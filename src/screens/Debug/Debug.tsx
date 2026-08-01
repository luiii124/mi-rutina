import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Button } from '../../components/Button'
import { crearDatosDePrueba } from '../../db/createTestData'
import { DATA_TABLES } from '../../db/schema'

const NOMBRES_TABLA: Record<string, string> = {
  settings: 'ajustes',
  exercises: 'ejercicios',
  routines: 'rutinas',
  workouts: 'entrenos',
  workoutExercises: 'ejercicios de entreno',
  sessions: 'sesiones',
  sessionSets: 'series',
  bodyEntries: 'registros corporales',
  photos: 'fotos',
  personalRecords: 'PRs',
}

export function Debug() {
  const [creando, setCreando] = useState(false)

  const contenido = useLiveQuery(async () => {
    const entradas = await Promise.all(
      DATA_TABLES.map(async (table) => [table.name, await table.toArray()] as const),
    )
    return Object.fromEntries(entradas)
  }, [])

  async function handleCrearDatos() {
    setCreando(true)
    try {
      await crearDatosDePrueba()
    } finally {
      setCreando(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-8 pb-12">
      <h1 className="text-title text-text">Depuración</h1>
      <p className="text-caption text-text-secondary">
        Pantalla técnica y temporal, solo para la Fase 1: sirve para comprobar que la base de
        datos guarda y recupera bien las cosas. No es una pantalla que vaya a quedarse en la app
        final; en la Fase 2 la sustituyen las pantallas normales de rutinas y entrenos.
      </p>

      <Button variant="secondary" onClick={handleCrearDatos} disabled={creando}>
        {creando ? 'Creando...' : 'Crear datos de prueba'}
      </Button>

      <div className="rounded-card border border-border bg-surface p-4">
        <h2 className="mb-2 text-label uppercase text-text-secondary">Resumen</h2>
        {!contenido ? (
          <p className="text-body text-text-secondary">Cargando...</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {Object.entries(contenido).map(([tabla, filas]) => (
              <li key={tabla} className="flex justify-between text-body text-text">
                <span className="text-text-secondary">{NOMBRES_TABLA[tabla] ?? tabla}</span>
                <span>{(filas as unknown[]).length}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <details className="rounded-card border border-border bg-surface p-4">
        <summary className="cursor-pointer text-caption text-text-secondary">
          Ver datos en bruto (tecnico)
        </summary>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-caption text-text">
          {contenido ? JSON.stringify(contenido, null, 2) : ''}
        </pre>
      </details>
    </div>
  )
}
