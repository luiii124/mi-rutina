import { useParams } from 'react-router-dom'

export function Rutina() {
  const { routineId } = useParams()
  return (
    <div className="px-4 py-8">
      <h1 className="text-title text-text">Rutina {routineId}</h1>
    </div>
  )
}
