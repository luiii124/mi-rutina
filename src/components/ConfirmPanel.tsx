import { Button } from './Button'

interface ConfirmPanelProps {
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

/** Tarjeta de "¿estas seguro?" reutilizable para cualquier accion destructiva de la app. */
export function ConfirmPanel({
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
      <p className="text-caption text-alert">{message}</p>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-[35]" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant="destructive" className="flex-[65]" onClick={onConfirm} disabled={loading}>
          {loading ? 'Procesando...' : confirmLabel}
        </Button>
      </div>
    </div>
  )
}
