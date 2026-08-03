import { useLiveQuery } from 'dexie-react-hooks'
import { recalcularPRDeVarios } from '../db/personalRecordSync'
import { db } from '../db/schema'
import type { Routine } from '../db/types'

const VARIANT_LETTERS = ['A', 'B', 'C', 'D']

export interface RoutineListItem {
  routine: Routine
  lastSessionAt: number | null
}

function ordenarRoutineList(items: RoutineListItem[]): RoutineListItem[] {
  const activas = items.filter((i) => !i.routine.archivedAt)
  const archivadas = items.filter((i) => i.routine.archivedAt)

  const conSesion = activas
    .filter((i) => i.lastSessionAt !== null)
    .sort((a, b) => (b.lastSessionAt as number) - (a.lastSessionAt as number))
  const sinSesion = activas
    .filter((i) => i.lastSessionAt === null)
    .sort((a, b) => a.routine.createdAt - b.routine.createdAt)
  const archivadasOrdenadas = [...archivadas].sort(
    (a, b) => (b.routine.archivedAt ?? 0) - (a.routine.archivedAt ?? 0),
  )

  return [...conSesion, ...sinSesion, ...archivadasOrdenadas]
}

export function useRoutineList(): RoutineListItem[] | undefined {
  return useLiveQuery(async () => {
    const routines = await db.routines.toArray()
    const items = await Promise.all(
      routines.map(async (routine): Promise<RoutineListItem> => {
        const sessions = await db.sessions.where('routineId').equals(routine.id).toArray()
        const lastSessionAt =
          sessions.length > 0 ? Math.max(...sessions.map((s) => s.startedAt)) : null
        return { routine, lastSessionAt }
      }),
    )
    return ordenarRoutineList(items)
  }, [])
}

export function useRoutine(routineId: string | undefined): Routine | undefined {
  return useLiveQuery(() => (routineId ? db.routines.get(routineId) : undefined), [routineId])
}

export interface TramoRutina {
  routineId: string
  name: string
  inicio: number
  fin: number
}

/** Tramo activo de cada rutina con sesiones, para las marcas verticales de "Mi progreso". Ver DATA_MODEL.md. */
export function useTramosDeRutinas(): TramoRutina[] | undefined {
  return useLiveQuery(async () => {
    const routines = await db.routines.toArray()
    const tramos: TramoRutina[] = []

    for (const routine of routines) {
      const sessions = await db.sessions.where('routineId').equals(routine.id).toArray()
      if (sessions.length === 0) continue
      const inicio = Math.min(...sessions.map((s) => s.startedAt))
      const fin = routine.archivedAt ?? Math.max(...sessions.map((s) => s.startedAt))
      tramos.push({ routineId: routine.id, name: routine.name, inicio, fin })
    }

    return tramos.sort((a, b) => a.inicio - b.inicio)
  }, [])
}

export async function createRoutine(name: string, variantCount: 1 | 2 | 3 | 4): Promise<string> {
  const now = Date.now()
  const id = crypto.randomUUID()
  const routine: Routine = {
    id,
    name,
    variantCount,
    variantNames: VARIANT_LETTERS.slice(0, variantCount),
    currentVariantIndex: 0,
    manualVariantIndex: null,
    cycleCompletedWorkoutIds: [],
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  }
  await db.routines.add(routine)
  return id
}

interface UpdateRoutineInput {
  name: string
  variantCount: 1 | 2 | 3 | 4
  variantNames: string[]
}

/** Aplica el cambio de nombre/variantes. Si se reducen variantes, borra los entrenos sobrantes. */
export async function updateRoutine(routineId: string, input: UpdateRoutineInput): Promise<void> {
  const routine = await db.routines.get(routineId)
  if (!routine) throw new Error('Rutina no encontrada')

  if (input.variantCount < routine.variantCount) {
    const workouts = await db.workouts
      .where('routineId')
      .equals(routineId)
      .filter((w) => w.variantIndex >= input.variantCount)
      .toArray()
    const workoutIds = workouts.map((w) => w.id)
    const workoutExercises = await db.workoutExercises.where('workoutId').anyOf(workoutIds).toArray()
    await db.workoutExercises.bulkDelete(workoutExercises.map((we) => we.id))
    await db.workouts.bulkDelete(workoutIds)
  }

  await db.routines.update(routineId, {
    name: input.name,
    variantCount: input.variantCount,
    variantNames: input.variantNames,
    currentVariantIndex: 0,
    manualVariantIndex: null,
    cycleCompletedWorkoutIds: [],
    updatedAt: Date.now(),
  })
}

export async function setManualVariant(routineId: string, variantIndex: number): Promise<void> {
  await db.routines.update(routineId, { manualVariantIndex: variantIndex })
}

export async function clearManualVariant(routineId: string): Promise<void> {
  await db.routines.update(routineId, { manualVariantIndex: null })
}

export async function archiveRoutine(routineId: string): Promise<void> {
  await db.routines.update(routineId, { archivedAt: Date.now() })
}

export async function reactivateRoutine(routineId: string): Promise<void> {
  await db.routines.update(routineId, { archivedAt: null })
}

/** Copia la estructura (entrenos, ejercicios, series, rangos) pero nunca el historial. */
export async function duplicateRoutine(routineId: string): Promise<string> {
  const original = await db.routines.get(routineId)
  if (!original) throw new Error('Rutina no encontrada')

  const now = Date.now()
  const newRoutineId = crypto.randomUUID()

  await db.routines.add({
    ...original,
    id: newRoutineId,
    name: `${original.name} (copia)`,
    currentVariantIndex: 0,
    manualVariantIndex: null,
    cycleCompletedWorkoutIds: [],
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  })

  const workouts = await db.workouts.where('routineId').equals(routineId).toArray()
  for (const workout of workouts) {
    const newWorkoutId = crypto.randomUUID()
    await db.workouts.add({
      ...workout,
      id: newWorkoutId,
      routineId: newRoutineId,
      createdAt: now,
      updatedAt: now,
    })
    const exercises = await db.workoutExercises.where('workoutId').equals(workout.id).toArray()
    await db.workoutExercises.bulkAdd(
      exercises.map((we) => ({
        ...we,
        id: crypto.randomUUID(),
        workoutId: newWorkoutId,
        createdAt: now,
        updatedAt: now,
      })),
    )
  }

  return newRoutineId
}

/** Borra la rutina y todo su historial. Los PR se recalculan porque son universales. */
export async function deleteRoutine(routineId: string): Promise<void> {
  const workouts = await db.workouts.where('routineId').equals(routineId).toArray()
  const workoutIds = workouts.map((w) => w.id)
  const workoutExercises = await db.workoutExercises.where('workoutId').anyOf(workoutIds).toArray()
  const sessions = await db.sessions.where('routineId').equals(routineId).toArray()
  const sessionIds = sessions.map((s) => s.id)
  const sessionSets = await db.sessionSets.where('sessionId').anyOf(sessionIds).toArray()
  const exerciseIdsAfectados = sessionSets.map((s) => s.exerciseId)

  await db.transaction(
    'rw',
    [db.routines, db.workouts, db.workoutExercises, db.sessions, db.sessionSets, db.personalRecords],
    async () => {
      await db.sessionSets.bulkDelete(sessionSets.map((s) => s.id))
      await db.sessions.bulkDelete(sessionIds)
      await db.workoutExercises.bulkDelete(workoutExercises.map((we) => we.id))
      await db.workouts.bulkDelete(workoutIds)
      await db.routines.delete(routineId)
    },
  )

  await recalcularPRDeVarios(exerciseIdsAfectados)
}
