import { useState } from 'react'
import { BackButton } from '../../components/BackButton'
import { EmptyState } from '../../components/EmptyState'
import { PhotoThumbnail } from '../../components/PhotoThumbnail'
import type { BodyEntry } from '../../db/types'
import { formatearFechaISO } from '../../domain/dates'
import { useBodyEntries } from '../../hooks/useBodyEntries'
import { usePhoto } from '../../hooks/usePhotos'

export function CompararFotos() {
  const entries = useBodyEntries()
  const conFotos = entries?.filter((e) => e.photoIds.length > 0)
  const [seleccion, setSeleccion] = useState<[string | null, string | null]>([null, null])

  function seleccionar(id: string) {
    setSeleccion(([a, b]) => {
      if (a === id) return [null, b]
      if (b === id) return [a, null]
      if (a === null) return [id, b]
      if (b === null) return [a, id]
      return [id, null]
    })
  }

  const entradaA = conFotos?.find((e) => e.id === seleccion[0])
  const entradaB = conFotos?.find((e) => e.id === seleccion[1])

  return (
    <div className="flex flex-col gap-6 px-4 py-8 pb-12">
      <div className="flex items-center gap-1">
        <BackButton to="/progreso" />
        <h1 className="text-title text-text">Comparar fotos</h1>
      </div>

      {conFotos === undefined ? null : conFotos.length < 2 ? (
        <EmptyState message="Necesitas al menos dos registros con fotos para comparar." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <LadoComparador entrada={entradaA} />
            <LadoComparador entrada={entradaB} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-label uppercase text-text-secondary">Elige dos registros</span>
            {conFotos.map((entry) => (
              <FilaSeleccionable
                key={entry.id}
                entry={entry}
                activo={seleccion.includes(entry.id)}
                onClick={() => seleccionar(entry.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function FilaSeleccionable({
  entry,
  activo,
  onClick,
}: {
  entry: BodyEntry
  activo: boolean
  onClick: () => void
}) {
  const foto = usePhoto(entry.photoIds[0])

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between gap-2 rounded-card p-4 text-left text-body ${
        activo ? 'bg-border text-text' : 'bg-surface text-text-secondary'
      }`}
    >
      {formatearFechaISO(entry.date)}
      {foto && <PhotoThumbnail photo={foto} className="h-12 w-12 shrink-0 rounded-field object-cover" />}
    </button>
  )
}

function LadoComparador({ entrada }: { entrada: BodyEntry | undefined }) {
  const foto = usePhoto(entrada?.photoIds[0])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex aspect-[3/4] items-center justify-center rounded-card bg-surface">
        {foto && <PhotoThumbnail photo={foto} className="h-full w-full rounded-card object-contain" />}
      </div>
      <p className="text-center text-caption text-text-secondary">
        {entrada ? formatearFechaISO(entrada.date) : 'Sin elegir'}
      </p>
    </div>
  )
}
