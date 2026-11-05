import { anclarEstaSemana } from '../domain/variant'
import type { Routine } from './types'

/**
 * Hasta noviembre de 2026 la variante avanzaba al completar todos los entrenos de la variante
 * (campos currentVariantIndex / manualVariantIndex / cycleCompletedWorkoutIds). Ahora va por
 * semanas naturales. Las rutinas antiguas (de la base de datos o de una copia de seguridad
 * vieja) se convierten así: esta semana se queda con la variante que se estaba mostrando.
 */
export function rutinaConAnclaSemanal(raw: Routine | Record<string, unknown>): Routine {
  const r = raw as Record<string, unknown>
  if (typeof r.variantAnchorWeek === 'string' && typeof r.variantAnchorIndex === 'number') {
    return raw as Routine
  }

  const manual = typeof r.manualVariantIndex === 'number' ? r.manualVariantIndex : null
  const sugerida = typeof r.currentVariantIndex === 'number' ? r.currentVariantIndex : 0
  const count = typeof r.variantCount === 'number' ? r.variantCount : 1
  const mostrada = manual ?? sugerida
  const { currentVariantIndex: _c, manualVariantIndex: _m, cycleCompletedWorkoutIds: _w, ...resto } = r

  return {
    ...(resto as unknown as Routine),
    ...anclarEstaSemana(mostrada < count ? mostrada : 0),
  }
}
