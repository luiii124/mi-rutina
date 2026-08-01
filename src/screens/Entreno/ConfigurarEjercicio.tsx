import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BackButton } from '../../components/BackButton'
import { Button } from '../../components/Button'
import { TextAreaField, TextField, fieldClass } from '../../components/TextField'
import { db } from '../../db/schema'
import { createExercise } from '../../hooks/useExerciseSearch'
import { useSettings } from '../../hooks/useSettings'
import {
  addExerciseToWorkout,
  updateWorkoutExercise,
  useWorkoutExercise,
} from '../../hooks/useWorkoutExercises'

const REST_PRESETS = [60, 90, 120, 180]

export function ConfigurarEjercicio() {
  const { workoutId, workoutExerciseId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const settings = useSettings()
  const esEdicion = workoutExerciseId !== undefined

  const existente = useWorkoutExercise(workoutExerciseId)
  const exerciseIdNuevo = searchParams.get('ejercicio')
  const exerciseId = esEdicion ? existente?.exerciseId : exerciseIdNuevo

  const exercise = useLiveQuery(
    () => (exerciseId ? db.exercises.get(exerciseId) : undefined),
    [exerciseId],
  )

  const [nombreEditado, setNombreEditado] = useState('')
  const [editandoNombre, setEditandoNombre] = useState(false)
  const [note, setNote] = useState('')
  const [targetSets, setTargetSets] = useState(3)
  const [seriesTexto, setSeriesTexto] = useState('3')
  const [repMin, setRepMin] = useState('')
  const [repMax, setRepMax] = useState('')
  const [restSeconds, setRestSeconds] = useState<number | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (existente) {
      setNote(existente.note ?? '')
      setTargetSets(existente.targetSets)
      setSeriesTexto(String(existente.targetSets))
      setRepMin(existente.repMin === null ? '' : String(existente.repMin))
      setRepMax(existente.repMax === null ? '' : String(existente.repMax))
      setRestSeconds(existente.restSeconds)
    }
  }, [existente])

  useEffect(() => {
    if (exercise) setNombreEditado(exercise.name)
  }, [exercise])

  if (esEdicion && (!existente || !exercise)) return null
  if (!esEdicion && !exercise) return null
  if (!exercise || !workoutId) return null

  function calcularRango(): { repMin: number | null; repMax: number | null } {
    const min = repMin.trim() ? Number(repMin) : null
    const max = repMax.trim() ? Number(repMax) : null
    if (min !== null && max === null) return { repMin: min, repMax: min }
    if (min === null && max !== null) return { repMin: max, repMax: max }
    return { repMin: min, repMax: max }
  }

  async function guardar() {
    if (!workoutId || !exercise) return
    setGuardando(true)
    try {
      const rango = calcularRango()
      const config = {
        note: note.trim() ? note.trim() : null,
        targetSets,
        repMin: rango.repMin,
        repMax: rango.repMax,
        restSeconds,
      }

      if (esEdicion && workoutExerciseId) {
        await updateWorkoutExercise(workoutExerciseId, config)
      } else {
        await addExerciseToWorkout(workoutId, exercise.id, config)
      }
      navigate(`/entrenos/${workoutId}`)
    } finally {
      setGuardando(false)
    }
  }

  async function handleCrearCopia() {
    if (!nombreEditado.trim() || !exercise || !workoutId) return
    const nuevoId = await createExercise(nombreEditado.trim(), exercise.muscleGroup)
    navigate(`/entrenos/${workoutId}/ejercicios/nuevo?ejercicio=${nuevoId}`, { replace: true })
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8 pb-12">
      <div className="flex items-center gap-1">
        <BackButton to={`/entrenos/${workoutId}`} />
        <h1 className="text-title text-text">Configurar ejercicio</h1>
      </div>

      {exercise.isBuiltIn ? (
        <div className="flex flex-col gap-2">
          <span className="text-label uppercase text-text-secondary">Ejercicio</span>
          <p className="text-body text-text">{exercise.name}</p>
          {!editandoNombre ? (
            <button
              type="button"
              className="text-left text-caption text-text-secondary underline"
              onClick={() => setEditandoNombre(true)}
            >
              Crear una copia con otro nombre
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <TextField value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} />
              <Button variant="secondary" onClick={handleCrearCopia}>
                Crear copia «{nombreEditado}»
              </Button>
            </div>
          )}
        </div>
      ) : (
        <TextField label="Nombre del ejercicio" value={nombreEditado} disabled className="opacity-60" />
      )}

      <TextAreaField
        label="Nota"
        placeholder="Ej. Banco en el 3, agarre justo fuera de los hombros"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <span className="text-label uppercase text-text-secondary">Series</span>
        <input
          type="text"
          inputMode="numeric"
          className={fieldClass}
          value={seriesTexto}
          onChange={(e) => setSeriesTexto(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={() => {
            const n = Math.min(10, Math.max(1, Number(seriesTexto) || 1))
            setTargetSets(n)
            setSeriesTexto(String(n))
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label uppercase text-text-secondary">Rango de repeticiones</span>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Mín"
            className={fieldClass}
            value={repMin}
            onChange={(e) => setRepMin(e.target.value)}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Máx"
            className={fieldClass}
            value={repMax}
            onChange={(e) => setRepMax(e.target.value)}
          />
        </div>
        <p className="text-caption text-text-secondary">
          Si lo dejas vacío, las repeticiones nunca se pintan de rojo.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label uppercase text-text-secondary">Descanso</span>
        <div className="flex gap-2">
          {REST_PRESETS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => setRestSeconds(seconds)}
              className={`flex-1 rounded-field border border-border py-3 text-body ${
                restSeconds === seconds ? 'bg-border text-text' : 'bg-surface-raised text-text-secondary'
              }`}
            >
              {seconds}s
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRestSeconds(null)}
          className={`rounded-field border border-border py-3 text-caption ${
            restSeconds === null ? 'bg-border text-text' : 'bg-surface-raised text-text-secondary'
          }`}
        >
          Usar el valor por defecto de Ajustes ({settings?.defaultRestSeconds ?? 90}s)
        </button>
      </div>

      <Button variant="primary" onClick={guardar} disabled={guardando}>
        {guardando ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  )
}
