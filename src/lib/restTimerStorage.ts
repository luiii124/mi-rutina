const KEY = 'mi-rutina:descanso'

interface DescansoGuardado {
  workoutExerciseId: string
  finEn: number
}

/**
 * Guarda el final del descanso activo para poder recuperarlo si Safari descarga la pagina de
 * la memoria al bloquear el movil (no solo la pausa: la recarga entera y pierde el estado en
 * memoria). Solo hace falta un hueco global porque solo puede haber un descanso activo a la vez.
 */
export function guardarDescanso(workoutExerciseId: string, finEn: number): void {
  localStorage.setItem(KEY, JSON.stringify({ workoutExerciseId, finEn } satisfies DescansoGuardado))
}

export function borrarDescansoGuardado(): void {
  localStorage.removeItem(KEY)
}

/** Devuelve el instante de fin guardado para este ejercicio, o null si no hay ninguno. */
export function leerDescansoGuardado(workoutExerciseId: string): number | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as DescansoGuardado
    return data.workoutExerciseId === workoutExerciseId ? data.finEn : null
  } catch {
    return null
  }
}
