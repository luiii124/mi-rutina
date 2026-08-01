import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'destructive'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-text text-bg',
  secondary: 'bg-surface-raised text-text border border-border',
  destructive: 'bg-transparent text-alert border border-border',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`h-[52px] w-full rounded-field text-body font-semibold transition-[opacity,transform] duration-[120ms] active:scale-[0.98] active:opacity-80 disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}
