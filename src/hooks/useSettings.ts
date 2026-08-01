import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import type { Settings } from '../db/types'

export function useSettings(): Settings | undefined {
  return useLiveQuery(() => db.settings.get('settings'), [])
}

export async function updateSettings(changes: Partial<Omit<Settings, 'id'>>): Promise<void> {
  await db.settings.update('settings', changes)
}
