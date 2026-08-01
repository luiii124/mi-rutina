/**
 * Unica funcion de la que depende toda la interfaz para pintar repeticiones en rojo.
 * Ver RIESGOS.md, decision A: cambiar la politica es cuestion de tocar solo aqui.
 */
export function estaFueraDeRango(
  reps: number | null,
  repMin: number | null,
  repMax: number | null,
): boolean {
  if (repMin === null || repMax === null) return false
  if (reps === null || reps === 0) return false
  return reps < repMin || reps > repMax
}
