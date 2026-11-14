import React from 'react'
import type { ExamStatus, ResultStatus } from '../../types/teacher'

type BadgeStatus = ExamStatus | ResultStatus | 'info' | 'success' | 'warning' | 'danger'

const badgeStyles: Record<BadgeStatus, string> = {
  draft: 'bg-canvas text-muted ring-line',
  published: 'bg-success-soft text-success ring-success-line',
  finished: 'bg-info-soft text-info ring-info-line',
  graded: 'bg-success-soft text-success ring-success-line',
  'in-progress': 'bg-accent-soft text-accent-strong ring-accent/20',
  missing: 'bg-danger-soft text-danger ring-danger-line',
  info: 'bg-info-soft text-info ring-info-line',
  success: 'bg-success-soft text-success ring-success-line',
  warning: 'bg-accent-soft text-accent-strong ring-accent/20',
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
}

export function Badge({ status, children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeStyles[status]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children ?? statusLabels[status] ?? status}
    </span>
  )
}
