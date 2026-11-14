import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-surface shadow-sm hover:bg-primary-800',
  secondary: 'border border-line bg-surface text-ink hover:bg-canvas',
  accent: 'bg-accent text-ink shadow-sm hover:bg-accent/90',
  ghost: 'text-muted hover:bg-canvas hover:text-ink',
  danger: 'bg-danger text-surface shadow-sm hover:bg-danger/90',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-10 px-4 text-sm',
  lg: 'min-h-11 px-5 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
