import { useState } from 'react'
import { fieldClass } from './TextField'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
}

/** Campo de etiquetas: escribir y pulsar intro anade, cada una lleva una x para quitarla. */
export function TagInput({ value, onChange, suggestions = [], placeholder }: TagInputProps) {
  const [texto, setTexto] = useState('')

  function anadir(tag: string) {
    const limpio = tag.trim()
    if (!limpio || value.includes(limpio)) return
    onChange([...value, limpio])
    setTexto('')
  }

  function quitar(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  const sugerenciasFiltradas = suggestions.filter(
    (s) => s.toLowerCase().includes(texto.toLowerCase()) && !value.includes(s) && texto.length > 0,
  )

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-field bg-surface-raised px-3 py-1.5 text-caption text-text"
            >
              {tag}
              <button
                type="button"
                onClick={() => quitar(tag)}
                className="-m-1.5 p-1.5 text-text-secondary"
                aria-label={`Quitar ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        className={fieldClass}
        placeholder={placeholder}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            anadir(texto)
          }
        }}
      />
      {sugerenciasFiltradas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sugerenciasFiltradas.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => anadir(s)}
              className="rounded-field border border-border px-3 py-1.5 text-caption text-text-secondary"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
