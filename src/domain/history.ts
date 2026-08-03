export interface SetHistorial {
  weightKg: number | null
  reps: number | null
}

export interface PuntoHistorial {
  weightKg: number
  reps: number
}

/**
 * Serie de mas peso dentro de una sesion: el punto que representa esa sesion en la grafica.
 * Empate a peso: gana mas repeticiones. Mismo criterio que el PR, ver domain/personalRecord.ts.
 */
export function serieMaxima(sets: SetHistorial[]): PuntoHistorial | null {
  let mejor: PuntoHistorial | null = null

  for (const set of sets) {
    if (set.weightKg === null || set.reps === null || set.reps === 0) continue
    if (!mejor || set.weightKg > mejor.weightKg || (set.weightKg === mejor.weightKg && set.reps > mejor.reps)) {
      mejor = { weightKg: set.weightKg, reps: set.reps }
    }
  }

  return mejor
}
