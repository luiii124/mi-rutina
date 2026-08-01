import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { fieldClass } from '../../components/TextField'
import type { Exercise } from '../../db/types'
import { createExercise, encontrarCoincidenciaCasiExacta, useExerciseSearch } from '../../hooks/useExerciseSearch'

export function AnadirEjercicio() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [avisoDuplicado, setAvisoDuplicado] = useState<Exercise | null>(null)
  const resultados = useExerciseSearch(query)

  function irAConfigurar(exerciseId: string) {
    navigate(`/entrenos/${workoutId}/ejercicios/nuevo?ejercicio=${exerciseId}`)
  }

  async function handleCrear(forzar = false) {
    const nombre = query.trim()
    if (!nombre) return

    if (!forzar) {
      const coincidencia = resultados ? encontrarCoincidenciaCasiExacta(resultados, nombre) : undefined
      if (coincidencia) {
        setAvisoDuplicado(coincidencia)
        return
      }
    }

    const id = await createExercise(nombre, null)
    irAConfigurar(id)
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-8 pb-12">
      <h1 className="text-title text-text">Añadir ejercicio</h1>

      <input
        type="text"
        autoFocus
        className={fieldClass}
        placeholder="Buscar ejercicio..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setAvisoDuplicado(null)
        }}
      />

      {avisoDuplicado && (
        <div className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4">
          <p className="text-body text-text">Ya existe «{avisoDuplicado.name}». ¿Querías ese?</p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => handleCrear(true)}>
              Crear de todas formas
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => irAConfigurar(avisoDuplicado.id)}>
              Usar «{avisoDuplicado.name}»
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {resultados?.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            onClick={() => irAConfigurar(exercise.id)}
            className="flex flex-col items-start gap-0.5 rounded-card bg-surface p-4 text-left"
          >
            <span className="flex items-center gap-2 text-body text-text">
              {exercise.name}
              {!exercise.isBuiltIn && (
                <span className="rounded-field bg-surface-raised px-2 py-0.5 text-caption text-text-secondary">
                  Mío
                </span>
              )}
            </span>
            {exercise.muscleGroup && (
              <span className="text-caption text-text-secondary">{exercise.muscleGroup}</span>
            )}
          </button>
        ))}
      </div>

      {query.trim().length > 0 && (
        <Button variant="secondary" onClick={() => handleCrear()}>
          Crear ejercicio nuevo: «{query.trim()}»
        </Button>
      )}
    </div>
  )
}
