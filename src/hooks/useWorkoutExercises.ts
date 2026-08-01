import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import type { Exercise, WorkoutExercise } from '../db/types'

export interface WorkoutExerciseListItem {
  workoutExercise: WorkoutExercise
  exercise: Exercise
}

export function useWorkoutExercises(workoutId: string): WorkoutExerciseListItem[] | undefined {
  return useLiveQuery(async () => {
    const workoutExercises = await db.workoutExercises.where('workoutId').equals(workoutId).sortBy('order')
    const exercises = await db.exercises.bulkGet(workoutExercises.map((we) => we.exerciseId))
    return workoutExercises
      .map((workoutExercise, i) => ({ workoutExercise, exercise: exercises[i] }))
      .filter((item): item is WorkoutExerciseListItem => item.exercise !== undefined)
  }, [workoutId])
}

export function useWorkoutExercise(id: string | undefined): WorkoutExercise | undefined {
  return useLiveQuery(() => (id ? db.workoutExercises.get(id) : undefined), [id])
}

export interface WorkoutExerciseConfig {
  note: string | null
  targetSets: number
  repMin: number | null
  repMax: number | null
  restSeconds: number | null
}

export async function addExerciseToWorkout(
  workoutId: string,
  exerciseId: string,
  config: WorkoutExerciseConfig,
): Promise<string> {
  const now = Date.now()
  const count = await db.workoutExercises.where('workoutId').equals(workoutId).count()
  const id = crypto.randomUUID()

  await db.workoutExercises.add({
    id,
    workoutId,
    exerciseId,
    order: count,
    ...config,
    createdAt: now,
    updatedAt: now,
  })

  const exercise = await db.exercises.get(exerciseId)
  if (exercise) {
    await db.exercises.update(exerciseId, { usageCount: exercise.usageCount + 1 })
  }

  return id
}

export async function updateWorkoutExercise(id: string, config: WorkoutExerciseConfig): Promise<void> {
  await db.workoutExercises.update(id, { ...config, updatedAt: Date.now() })
}

export async function removeWorkoutExercise(id: string): Promise<void> {
  await db.workoutExercises.delete(id)
}

export async function reorderWorkoutExercises(items: WorkoutExercise[]): Promise<void> {
  const now = Date.now()
  await Promise.all(
    items.map((item, index) => db.workoutExercises.update(item.id, { order: index, updatedAt: now })),
  )
}
