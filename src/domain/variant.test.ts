import { describe, expect, it } from 'vitest'
import { anclarEstaSemana, lunesDeLaSemana, semanasEntre, varianteDeLaSemana } from './variant'

// Meses en Date son 0-based: new Date(2026, 10, 5) = 5 nov 2026 (jueves).
describe('lunesDeLaSemana', () => {
  it('devuelve el lunes de la misma semana', () => {
    expect(lunesDeLaSemana(new Date(2026, 10, 5))).toBe('2026-11-02')
  })

  it('el lunes es su propio lunes', () => {
    expect(lunesDeLaSemana(new Date(2026, 10, 2, 0, 5))).toBe('2026-11-02')
  })

  it('el domingo pertenece a la semana que empezo el lunes anterior', () => {
    expect(lunesDeLaSemana(new Date(2026, 10, 8, 23, 59))).toBe('2026-11-02')
  })

  it('cruza cambio de mes y de año', () => {
    expect(lunesDeLaSemana(new Date(2027, 0, 1))).toBe('2026-12-28')
  })
})

describe('semanasEntre', () => {
  it('cuenta semanas hacia delante y hacia atras', () => {
    expect(semanasEntre('2026-11-02', '2026-11-16')).toBe(2)
    expect(semanasEntre('2026-11-16', '2026-11-02')).toBe(-2)
  })

  it('no se descuadra con el cambio de hora de octubre', () => {
    expect(semanasEntre('2026-10-19', '2026-11-02')).toBe(2)
  })
})

describe('varianteDeLaSemana', () => {
  const ancla = { variantCount: 2, variantAnchorWeek: '2026-11-02', variantAnchorIndex: 0 }

  it('sin variantes siempre es la 0', () => {
    expect(varianteDeLaSemana({ ...ancla, variantCount: 1, variantAnchorIndex: 0 }, new Date(2026, 11, 1))).toBe(0)
  })

  it('alterna A-B-A cada lunes', () => {
    expect(varianteDeLaSemana(ancla, new Date(2026, 10, 8))).toBe(0) // domingo, misma semana
    expect(varianteDeLaSemana(ancla, new Date(2026, 10, 9))).toBe(1) // lunes siguiente
    expect(varianteDeLaSemana(ancla, new Date(2026, 10, 16))).toBe(0)
  })

  it('con 3 variantes recorre A-B-C-A', () => {
    const a3 = { ...ancla, variantCount: 3 }
    expect(varianteDeLaSemana(a3, new Date(2026, 10, 9))).toBe(1)
    expect(varianteDeLaSemana(a3, new Date(2026, 10, 16))).toBe(2)
    expect(varianteDeLaSemana(a3, new Date(2026, 10, 23))).toBe(0)
  })

  it('funciona con semanas anteriores al ancla', () => {
    expect(varianteDeLaSemana(ancla, new Date(2026, 9, 28))).toBe(1)
  })

  it('sigue alternando aunque no se entrene (semanas naturales)', () => {
    expect(varianteDeLaSemana(ancla, new Date(2027, 0, 4))).toBe(1) // 9 semanas despues
  })
})

describe('anclarEstaSemana', () => {
  it('elegir B a mano hace B esta semana y A la siguiente', () => {
    const hoy = new Date(2026, 10, 5)
    const nueva = { variantCount: 2, ...anclarEstaSemana(1, hoy) }
    expect(varianteDeLaSemana(nueva, hoy)).toBe(1)
    expect(varianteDeLaSemana(nueva, new Date(2026, 10, 9))).toBe(0)
  })
})
