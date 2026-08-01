import { Link } from 'react-router-dom'

/** Vuelve siempre a la pantalla logica anterior, nunca al historial del navegador. */
export function BackButton({ to }: { to: string }) {
  return (
    <Link to={to} aria-label="Volver" className="-ml-2 flex h-9 w-9 items-center justify-center text-text">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}
