import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '../../components/BackButton'
import { EmptyState } from '../../components/EmptyState'
import { fieldClass } from '../../components/TextField'
import { useExercisesConHistorial } from '../../hooks/useHistory'

export function BuscadorPR() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const resultados = useExercisesConHistorial(query)

  return (
    <div className="flex flex-col gap-4 px-4 py-8 pb-12">
      <div className="flex items-center gap-1">
        <BackButton to="/progreso" />
        <h1 className="text-title text-text">Historial de PR</h1>
      </div>

      <input
        type="text"
        autoFocus
        className={fieldClass}
        placeholder="Buscar ejercicio..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {resultados === undefined ? null : resultados.length === 0 ? (
        <EmptyState
          message={
            query.trim() ? 'Ningún ejercicio hecho coincide con la búsqueda.' : 'Aún no has completado ningún ejercicio.'
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {resultados.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              onClick={() => navigate(`/progreso/historial/${exercise.id}`)}
              className="flex flex-col items-start gap-0.5 rounded-card bg-surface p-4 text-left"
            >
              <span className="text-body text-text">{exercise.name}</span>
              {exercise.muscleGroup && <span className="text-caption text-text-secondary">{exercise.muscleGroup}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
