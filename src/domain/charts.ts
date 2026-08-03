/** Marcas del eje Y con paso fijo (1/2/2,5/5/10 x potencia de diez), para que no salten numeros sueltos. */
export function calcularTicksEje(valorMaximo: number, pasosObjetivo = 4): number[] {
  if (valorMaximo <= 0) return [0, 1]
  const pasoBruto = valorMaximo / pasosObjetivo
  const magnitud = 10 ** Math.floor(Math.log10(pasoBruto))
  const candidatos = [1, 2, 2.5, 5, 10]
  const paso = (candidatos.map((c) => c * magnitud).find((p) => p >= pasoBruto) ?? 10 * magnitud) as number

  const ticks: number[] = []
  for (let v = 0; v <= valorMaximo + paso; v += paso) ticks.push(Math.round(v * 100) / 100)
  return ticks
}
