import type { LucideIcon } from 'lucide-react'
import { m, useReducedMotion } from 'framer-motion'
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
  const reduceMotion = useReducedMotion()
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
      <m.div
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.22 }}
        className="relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-50 to-primary-50 text-primary ring-1 ring-inset ring-sky-100"
      >
        <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full border-4 border-white bg-sky-300" aria-hidden="true" />
        <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
      </m.div>
      <h2 className="mt-5 text-base font-bold tracking-tight text-ink">{title}</h2>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted">{description}</p>
      {actionLabel && onAction && <Button className="mt-5" onClick={onAction}>{actionLabel}</Button>}
    </Card>
  )
}
