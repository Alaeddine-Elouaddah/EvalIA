import React, { useId } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  leadingIcon?: React.ReactNode
}

export function Input({
  label,
  hint,
  error,
  leadingIcon,
  id,
  className = '',
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? props.name ?? generatedId
  const messageId = `${inputId}-message`
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted" aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={hint || error ? messageId : undefined}
          className={`min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-muted/70 hover:border-primary-300 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-canvas ${leadingIcon ? 'pl-10' : ''} ${error ? 'border-danger focus:border-danger focus:ring-danger/15' : ''} ${className}`}
          {...props}
        />
      </div>
      {(hint || error) && (
        <p id={messageId} className={`text-xs ${error ? 'text-danger' : 'text-muted'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
