import { useLiveQuery } from 'dexie-react-hooks'
import { normalizeText } from '../domain/normalizeText'
import { db } from '../db/schema'
import type { Exercise } from '../db/types'

export function useExerciseSearch(query: string): Exercise[] | undefined {
  return useLiveQuery(async () => {
    const normalizado = normalizeText(query)
    const todos = await db.exercises.toArray()
    const filtrados = normalizado ? todos.filter((e) => e.nameNormalized.includes(normalizado)) : todos

    return filtrados.sort((a, b) => {
      if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount
      return a.name.localeCompare(b.name, 'es')
    })
  }, [query])
}

export function encontrarCoincidenciaCasiExacta(exercises: Exercise[], query: string): Exercise | undefined {
  const normalizado = normalizeText(query)
  return exercises.find((e) => e.nameNormalized === normalizado)
}

export async function createExercise(name: string, muscleGroup: string | null): Promise<string> {
  const now = Date.now()
  const id = crypto.randomUUID()
  await db.exercises.add({
    id,
    name,
    nameNormalized: normalizeText(name),
    muscleGroup,
    photoId: null,
    isBuiltIn: false,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  })
  return id
}
