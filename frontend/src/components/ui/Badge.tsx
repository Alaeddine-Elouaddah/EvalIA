import React from 'react'
import type { ExamStatus, ResultStatus } from '../../types/teacher'

type BadgeStatus = ExamStatus | ResultStatus | 'info' | 'success' | 'warning' | 'danger'

const badgeStyles: Record<BadgeStatus, string> = {
  draft: 'bg-slate-100 text-slate-600 ring-slate-200',
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  finished: 'bg-sky-50 text-sky-700 ring-sky-200',
  graded: 'bg-success-soft text-success ring-success-line',
  'in-progress': 'bg-amber-50 text-amber-700 ring-amber-200',
  missing: 'bg-danger-soft text-danger ring-danger-line',
  info: 'bg-info-soft text-info ring-info-line',
  success: 'bg-success-soft text-success ring-success-line',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-danger-soft text-danger ring-danger-line',
}

const statusLabels: Partial<Record<BadgeStatus, string>> = {
  draft: 'Brouillon',
  published: 'Publié',
  finished: 'Terminé',
  graded: 'Corrigé',
  'in-progress': 'En cours',
  missing: 'Non rendu',
}

interface BadgeProps {
  status: BadgeStatus
  children?: React.ReactNode
  className?: string
  title?: string
}

export function Badge({ status, children, className = '', title }: BadgeProps) {
  return (
    <span title={title} className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeStyles[status]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      {children ?? statusLabels[status] ?? status}
    </span>
  )
}
