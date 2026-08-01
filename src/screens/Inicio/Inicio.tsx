import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ConfirmPanel } from '../../components/ConfirmPanel'
import { EmptyState } from '../../components/EmptyState'
import {
  archiveRoutine,
  deleteRoutine,
  duplicateRoutine,
  reactivateRoutine,
  useRoutineList,
} from '../../hooks/useRoutines'
import { RoutineCard } from './RoutineCard'

export function Inicio() {
  const items = useRoutineList()
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [borrando, setBorrando] = useState(false)

  async function handleEliminar() {
    if (!eliminando) return
    setBorrando(true)
    try {
      await deleteRoutine(eliminando)
      setEliminando(null)
    } finally {
      setBorrando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-title text-text">Mi Rutina</h1>
      </div>

      <Link to="/rutinas/nueva">
        <Button variant="primary">Nueva rutina</Button>
      </Link>

      {items === undefined ? null : items.length === 0 ? (
        <EmptyState message="Todavía no tienes ninguna rutina" />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(({ routine, lastSessionAt }) => (
            <div key={routine.id}>
              <RoutineCard
                routine={routine}
                lastSessionAt={lastSessionAt}
                onDuplicar={() => duplicateRoutine(routine.id)}
                onArchivar={() => archiveRoutine(routine.id)}
                onReactivar={() => reactivateRoutine(routine.id)}
                onEliminar={() => setEliminando(routine.id)}
              />
              {eliminando === routine.id && (
                <div className="mt-2">
                  <ConfirmPanel
                    message="Se borrará también todo el historial de sesiones de esta rutina. Los PR no se pierden: son universales y se recalculan si hacía falta."
                    confirmLabel="Sí, eliminar"
                    onCancel={() => setEliminando(null)}
                    onConfirm={handleEliminar}
                    loading={borrando}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <Link to="/progreso" className="text-body text-text-secondary">
          Mi progreso
        </Link>
        <Link to="/ajustes" className="text-body text-text-secondary">
          Ajustes
        </Link>
        <Link to="/debug" className="text-caption text-text-tertiary">
          Depuración (dev)
        </Link>
      </div>
    </div>
  )
}
