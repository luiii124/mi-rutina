import { calcularPR } from '../domain/personalRecord'
import { db } from './schema'

/** Recalcula el PR de un ejercicio desde cero, consultando todas sus series. */
export async function recalcularPR(exerciseId: string): Promise<void> {
  const sets = await db.sessionSets.where('exerciseId').equals(exerciseId).toArray()
  const resultado = calcularPR(
    sets.map((set) => ({
      weightKg: set.weightKg,
      reps: set.reps,
      sessionId: set.sessionId,
      routineId: set.routineId,
      achievedAt: set.performedAt,
    })),
  )

  if (resultado) {
    await db.personalRecords.put({ exerciseId, ...resultado })
  } else {
    await db.personalRecords.delete(exerciseId)
  }
}

export async function recalcularPRDeVarios(exerciseIds: Iterable<string>): Promise<void> {
  const unicos = [...new Set(exerciseIds)]
  await Promise.all(unicos.map((id) => recalcularPR(id)))
}
