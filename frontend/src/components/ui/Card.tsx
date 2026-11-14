import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
  none: '',
}

export function Card({ padding = 'md', className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/60 bg-white/80 shadow-card backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-card-hover ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
