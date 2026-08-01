interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="flex overflow-hidden rounded-field border border-border bg-surface-raised">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 py-3 text-body ${
            value === option.value ? 'bg-border text-text' : 'text-text-secondary'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
