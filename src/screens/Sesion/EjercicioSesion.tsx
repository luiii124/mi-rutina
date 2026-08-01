import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ConfirmPanel } from '../../components/ConfirmPanel'
import { fieldClass } from '../../components/TextField'
import type { SessionSet } from '../../db/types'
import { estaFueraDeRango } from '../../domain/repRange'
import { formatWeightForDisplay, parseWeightInput } from '../../domain/units'
import { useSettings } from '../../hooks/useSettings'
import {
  actualizarSerie,
  anadirSerieExtra,
  asegurarSeriesPrecargadas,
  guardarSerieExtraEnRutina,
  marcarSerieComoRevisada,
  marcarSerieCompletada,
  resumenSeriesSinRevisar,
  terminarSesion,
  useSession,
  useSessionSets,
  useTodosCompletados,
} from '../../hooks/useSessions'
import { useWorkoutExercise, useWorkoutExercises } from '../../hooks/useWorkoutExercises'

export function EjercicioSesion() {
  const { workoutId, sessionId, workoutExerciseId } = useParams()
  const navigate = useNavigate()
  const settings = useSettings()

  const session = useSession(sessionId)
  const items = useWorkoutExercises(workoutId ?? '')
  const workoutExercise = useWorkoutExercise(workoutExerciseId)
  const sets = useSessionSets(sessionId, workoutExerciseId)
  const todosCompletados = useTodosCompletados(sessionId, workoutId)

  const [notaExpandida, setNotaExpandida] = useState(false)
  const [confirmandoRevision, setConfirmandoRevision] = useState(false)
  const [terminando, setTerminando] = useState(false)

  useEffect(() => {
    if (session && workoutExercise) {
      void asegurarSeriesPrecargadas(session, workoutExercise)
    }
  }, [session, workoutExercise])

  if (!workoutId || !sessionId || !workoutExerciseId) return null
  if (!session || !workoutExercise || items === undefined) return null

  const item = items.find((i) => i.workoutExercise.id === workoutExerciseId)
  if (!item) return null

  const index = items.findIndex((i) => i.workoutExercise.id === workoutExerciseId)
  const anterior = index > 0 ? items[index - 1] : null
  const siguiente = index < items.length - 1 ? items[index + 1] : null
  const unit = settings?.unit ?? 'kg'

  async function handleTerminar() {
    if (!sessionId || !workoutId) return
    setTerminando(true)
    try {
      const resumen = await resumenSeriesSinRevisar(sessionId)
      if (resumen.total > 0 && resumen.sinRevisar > resumen.total / 2) {
        setConfirmandoRevision(true)
        return
      }
      await terminarSesion(sessionId, workoutId, false)
      navigate(`/entrenos/${workoutId}`)
    } finally {
      setTerminando(false)
    }
  }

  async function resolverRevision(descartar: boolean) {
    if (!sessionId || !workoutId) return
    setTerminando(true)
    try {
      await terminarSesion(sessionId, workoutId, descartar)
      navigate(`/entrenos/${workoutId}`)
    } finally {
      setTerminando(false)
      setConfirmandoRevision(false)
    }
  }

  const rango =
    workoutExercise.repMin !== null && workoutExercise.repMax !== null
      ? `${workoutExercise.repMin}-${workoutExercise.repMax} reps`
      : null

  const notaLarga = (workoutExercise.note?.length ?? 0) > 140

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 px-4 py-8">
        <div className="flex items-center justify-between">
          <span className="text-caption text-text-secondary">
            Ejercicio {index + 1} de {items.length}
          </span>
          <Link to={`/entrenos/${workoutId}`} className="text-caption text-text-secondary">
            Salir
          </Link>
        </div>

        <h1 className="text-title text-text">{item.exercise.name}</h1>

        {workoutExercise.note && (
          <p className={`text-caption text-text-secondary ${notaLarga && !notaExpandida ? 'line-clamp-3' : ''}`}>
            {workoutExercise.note}
            {notaLarga && (
              <button
                type="button"
                className="ml-2 underline"
                onClick={() => setNotaExpandida((v) => !v)}
              >
                {notaExpandida ? 'ver menos' : 'ver más'}
              </button>
            )}
          </p>
        )}

        <div className="flex flex-col gap-2">
          {rango && <p className="text-caption text-text-secondary">Objetivo: {rango}</p>}

          <div className="grid grid-cols-[32px_1fr_1fr_44px] items-center gap-2 px-1">
            <span className="text-label uppercase text-text-secondary">Serie</span>
            <span className="text-label uppercase text-text-secondary">Peso ({unit})</span>
            <span className="text-label uppercase text-text-secondary">Reps</span>
            <span />
          </div>

          {sets?.map((set) => (
            <SerieRow
              key={set.id}
              set={set}
              unit={unit}
              repMin={workoutExercise.repMin}
              repMax={workoutExercise.repMax}
            />
          ))}

          <button
            type="button"
            className="mt-1 text-left text-caption text-text-secondary underline"
            onClick={() => session && anadirSerieExtra(session, workoutExercise)}
          >
            Añadir serie
          </button>

          {sets && sets.length > workoutExercise.targetSets && (
            <button
              type="button"
              className="text-left text-caption text-text-secondary underline"
              onClick={() => guardarSerieExtraEnRutina(workoutExercise)}
            >
              Guardar también en la rutina
            </button>
          )}
        </div>

        {confirmandoRevision && (
          <ConfirmPanel
            message="Hay series que no has revisado. ¿Las guardo tal cual o las descarto?"
            cancelLabel="Guardar tal cual"
            confirmLabel="Descartar"
            onCancel={() => resolverRevision(false)}
            onConfirm={() => resolverRevision(true)}
            loading={terminando}
          />
        )}
      </div>

      <div
        className="mt-auto flex gap-2 border-t border-border bg-bg px-4 py-4"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        {anterior && (
          <Link to={`/entrenos/${workoutId}/sesion/${sessionId}/${anterior.workoutExercise.id}`} className="flex-[35]">
            <Button variant="secondary">← Anterior</Button>
          </Link>
        )}
        {siguiente ? (
          <Link
            to={`/entrenos/${workoutId}/sesion/${sessionId}/${siguiente.workoutExercise.id}`}
            className={anterior ? 'flex-[65]' : 'flex-1'}
          >
            <Button variant="primary">Siguiente ejercicio →</Button>
          </Link>
        ) : (
          <div className="flex-[65]">
            <Button variant={todosCompletados ? 'primary' : 'secondary'} onClick={handleTerminar} disabled={terminando}>
              Terminar entreno
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function SerieRow({
  set,
  unit,
  repMin,
  repMax,
}: {
  set: SessionSet
  unit: 'kg' | 'lb'
  repMin: number | null
  repMax: number | null
}) {
  const [peso, setPeso] = useState('')
  const [reps, setReps] = useState('')

  useEffect(() => {
    setPeso(set.weightKg !== null ? String(formatWeightForDisplay(set.weightKg, unit)) : '')
    setReps(set.reps !== null ? String(set.reps) : '')
  }, [set.id, set.weightKg, set.reps, unit])

  const fueraDeRango = estaFueraDeRango(set.reps, repMin, repMax)

  function guardar(pesoTexto: string, repsTexto: string) {
    const pesoNum = pesoTexto.trim() ? Number(pesoTexto.replace(',', '.')) : null
    const repsNum = repsTexto.trim() ? Number(repsTexto.replace(',', '.')) : null
    void actualizarSerie(set.id, {
      weightKg: pesoNum !== null && !Number.isNaN(pesoNum) ? parseWeightInput(pesoNum, unit) : null,
      reps: repsNum !== null && !Number.isNaN(repsNum) ? Math.round(repsNum) : null,
    })
  }

  return (
    <div className="grid grid-cols-[32px_1fr_1fr_44px] items-center gap-2">
      <span className="text-body text-text-secondary">{set.setIndex + 1}</span>
      <input
        type="text"
        inputMode="decimal"
        className={`${fieldClass} text-numeric ${set.isPrefilled ? 'text-text-tertiary' : 'text-text'}`}
        value={peso}
        onFocus={() => set.isPrefilled && void marcarSerieComoRevisada(set.id)}
        onChange={(e) => setPeso(e.target.value)}
        onBlur={() => guardar(peso, reps)}
      />
      <input
        type="text"
        inputMode="numeric"
        className={`${fieldClass} text-numeric ${
          fueraDeRango ? 'text-alert' : set.isPrefilled ? 'text-text-tertiary' : 'text-text'
        }`}
        value={reps}
        onFocus={() => set.isPrefilled && void marcarSerieComoRevisada(set.id)}
        onChange={(e) => setReps(e.target.value)}
        onBlur={() => guardar(peso, reps)}
      />
      <button
        type="button"
        aria-label={set.isCompleted ? 'Marcar como no hecha' : 'Marcar como hecha'}
        onClick={() => void marcarSerieCompletada(set.id, !set.isCompleted)}
        className={`h-9 w-9 rounded-full border transition-colors ${
          set.isCompleted ? 'border-text bg-text' : 'border-border bg-transparent'
        }`}
      />
    </div>
  )
}
