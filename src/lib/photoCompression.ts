import { calcularDimensionesRedimensionadas } from '../domain/photo'

export const LADO_MAXIMO = 1280
const CALIDAD_JPEG = 0.75

export interface ImagenComprimida {
  blob: Blob
  width: number
  height: number
}

/**
 * Redimensiona a maximo 1280px en el lado mayor y comprime a JPEG calidad 0,75.
 * Sin comprimir, una foto de iPhone pesa 3-5 MB; ver DATA_MODEL.md.
 */
export async function comprimirImagen(origen: Blob): Promise<ImagenComprimida> {
  const bitmap = await createImageBitmap(origen)
  try {
    const { width, height } = calcularDimensionesRedimensionadas(bitmap.width, bitmap.height, LADO_MAXIMO)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No se ha podido preparar la imagen')
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', CALIDAD_JPEG))
    if (!blob) throw new Error('No se ha podido comprimir la imagen')

    return { blob, width, height }
  } finally {
    bitmap.close()
  }
}
