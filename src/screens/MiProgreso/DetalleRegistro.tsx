import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '../../components/BackButton'
import { Button } from '../../components/Button'
import { ConfirmPanel } from '../../components/ConfirmPanel'
import { PhotoThumbnail } from '../../components/PhotoThumbnail'
import { PhotoViewer } from '../../components/PhotoViewer'
import type { Photo } from '../../db/types'
import { formatearFechaISO } from '../../domain/dates'
import { formatWeightForDisplay, type Unit } from '../../domain/units'
import { eliminarRegistro, useBodyEntry, useBodyEntryPhotos } from '../../hooks/useBodyEntries'
import { useSettings } from '../../hooks/useSettings'

export function DetalleRegistro() {
  const { entryId } = useParams()
  const navigate = useNavigate()
  const entry = useBodyEntry(entryId)
  const fotos = useBodyEntryPhotos(entry)
  const settings = useSettings()
  const unit: Unit = settings?.unit ?? 'kg'

  const [confirmando, setConfirmando] = useState(false)
  const [borrando, setBorrando] = useState(false)
  const [fotoAmpliada, setFotoAmpliada] = useState<Photo | null>(null)

  if (!entryId || !entry) return null

  async function borrar() {
    if (!entryId) return
    setBorrando(true)
    try {
      await eliminarRegistro(entryId)
      navigate('/progreso')
    } finally {
      setBorrando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8 pb-12">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <BackButton to="/progreso" />
          <h1 className="text-title text-text">{formatearFechaISO(entry.date)}</h1>
        </div>
        <Link to={`/progreso/${entryId}/editar`} className="text-caption text-text-secondary">
          Editar
        </Link>
      </div>

      {(entry.weightKg !== null || entry.bodyFatPct !== null) && (
        <div className="flex gap-2">
          {entry.weightKg !== null && (
            <div className="flex-1 rounded-card bg-surface p-4">
              <span className="text-label uppercase text-text-secondary">Peso</span>
              <p className="text-numeric text-text">
                {formatWeightForDisplay(entry.weightKg, unit)} {unit}
              </p>
            </div>
          )}
          {entry.bodyFatPct !== null && (
            <div className="flex-1 rounded-card bg-surface p-4">
              <span className="text-label uppercase text-text-secondary">% grasa</span>
              <p className="text-numeric text-text">{entry.bodyFatPct}%</p>
            </div>
          )}
        </div>
      )}

      {entry.note && <p className="text-caption text-text-secondary">{entry.note}</p>}

      {fotos && fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((foto) => (
            <PhotoThumbnail
              key={foto.id}
              photo={foto}
              className="aspect-square w-full rounded-field object-cover"
              onClick={() => setFotoAmpliada(foto)}
            />
          ))}
        </div>
      )}

      {fotoAmpliada && <PhotoViewer photo={fotoAmpliada} onClose={() => setFotoAmpliada(null)} />}

      {confirmando ? (
        <ConfirmPanel
          message="¿Borrar este registro y sus fotos? No se puede deshacer."
          confirmLabel="Sí, borrar"
          loading={borrando}
          onCancel={() => setConfirmando(false)}
          onConfirm={borrar}
        />
      ) : (
        <Button variant="destructive" onClick={() => setConfirmando(true)}>
          Borrar registro
        </Button>
      )}
    </div>
  )
}
