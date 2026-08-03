import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import type { Photo } from '../db/types'
import { comprimirImagen, LADO_MAXIMO } from '../lib/photoCompression'

export function usePhoto(photoId: string | null | undefined): Photo | undefined {
  return useLiveQuery(() => (photoId ? db.photos.get(photoId) : undefined), [photoId])
}

/** Comprime y guarda la foto de un ejercicio, sustituyendo la anterior si tenia. */
export async function guardarFotoEjercicio(exerciseId: string, archivo: Blob): Promise<void> {
  const exercise = await db.exercises.get(exerciseId)
  if (!exercise) return
  const { blob, width, height } = await comprimirImagen(archivo)
  const id = crypto.randomUUID()
  const fotoAnteriorId = exercise.photoId

  await db.transaction('rw', [db.photos, db.exercises], async () => {
    await db.photos.add({ id, blob, width, height, bytes: blob.size, kind: 'exercise', createdAt: Date.now() })
    await db.exercises.update(exerciseId, { photoId: id, updatedAt: Date.now() })
    if (fotoAnteriorId) await db.photos.delete(fotoAnteriorId)
  })
}

export async function eliminarFotoEjercicio(exerciseId: string): Promise<void> {
  const exercise = await db.exercises.get(exerciseId)
  if (!exercise?.photoId) return
  const fotoId = exercise.photoId

  await db.transaction('rw', [db.photos, db.exercises], async () => {
    await db.exercises.update(exerciseId, { photoId: null, updatedAt: Date.now() })
    await db.photos.delete(fotoId)
  })
}

export interface EstadoAlmacenamiento {
  bytes: number
  numFotos: number
}

export function useEstadoAlmacenamiento(): EstadoAlmacenamiento | undefined {
  return useLiveQuery(async () => {
    const photos = await db.photos.toArray()
    return { bytes: photos.reduce((suma, p) => suma + p.bytes, 0), numFotos: photos.length }
  }, [])
}

/** Recomprime las fotos guardadas antes de que existiera el limite de 1280px. Devuelve bytes liberados. */
export async function recomprimirFotosAntiguas(): Promise<number> {
  const photos = await db.photos.toArray()
  const objetivo = photos.filter((p) => Math.max(p.width, p.height) > LADO_MAXIMO)

  let bytesLiberados = 0
  for (const photo of objetivo) {
    const { blob, width, height } = await comprimirImagen(photo.blob)
    bytesLiberados += photo.bytes - blob.size
    await db.photos.update(photo.id, { blob, width, height, bytes: blob.size })
  }
  return bytesLiberados
}
