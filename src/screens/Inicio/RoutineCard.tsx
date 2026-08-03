import { Link } from 'react-router-dom'
import { SwipeActions, type SwipeAction } from '../../components/SwipeActions'
import { formatearFechaCorta, formatearFechaRelativa } from '../../domain/dates'
import type { Routine } from '../../db/types'

interface RoutineCardProps {
  routine: Routine
  lastSessionAt: number | null
  onDuplicar: () => void
  onArchivar: () => void
  onReactivar: () => void
  onEliminar: () => void
}

export function RoutineCard({
  routine,
  lastSessionAt,
  onDuplicar,
  onArchivar,
  onReactivar,
  onEliminar,
}: RoutineCardProps) {
  const archivada = routine.archivedAt !== null

  const actions: SwipeAction[] = archivada
    ? [
        { label: 'Reactivar', onClick: onReactivar },
        { label: 'Eliminar', onClick: onEliminar, destructive: true },
      ]
    : [
        { label: 'Duplicar', onClick: onDuplicar },
        { label: 'Terminar', onClick: onArchivar },
        { label: 'Eliminar', onClick: onEliminar, destructive: true },
      ]

  return (
    <SwipeActions actions={actions}>
      <Link
        to={`/rutinas/${routine.id}`}
        className="flex flex-col gap-1 rounded-card bg-surface p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <span className={`text-heading ${archivada ? 'text-text-secondary' : 'text-text'}`}>
            {routine.name}
          </span>
          {routine.variantCount > 1 && (
            <span className="shrink-0 rounded-field bg-surface-raised px-2.5 py-1 text-caption text-text-secondary">
              {routine.variantNames[routine.manualVariantIndex ?? routine.currentVariantIndex]}
            </span>
          )}
        </div>
        <span className="text-caption text-text-secondary">
          {archivada && routine.archivedAt !== null
            ? `Terminada el ${formatearFechaCorta(routine.archivedAt)}`
            : `Creada el ${formatearFechaCorta(routine.createdAt)}${
                lastSessionAt !== null ? ` · Última sesión ${formatearFechaRelativa(lastSessionAt)}` : ''
              }`}
        </span>
      </Link>
    </SwipeActions>
  )
}
