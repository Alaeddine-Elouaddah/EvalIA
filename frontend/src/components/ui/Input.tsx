import React, { useId } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  leadingIcon?: React.ReactNode
  trailingAction?: React.ReactNode
}

export function Input({
  label,
  hint,
  error,
  leadingIcon,
  trailingAction,
  id,
  className = '',
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? props.name ?? generatedId
  const messageId = `${inputId}-message`
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-[13px] font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-subtle" aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        {trailingAction && (
          <span className="absolute inset-y-0 right-2 flex items-center">
            {trailingAction}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={hint || error ? messageId : undefined}
          className={`min-h-11 w-full rounded-[10px] border border-slate-200/80 bg-white px-3 text-sm text-ink shadow-sm outline-none transition-all duration-200 placeholder:text-subtle hover:border-sky-300 focus:border-primary focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 ${leadingIcon ? 'pl-10' : ''} ${trailingAction ? 'pr-12' : ''} ${error ? 'border-danger focus:border-danger focus:ring-danger/10' : ''} ${className}`}
          {...props}
        />
      </div>
      {(hint || error) && (
        <p id={messageId} className={`text-xs leading-5 ${error ? 'text-danger' : 'text-muted'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
