let audioCtx: AudioContext | null = null

function obtenerContexto(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioCtx = new AudioContextClass()
  }
  return audioCtx
}

/**
 * Desbloquea el audio en iOS. Debe llamarse de forma sincrona dentro de un gesto del usuario
 * (el tap en "Descanso"). Ademas de reanudar el contexto, reproduce un sonido silencioso: en
 * iOS a veces resume() no basta si no suena nada durante el propio gesto.
 */
export function prepararSonido(): void {
  const ctx = obtenerContexto()
  if (ctx.state === 'suspended') void ctx.resume()

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  gain.gain.value = 0
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.01)
}

/** Tono corto de dos notas, tipo notificacion, generado sin assets externos. */
export function reproducirTonoFinDescanso(): void {
  if (!audioCtx) return
  const ctx = audioCtx
  if (ctx.state === 'suspended') void ctx.resume()
  const ahora = ctx.currentTime

  ;[880, 1320].forEach((frecuencia, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const inicio = ahora + i * 0.18

    osc.type = 'sine'
    osc.frequency.value = frecuencia
    gain.gain.setValueAtTime(0, inicio)
    gain.gain.linearRampToValueAtTime(0.25, inicio + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, inicio + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(inicio)
    osc.stop(inicio + 0.32)
  })
}
