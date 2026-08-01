import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '../../components/BackButton'
import { Button } from '../../components/Button'
import { ConfirmPanel } from '../../components/ConfirmPanel'
import { SegmentedControl } from '../../components/SegmentedControl'
import { TextField } from '../../components/TextField'
import { createRoutine, updateRoutine, useRoutine } from '../../hooks/useRoutines'

type VariantOption = '1' | '2' | '3' | '4'

const VARIANT_OPTIONS: { value: VariantOption; label: string }[] = [
  { value: '1', label: 'Sin variantes' },
  { value: '2', label: '2 semanas' },
  { value: '3', label: '3 semanas' },
  { value: '4', label: '4 semanas' },
]

const VARIANT_EXPLANATIONS: Record<VariantOption, string> = {
  '1': 'La rutina no alterna variantes: siempre es la misma.',
  '2': 'Tu rutina alternará entre 2 versiones distintas, una cada semana.',
  '3': 'Tu rutina alternará entre 3 versiones distintas, una cada semana.',
  '4': 'Tu rutina alternará entre 4 versiones distintas, una cada semana.',
}

export function RoutineForm() {
  const { routineId } = useParams()
  const esEdicion = routineId !== undefined
  const navigate = useNavigate()
  const existente = useRoutine(routineId)

  const [name, setName] = useState('')
  const [variantCount, setVariantCount] = useState<VariantOption>('1')
  const [variantNames, setVariantNames] = useState<string[]>(['A'])
  const [confirmandoReduccion, setConfirmandoReduccion] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (existente) {
      setName(existente.name)
      setVariantCount(String(existente.variantCount) as VariantOption)
      setVariantNames(existente.variantNames)
    }
  }, [existente])

  if (esEdicion && !existente) {
    return null
  }

  const count = Number(variantCount)

  function handleVariantCountChange(next: VariantOption) {
    setVariantCount(next)
    const nextCount = Number(next)
    setVariantNames((current) => {
      const letras = ['A', 'B', 'C', 'D']
      const nuevo = [...current]
      while (nuevo.length < nextCount) nuevo.push(letras[nuevo.length])
      return nuevo.slice(0, nextCount)
    })
  }

  async function guardar() {
    setGuardando(true)
    try {
      if (esEdicion && routineId) {
        await updateRoutine(routineId, { name, variantCount: count as 1 | 2 | 3 | 4, variantNames })
        navigate(`/rutinas/${routineId}`)
      } else {
        const id = await createRoutine(name, count as 1 | 2 | 3 | 4)
        navigate(`/rutinas/${id}`)
      }
    } finally {
      setGuardando(false)
    }
  }

  function handleSubmit() {
    const reduceVariantes = esEdicion && existente && count < existente.variantCount
    if (reduceVariantes) {
      setConfirmandoReduccion(true)
      return
    }
    void guardar()
  }

  if (confirmandoReduccion) {
    return (
      <div className="flex flex-col gap-6 px-4 py-8">
        <div className="flex items-center gap-1">
          <BackButton />
          <h1 className="text-title text-text">
            {esEdicion ? 'Editar rutina' : 'Nueva rutina'}
          </h1>
        </div>
        <ConfirmPanel
          message={`Vas a reducir de ${existente?.variantCount} a ${count} variante${count === 1 ? '' : 's'}. Los entrenos de las variantes eliminadas se borran, pero sus sesiones pasadas se conservan en las gráficas. ¿Continuar?`}
          confirmLabel="Sí, continuar"
          onCancel={() => setConfirmandoReduccion(false)}
          onConfirm={guardar}
          loading={guardando}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8 pb-12">
      <div className="flex items-center gap-1">
        <BackButton />
        <h1 className="text-title text-text">{esEdicion ? 'Editar rutina' : 'Nueva rutina'}</h1>
      </div>

      <TextField
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej. Upper/Lower 2026"
      />

      <div className="flex flex-col gap-3">
        <span className="text-label uppercase text-text-secondary">Variantes</span>
        <SegmentedControl options={VARIANT_OPTIONS} value={variantCount} onChange={handleVariantCountChange} />
        <p className="text-caption text-text-secondary">{VARIANT_EXPLANATIONS[variantCount]}</p>
      </div>

      {count > 1 && (
        <div className="flex flex-col gap-3">
          <span className="text-label uppercase text-text-secondary">Nombres de las variantes</span>
          {variantNames.map((v, i) => (
            <TextField
              key={i}
              value={v}
              onChange={(e) => {
                const copia = [...variantNames]
                copia[i] = e.target.value
                setVariantNames(copia)
              }}
            />
          ))}
        </div>
      )}

      <Button variant="primary" onClick={handleSubmit} disabled={!name.trim() || guardando}>
        {guardando ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  )
}
