/**
 * Variantes por semana natural: cambian solas cada lunes en orden (A, B, A, B...).
 * Se guarda un "ancla": una semana (su lunes) y la variante que le toca. El resto de semanas se
 * deducen contando semanas desde ahi. Corregir a mano es mover el ancla a la semana actual.
 * Ver DATA_MODEL.md, "Variante de la semana".
 */

const DIA_MS = 24 * 60 * 60 * 1000

/** Lunes de la semana de `fecha`, en formato YYYY-MM-DD y hora local. */
export function lunesDeLaSemana(fecha: Date): string {
  const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  const diasDesdeLunes = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - diasDesdeLunes)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Semanas completas de `desde` a `hasta` (ambos lunes YYYY-MM-DD). Negativo si `hasta` es anterior. */
export function semanasEntre(desde: string, hasta: string): number {
  // Se cuenta en UTC para que el cambio de hora (dias de 23 o 25 h) no descuadre la division.
  const [y1, m1, d1] = desde.split('-').map(Number)
  const [y2, m2, d2] = hasta.split('-').map(Number)
  const dias = (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / DIA_MS
  return Math.round(dias / 7)
}

export interface AnclaVariante {
  variantCount: number
  variantAnchorWeek: string
  variantAnchorIndex: number
}

/** Variante que toca en la semana de `hoy`. */
export function varianteDeLaSemana(ancla: AnclaVariante, hoy: Date = new Date()): number {
  if (ancla.variantCount <= 1) return 0
  const semanas = semanasEntre(ancla.variantAnchorWeek, lunesDeLaSemana(hoy))
  const n = ancla.variantCount
  return (((ancla.variantAnchorIndex + semanas) % n) + n) % n
}

/** Ancla que hace que la semana de `hoy` sea la variante elegida; las siguientes siguen el orden. */
export function anclarEstaSemana(variantIndex: number, hoy: Date = new Date()): Pick<AnclaVariante, 'variantAnchorWeek' | 'variantAnchorIndex'> {
  return { variantAnchorWeek: lunesDeLaSemana(hoy), variantAnchorIndex: variantIndex }
}
