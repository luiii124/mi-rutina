import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BackButton } from '../../components/BackButton'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { PhotoThumbnail } from '../../components/PhotoThumbnail'
import { SegmentedControl } from '../../components/SegmentedControl'
import type { BodyEntry } from '../../db/types'
import { calcularTicksEje } from '../../domain/charts'
import { fechaISOATimestamp, formatearFechaCorta, formatearFechaISO } from '../../domain/dates'
import { formatWeightForDisplay, type Unit } from '../../domain/units'
import { useBodyEntries } from '../../hooks/useBodyEntries'
import { usePhoto } from '../../hooks/usePhotos'
import { useTramosDeRutinas, type TramoRutina } from '../../hooks/useRoutines'
import { useSettings } from '../../hooks/useSettings'

interface Punto {
  x: number
  y: number
}

type Periodo = '1m' | '3m' | '6m' | '1a' | 'todo'

const DIAS_POR_PERIODO: Record<Exclude<Periodo, 'todo'>, number> = { '1m': 30, '3m': 90, '6m': 182, '1a': 365 }

function filtrarPorPeriodo(entries: BodyEntry[], periodo: Periodo): BodyEntry[] {
  if (periodo === 'todo') return entries
  const limite = Date.now() - DIAS_POR_PERIODO[periodo] * 24 * 60 * 60 * 1000
  return entries.filter((e) => fechaISOATimestamp(e.date) >= limite)
}

function puntosDe(entries: BodyEntry[], campo: 'weightKg' | 'bodyFatPct', transformar: (v: number) => number): Punto[] {
  return entries
    .filter((e) => e[campo] !== null)
    .map((e) => ({ x: fechaISOATimestamp(e.date), y: transformar(e[campo] as number) }))
    .sort((a, b) => a.x - b.x)
}

export function MiProgreso() {
  const entries = useBodyEntries()
  const tramos = useTramosDeRutinas()
  const settings = useSettings()
  const unit: Unit = settings?.unit ?? 'kg'
  const [periodo, setPeriodo] = useState<Periodo>('6m')

  const puntosPesoTotal = useMemo(
    () => (entries ? puntosDe(entries, 'weightKg', (kg) => formatWeightForDisplay(kg, unit)) : []),
    [entries, unit],
  )
  const puntosGrasaTotal = useMemo(() => (entries ? puntosDe(entries, 'bodyFatPct', (v) => v) : []), [entries])
  const hayGraficas = puntosPesoTotal.length >= 2 || puntosGrasaTotal.length >= 2

  const entriesFiltradas = useMemo(() => (entries ? filtrarPorPeriodo(entries, periodo) : []), [entries, periodo])
  const puntosPeso = useMemo(
    () => puntosDe(entriesFiltradas, 'weightKg', (kg) => formatWeightForDisplay(kg, unit)),
    [entriesFiltradas, unit],
  )
  const puntosGrasa = useMemo(() => puntosDe(entriesFiltradas, 'bodyFatPct', (v) => v), [entriesFiltradas])

  return (
    <div className="flex flex-col gap-6 px-4 py-8 pb-12">
      <div className="flex items-center gap-1">
        <BackButton to="/" />
        <h1 className="text-title text-text">Mi progreso</h1>
      </div>

      <div className="flex flex-col gap-2">
        <Link to="/progreso/nuevo">
          <Button variant="primary">Añadir registro</Button>
        </Link>
        <div className="flex gap-2">
          <Link to="/progreso/historial" className="flex-1">
            <Button variant="secondary">Historial de PR</Button>
          </Link>
          <Link to="/progreso/comparar" className="flex-1">
            <Button variant="secondary">Comparar fotos</Button>
          </Link>
        </div>
      </div>

      {entries === undefined ? null : entries.length === 0 ? (
        <EmptyState message="Aún no has añadido ningún registro corporal." />
      ) : (
        <>
          {hayGraficas && (
            <SegmentedControl
              options={[
                { value: '1m', label: '1m' },
                { value: '3m', label: '3m' },
                { value: '6m', label: '6m' },
                { value: '1a', label: '1a' },
                { value: 'todo', label: 'Todo' },
              ]}
              value={periodo}
              onChange={setPeriodo}
            />
          )}
          {puntosPeso.length >= 2 && (
            <GraficaMetrica titulo="Peso corporal" sufijo={unit} puntos={puntosPeso} tramos={tramos ?? []} />
          )}
          {puntosGrasa.length >= 2 && (
            <GraficaMetrica titulo="% de grasa" sufijo="%" puntos={puntosGrasa} tramos={tramos ?? []} />
          )}

          <div className="flex flex-col gap-2">
            <span className="text-label uppercase text-text-secondary">Registros</span>
            <div className="flex flex-col gap-2">
              {entries.map((entry) => (
                <FilaRegistro key={entry.id} entry={entry} unit={unit} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function GraficaMetrica({
  titulo,
  sufijo,
  puntos,
  tramos,
}: {
  titulo: string
  sufijo: string
  puntos: Punto[]
  tramos: TramoRutina[]
}) {
  const ticksEjeY = useMemo(() => calcularTicksEje(puntos.reduce((max, p) => Math.max(max, p.y), 0)), [puntos])

  return (
    <div className="flex flex-col gap-2">
      <span className="text-label uppercase text-text-secondary">{titulo}</span>
      <div className="h-56 rounded-card bg-surface p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={puntos} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis
              dataKey="x"
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
                const punto = payload[0].payload as Punto
                return (
                  <div className="rounded-field border border-border bg-surface-raised px-3 py-2 text-caption text-text">
                    {formatearFechaCorta(punto.x)} · {punto.y} {sufijo}
                  </div>
                )
              }}
            />
            {tramos.map((t) => (
              <ReferenceLine
                key={`${t.routineId}-inicio`}
                x={t.inicio}
                stroke="#4d4d4d"
                strokeDasharray="3 3"
                label={{ value: t.name, position: 'insideTopLeft', fontSize: 10, fill: '#8a8a8a' }}
              />
            ))}
            {tramos.map((t) => (
              <ReferenceLine key={`${t.routineId}-fin`} x={t.fin} stroke="#4d4d4d" strokeDasharray="3 3" />
            ))}
            <Line type="monotone" dataKey="y" stroke="#ffffff" strokeWidth={2} dot={{ r: 3, fill: '#ffffff' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function FilaRegistro({ entry, unit }: { entry: BodyEntry; unit: Unit }) {
  const primeraFoto = usePhoto(entry.photoIds[0])
  const datos = [
    entry.weightKg !== null ? `${formatWeightForDisplay(entry.weightKg, unit)} ${unit}` : null,
    entry.bodyFatPct !== null ? `${entry.bodyFatPct}% de grasa` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link to={`/progreso/${entry.id}`} className="flex items-center justify-between gap-2 rounded-card bg-surface p-4">
      <div className="flex flex-col gap-1">
        <span className="text-body text-text">{formatearFechaISO(entry.date)}</span>
        <span className="text-caption text-text-secondary">{datos || 'Sin peso ni % de grasa'}</span>
        {entry.note && <span className="text-caption text-text-tertiary">{entry.note}</span>}
      </div>
      {primeraFoto && (
        <PhotoThumbnail photo={primeraFoto} className="h-12 w-12 shrink-0 rounded-field object-cover" />
      )}
    </Link>
  )
}
