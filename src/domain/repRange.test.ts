import { describe, expect, it } from 'vitest'
import { estaFueraDeRango } from './repRange'

describe('estaFueraDeRango', () => {
  it('dentro del rango no esta fuera', () => {
    expect(estaFueraDeRango(10, 8, 12)).toBe(false)
    expect(estaFueraDeRango(8, 8, 12)).toBe(false)
    expect(estaFueraDeRango(12, 8, 12)).toBe(false)
  })

  it('por debajo o por encima del rango esta fuera', () => {
    expect(estaFueraDeRango(6, 8, 12)).toBe(true)
    expect(estaFueraDeRango(14, 8, 12)).toBe(true)
  })

  it('sin rango definido nunca esta fuera', () => {
    expect(estaFueraDeRango(20, null, null)).toBe(false)
    expect(estaFueraDeRango(20, 8, null)).toBe(false)
    expect(estaFueraDeRango(20, null, 12)).toBe(false)
  })

  it('sin repeticiones o con 0 nunca esta fuera', () => {
    expect(estaFueraDeRango(null, 8, 12)).toBe(false)
    expect(estaFueraDeRango(0, 8, 12)).toBe(false)
  })
})
