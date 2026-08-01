let audioCtx: AudioContext | null = null

/** Desbloquea el audio en iOS. Debe llamarse de forma sincrona dentro de un gesto del usuario. */
export function prepararSonido(): void {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume()
}

/** Tono corto de dos notas, tipo notificacion, generado sin assets externos. */
export function reproducirTonoFinDescanso(): void {
  if (!audioCtx) return
  const ctx = audioCtx
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
