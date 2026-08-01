import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import type { Workout } from '../db/types'

export interface WorkoutListItem {
  workout: Workout
  lastSessionAt: number | null
  sesionSinTerminar: boolean
}

export function useWorkouts(routineId: string, variantIndex: number): WorkoutListItem[] | undefined {
  return useLiveQuery(async () => {
    const workouts = await db.workouts
      .where('[routineId+variantIndex]')
      .equals([routineId, variantIndex])
      .sortBy('order')

    return Promise.all(
      workouts.map(async (workout): Promise<WorkoutListItem> => {
        const sessions = await db.sessions.where('workoutId').equals(workout.id).toArray()
        const lastSessionAt =
          sessions.length > 0 ? Math.max(...sessions.map((s) => s.startedAt)) : null
        const sesionSinTerminar = sessions.some((s) => s.completedAt === null)
        return { workout, lastSessionAt, sesionSinTerminar }
      }),
    )
  }, [routineId, variantIndex])
}

export function useWorkout(workoutId: string | undefined): Workout | undefined {
  return useLiveQuery(() => (workoutId ? db.workouts.get(workoutId) : undefined), [workoutId])
}

export function useMaterialSuggestions(): string[] {
  return (
    useLiveQuery(async () => {
      const workouts = await db.workouts.toArray()
      const vistos = new Map<string, string>()
      for (const material of workouts.flatMap((w) => w.materials)) {
        const key = material.toLowerCase()
        if (!vistos.has(key)) vistos.set(key, material)
      }
      return [...vistos.values()].sort()
    }, []) ?? []
  )
}

export async function createWorkout(
  routineId: string,
  variantIndex: number,
  name: string,
  materials: string[],
): Promise<string> {
  const now = Date.now()
  const count = await db.workouts
    .where('[routineId+variantIndex]')
    .equals([routineId, variantIndex])
    .count()
  const id = crypto.randomUUID()
  await db.workouts.add({
    id,
    routineId,
    variantIndex,
    name,
    materials,
    order: count,
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function updateWorkout(
  workoutId: string,
  changes: { name: string; materials: string[] },
): Promise<void> {
  await db.workouts.update(workoutId, { ...changes, updatedAt: Date.now() })
}

/** Copia el entreno (y sus ejercicios) a la variante indicada. Nunca copia historial. */
export async function duplicateWorkout(workoutId: string, targetVariantIndex: number): Promise<string> {
  const original = await db.workouts.get(workoutId)
  if (!original) throw new Error('Entreno no encontrado')

  const now = Date.now()
  const newId = crypto.randomUUID()
  const count = await db.workouts
    .where('[routineId+variantIndex]')
    .equals([original.routineId, targetVariantIndex])
    .count()

  await db.workouts.add({
    ...original,
    id: newId,
    variantIndex: targetVariantIndex,
    order: count,
    createdAt: now,
    updatedAt: now,
  })

  const exercises = await db.workoutExercises.where('workoutId').equals(workoutId).toArray()
  await db.workoutExercises.bulkAdd(
    exercises.map((we) => ({
      ...we,
      id: crypto.randomUUID(),
      workoutId: newId,
      createdAt: now,
      updatedAt: now,
    })),
  )

  return newId
}

/** Copia todos los entrenos de una variante a otra (variante vacia recien creada). */
export async function copiarEntrenosDeVariante(
  routineId: string,
  desdeVariantIndex: number,
  haciaVariantIndex: number,
): Promise<void> {
  const workouts = await db.workouts
    .where('[routineId+variantIndex]')
    .equals([routineId, desdeVariantIndex])
    .sortBy('order')

  for (const workout of workouts) {
    await duplicateWorkout(workout.id, haciaVariantIndex)
  }
}

/** Quita el entreno de la rutina. El historial de sesiones ya realizadas no se toca. */
export async function deleteWorkout(workoutId: string): Promise<void> {
  const exercises = await db.workoutExercises.where('workoutId').equals(workoutId).toArray()
  await db.workoutExercises.bulkDelete(exercises.map((we) => we.id))
  await db.workouts.delete(workoutId)
}

export async function reorderWorkouts(workouts: Workout[]): Promise<void> {
  const now = Date.now()
  await Promise.all(
    workouts.map((workout, index) => db.workouts.update(workout.id, { order: index, updatedAt: now })),
  )
}
