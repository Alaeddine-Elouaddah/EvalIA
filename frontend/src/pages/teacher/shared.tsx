import React from 'react'
import type { LucideIcon } from 'lucide-react'

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h1 className="text-[27px] font-bold leading-tight tracking-[-0.045em] text-ink sm:text-[30px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-muted">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function SectionTitle({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-start gap-2.5">
        {Icon && <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" aria-hidden="true" />}
        <div>
          <h2 className="text-[17px] font-bold tracking-tight text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  id,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  id: string
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">{label}</label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-[10px] border border-slate-200/80 bg-white px-3 text-sm text-ink shadow-sm outline-none transition-all hover:border-sky-300 focus:border-primary focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  )
}
