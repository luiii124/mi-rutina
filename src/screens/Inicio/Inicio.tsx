import { Link } from 'react-router-dom'

export function Inicio() {
  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <h1 className="text-title text-text">Mi Rutina</h1>
      <p className="text-caption text-text-secondary">
        Todavia no hay pantalla de rutinas (llega en la Fase 2). Enlaces temporales para probar
        la Fase 1:
      </p>
      <div className="flex flex-col gap-2">
        <Link to="/ajustes" className="text-body text-text underline">
          Ajustes
        </Link>
        <Link to="/debug" className="text-body text-text underline">
          Depuracion (dev)
        </Link>
        <Link to="/progreso" className="text-body text-text underline">
          Mi progreso
        </Link>
      </div>
    </div>
  )
}
