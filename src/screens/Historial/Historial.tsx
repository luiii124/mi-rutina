import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BackButton } from '../../components/BackButton'
import { SegmentedControl } from '../../components/SegmentedControl'
import { fieldClass } from '../../components/TextField'
import { db } from '../../db/schema'
import type { SessionSet } from '../../db/types'
import { calcularTicksEje } from '../../domain/charts'
import { formatearFechaCorta } from '../../domain/dates'
import { serieMaxima } from '../../domain/history'
import { formatWeightForDisplay, parseWeightInput, type Unit } from '../../domain/units'
import { type HistorySession, useHistorialEjercicio, usePersonalRecord, useRoutinesConEjercicio } from '../../hooks/useHistory'
import { useRoutine } from '../../hooks/useRoutines'
import { actualizarSerie } from '../../hooks/useSessions'
import { useSettings } from '../../hooks/useSettings'
import { useWorkout } from '../../hooks/useWorkouts'
import { useWorkoutExercise } from '../../hooks/useWorkoutExercises'

type Periodo = '3m' | '6m' | '1a' | 'todo'

const DIAS_POR_PERIODO: Record<Exclude<Periodo, 'todo'>, number> = { '3m': 90, '6m': 182, '1a': 365 }

function filtrarPorPeriodo(sesiones: HistorySession[], periodo: Periodo): HistorySession[] {
  if (periodo === 'todo') return sesiones
  const limite = Date.now() - DIAS_POR_PERIODO[periodo] * 24 * 60 * 60 * 1000
  return sesiones.filter((s) => s.performedAt >= limite)
}

export function Historial() {
  const { workoutId, sessionId, workoutExerciseId, exerciseId: exerciseIdParam } = useParams()
  const workout = useWorkout(workoutId)
  const workoutExercise = useWorkoutExercise(workoutExerciseId)
  const exerciseId = workoutExercise?.exerciseId ?? exerciseIdParam
  const exercise = useLiveQuery(() => (exerciseId ? db.exercises.get(exerciseId) : undefined), [exerciseId])
  const settings = useSettings()
  const unit: Unit = settings?.unit ?? 'kg'

  const pr = usePersonalRecord(exerciseId)
  const prRoutine = useRoutine(pr?.routineId)
  const rutinas = useRoutinesConEjercicio(exerciseId)

  const [routineIdManual, setRoutineIdManual] = useState<string | null>(null)
  const routineIdEfectivo = routineIdManual ?? workout?.routineId ?? rutinas?.[0]?.id ?? null

  const sesiones = useHistorialEjercicio(exerciseId, routineIdEfectivo ?? undefined)
  const [periodo, setPeriodo] = useState<Periodo>('6m')

  const sesionesFiltradas = useMemo(() => (sesiones ? filtrarPorPeriodo(sesiones, periodo) : []), [sesiones, periodo])

  const puntos = useMemo(
    () =>
      sesionesFiltradas
        .map((s) => {
          const max = serieMaxima(s.sets)
          return max ? { performedAt: s.performedAt, reps: max.reps, peso: formatWeightForDisplay(max.weightKg, unit) } : null
        })
        .filter((p): p is { performedAt: number; reps: number; peso: number } => p !== null)
        .sort((a, b) => a.performedAt - b.performedAt),
    [sesionesFiltradas, unit],
  )

  const ticksEjeY = useMemo(
    () => calcularTicksEje(puntos.reduce((max, p) => Math.max(max, p.peso), 0)),
    [puntos],
  )

  const esDesdeSesion = Boolean(workoutId && sessionId && workoutExerciseId)
  const volverA = esDesdeSesion ? `/entrenos/${workoutId}/sesion/${sessionId}/${workoutExerciseId}` : '/progreso/historial'

  if (esDesdeSesion && (!workout || !workoutExercise)) return null
  if (!exerciseId || !exercise) return null

  return (
    <div className="flex flex-col gap-6 px-4 py-8 pb-12">
      <div className="flex items-center gap-1">
        <BackButton to={volverA} />
        <h1 className="text-title text-text">{exercise.name}</h1>
      </div>

      {pr && (
        <div className="flex flex-col gap-1 rounded-card bg-surface p-4">
          <span className="text-label uppercase text-text-secondary">PR</span>
          <span className="text-numeric text-text">
            {formatWeightForDisplay(pr.weightKg, unit)} {unit} × {pr.reps}
          </span>
          <span className="text-caption text-text-secondary">
            {formatearFechaCorta(pr.achievedAt)}
            {prRoutine ? ` · ${prRoutine.name}` : ''}
          </span>
        </div>
      )}

      {rutinas && rutinas.length > 1 && (
        <SegmentedControl
          options={rutinas.map((r) => ({ value: r.id, label: r.name }))}
          value={routineIdEfectivo ?? ''}
          onChange={setRoutineIdManual}
        />
      )}

      {sesiones === undefined ? null : sesiones.length < 2 ? (
        <p className="text-caption text-text-secondary">Necesitas al menos dos sesiones para ver la progresión.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <SegmentedControl
            options={[
              { value: '3m', label: '3m' },
              { value: '6m', label: '6m' },
              { value: '1a', label: '1a' },
              { value: 'todo', label: 'Todo' },
            ]}
            value={periodo}
            onChange={setPeriodo}
          />
          <div className="h-56 rounded-card bg-surface p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={puntos} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="performedAt"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(v: number) => formatearFechaCorta(v)}
                  stroke="#4d4d4d"
                  tick={{ fontSize: 11, fill: '#4d4d4d' }}
                />
                <YAxis
                  domain={[0, ticksEjeY[ticksEjeY.length - 1]]}
                  ticks={ticksEjeY}
                  stroke="#4d4d4d"
                  tick={{ fontSize: 11, fill: '#4d4d4d' }}
                  width={44}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null
                    const punto = payload[0].payload as (typeof puntos)[number]
                    return (
                      <div className="rounded-field border border-border bg-surface-raised px-3 py-2 text-caption text-text">
                        {formatearFechaCorta(punto.performedAt)} · {punto.peso} {unit} × {punto.reps}
                      </div>
                    )
                  }}
                />
                <Line type="monotone" dataKey="peso" stroke="#ffffff" strokeWidth={2} dot={{ r: 3, fill: '#ffffff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-label uppercase text-text-secondary">Sesiones</span>
        {sesiones && (
          <div className="flex flex-col gap-2">
            {sesiones.map((sesion) => (
              <FilaSesion key={sesion.sessionId} sesion={sesion} unit={unit} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilaSesion({ sesion, unit }: { sesion: HistorySession; unit: Unit }) {
  const [abierta, setAbierta] = useState(false)
  const resumen = sesion.sets
    .map((s) => (s.weightKg !== null && s.reps !== null ? `${formatWeightForDisplay(s.weightKg, unit)}×${s.reps}` : '—'))
    .join(' · ')

  return (
    <div className="rounded-card bg-surface p-4">
      <button type="button" className="flex w-full flex-col items-start gap-1 text-left" onClick={() => setAbierta((v) => !v)}>
        <span className="text-body text-text">{formatearFechaCorta(sesion.performedAt)}</span>
        <span className="text-caption text-text-secondary">{resumen}</span>
        {sesion.note && <span className="text-caption text-text-secondary">{sesion.note}</span>}
      </button>
      {abierta && (
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
          {sesion.sets.map((set) => (
            <SetEditableRow key={set.id} set={set} unit={unit} />
          ))}
        </div>
      )}
    </div>
  )
}

function SetEditableRow({ set, unit }: { set: SessionSet; unit: Unit }) {
  const [peso, setPeso] = useState(set.weightKg !== null ? String(formatWeightForDisplay(set.weightKg, unit)) : '')
  const [reps, setReps] = useState(set.reps !== null ? String(set.reps) : '')

  function guardar(pesoTexto: string, repsTexto: string) {
    const pesoNum = pesoTexto.trim() ? Number(pesoTexto.replace(',', '.')) : null
    const repsNum = repsTexto.trim() ? Number(repsTexto.replace(',', '.')) : null
    void actualizarSerie(set.id, {
      weightKg: pesoNum !== null && !Number.isNaN(pesoNum) ? parseWeightInput(pesoNum, unit) : null,
      reps: repsNum !== null && !Number.isNaN(repsNum) ? Math.round(repsNum) : null,
    })
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-label uppercase text-text-tertiary">Peso ({unit})</span>
        <input
          type="text"
          inputMode="decimal"
          className={`${fieldClass} h-11 text-center text-body`}
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          onBlur={() => guardar(peso, reps)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-label uppercase text-text-tertiary">Reps</span>
        <input
          type="text"
          inputMode="numeric"
          className={`${fieldClass} h-11 text-center text-body`}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onBlur={() => guardar(peso, reps)}
        />
      </div>
    </div>
  )
}
