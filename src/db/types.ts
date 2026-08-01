export interface Settings {
  id: 'settings'
  unit: 'kg' | 'lb'
  defaultRestSeconds: number
  lastBackupAt: number | null
  schemaVersion: number
}

export interface Exercise {
  id: string
  name: string
  nameNormalized: string
  muscleGroup: string | null
  photoId: string | null
  isBuiltIn: boolean
  usageCount: number
  createdAt: number
  updatedAt: number
}

export interface Routine {
  id: string
  name: string
  variantCount: 1 | 2 | 3 | 4
  variantNames: string[]
  currentVariantIndex: number
  manualVariantIndex: number | null
  cycleCompletedWorkoutIds: string[]
  createdAt: number
  updatedAt: number
  archivedAt: number | null
}

export interface Workout {
  id: string
  routineId: string
  variantIndex: number
  name: string
  materials: string[]
  order: number
  createdAt: number
  updatedAt: number
}

export interface WorkoutExercise {
  id: string
  workoutId: string
  exerciseId: string
  order: number
  note: string | null
  targetSets: number
  repMin: number | null
  repMax: number | null
  restSeconds: number | null
  createdAt: number
  updatedAt: number
}

export interface Session {
  id: string
  routineId: string
  workoutId: string
  variantIndex: number
  startedAt: number
  completedAt: number | null
  note: string | null
}

export interface SessionSet {
  id: string
  sessionId: string
  workoutExerciseId: string
  exerciseId: string
  routineId: string
  setIndex: number
  weightKg: number | null
  reps: number | null
  isCompleted: boolean
  isPrefilled: boolean
  performedAt: number
}

export interface BodyEntry {
  id: string
  date: string
  weightKg: number | null
  bodyFatPct: number | null
  photoIds: string[]
  note: string | null
  createdAt: number
  updatedAt: number
}

export interface Photo {
  id: string
  blob: Blob
  width: number
  height: number
  bytes: number
  kind: 'exercise' | 'body'
  createdAt: number
}

export interface PersonalRecord {
  exerciseId: string
  weightKg: number
  reps: number
  sessionId: string
  routineId: string
  achievedAt: number
}

/** Instantanea de seguridad tomada justo antes de sustituir los datos al importar una copia. */
export interface ImportSnapshot {
  id?: number
  createdAt: number
  data: string
}
