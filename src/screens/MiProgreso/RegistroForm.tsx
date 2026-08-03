import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '../../components/BackButton'
import { BodyPhotosField, type BodyPhotoItem } from '../../components/BodyPhotosField'
import { Button } from '../../components/Button'
import { TextAreaField, fieldClass } from '../../components/TextField'
import { fechaISOHoy } from '../../domain/dates'
import { formatWeightForDisplay, parseWeightInput, type Unit } from '../../domain/units'
import {
  eliminarFotoCorporal,
  guardarFotoCorporal,
  guardarRegistro,
  useBodyEntry,
  useBodyEntryPhotos,
} from '../../hooks/useBodyEntries'
import { useSettings } from '../../hooks/useSettings'

export function RegistroForm() {
  const { entryId } = useParams()
  const navigate = useNavigate()
  const esEdicion = entryId !== undefined
  const existente = useBodyEntry(entryId)
  const fotosGuardadas = useBodyEntryPhotos(existente)
  const settings = useSettings()
  const unit: Unit = settings?.unit ?? 'kg'

  const [fecha, setFecha] = useState(fechaISOHoy())
  const [peso, setPeso] = useState('')
  const [grasa, setGrasa] = useState('')
  const [nota, setNota] = useState('')
  const [fotosNuevas, setFotosNuevas] = useState<File[]>([])
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (existente) {
      setFecha(existente.date)
      setPeso(existente.weightKg !== null ? String(formatWeightForDisplay(existente.weightKg, unit)) : '')
      setGrasa(existente.bodyFatPct !== null ? String(existente.bodyFatPct) : '')
      setNota(existente.note ?? '')
    }
  }, [existente, unit])

  if (esEdicion && !existente) return null

  const vacio =
    !peso.trim() && !grasa.trim() && !nota.trim() && fotosNuevas.length === 0 && (existente?.photoIds.length ?? 0) === 0

  async function manejarAñadirFoto(archivo: File) {
    if (existente) {
      await guardarFotoCorporal(existente.id, archivo)
    } else {
      setFotosNuevas((prev) => [...prev, archivo])
    }
  }

  async function manejarQuitarFoto(key: string) {
    if (key.startsWith('pending-')) {
      const index = Number(key.replace('pending-', ''))
      setFotosNuevas((prev) => prev.filter((_, i) => i !== index))
    } else if (existente) {
      await eliminarFotoCorporal(existente.id, key)
    }
  }

  async function guardar() {
    setGuardando(true)
    try {
      const pesoNum = peso.trim() ? Number(peso.replace(',', '.')) : null
      const grasaNum = grasa.trim() ? Number(grasa.replace(',', '.')) : null
      const id = await guardarRegistro(
        {
          date: fecha,
          weightKg: pesoNum !== null && !Number.isNaN(pesoNum) ? parseWeightInput(pesoNum, unit) : null,
          bodyFatPct: grasaNum !== null && !Number.isNaN(grasaNum) ? grasaNum : null,
          note: nota.trim() ? nota.trim() : null,
        },
        entryId,
      )
      for (const archivo of fotosNuevas) {
        await guardarFotoCorporal(id, archivo)
      }
      navigate(`/progreso/${id}`)
    } finally {
      setGuardando(false)
    }
  }

  const fotos: BodyPhotoItem[] = [
    ...(fotosGuardadas ?? []).map((p) => ({ key: p.id, blob: p.blob })),
    ...fotosNuevas.map((f, i) => ({ key: `pending-${i}`, blob: f })),
  ]

  return (
    <div className="flex flex-col gap-6 px-4 py-8 pb-12">
      <div className="flex items-center gap-1">
        <BackButton to={esEdicion ? `/progreso/${entryId}` : '/progreso'} />
        <h1 className="text-title text-text">{esEdicion ? 'Editar registro' : 'Añadir registro'}</h1>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label uppercase text-text-secondary">Fecha</span>
        <input
          type="date"
          className={fieldClass}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label uppercase text-text-secondary">Peso corporal ({unit})</span>
        <input
          type="text"
          inputMode="decimal"
          className={fieldClass}
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label uppercase text-text-secondary">% de grasa</span>
        <input
          type="text"
          inputMode="decimal"
          className={fieldClass}
          value={grasa}
          onChange={(e) => setGrasa(e.target.value)}
        />
      </div>

      <BodyPhotosField fotos={fotos} onAñadir={manejarAñadirFoto} onQuitar={manejarQuitarFoto} />

      <TextAreaField label="Nota" value={nota} onChange={(e) => setNota(e.target.value)} />

      <Button variant="primary" onClick={guardar} disabled={guardando || vacio}>
        {guardando ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  )
}
