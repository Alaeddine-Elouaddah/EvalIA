import type { LucideIcon } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-base font-bold text-ink">{title}</h2>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction}>{actionLabel}</Button>
      )}
    </Card>
  )
}
