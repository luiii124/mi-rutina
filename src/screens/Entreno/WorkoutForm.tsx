import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { TagInput } from '../../components/TagInput'
import { TextField } from '../../components/TextField'
import { useRoutine } from '../../hooks/useRoutines'
import { createWorkout, updateWorkout, useMaterialSuggestions, useWorkout } from '../../hooks/useWorkouts'

export function WorkoutForm() {
  const { routineId, workoutId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const esEdicion = workoutId !== undefined

  const existente = useWorkout(workoutId)
  const rutinaIdEfectiva = routineId ?? existente?.routineId
  const routine = useRoutine(rutinaIdEfectiva)
  const sugerencias = useMaterialSuggestions()

  const [name, setName] = useState('')
  const [materials, setMaterials] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (existente) {
      setName(existente.name)
      setMaterials(existente.materials)
    }
  }, [existente])

  if (esEdicion && !existente) return null

  const variantIndex = esEdicion
    ? (existente?.variantIndex ?? 0)
    : Number(searchParams.get('variante') ?? '0')

  async function guardar() {
    setGuardando(true)
    try {
      if (esEdicion && workoutId && existente) {
        await updateWorkout(workoutId, { name, materials })
        navigate(`/entrenos/${workoutId}`)
      } else if (rutinaIdEfectiva) {
        const id = await createWorkout(rutinaIdEfectiva, variantIndex, name, materials)
        navigate(`/entrenos/${id}`)
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8 pb-12">
      <h1 className="text-title text-text">{esEdicion ? 'Editar entreno' : 'Nuevo entreno'}</h1>

      <TextField
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej. Espalda"
      />

      <div className="flex flex-col gap-2">
        <span className="text-label uppercase text-text-secondary">Materiales</span>
        <TagInput
          value={materials}
          onChange={setMaterials}
          suggestions={sugerencias}
          placeholder="Ej. Straps"
        />
      </div>

      {routine && routine.variantCount > 1 && (
        <p className="text-caption text-text-secondary">
          Variante: {routine.variantNames[variantIndex]}
        </p>
      )}

      <Button variant="primary" onClick={guardar} disabled={!name.trim() || guardando}>
        {guardando ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  )
}
