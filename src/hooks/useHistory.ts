import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import type { Exercise, PersonalRecord, SessionSet } from '../db/types'
import { normalizeText } from '../domain/normalizeText'

export function usePersonalRecord(exerciseId: string | undefined): PersonalRecord | null | undefined {
  return useLiveQuery(async () => {
    if (!exerciseId) return null
    const pr = await db.personalRecords.get(exerciseId)
    return pr ?? null
  }, [exerciseId])
}

/** Ejercicios con al menos una serie registrada, para el buscador de historial de PR de "Mi progreso". */
export function useExercisesConHistorial(query: string): Exercise[] | undefined {
  return useLiveQuery(async () => {
    const sets = await db.sessionSets.toArray()
    const exerciseIds = new Set(
      sets.filter((s) => s.isCompleted || s.weightKg !== null || s.reps !== null).map((s) => s.exerciseId),
    )
    if (exerciseIds.size === 0) return []

    const exercises = await db.exercises.bulkGet([...exerciseIds])
    const normalizado = normalizeText(query)
    return exercises
      .filter((e): e is Exercise => e !== undefined)
      .filter((e) => (normalizado ? e.nameNormalized.includes(normalizado) : true))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }, [query])
}

export interface RoutineOption {
  id: string
  name: string
}

/** Rutinas donde aparece este ejercicio, para el selector del historial. */
export function useRoutinesConEjercicio(exerciseId: string | undefined): RoutineOption[] | undefined {
  return useLiveQuery(async () => {
    if (!exerciseId) return undefined
    const workoutExercises = await db.workoutExercises.where('exerciseId').equals(exerciseId).toArray()
    const workoutIds = [...new Set(workoutExercises.map((we) => we.workoutId))]
    const workouts = await db.workouts.bulkGet(workoutIds)
    const routineIds = [
      ...new Set(workouts.filter((w): w is NonNullable<typeof w> => w !== undefined).map((w) => w.routineId)),
    ]
    const routines = await db.routines.bulkGet(routineIds)
    return routines
      .filter((r): r is NonNullable<typeof r> => r !== undefined)
      .map((r) => ({ id: r.id, name: r.name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [exerciseId])
}

export interface HistorySession {
  sessionId: string
  performedAt: number
  note: string | null
  sets: SessionSet[]
}

/** Sesiones de este ejercicio dentro de una rutina, mas reciente primero. */
export function useHistorialEjercicio(
  exerciseId: string | undefined,
  routineId: string | undefined,
): HistorySession[] | undefined {
  return useLiveQuery(async () => {
    if (!exerciseId || !routineId) return undefined

    const sets = await db.sessionSets.where('[exerciseId+routineId]').equals([exerciseId, routineId]).toArray()
    if (sets.length === 0) return []

    const sessionIds = [...new Set(sets.map((s) => s.sessionId))]
    const sessions = await db.sessions.bulkGet(sessionIds)
    const notaPorSesion = new Map(
      sessions.filter((s): s is NonNullable<typeof s> => s !== undefined).map((s) => [s.id, s.note]),
    )

    const porSesion = new Map<string, SessionSet[]>()
    for (const set of sets) {
      const lista = porSesion.get(set.sessionId) ?? []
      lista.push(set)
      porSesion.set(set.sessionId, lista)
    }

    return [...porSesion.entries()]
      .map(([sessionId, setsDeSesion]) => ({
        sessionId,
        performedAt: setsDeSesion[0].performedAt,
        note: notaPorSesion.get(sessionId) ?? null,
        sets: setsDeSesion.sort((a, b) => a.setIndex - b.setIndex),
      }))
      .sort((a, b) => b.performedAt - a.performedAt)
  }, [exerciseId, routineId])
}
