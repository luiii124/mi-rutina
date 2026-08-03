import { useEffect, useState } from 'react'
import type { Photo } from '../db/types'

interface PhotoViewerProps {
  photo: Photo
  onClose: () => void
}

/** Visor a pantalla completa. Libera la URL del blob al cerrarse. */
export function PhotoViewer({ photo, onClose }: PhotoViewerProps) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo.blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo.id, photo.blob])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--bg)_95%,transparent)]"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      onClick={onClose}
      role="button"
      tabIndex={0}
    >
      {url && <img src={url} alt="" className="h-full w-full object-contain" />}
    </div>
  )
}
