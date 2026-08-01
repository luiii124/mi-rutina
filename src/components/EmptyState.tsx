import type { ReactNode } from 'react'

interface EmptyStateProps {
  message: string
  children?: ReactNode
}

export function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
      <p className="text-body text-text-secondary">{message}</p>
      {children}
    </div>
  )
}
