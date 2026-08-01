import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ConfirmPanel } from '../../components/ConfirmPanel'
import { EmptyState } from '../../components/EmptyState'
import { SegmentedControl } from '../../components/SegmentedControl'
import { SortableList } from '../../components/SortableList'
import { formatearFechaCorta } from '../../domain/dates'
import { varianteMostrada } from '../../domain/variant'
import { clearManualVariant, setManualVariant, useRoutine } from '../../hooks/useRoutines'
import {
  copiarEntrenosDeVariante,
  deleteWorkout,
  duplicateWorkout,
  reorderWorkouts,
  useWorkouts,
} from '../../hooks/useWorkouts'
import { WorkoutCard } from './WorkoutCard'

export function Rutina() {
  const { routineId } = useParams()
  const routine = useRoutine(routineId)
  const [reordenando, setReordenando] = useState(false)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [duplicando, setDuplicando] = useState<string | null>(null)

  const variantIndex = routine
    ? varianteMostrada({
        currentVariantIndex: routine.currentVariantIndex,
        manualVariantIndex: routine.manualVariantIndex,
      })
    : 0

  const items = useWorkouts(routineId ?? '', variantIndex)

  if (!routine || !routineId) return null

  const esManual = routine.manualVariantIndex !== null

  return (
    <div className="flex flex-col gap-6 px-4 py-8 pb-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-title text-text">{routine.name}</h1>
          <Link to={`/rutinas/${routineId}/editar`} className="text-caption text-text-secondary">
            Editar
          </Link>
        </div>

        {routine.variantCount > 1 && (
          <>
            <SegmentedControl
              options={routine.variantNames.map((name, i) => ({ value: String(i), label: name }))}
              value={String(variantIndex)}
              onChange={(v) => setManualVariant(routineId, Number(v))}
            />
            <p className="text-caption text-text-secondary">
              {esManual ? (
                <>
                  Has cambiado la variante a mano ·{' '}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => clearManualVariant(routineId)}
                  >
                    Volver a la sugerida
                  </button>
                </>
              ) : (
                `Variante sugerida: ${routine.variantNames[routine.currentVariantIndex]}`
              )}
            </p>
          </>
        )}

        <p className="text-caption text-text-secondary">
          Creada el {formatearFechaCorta(routine.createdAt)}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-label uppercase text-text-secondary">Entrenos</span>
        {items && items.length > 1 && (
          <button
            type="button"
            className="text-caption text-text-secondary"
            onClick={() => setReordenando((v) => !v)}
          >
            {reordenando ? 'Listo' : 'Reordenar'}
          </button>
        )}
      </div>

      {items === undefined ? null : items.length === 0 ? (
        <EmptyState message="Esta variante todavía no tiene entrenos">
          {routine.variantCount > 1 && (
            <div className="flex flex-col gap-2">
              {routine.variantNames.map(
                (name, i) =>
                  i !== variantIndex && (
                    <Button
                      key={i}
                      variant="secondary"
                      onClick={() => copiarEntrenosDeVariante(routineId, i, variantIndex)}
                    >
                      Copiar entrenos de la variante {name}
                    </Button>
                  ),
              )}
            </div>
          )}
        </EmptyState>
      ) : reordenando ? (
        <SortableList
          items={items}
          getId={(item) => item.workout.id}
          onReorder={(reordered) => reorderWorkouts(reordered.map((item) => item.workout))}
          renderItem={(item) => (
            <div className="rounded-card bg-surface p-4 text-body text-text">{item.workout.name}</div>
          )}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(({ workout, lastSessionAt, sesionSinTerminar }) => (
            <div key={workout.id}>
              <WorkoutCard
                workout={workout}
                lastSessionAt={lastSessionAt}
                sesionSinTerminar={sesionSinTerminar}
                onDuplicar={() =>
                  routine.variantCount > 1 ? setDuplicando(workout.id) : duplicateWorkout(workout.id, 0)
                }
                onEliminar={() => setEliminando(workout.id)}
              />
              {duplicando === workout.id && (
                <div className="mt-2 flex flex-col gap-2 rounded-card border border-border bg-surface p-3">
                  <span className="text-caption text-text-secondary">Copiar a la variante:</span>
                  <div className="flex gap-2">
                    {routine.variantNames.map((name, i) => (
                      <button
                        key={i}
                        type="button"
                        className="flex-1 rounded-field border border-border py-2 text-caption text-text"
                        onClick={() => {
                          duplicateWorkout(workout.id, i)
                          setDuplicando(null)
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {eliminando === workout.id && (
                <div className="mt-2">
                  <ConfirmPanel
                    message="Se eliminará este entreno de la rutina. El historial de sesiones ya realizadas se conserva."
                    confirmLabel="Sí, eliminar"
                    onCancel={() => setEliminando(null)}
                    onConfirm={() => {
                      deleteWorkout(workout.id)
                      setEliminando(null)
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Link to={`/rutinas/${routineId}/entrenos/nuevo?variante=${variantIndex}`}>
        <Button variant="secondary">Nuevo entreno</Button>
      </Link>
    </div>
  )
}
