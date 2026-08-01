const DIA_MS = 24 * 60 * 60 * 1000

export function diasDesde(timestampMs: number): number {
  return Math.floor((Date.now() - timestampMs) / DIA_MS)
}

export function formatearFechaCorta(timestampMs: number): string {
  return new Date(timestampMs).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** "hoy" / "ayer" / "hace N dias" / "el 12 mar 2026" para fechas mas lejanas. */
export function formatearFechaRelativa(timestampMs: number): string {
  const dias = diasDesde(timestampMs)
  if (dias <= 0) return 'hoy'
  if (dias === 1) return 'ayer'
  if (dias < 30) return `hace ${dias} dias`
  return `el ${formatearFechaCorta(timestampMs)}`
}
