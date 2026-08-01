import { useRef, useState, type PointerEvent, type ReactNode } from 'react'

export interface SwipeAction {
  label: string
  onClick: () => void
  destructive?: boolean
}

interface SwipeActionsProps {
  actions: SwipeAction[]
  children: ReactNode
}

const ACTION_WIDTH = 88

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Fila deslizable hacia la izquierda que revela acciones (Duplicar, Eliminar...). */
export function SwipeActions({ actions, children }: SwipeActionsProps) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startOffset = useRef(0)
  const maxOffset = actions.length * ACTION_WIDTH

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    startX.current = e.clientX
    startOffset.current = offset
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return
    const delta = startX.current - e.clientX
    setOffset(clamp(startOffset.current + delta, 0, maxOffset))
  }

  function handlePointerUp() {
    setDragging(false)
    setOffset((current) => (current > maxOffset / 2 ? maxOffset : 0))
  }

  return (
    <div className="relative overflow-hidden rounded-card">
      <div className="absolute inset-y-0 right-0 flex">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            style={{ width: ACTION_WIDTH }}
            className={`flex items-center justify-center px-2 text-center text-caption ${
              action.destructive ? 'bg-surface-raised text-alert' : 'bg-surface-raised text-text'
            }`}
            onClick={() => {
              setOffset(0)
              action.onClick()
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
      <div
        className="relative touch-pan-y bg-surface"
        style={{
          transform: `translateX(-${offset}px)`,
          transition: dragging ? 'none' : 'transform 150ms ease-out',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {children}
      </div>
    </div>
  )
}
