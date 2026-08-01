import { describe, expect, it } from 'vitest'
import { calcularPR, type SetPRInput } from './personalRecord'

function set(overrides: Partial<SetPRInput>): SetPRInput {
  return {
    weightKg: 80,
    reps: 8,
    sessionId: 's1',
    routineId: 'r1',
    achievedAt: 1,
    ...overrides,
  }
}

describe('calcularPR', () => {
  it('sin series validas no hay PR', () => {
    expect(calcularPR([])).toBeNull()
    expect(calcularPR([set({ weightKg: null }), set({ reps: 0 })])).toBeNull()
  })

  it('gana el peso mas alto', () => {
    const pr = calcularPR([set({ weightKg: 80 }), set({ weightKg: 100 }), set({ weightKg: 90 })])
    expect(pr?.weightKg).toBe(100)
  })

  it('en empate a peso gana mas repeticiones', () => {
    const pr = calcularPR([
      set({ weightKg: 100, reps: 3, achievedAt: 1 }),
      set({ weightKg: 100, reps: 5, achievedAt: 2 }),
    ])
    expect(pr?.reps).toBe(5)
  })

  it('en empate total gana el registro mas antiguo', () => {
    const pr = calcularPR([
      set({ weightKg: 100, reps: 5, achievedAt: 500, sessionId: 'nuevo' }),
      set({ weightKg: 100, reps: 5, achievedAt: 100, sessionId: 'original' }),
    ])
    expect(pr?.sessionId).toBe('original')
  })

  it('ignora series con peso nulo o repeticiones a 0', () => {
    const pr = calcularPR([
      set({ weightKg: 200, reps: 0 }),
      set({ weightKg: null, reps: 10 }),
      set({ weightKg: 90, reps: 8 }),
    ])
    expect(pr?.weightKg).toBe(90)
  })
})
