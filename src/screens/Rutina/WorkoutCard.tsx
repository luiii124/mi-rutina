import { Link } from 'react-router-dom'
import { SwipeActions, type SwipeAction } from '../../components/SwipeActions'
import { formatearFechaRelativa } from '../../domain/dates'
import type { Workout } from '../../db/types'

interface WorkoutCardProps {
  workout: Workout
  lastSessionAt: number | null
  sesionSinTerminar: boolean
  onDuplicar: () => void
  onEliminar: () => void
}

export function WorkoutCard({
  workout,
  lastSessionAt,
  sesionSinTerminar,
  onDuplicar,
  onEliminar,
}: WorkoutCardProps) {
  const actions: SwipeAction[] = [
    { label: 'Duplicar', onClick: onDuplicar },
    { label: 'Eliminar', onClick: onEliminar, destructive: true },
  ]

  return (
    <SwipeActions actions={actions}>
      <Link to={`/entrenos/${workout.id}`} className="flex items-start justify-between gap-2 rounded-card bg-surface p-4">
        <div className="flex flex-col gap-1">
          <span className="text-heading text-text">{workout.name}</span>
          {workout.materials.length > 0 && (
            <span className="text-caption text-text-secondary">Materiales: {workout.materials.join(' · ')}</span>
          )}
          {sesionSinTerminar && <span className="text-caption text-text-secondary">Sesión sin terminar</span>}
        </div>
        <span className="shrink-0 text-caption text-text-tertiary">
          {lastSessionAt !== null ? formatearFechaRelativa(lastSessionAt) : 'Nunca'}
        </span>
      </Link>
    </SwipeActions>
  )
}
