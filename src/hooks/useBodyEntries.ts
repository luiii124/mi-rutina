import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import type { BodyEntry, Photo } from '../db/types'
import { comprimirImagen } from '../lib/photoCompression'

export function useBodyEntries(): BodyEntry[] | undefined {
  return useLiveQuery(async () => {
    const entries = await db.bodyEntries.toArray()
    return entries.sort((a, b) => b.date.localeCompare(a.date))
  }, [])
}

export function useBodyEntry(id: string | undefined): BodyEntry | undefined {
  return useLiveQuery(() => (id ? db.bodyEntries.get(id) : undefined), [id])
}

export function useBodyEntryPhotos(entry: BodyEntry | undefined): Photo[] | undefined {
  return useLiveQuery(async () => {
    if (!entry) return undefined
    const photos = await db.photos.bulkGet(entry.photoIds)
    return photos.filter((p): p is Photo => p !== undefined)
  }, [entry?.id, entry?.photoIds.join(',')])
}

export interface GuardarRegistroInput {
  date: string
  weightKg: number | null
  bodyFatPct: number | null
  note: string | null
}

/**
 * Crea el registro, o si se edita uno existente lo actualiza. `date` es unico en la BD (un registro
 * por dia): si la fecha elegida ya pertenece a otro registro, se fusiona en ese (conservando ambas
 * fotos) en vez de duplicar o de romper el indice unico.
 */
export async function guardarRegistro(input: GuardarRegistroInput, idExistente?: string): Promise<string> {
  const now = Date.now()
  const otroEnEsaFecha = await db.bodyEntries.where('date').equals(input.date).first()

  if (otroEnEsaFecha && otroEnEsaFecha.id !== idExistente) {
    if (idExistente) {
      const actual = await db.bodyEntries.get(idExistente)
      const photoIds = [...new Set([...(actual?.photoIds ?? []), ...otroEnEsaFecha.photoIds])]
      await db.transaction('rw', db.bodyEntries, async () => {
        await db.bodyEntries.update(otroEnEsaFecha.id, { ...input, photoIds, updatedAt: now })
        await db.bodyEntries.delete(idExistente)
      })
    } else {
      await db.bodyEntries.update(otroEnEsaFecha.id, { ...input, updatedAt: now })
    }
    return otroEnEsaFecha.id
  }

  if (idExistente) {
    await db.bodyEntries.update(idExistente, { ...input, updatedAt: now })
    return idExistente
  }

  const id = crypto.randomUUID()
  await db.bodyEntries.add({ id, ...input, photoIds: [], createdAt: now, updatedAt: now })
  return id
}

export async function eliminarRegistro(entryId: string): Promise<void> {
  const entry = await db.bodyEntries.get(entryId)
  if (!entry) return

  await db.transaction('rw', [db.photos, db.bodyEntries], async () => {
    await db.photos.bulkDelete(entry.photoIds)
    await db.bodyEntries.delete(entryId)
  })
}

export async function guardarFotoCorporal(entryId: string, archivo: Blob): Promise<void> {
  const entry = await db.bodyEntries.get(entryId)
  if (!entry) return
  const { blob, width, height } = await comprimirImagen(archivo)
  const id = crypto.randomUUID()

  await db.transaction('rw', [db.photos, db.bodyEntries], async () => {
    await db.photos.add({ id, blob, width, height, bytes: blob.size, kind: 'body', createdAt: Date.now() })
    await db.bodyEntries.update(entryId, { photoIds: [...entry.photoIds, id], updatedAt: Date.now() })
  })
}

export async function eliminarFotoCorporal(entryId: string, photoId: string): Promise<void> {
  const entry = await db.bodyEntries.get(entryId)
  if (!entry) return

  await db.transaction('rw', [db.photos, db.bodyEntries], async () => {
    await db.bodyEntries.update(entryId, {
      photoIds: entry.photoIds.filter((id) => id !== photoId),
      updatedAt: Date.now(),
    })
    await db.photos.delete(photoId)
  })
}
