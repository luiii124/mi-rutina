/**
 * Al terminar (o salir de) una sesion hay que volver a la pantalla del entreno retrocediendo en
 * el historial, no abriendola de nuevo encima: si no, el gesto de deslizar hacia atras de iOS
 * te devuelve a la sesion recien terminada en vez de a la rutina y luego a inicio.
 *
 * Se apunta la posicion del historial de la pantalla del entreno al empezar la sesion. React
 * Router guarda esa posicion en `history.state.idx`. sessionStorage sobrevive a que Safari
 * recargue la pagina al bloquear el movil.
 */

const CLAVE = 'mi-rutina:entrenoIdx'

function idxActual(): number | null {
  const idx = (window.history.state as { idx?: unknown } | null)?.idx
  return typeof idx === 'number' ? idx : null
}

/** Llamar en la pantalla del entreno justo antes de abrir la sesion. */
export function recordarPosicionDelEntreno(sessionId: string): void {
  const idx = idxActual()
  if (idx === null) return
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify({ sessionId, idx }))
  } catch {
    // Sin almacenamiento se usa el plan B de pasosHastaElEntreno.
  }
}

/**
 * Cuantos pasos hay que retroceder para llegar a la pantalla del entreno (numero negativo), o
 * null si no se sabe (por ejemplo, si la sesion se abrio sin pasar por el entreno).
 */
export function pasosHastaElEntreno(sessionId: string): number | null {
  const actual = idxActual()
  if (actual === null) return null
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null') as { sessionId: string; idx: number } | null
    if (!guardado || guardado.sessionId !== sessionId || guardado.idx >= actual) return null
    return guardado.idx - actual
  } catch {
    return null
  }
}
