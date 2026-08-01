import { useNavigate } from 'react-router-dom'

export function BackButton({ fallback }: { fallback?: string }) {
  const navigate = useNavigate()

  function volver() {
    if (window.history.length > 1) navigate(-1)
    else if (fallback) navigate(fallback)
    else navigate('/')
  }

  return (
    <button
      type="button"
      onClick={volver}
      aria-label="Volver"
      className="-ml-2 flex h-9 w-9 items-center justify-center text-text"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
