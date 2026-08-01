import { db } from './schema'

/** Solo para probar el ciclo exportar / borrar / importar durante la Fase 1. */
export async function crearDatosDePrueba(): Promise<void> {
  const now = Date.now()
  const exercise = await db.exercises.where('nameNormalized').equals('press banca').first()
  if (!exercise) throw new Error('Catalogo de ejercicios no sembrado todavia')

  const routineId = crypto.randomUUID()
  const workoutId = crypto.randomUUID()
  const workoutExerciseId = crypto.randomUUID()
  const sessionId = crypto.randomUUID()

  await db.routines.add({
    id: routineId,
    name: 'Rutina de prueba',
    variantCount: 1,
    variantNames: ['A'],
    currentVariantIndex: 0,
    manualVariantIndex: null,
    cycleCompletedWorkoutIds: [],
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  })

  await db.workouts.add({
    id: workoutId,
    routineId,
    variantIndex: 0,
    name: 'Torso',
    materials: ['Straps'],
    order: 0,
    createdAt: now,
    updatedAt: now,
  })

  await db.workoutExercises.add({
    id: workoutExerciseId,
    workoutId,
    exerciseId: exercise.id,
    order: 0,
    note: null,
    targetSets: 3,
    repMin: 8,
    repMax: 12,
    restSeconds: 90,
    createdAt: now,
    updatedAt: now,
  })

  await db.sessions.add({
    id: sessionId,
    routineId,
    workoutId,
    variantIndex: 0,
    startedAt: now,
    completedAt: now,
    note: 'Sesion de prueba',
  })

  await db.sessionSets.bulkAdd([
    {
      id: crypto.randomUUID(),
      sessionId,
      workoutExerciseId,
      exerciseId: exercise.id,
      routineId,
      setIndex: 0,
      weightKg: 80,
      reps: 10,
      isCompleted: true,
      isPrefilled: false,
      performedAt: now,
    },
    {
      id: crypto.randomUUID(),
      sessionId,
      workoutExerciseId,
      exerciseId: exercise.id,
      routineId,
      setIndex: 1,
      weightKg: 82.5,
      reps: 8,
      isCompleted: true,
      isPrefilled: false,
      performedAt: now,
    },
  ])

  await db.bodyEntries.add({
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    weightKg: 78.5,
    bodyFatPct: 15,
    photoIds: [],
    note: 'Registro de prueba',
    createdAt: now,
    updatedAt: now,
  })
}
