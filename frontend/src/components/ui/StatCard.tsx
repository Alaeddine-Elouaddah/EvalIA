import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string | number
  detail: string
  icon: LucideIcon
  tone?: 'primary' | 'accent' | 'success' | 'info'
}

const toneStyles = {
  primary: 'bg-primary-50 text-primary',
  accent: 'bg-accent-soft text-accent-strong',
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
}

export function StatCard({ label, value, detail, icon: Icon, tone = 'primary' }: StatCardProps) {
  return (
    <Card className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{value}</p>
        <p className="mt-1 text-xs text-muted">{detail}</p>
      </div>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneStyles[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
    </Card>
  )
}
