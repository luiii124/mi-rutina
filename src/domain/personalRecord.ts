export interface SetPRInput {
  weightKg: number | null
  reps: number | null
  sessionId: string
  routineId: string
  achievedAt: number
}

export interface PersonalRecordResult {
  weightKg: number
  reps: number
  sessionId: string
  routineId: string
  achievedAt: number
}

function esMejorPR(candidato: PersonalRecordResult, actual: PersonalRecordResult): boolean {
  if (candidato.weightKg !== actual.weightKg) return candidato.weightKg > actual.weightKg
  if (candidato.reps !== actual.reps) return candidato.reps > actual.reps
  // Empate total: se conserva el mas antiguo (el PR original).
  return candidato.achievedAt < actual.achievedAt
}

/**
 * Calcula el PR desde cero a partir de todas las series de un ejercicio.
 * Ver DATA_MODEL.md, PersonalRecord: nunca se ajusta de forma incremental.
 */
export function calcularPR(sets: SetPRInput[]): PersonalRecordResult | null {
  let mejor: PersonalRecordResult | null = null

  for (const set of sets) {
    if (set.weightKg === null || set.reps === null || set.reps === 0) continue

    const candidato: PersonalRecordResult = {
      weightKg: set.weightKg,
      reps: set.reps,
      sessionId: set.sessionId,
      routineId: set.routineId,
      achievedAt: set.achievedAt,
    }

    if (!mejor || esMejorPR(candidato, mejor)) {
      mejor = candidato
    }
  }

  return mejor
}
