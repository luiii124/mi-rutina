import { normalizeText } from '../domain/normalizeText'
import { BUILT_IN_EXERCISES } from './builtInExercises'
import { db } from './schema'
import type { Settings } from './types'

const DEFAULT_SETTINGS: Settings = {
  id: 'settings',
  unit: 'kg',
  defaultRestSeconds: 90,
  lastBackupAt: null,
  schemaVersion: 1,
}

/** Se ejecuta en cada arranque; solo siembra datos si la base de datos esta vacia. */
export async function seedIfNeeded(): Promise<void> {
  const settings = await db.settings.get('settings')
  if (!settings) {
    await db.settings.put(DEFAULT_SETTINGS)
  }

  const yaHayEjercicios = (await db.exercises.count()) > 0
  if (!yaHayEjercicios) {
    await seedBuiltInExercises()
  }
}

export async function seedBuiltInExercises(): Promise<void> {
  const now = Date.now()
  await db.exercises.bulkAdd(
    BUILT_IN_EXERCISES.map(({ name, muscleGroup }) => ({
      id: crypto.randomUUID(),
      name,
      nameNormalized: normalizeText(name),
      muscleGroup,
      photoId: null,
      isBuiltIn: true,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    })),
  )
}
