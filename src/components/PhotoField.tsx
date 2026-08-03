import { useRef, useState, type ChangeEvent } from 'react'
import type { Photo } from '../db/types'
import { PhotoThumbnail } from './PhotoThumbnail'

interface PhotoFieldProps {
  photo: Photo | undefined | null
  onElegir: (archivo: File) => Promise<void>
  onQuitar: () => Promise<void>
}

export function PhotoField({ photo, onElegir, onQuitar }: PhotoFieldProps) {
  const camaraRef = useRef<HTMLInputElement>(null)
  const galeriaRef = useRef<HTMLInputElement>(null)
  const [mostrarOpciones, setMostrarOpciones] = useState(false)
  const [guardando, setGuardando] = useState(false)

  async function manejarArchivo(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setMostrarOpciones(false)
    setGuardando(true)
    try {
      await onElegir(archivo)
    } finally {
      setGuardando(false)
    }
  }

  async function manejarQuitar() {
    setGuardando(true)
    try {
      await onQuitar()
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-label uppercase text-text-secondary">Foto</span>

      {photo ? (
        <div className="flex flex-col gap-2">
          <PhotoThumbnail photo={photo} className="h-40 w-full rounded-card bg-surface-raised object-contain" />
          <div className="flex gap-3">
            <button
              type="button"
              className="text-caption text-text-secondary underline disabled:opacity-40"
              disabled={guardando}
              onClick={() => setMostrarOpciones((v) => !v)}
            >
              Cambiar foto
            </button>
            <button
              type="button"
              className="text-caption text-alert underline disabled:opacity-40"
              disabled={guardando}
              onClick={manejarQuitar}
            >
              Quitar foto
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="self-start text-caption text-text-secondary underline disabled:opacity-40"
          disabled={guardando}
          onClick={() => setMostrarOpciones((v) => !v)}
        >
          Añadir foto
        </button>
      )}

      {mostrarOpciones && (
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-field border border-border bg-surface-raised py-3 text-caption text-text"
            onClick={() => camaraRef.current?.click()}
          >
            Hacer foto
          </button>
          <button
            type="button"
            className="flex-1 rounded-field border border-border bg-surface-raised py-3 text-caption text-text"
            onClick={() => galeriaRef.current?.click()}
          >
            Elegir de galería
          </button>
        </div>
      )}

      {guardando && <p className="text-caption text-text-secondary">Guardando foto...</p>}

      <input
        ref={camaraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={manejarArchivo}
      />
      <input ref={galeriaRef} type="file" accept="image/*" className="hidden" onChange={manejarArchivo} />
    </div>
  )
}
