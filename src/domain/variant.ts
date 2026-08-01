export interface RoutineVariantState {
  variantCount: number
  currentVariantIndex: number
  cycleCompletedWorkoutIds: string[]
  manualVariantIndex: number | null
}

/**
 * Avanza el ciclo de variantes al completar una sesion. Cuenta entrenos completados,
 * no fechas: ver DATA_MODEL.md, "por que asi y no por fechas".
 */
export function avanzarVariante(
  estado: RoutineVariantState,
  workoutIdCompletado: string,
  workoutIdsDeLaVarianteActual: string[],
): RoutineVariantState {
  if (estado.variantCount === 1) return estado

  const completados = estado.cycleCompletedWorkoutIds.includes(workoutIdCompletado)
    ? estado.cycleCompletedWorkoutIds
    : [...estado.cycleCompletedWorkoutIds, workoutIdCompletado]

  const cicloCompleto = workoutIdsDeLaVarianteActual.every((id) => completados.includes(id))

  if (!cicloCompleto) {
    return { ...estado, cycleCompletedWorkoutIds: completados }
  }

  return {
    variantCount: estado.variantCount,
    currentVariantIndex: (estado.currentVariantIndex + 1) % estado.variantCount,
    cycleCompletedWorkoutIds: [],
    manualVariantIndex: null,
  }
}

/** Variante que debe verse en pantalla: la elegida a mano, o si no la sugerida. */
export function varianteMostrada(
  estado: Pick<RoutineVariantState, 'currentVariantIndex' | 'manualVariantIndex'>,
): number {
  return estado.manualVariantIndex ?? estado.currentVariantIndex
}
