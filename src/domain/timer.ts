/** "01:23" a partir de segundos totales. */
export function formatearTiempo(segundosTotales: number): string {
  const segundos = Math.max(0, Math.round(segundosTotales))
  const min = Math.floor(segundos / 60)
  const seg = segundos % 60
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
}
