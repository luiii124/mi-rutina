import { useEffect, useState } from 'react'
import type { Photo } from '../db/types'

interface PhotoThumbnailProps {
  photo: Photo
  className?: string
  onClick?: () => void
}

/** Crea la URL del blob y la libera al desmontar o al cambiar de foto (ver ROADMAP.md, Fase 6). */
export function PhotoThumbnail({ photo, className, onClick }: PhotoThumbnailProps) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo.blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo.id, photo.blob])

  if (!url) return null

  return <img src={url} alt="" className={className} onClick={onClick} />
}
