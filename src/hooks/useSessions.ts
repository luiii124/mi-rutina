import { useLiveQuery } from 'dexie-react-hooks'
import { recalcularPR, recalcularPRDeVarios } from '../db/personalRecordSync'
import { db } from '../db/schema'
import type { Session, SessionSet, Workout, WorkoutExercise } from '../db/types'
import { avanzarVariante } from '../domain/variant'

export function useUnfinishedSession(workoutId: string | undefined): Session | null | undefined {
  return useLiveQuery(async () => {
    if (!workoutId) return null
    const sesiones = await db.sessions.where('workoutId').equals(workoutId).toArray()
    const sinTerminar = sesiones.filter((s) => s.completedAt === null)
    if (sinTerminar.length === 0) return null
    return sinTerminar.sort((a, b) => b.startedAt - a.startedAt)[0]
  }, [workoutId])
}

export function useSession(sessionId: string | undefined): Session | undefined {
  return useLiveQuery(() => (sessionId ? db.sessions.get(sessionId) : undefined), [sessionId])
}

export function useSessionSets(
  sessionId: string | undefined,
  workoutExerciseId: string | undefined,
): SessionSet[] | undefined {
  return useLiveQuery(async () => {
    if (!sessionId || !workoutExerciseId) return undefined
    return db.sessionSets
      .where('sessionId')
      .equals(sessionId)
      .filter((s) => s.workoutExerciseId === workoutExerciseId)
      .sortBy('setIndex')
  }, [sessionId, workoutExerciseId])
}

/** True si todos los ejercicios del entreno tienen todas sus series de esta sesion marcadas. */
export function useTodosCompletados(sessionId: string | undefined, workoutId: string | undefined): boolean {
  return (
    useLiveQuery(async () => {
      if (!sessionId || !workoutId) return false
      const workoutExercises = await db.workoutExercises.where('workoutId').equals(workoutId).toArray()
      if (workoutExercises.length === 0) return false
      const sets = await db.sessionSets.where('sessionId').equals(sessionId).toArray()
      return workoutExercises.every((we) => {
        const propias = sets.filter((s) => s.workoutExerciseId === we.id)
        return propias.length > 0 && propias.every((s) => s.isCompleted)
      })
    }, [sessionId, workoutId]) ?? false
  )
}

/** Crea la sesion si no hay ninguna sin terminar para este entreno, o devuelve la existente. */
export async function iniciarOContinuarSesion(workout: Workout): Promise<string> {
  const sesiones = await db.sessions.where('workoutId').equals(workout.id).toArray()
  const sinTerminar = sesiones.find((s) => s.completedAt === null)
  if (sinTerminar) return sinTerminar.id

  const id = crypto.randomUUID()
  await db.sessions.add({
    id,
    routineId: workout.routineId,
    workoutId: workout.id,
    variantIndex: workout.variantIndex,
    startedAt: Date.now(),
    completedAt: null,
    note: null,
  })
  return id
}

/** El primer ejercicio del entreno que aun no tiene todas sus series marcadas. */
export async function primerEjercicioPendiente(sessionId: string, workoutId: string): Promise<string | null> {
  const workoutExercises = await db.workoutExercises.where('workoutId').equals(workoutId).sortBy('order')
  if (workoutExercises.length === 0) return null
  const sets = await db.sessionSets.where('sessionId').equals(sessionId).toArray()

  for (const we of workoutExercises) {
    const propias = sets.filter((s) => s.workoutExerciseId === we.id)
    if (propias.length === 0 || !propias.every((s) => s.isCompleted)) return we.id
  }
  return workoutExercises[workoutExercises.length - 1].id
}

/**
 * Ver DATA_MODEL.md, "Precarga de la sesion anterior". Idempotente y segura frente a llamadas
 * concurrentes: todo ocurre dentro de una unica transaccion para que dos llamadas solapadas
 * (el efecto de React puede dispararse mas de una vez) no dupliquen series.
 */
export async function asegurarSeriesPrecargadas(session: Session, workoutExercise: WorkoutExercise): Promise<void> {
  await db.transaction('rw', db.sessionSets, async () => {
    const existentes = await db.sessionSets
      .where('sessionId')
      .equals(session.id)
      .filter((s) => s.workoutExerciseId === workoutExercise.id)
      .toArray()

    const indicesExistentes = new Set(existentes.map((s) => s.setIndex))
    const faltantes: number[] = []
    for (let i = 0; i < workoutExercise.targetSets; i++) {
      if (!indicesExistentes.has(i)) faltantes.push(i)
    }
    if (faltantes.length === 0) return

    const anteriores = await db.sessionSets
      .where('workoutExerciseId')
      .equals(workoutExercise.id)
      .filter((s) => s.sessionId !== session.id)
      .toArray()

    let ultimaSesionId: string | null = null
    let ultimoPerformedAt = -Infinity
    for (const s of anteriores) {
      if (s.performedAt > ultimoPerformedAt) {
        ultimoPerformedAt = s.performedAt
        ultimaSesionId = s.sessionId
      }
    }
    const previaPorIndice = new Map(
      (ultimaSesionId ? anteriores.filter((s) => s.sessionId === ultimaSesionId) : []).map((s) => [s.setIndex, s]),
    )

    await db.sessionSets.bulkAdd(
      faltantes.map((setIndex) => {
        const previa = previaPorIndice.get(setIndex)
        return {
          id: crypto.randomUUID(),
          sessionId: session.id,
          workoutExerciseId: workoutExercise.id,
          exerciseId: workoutExercise.exerciseId,
          routineId: session.routineId,
          setIndex,
          weightKg: previa?.weightKg ?? null,
          reps: previa?.reps ?? null,
          isCompleted: false,
          isPrefilled: previa !== undefined,
          performedAt: session.startedAt,
        }
      }),
    )
  })
}

/** El usuario ha tocado el campo: deja de mostrarse en gris, aunque no cambie el valor. */
export async function marcarSerieComoRevisada(setId: string): Promise<void> {
  await db.sessionSets.update(setId, { isPrefilled: false })
}

export async function actualizarSerie(
  setId: string,
  changes: { weightKg: number | null; reps: number | null },
): Promise<void> {
  await db.sessionSets.update(setId, { ...changes, isPrefilled: false })
  if (changes.weightKg !== null && changes.reps) {
    const set = await db.sessionSets.get(setId)
    if (set) await recalcularPR(set.exerciseId)
  }
}

export async function marcarSerieCompletada(setId: string, completed: boolean): Promise<void> {
  await db.sessionSets.update(setId, { isCompleted: completed })
}

export async function anadirSerieExtra(session: Session, workoutExercise: WorkoutExercise): Promise<void> {
  const existentes = await db.sessionSets
    .where('sessionId')
    .equals(session.id)
    .filter((s) => s.workoutExerciseId === workoutExercise.id)
    .toArray()
  const setIndex = existentes.length > 0 ? Math.max(...existentes.map((s) => s.setIndex)) + 1 : 0

  await db.sessionSets.add({
    id: crypto.randomUUID(),
    sessionId: session.id,
    workoutExerciseId: workoutExercise.id,
    exerciseId: workoutExercise.exerciseId,
    routineId: session.routineId,
    setIndex,
    weightKg: null,
    reps: null,
    isCompleted: false,
    isPrefilled: false,
    performedAt: Date.now(),
  })
}

/** Hace permanente en la plantilla la ultima serie añadida sobre la marcha. */
export async function guardarSerieExtraEnRutina(workoutExercise: WorkoutExercise): Promise<void> {
  await db.workoutExercises.update(workoutExercise.id, {
    targetSets: workoutExercise.targetSets + 1,
    updatedAt: Date.now(),
  })
}

export async function resumenSeriesSinRevisar(sessionId: string): Promise<{ total: number; sinRevisar: number }> {
  const sets = await db.sessionSets.where('sessionId').equals(sessionId).toArray()
  return { total: sets.length, sinRevisar: sets.filter((s) => s.isPrefilled).length }
}

/**
 * Termina la sesion: opcionalmente descarta las series sin revisar, recalcula el PR de los
 * ejercicios afectados y avanza el ciclo de variantes de la rutina. Ver DATA_MODEL.md.
 */
export async function terminarSesion(
  sessionId: string,
  workoutId: string,
  descartarSinRevisar: boolean,
): Promise<void> {
  const session = await db.sessions.get(sessionId)
  if (!session) return

  if (descartarSinRevisar) {
    const sinRevisar = await db.sessionSets
      .where('sessionId')
      .equals(sessionId)
      .filter((s) => s.isPrefilled)
      .toArray()
    await db.sessionSets.bulkDelete(sinRevisar.map((s) => s.id))
  }

  await db.sessions.update(sessionId, { completedAt: Date.now() })

  const setsFinales = await db.sessionSets.where('sessionId').equals(sessionId).toArray()
  await recalcularPRDeVarios(setsFinales.map((s) => s.exerciseId))

  const routine = await db.routines.get(session.routineId)
  if (routine && routine.variantCount > 1) {
    const workoutIdsDeVariante = (
      await db.workouts
        .where('[routineId+variantIndex]')
        .equals([routine.id, routine.currentVariantIndex])
        .toArray()
    ).map((w) => w.id)

    const nuevoEstado = avanzarVariante(
      {
        variantCount: routine.variantCount,
        currentVariantIndex: routine.currentVariantIndex,
        cycleCompletedWorkoutIds: routine.cycleCompletedWorkoutIds,
        manualVariantIndex: routine.manualVariantIndex,
      },
      workoutId,
      workoutIdsDeVariante,
    )
    await db.routines.update(routine.id, {
      currentVariantIndex: nuevoEstado.currentVariantIndex,
      cycleCompletedWorkoutIds: nuevoEstado.cycleCompletedWorkoutIds,
      manualVariantIndex: nuevoEstado.manualVariantIndex,
    })
  }
}
