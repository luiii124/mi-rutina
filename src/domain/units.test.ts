import { describe, expect, it } from 'vitest'
import { kgToLb, lbToKg, displayKg, displayLb, formatWeightForDisplay, parseWeightInput } from './units'

describe('conversion kg <-> lb', () => {
  it('ida y vuelta sin perdida', () => {
    for (const kg of [0, 1, 20, 82.5, 137.135, 999.999]) {
      expect(lbToKg(kgToLb(kg))).toBeCloseTo(kg, 9)
    }
  })

  it('kgToLb usa el factor correcto', () => {
    expect(kgToLb(100)).toBeCloseTo(220.462262185, 6)
  })
})

describe('redondeo al mostrar', () => {
  it('kg redondea a 0,5 por defecto', () => {
    expect(displayKg(81.6)).toBe(81.5)
    expect(displayKg(82.4)).toBe(82.5)
  })

  it('kg usa 0,25 cuando el valor esta en un cuarto exacto', () => {
    expect(displayKg(81.65)).toBe(81.75)
    expect(displayKg(81.35)).toBe(81.25)
  })

  it('lb siempre redondea a 0,5', () => {
    expect(displayLb(100.2)).toBe(100)
    expect(displayLb(100.3)).toBe(100.5)
  })
})

describe('formatWeightForDisplay / parseWeightInput', () => {
  it('no redondea al guardar un valor introducido en lb', () => {
    expect(parseWeightInput(225, 'lb')).toBeCloseTo(lbToKg(225), 9)
  })

  it('guarda el valor tal cual cuando la unidad es kg', () => {
    expect(parseWeightInput(82.5, 'kg')).toBe(82.5)
  })

  it('muestra el valor guardado convertido y redondeado', () => {
    expect(formatWeightForDisplay(100, 'lb')).toBe(displayLb(kgToLb(100)))
  })
})
