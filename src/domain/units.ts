export type Unit = 'kg' | 'lb'

const KG_PER_LB = 1 / 2.20462262185

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step
}

/**
 * Redondea a 0,5 kg salvo que el valor caiga en un cuarto exacto (x,25 / x,75),
 * en cuyo caso conserva esa precision. Ver DATA_MODEL.md, conversion de unidades.
 */
export function displayKg(kg: number): number {
  return roundToStep(kg, 0.25)
}

export function displayLb(lb: number): number {
  return roundToStep(lb, 0.5)
}

/** Valor a mostrar en la unidad activa, ya redondeado. El dato guardado siempre esta en kg. */
export function formatWeightForDisplay(weightKg: number, unit: Unit): number {
  return unit === 'kg' ? displayKg(weightKg) : displayLb(kgToLb(weightKg))
}

/** Convierte lo que el usuario escribe a kg para guardar, sin redondear. */
export function parseWeightInput(value: number, unit: Unit): number {
  return unit === 'kg' ? value : lbToKg(value)
}
