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

/** Fecha de hoy en formato YYYY-MM-DD, en zona horaria local (para BodyEntry.date e <input type="date">). */
export function fechaISOHoy(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Convierte una fecha YYYY-MM-DD a medianoche local, evitando el desfase de interpretarla como UTC. */
export function fechaISOATimestamp(fecha: string): number {
  const [y, m, d] = fecha.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

export function formatearFechaISO(fecha: string): string {
  return formatearFechaCorta(fechaISOATimestamp(fecha))
}
