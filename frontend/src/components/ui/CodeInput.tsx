import { useRef, type ClipboardEvent } from 'react'

const CODE_CHARACTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

interface CodeInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
}

export function CodeInput({ value, onChange, error, label = 'Code d’accès à 6 caractères' }: CodeInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  function updateAt(index: number, raw: string) {
    if (!raw) {
      const next = value.split('')
      next[index] = ''
      onChange(next.join(''))
      return
    }
    const character = raw.toUpperCase().split('').reverse().find((item) => CODE_CHARACTERS.includes(item))
    const next = value.split('')
    if (!character) return
    next[index] = character
    onChange(next.join('').slice(0, 6))
    if (index < 5) inputs.current[index + 1]?.focus()
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!pasted) return
    event.preventDefault()
    const valid = Array.from(pasted).filter((character) => CODE_CHARACTERS.includes(character)).slice(0, 6).join('')
    onChange(valid)
    inputs.current[Math.min(valid.length, 5)]?.focus()
  }

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      <div className="flex justify-between gap-2" role="group" aria-label={label}>
        {Array.from({ length: 6 }, (_, index) => (
          <input
            key={index}
            ref={(element) => { inputs.current[index] = element }}
            aria-label={`Caractère ${index + 1} sur 6`}
            aria-invalid={Boolean(error)}
            autoFocus={index === 0}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            inputMode="text"
            maxLength={1}
            value={value[index] ?? ''}
            onChange={(event) => updateAt(index, event.target.value)}
            onPaste={handlePaste}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && !value[index] && index > 0) inputs.current[index - 1]?.focus()
              if (event.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus()
              if (event.key === 'ArrowRight' && index < 5) inputs.current[index + 1]?.focus()
            }}
            className={`h-12 min-w-0 flex-1 rounded-lg border bg-surface text-center font-mono text-lg font-bold uppercase text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-14 sm:text-xl ${error ? 'border-danger' : 'border-line'}`}
          />
        ))}
      </div>
      {error && <p role="alert" className="mt-2 text-xs font-medium text-danger">{error}</p>}
    </fieldset>
  )
}
