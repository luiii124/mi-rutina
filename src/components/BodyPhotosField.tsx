import { useEffect, useRef, useState, type ChangeEvent } from 'react'

export interface BodyPhotoItem {
  key: string
  blob: Blob
}

interface BodyPhotosFieldProps {
  fotos: BodyPhotoItem[]
  onAñadir: (archivo: File) => void
  onQuitar: (key: string) => void
  guardando?: boolean
}

export function BodyPhotosField({ fotos, onAñadir, onQuitar, guardando = false }: BodyPhotosFieldProps) {
  const camaraRef = useRef<HTMLInputElement>(null)
  const galeriaRef = useRef<HTMLInputElement>(null)

  function manejarArchivos(e: ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(e.target.files ?? [])
    e.target.value = ''
    archivos.forEach(onAñadir)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-label uppercase text-text-secondary">Fotos</span>

      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((foto) => (
            <FotoMiniatura key={foto.key} blob={foto.blob} disabled={guardando} onQuitar={() => onQuitar(foto.key)} />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-field border border-border bg-surface-raised py-3 text-caption text-text disabled:opacity-40"
          disabled={guardando}
          onClick={() => camaraRef.current?.click()}
        >
          Hacer foto
        </button>
        <button
          type="button"
          className="flex-1 rounded-field border border-border bg-surface-raised py-3 text-caption text-text disabled:opacity-40"
          disabled={guardando}
          onClick={() => galeriaRef.current?.click()}
        >
          Elegir de galería
        </button>
      </div>

      {guardando && <p className="text-caption text-text-secondary">Guardando foto...</p>}

      <input
        ref={camaraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={manejarArchivos}
      />
      <input ref={galeriaRef} type="file" accept="image/*" multiple className="hidden" onChange={manejarArchivos} />
    </div>
  )
}

function FotoMiniatura({ blob, onQuitar, disabled }: { blob: Blob; onQuitar: () => void; disabled: boolean }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  if (!url) return null

  return (
    <div className="relative aspect-square overflow-hidden rounded-field bg-surface-raised">
      <img src={url} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        disabled={disabled}
        onClick={onQuitar}
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-caption text-white disabled:opacity-40"
      >
        ×
      </button>
    </div>
  )
}
