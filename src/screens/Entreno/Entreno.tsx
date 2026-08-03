import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '../../components/BackButton'
import { Button } from '../../components/Button'
import { ConfirmPanel } from '../../components/ConfirmPanel'
import { EmptyState } from '../../components/EmptyState'
import { PhotoThumbnail } from '../../components/PhotoThumbnail'
import { SortableList } from '../../components/SortableList'
import { SwipeActions } from '../../components/SwipeActions'
import { db } from '../../db/schema'
import type { Exercise, WorkoutExercise } from '../../db/types'
import { formatearFechaCorta } from '../../domain/dates'
import {
  iniciarOContinuarSesion,
  primerEjercicioPendiente,
  useLastCompletedSession,
  useUnfinishedSession,
} from '../../hooks/useSessions'
import { usePhoto } from '../../hooks/usePhotos'
import { useWorkout } from '../../hooks/useWorkouts'
import {
  removeWorkoutExercise,
  reorderWorkoutExercises,
  useWorkoutExercises,
} from '../../hooks/useWorkoutExercises'

export function Entreno() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const workout = useWorkout(workoutId)
  const items = useWorkoutExercises(workoutId ?? '')
  const sesionActiva = useUnfinishedSession(workoutId)
  const ultimaSesionCompletada = useLastCompletedSession(workoutId)
  const [reordenando, setReordenando] = useState(false)
  const [quitando, setQuitando] = useState<string | null>(null)
  const [empezando, setEmpezando] = useState(false)

  const ultimaSesion = useLiveQuery(async () => {
    if (!workoutId) return null
    const sesiones = await db.sessions.where('workoutId').equals(workoutId).toArray()
    return sesiones.length > 0 ? Math.max(...sesiones.map((s) => s.startedAt)) : null
  }, [workoutId])

  if (!workout || !workoutId) return null

  async function handleEmpezar() {
    if (!workout) return
    setEmpezando(true)
    try {
      const sessionId = await iniciarOContinuarSesion(workout)
      const primerId = await primerEjercicioPendiente(sessionId, workout.id)
      if (primerId) navigate(`/entrenos/${workout.id}/sesion/${sessionId}/${primerId}`)
    } finally {
      setEmpezando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8 pb-12">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <BackButton to={`/rutinas/${workout.routineId}`} />
            <h1 className="text-title text-text">{workout.name}</h1>
          </div>
          <Link to={`/entrenos/${workoutId}/editar`} className="text-caption text-text-secondary">
            Editar
          </Link>
        </div>
        {workout.materials.length > 0 && (
          <p className="text-caption text-text-secondary">{workout.materials.join(' · ')}</p>
        )}
        <p className="text-caption text-text-tertiary">
          Actualizado el {formatearFechaCorta(workout.updatedAt)}
          {ultimaSesion ? ` · Última sesión: ${formatearFechaCorta(ultimaSesion)}` : ''}
        </p>
      </div>

      {ultimaSesionCompletada?.note && (
        <div className="flex flex-col gap-1 rounded-card bg-surface p-4">
          <span className="text-label uppercase text-text-secondary">Notas de la última sesión</span>
          <p className="text-caption text-text-secondary">{ultimaSesionCompletada.note}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-label uppercase text-text-secondary">Ejercicios</span>
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
        <EmptyState message="Este entreno todavía no tiene ejercicios" />
      ) : reordenando ? (
        <SortableList
          items={items}
          getId={(item) => item.workoutExercise.id}
          onReorder={(reordered) => reorderWorkoutExercises(reordered.map((i) => i.workoutExercise))}
          renderItem={(item, index) => (
            <ExerciseRow index={index} exercise={item.exercise} workoutExercise={item.workoutExercise} />
          )}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div key={item.workoutExercise.id}>
              <SwipeActions
                actions={[
                  {
                    label: 'Editar',
                    onClick: () => navigate(`/entrenos/${workoutId}/ejercicios/${item.workoutExercise.id}/editar`),
                  },
                  {
                    label: 'Quitar',
                    onClick: () => setQuitando(item.workoutExercise.id),
                    destructive: true,
                  },
                ]}
              >
                <Link
                  to={
                    sesionActiva
                      ? `/entrenos/${workoutId}/sesion/${sesionActiva.id}/${item.workoutExercise.id}`
                      : `/entrenos/${workoutId}/ejercicios/${item.workoutExercise.id}/editar`
                  }
                >
                  <ExerciseRow index={index} exercise={item.exercise} workoutExercise={item.workoutExercise} />
                </Link>
              </SwipeActions>
              {quitando === item.workoutExercise.id && (
                <div className="mt-2">
                  <ConfirmPanel
                    message={`¿Quitar ${item.exercise.name} de este entreno? No se borra del catálogo ni pierde su historial.`}
                    confirmLabel="Sí, quitar"
                    onCancel={() => setQuitando(null)}
                    onConfirm={() => {
                      removeWorkoutExercise(item.workoutExercise.id)
                      setQuitando(null)
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Link to={`/entrenos/${workoutId}/anadir-ejercicio`}>
        <Button variant="secondary">Añadir ejercicio</Button>
      </Link>

      {items && items.length > 0 && (
        <Button variant="primary" onClick={handleEmpezar} disabled={empezando}>
          {sesionActiva ? 'Continuar entreno' : 'Empezar entreno'}
        </Button>
      )}

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <Link to={`/rutinas/${workout.routineId}`}>
          <Button variant="secondary">Volver a la rutina</Button>
        </Link>
        <Link to="/">
          <Button variant="secondary">Volver a inicio</Button>
        </Link>
      </div>
    </div>
  )
}

function ExerciseRow({
  index,
  exercise,
  workoutExercise,
}: {
  index: number
  exercise: Exercise
  workoutExercise: WorkoutExercise
}) {
  const rango =
    workoutExercise.repMin !== null && workoutExercise.repMax !== null
      ? `${workoutExercise.repMin}-${workoutExercise.repMax} reps`
      : null
  const foto = usePhoto(exercise.photoId)

  return (
    <div className="flex items-center justify-between gap-2 rounded-card bg-surface p-4">
      <div className="flex flex-col gap-1">
        <span className="text-body text-text">
          {index + 1}. {exercise.name}
        </span>
        <span className="text-caption text-text-secondary">
          {workoutExercise.targetSets} series{rango ? ` · ${rango}` : ''}
        </span>
      </div>
      {foto && <PhotoThumbnail photo={foto} className="h-12 w-12 shrink-0 rounded-field object-cover" />}
    </div>
  )
}
