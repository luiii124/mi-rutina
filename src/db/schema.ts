import Dexie, { type Table } from 'dexie'
import { rutinaConAnclaSemanal } from './migrations'
import type {
  BodyEntry,
  Exercise,
  ImportSnapshot,
  PersonalRecord,
  Photo,
  Routine,
  Session,
  SessionSet,
  Settings,
  Workout,
  WorkoutExercise,
} from './types'

export class MiRutinaDB extends Dexie {
  settings!: Table<Settings, string>
  exercises!: Table<Exercise, string>
  routines!: Table<Routine, string>
  workouts!: Table<Workout, string>
  workoutExercises!: Table<WorkoutExercise, string>
  sessions!: Table<Session, string>
  sessionSets!: Table<SessionSet, string>
  bodyEntries!: Table<BodyEntry, string>
  photos!: Table<Photo, string>
  personalRecords!: Table<PersonalRecord, string>
  importSnapshots!: Table<ImportSnapshot, number>

  constructor() {
    super('mi-rutina')
    this.version(1).stores({
      settings: 'id',
      exercises: 'id, nameNormalized, isBuiltIn',
      routines: 'id',
      workouts: 'id, routineId, [routineId+variantIndex]',
      workoutExercises: 'id, workoutId, exerciseId',
      sessions: 'id, routineId, workoutId, [workoutId+startedAt]',
      sessionSets:
        'id, sessionId, workoutExerciseId, exerciseId, routineId, [exerciseId+performedAt], [exerciseId+routineId]',
      bodyEntries: 'id, &date',
      photos: 'id',
      personalRecords: 'exerciseId',
      importSnapshots: '++id, createdAt',
    })
    // v2: las variantes pasan a cambiar por semana natural. Mismos índices; solo convierte datos.
    this.version(2).upgrade((tx) =>
      tx
        .table('routines')
        .toCollection()
        .modify((routine: Record<string, unknown>, ref: { value: unknown }) => {
          ref.value = rutinaConAnclaSemanal(routine)
        }),
    )
  }
}

export const db = new MiRutinaDB()

/** Todas las tablas de datos de usuario, sin contar las instantaneas de seguridad. */
export const DATA_TABLES = [
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
] as const
