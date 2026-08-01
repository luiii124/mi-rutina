import { describe, expect, it } from 'vitest'
import { avanzarVariante, varianteMostrada, type RoutineVariantState } from './variant'

function estado(overrides: Partial<RoutineVariantState>): RoutineVariantState {
  return {
    variantCount: 2,
    currentVariantIndex: 0,
    cycleCompletedWorkoutIds: [],
    manualVariantIndex: null,
    ...overrides,
  }
}

describe('avanzarVariante', () => {
  it('sin variantes no cambia nada', () => {
    const e = estado({ variantCount: 1 })
    expect(avanzarVariante(e, 'w1', ['w1', 'w2'])).toBe(e)
  })

  it('anota el entreno completado sin cerrar el ciclo si faltan otros', () => {
    const e = estado({})
    const resultado = avanzarVariante(e, 'w1', ['w1', 'w2'])
    expect(resultado.cycleCompletedWorkoutIds).toEqual(['w1'])
    expect(resultado.currentVariantIndex).toBe(0)
  })

  it('avanza de variante y reinicia el ciclo cuando se completan todos los entrenos', () => {
    const e = estado({ cycleCompletedWorkoutIds: ['w1'] })
    const resultado = avanzarVariante(e, 'w2', ['w1', 'w2'])
    expect(resultado.currentVariantIndex).toBe(1)
    expect(resultado.cycleCompletedWorkoutIds).toEqual([])
    expect(resultado.manualVariantIndex).toBeNull()
  })

  it('da la vuelta al llegar a la ultima variante', () => {
    const e = estado({ variantCount: 3, currentVariantIndex: 2, cycleCompletedWorkoutIds: ['w1'] })
    const resultado = avanzarVariante(e, 'w2', ['w1', 'w2'])
    expect(resultado.currentVariantIndex).toBe(0)
  })

  it('un entreno nuevo anadido a mitad de ciclo no cierra el ciclo antes de tiempo', () => {
    const e = estado({ cycleCompletedWorkoutIds: ['w1', 'w2'] })
    const resultado = avanzarVariante(e, 'w1', ['w1', 'w2', 'w3'])
    expect(resultado.currentVariantIndex).toBe(0)
    expect(resultado.cycleCompletedWorkoutIds).toEqual(['w1', 'w2'])
  })

  it('no duplica un entreno ya marcado como completado', () => {
    const e = estado({ cycleCompletedWorkoutIds: ['w1'] })
    const resultado = avanzarVariante(e, 'w1', ['w1', 'w2'])
    expect(resultado.cycleCompletedWorkoutIds).toEqual(['w1'])
  })
})

describe('varianteMostrada', () => {
  it('usa la sugerida si no hay eleccion manual', () => {
    expect(varianteMostrada({ currentVariantIndex: 1, manualVariantIndex: null })).toBe(1)
  })

  it('usa la manual si el usuario la fijo', () => {
    expect(varianteMostrada({ currentVariantIndex: 1, manualVariantIndex: 0 })).toBe(0)
  })
})
