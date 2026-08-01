import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

export const fieldClass =
  'h-12 w-full rounded-field border-none bg-surface-raised px-3 text-body text-text placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-border'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function TextField({ label, className = '', id, ...props }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      {label && (
        <span className="text-label uppercase text-text-secondary" id={id}>
          {label}
        </span>
      )}
      <input className={`${fieldClass} ${className}`} {...props} />
    </label>
  )
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function TextAreaField({ label, className = '', ...props }: TextAreaFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      {label && <span className="text-label uppercase text-text-secondary">{label}</span>}
      <textarea
        className={`min-h-24 w-full rounded-field border-none bg-surface-raised px-3 py-2 text-body text-text placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-border ${className}`}
        {...props}
      />
    </label>
  )
}
