import React from 'react'
import { LoaderCircle } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
  loading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-primary-600 to-sky text-white shadow-button hover:shadow-button-hover',
  secondary: 'border border-slate-200/80 bg-white/90 text-ink shadow-sm hover:border-sky-300 hover:bg-sky-50',
  accent: 'bg-accent-soft text-accent-strong shadow-sm hover:bg-accent/15',
  ghost: 'text-muted hover:bg-sky-50 hover:text-primary',
  danger: 'bg-danger text-white shadow-sm hover:bg-danger/90',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3.5 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      disabled={loading || disabled}
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[10px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-55 disabled:hover:translate-y-0 disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  )
}
