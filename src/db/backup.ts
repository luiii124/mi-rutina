import { db } from './schema'
import { seedBuiltInExercises } from './seed'
import type {
  BodyEntry,
  Exercise,
  Routine,
  Session,
  SessionSet,
  Settings,
  Workout,
  WorkoutExercise,
} from './types'

const APP_ID = 'mi-rutina'
const SCHEMA_VERSION = 1
const SNAPSHOT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

interface ExportedPhoto {
  id: string
  kind: 'exercise' | 'body'
  width: number
  height: number
  bytes: number
  createdAt: number
  dataUrl: string
}

export interface BackupFile {
  app: string
  schemaVersion: number
  exportedAt: number
  settings: Settings | undefined
  exercises: Exercise[]
  routines: Routine[]
  workouts: Workout[]
  workoutExercises: WorkoutExercise[]
  sessions: Session[]
  sessionSets: SessionSet[]
  bodyEntries: BodyEntry[]
  photos: ExportedPhoto[]
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

export async function construirCopia(): Promise<BackupFile> {
  const [settings, exercises, routines, workouts, workoutExercises, sessions, sessionSets, bodyEntries, photos] =
    await Promise.all([
      db.settings.get('settings'),
      db.exercises.toArray(),
      db.routines.toArray(),
      db.workouts.toArray(),
      db.workoutExercises.toArray(),
      db.sessions.toArray(),
      db.sessionSets.toArray(),
      db.bodyEntries.toArray(),
      db.photos.toArray(),
    ])

  const exportedPhotos: ExportedPhoto[] = await Promise.all(
    photos.map(async (photo) => ({
      id: photo.id,
      kind: photo.kind,
      width: photo.width,
      height: photo.height,
      bytes: photo.bytes,
      createdAt: photo.createdAt,
      dataUrl: await blobToDataUrl(photo.blob),
    })),
  )

  return {
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: Date.now(),
    settings,
    exercises,
    routines,
    workouts,
    workoutExercises,
    sessions,
    sessionSets,
    bodyEntries,
    photos: exportedPhotos,
  }
}

function nombreArchivo(fecha: Date): string {
  const iso = fecha.toISOString().slice(0, 10)
  return `mi-rutina-${iso}.json`
}

/**
 * Genera el archivo de copia y lo comparte o descarga segun lo que soporte el navegador.
 * Devuelve false si el usuario cancela el dialogo de compartir (no cuenta como copia hecha).
 */
export async function exportarCopia(): Promise<boolean> {
  const backup = await construirCopia()
  const json = JSON.stringify(backup, null, 2)
  const file = new File([json], nombreArchivo(new Date()), { type: 'application/json' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Copia de Mi Rutina' })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return false
      throw error
    }
  } else {
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    URL.revokeObjectURL(url)
  }

  await db.settings.update('settings', { lastBackupAt: Date.now() })
  return true
}

export interface ResumenCopia {
  rutinas: number
  sesiones: number
  desde: number | null
  hasta: number | null
}

export function resumirCopia(backup: BackupFile): ResumenCopia {
  const fechas = backup.sessions.map((s) => s.startedAt)
  return {
    rutinas: backup.routines.length,
    sesiones: backup.sessions.length,
    desde: fechas.length > 0 ? Math.min(...fechas) : null,
    hasta: fechas.length > 0 ? Math.max(...fechas) : null,
  }
}

export function validarCopia(data: unknown): data is BackupFile {
  if (typeof data !== 'object' || data === null) return false
  const backup = data as Partial<BackupFile>
  return backup.app === APP_ID && typeof backup.schemaVersion === 'number'
}

async function tomarInstantanea(): Promise<void> {
  const actual = await construirCopia()
  await db.importSnapshots.add({ createdAt: Date.now(), data: JSON.stringify(actual) })

  const limite = Date.now() - SNAPSHOT_MAX_AGE_MS
  const antiguas = await db.importSnapshots.where('createdAt').below(limite).primaryKeys()
  if (antiguas.length > 0) {
    await db.importSnapshots.bulkDelete(antiguas)
  }
}

/** Borra todos los datos y los sustituye por los del archivo. Nunca fusiona. */
export async function importarCopia(backup: BackupFile): Promise<void> {
  await tomarInstantanea()

  const photos = await Promise.all(
    backup.photos.map(async (p) => ({
      id: p.id,
      blob: await dataUrlToBlob(p.dataUrl),
      width: p.width,
      height: p.height,
      bytes: p.bytes,
      kind: p.kind,
      createdAt: p.createdAt,
    })),
  )

  await db.transaction(
    'rw',
    [
      db.settings,
      db.exercises,
      db.routines,
      db.workouts,
      db.workoutExercises,
      db.sessions,
      db.sessionSets,
      db.bodyEntries,
      db.photos,
      db.personalRecords,
    ],
    async () => {
      await Promise.all([
        db.settings.clear(),
        db.exercises.clear(),
        db.routines.clear(),
        db.workouts.clear(),
        db.workoutExercises.clear(),
        db.sessions.clear(),
        db.sessionSets.clear(),
        db.bodyEntries.clear(),
        db.photos.clear(),
        db.personalRecords.clear(),
      ])

      if (backup.settings) await db.settings.put(backup.settings)
      await db.exercises.bulkAdd(backup.exercises)
      await db.routines.bulkAdd(backup.routines)
      await db.workouts.bulkAdd(backup.workouts)
      await db.workoutExercises.bulkAdd(backup.workoutExercises)
      await db.sessions.bulkAdd(backup.sessions)
      await db.sessionSets.bulkAdd(backup.sessionSets)
      await db.bodyEntries.bulkAdd(backup.bodyEntries)
      await db.photos.bulkAdd(photos)
    },
  )
}

/** Deja la base de datos como en el primer arranque: vacia y con el catalogo base. */
export async function borrarTodosLosDatos(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.settings,
      db.exercises,
      db.routines,
      db.workouts,
      db.workoutExercises,
      db.sessions,
      db.sessionSets,
      db.bodyEntries,
      db.photos,
      db.personalRecords,
    ],
    async () => {
      await Promise.all([
        db.settings.clear(),
        db.exercises.clear(),
        db.routines.clear(),
        db.workouts.clear(),
        db.workoutExercises.clear(),
        db.sessions.clear(),
        db.sessionSets.clear(),
        db.bodyEntries.clear(),
        db.photos.clear(),
        db.personalRecords.clear(),
      ])
      await db.settings.put({
        id: 'settings',
        unit: 'kg',
        defaultRestSeconds: 90,
        lastBackupAt: null,
        schemaVersion: SCHEMA_VERSION,
      })
      await seedBuiltInExercises()
    },
  )
}
