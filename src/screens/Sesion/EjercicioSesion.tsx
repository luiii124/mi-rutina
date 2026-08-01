import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ConfirmPanel } from '../../components/ConfirmPanel'
import { fieldClass } from '../../components/TextField'
import type { SessionSet } from '../../db/types'
import { estaFueraDeRango } from '../../domain/repRange'
import { formatearTiempo } from '../../domain/timer'
import { formatWeightForDisplay, parseWeightInput } from '../../domain/units'
import { prepararSonido, reproducirTonoFinDescanso } from '../../lib/sound'
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

function useDescanso(onFin: () => void) {
  const [finEn, setFinEn] = useState<number | null>(null)
  const [pausadoRestante, setPausadoRestante] = useState<number | null>(null)
  const [ahora, setAhora] = useState(() => Date.now())
  const onFinRef = useRef(onFin)
  onFinRef.current = onFin

  useEffect(() => {
    if (finEn === null || pausadoRestante !== null) return
    const id = window.setInterval(() => setAhora(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [finEn, pausadoRestante])

  useEffect(() => {
    function alVolver() {
      if (document.visibilityState === 'visible') setAhora(Date.now())
    }
    document.addEventListener('visibilitychange', alVolver)
    return () => document.removeEventListener('visibilitychange', alVolver)
  }, [])

  const restante = finEn === null ? null : (pausadoRestante ?? Math.max(0, Math.ceil((finEn - ahora) / 1000)))

  useEffect(() => {
    if (finEn !== null && pausadoRestante === null && restante === 0) {
      setFinEn(null)
      onFinRef.current()
    }
  }, [restante, finEn, pausadoRestante])

  return {
    activo: finEn !== null,
    restante,
    pausado: pausadoRestante !== null,
    iniciar(segundos: number) {
      setPausadoRestante(null)
      setFinEn(Date.now() + segundos * 1000)
    },
    pausar() {
      if (finEn === null) return
      setPausadoRestante(Math.max(0, Math.ceil((finEn - Date.now()) / 1000)))
    },
    reanudar() {
      if (pausadoRestante === null) return
      setFinEn(Date.now() + pausadoRestante * 1000)
      setPausadoRestante(null)
    },
    anadir30() {
      if (pausadoRestante !== null) setPausadoRestante(pausadoRestante + 30)
      else if (finEn !== null) setFinEn(finEn + 30000)
    },
    saltar() {
      setFinEn(null)
      setPausadoRestante(null)
      onFinRef.current()
    },
    cancelar() {
      setFinEn(null)
      setPausadoRestante(null)
    },
  }
}

export function EjercicioSesion() {
  const { workoutId, sessionId, workoutExerciseId } = useParams()
  const navigate = useNavigate()
  const settings = useSettings()

  const session = useSession(sessionId)
  const items = useWorkoutExercises(workoutId ?? '')
  const workoutExercise = useWorkoutExercise(workoutExerciseId)
  const sets = useSessionSets(sessionId, workoutExerciseId)
  const todosCompletados = useTodosCompletados(sessionId, workoutId)

  const [serieIndex, setSerieIndex] = useState<number | null>(null)
  const [notaExpandida, setNotaExpandida] = useState(false)
  const [confirmandoRevision, setConfirmandoRevision] = useState(false)
  const [terminando, setTerminando] = useState(false)

  const descanso = useDescanso(() => {
    reproducirTonoFinDescanso()
    setSerieIndex((i) => (sets && i !== null && i < sets.length - 1 ? i + 1 : i))
  })

  useEffect(() => {
    setSerieIndex(null)
    descanso.cancelar()
  }, [workoutExerciseId]) // eslint-disable-line react-hooks/exhaustive-deps -- descanso se recrea cada render, no es una dependencia real

  useEffect(() => {
    if (serieIndex === null && sets && sets.length > 0) {
      const primerPendiente = sets.findIndex((s) => !s.isCompleted)
      setSerieIndex(primerPendiente === -1 ? sets.length - 1 : primerPendiente)
    }
  }, [serieIndex, sets])

  useEffect(() => {
    if (session && workoutExercise) {
      void asegurarSeriesPrecargadas(session, workoutExercise)
    }
    // Solo debe repetirse cuando cambia el ejercicio o su numero de series objetivo, no en
    // cada refresco de la consulta reactiva (session/workoutExercise cambian de referencia
    // constantemente y relanzarlo en cada uno duplicaba series).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, workoutExercise?.id, workoutExercise?.targetSets])

  if (!workoutId || !sessionId || !workoutExerciseId) return null
  if (!session || !workoutExercise || items === undefined) return null

  const item = items.find((i) => i.workoutExercise.id === workoutExerciseId)
  if (!item) return null

  const index = items.findIndex((i) => i.workoutExercise.id === workoutExerciseId)
  const anterior = index > 0 ? items[index - 1] : null
  const siguienteItem = index < items.length - 1 ? items[index + 1] : null
  const unit = settings?.unit ?? 'kg'
  const restSeconds = workoutExercise.restSeconds ?? settings?.defaultRestSeconds ?? 90

  const serieActual = serieIndex !== null ? (sets?.[serieIndex] ?? null) : null
  const haySiguienteSerie = sets !== undefined && serieIndex !== null && serieIndex < sets.length - 1

  function avanzar() {
    setSerieIndex((i) => (sets && i !== null && i < sets.length - 1 ? i + 1 : i))
  }

  function handleDescanso() {
    if (!serieActual) return
    prepararSonido()
    void marcarSerieCompletada(serieActual.id, true)
    descanso.iniciar(restSeconds)
  }

  function handleSiguienteSerie() {
    if (!serieActual) return
    void marcarSerieCompletada(serieActual.id, true)
    avanzar()
  }

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
          <div className="flex items-center gap-3">
            {anterior && (
              <Link
                to={`/entrenos/${workoutId}/sesion/${sessionId}/${anterior.workoutExercise.id}`}
                className="text-caption text-text-secondary"
              >
                ← Anterior
              </Link>
            )}
            <span className="text-caption text-text-secondary">
              Ejercicio {index + 1} de {items.length}
            </span>
          </div>
          <Link to={`/entrenos/${workoutId}`} className="text-caption text-text-secondary">
            Salir
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2">
          <h1 className="text-title text-text">{item.exercise.name}</h1>
          <Link
            to={`/entrenos/${workoutId}/ejercicios/${workoutExerciseId}/editar`}
            className="shrink-0 text-caption text-text-secondary"
          >
            Editar
          </Link>
        </div>

        {workoutExercise.note && (
          <p className={`text-caption text-text-secondary ${notaLarga && !notaExpandida ? 'line-clamp-3' : ''}`}>
            {workoutExercise.note}
            {notaLarga && (
              <button type="button" className="ml-2 underline" onClick={() => setNotaExpandida((v) => !v)}>
                {notaExpandida ? 'ver menos' : 'ver más'}
              </button>
            )}
          </p>
        )}

        {descanso.activo ? (
          <div className="flex flex-col items-center gap-6 rounded-card bg-surface p-8">
            <span className="text-label uppercase text-text-secondary">Descanso</span>
            <span className="text-display text-text">{formatearTiempo(descanso.restante ?? 0)}</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={descanso.anadir30}
                className="rounded-field border border-border bg-surface-raised px-4 py-2 text-caption text-text"
              >
                +30 s
              </button>
              <button
                type="button"
                onClick={descanso.pausado ? descanso.reanudar : descanso.pausar}
                className="rounded-field border border-border bg-surface-raised px-4 py-2 text-caption text-text"
              >
                {descanso.pausado ? 'Reanudar' : 'Pausar'}
              </button>
              <button
                type="button"
                onClick={descanso.saltar}
                className="rounded-field border border-border bg-surface-raised px-4 py-2 text-caption text-text"
              >
                Saltar
              </button>
            </div>
          </div>
        ) : serieActual ? (
          <div className="flex flex-col gap-4 rounded-card bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-label uppercase text-text-secondary">Serie {serieIndex! + 1}</span>
              {rango && <span className="text-caption text-text-secondary">Objetivo: {rango}</span>}
            </div>
            <SerieCampos
              set={serieActual}
              unit={unit}
              repMin={workoutExercise.repMin}
              repMax={workoutExercise.repMax}
            />
          </div>
        ) : null}

        <div className="flex flex-col items-start gap-1">
          {!haySiguienteSerie && !descanso.activo && (
            <button
              type="button"
              className="text-caption text-text-secondary underline"
              onClick={() => session && anadirSerieExtra(session, workoutExercise)}
            >
              Añadir serie
            </button>
          )}
          {sets && sets.length > workoutExercise.targetSets && (
            <button
              type="button"
              className="text-caption text-text-secondary underline"
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
        {!descanso.activo && (
          <>
            <Button variant="secondary" className="flex-1" onClick={handleDescanso} disabled={!serieActual}>
              Descanso
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleSiguienteSerie}
              disabled={!serieActual || !haySiguienteSerie}
            >
              Siguiente serie
            </Button>
          </>
        )}
        {siguienteItem ? (
          <Link to={`/entrenos/${workoutId}/sesion/${sessionId}/${siguienteItem.workoutExercise.id}`} className="flex-1">
            <Button variant="primary">Siguiente ejercicio</Button>
          </Link>
        ) : (
          <Button
            variant={todosCompletados ? 'primary' : 'secondary'}
            className="flex-1"
            onClick={handleTerminar}
            disabled={terminando}
          >
            Terminar entreno
          </Button>
        )}
      </div>
    </div>
  )
}

function SerieCampos({
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
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-label uppercase text-text-tertiary">Peso ({unit})</span>
        <input
          type="text"
          inputMode="decimal"
          className={`${fieldClass} h-16 text-center text-numeric ${set.isPrefilled ? 'text-text-tertiary' : 'text-text'}`}
          value={peso}
          onFocus={() => set.isPrefilled && void marcarSerieComoRevisada(set.id)}
          onChange={(e) => setPeso(e.target.value)}
          onBlur={() => guardar(peso, reps)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-label uppercase text-text-tertiary">Reps</span>
        <input
          type="text"
          inputMode="numeric"
          className={`${fieldClass} h-16 text-center text-numeric ${
            fueraDeRango ? 'text-alert' : set.isPrefilled ? 'text-text-tertiary' : 'text-text'
          }`}
          value={reps}
          onFocus={() => set.isPrefilled && void marcarSerieComoRevisada(set.id)}
          onChange={(e) => setReps(e.target.value)}
          onBlur={() => guardar(peso, reps)}
        />
      </div>
    </div>
  )
}
