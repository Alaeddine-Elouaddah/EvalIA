import { m, useReducedMotion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X, type LucideIcon } from 'lucide-react'

type ToastTone = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  tone?: ToastTone
  onClose?: () => void
}

const toastStyles: Record<ToastTone, { icon: LucideIcon; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'border-success-line bg-success-soft text-success' },
  error: { icon: AlertCircle, classes: 'border-danger-line bg-danger-soft text-danger' },
  info: { icon: Info, classes: 'border-info-line bg-info-soft text-info' },
}

export function Toast({ message, tone = 'success', onClose }: ToastProps) {
  const reduceMotion = useReducedMotion()
  const { icon: Icon, classes } = toastStyles[tone]
  return (
    <m.div
      role={tone === 'error' ? 'alert' : 'status'}
      initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: reduceMotion ? 0 : 0.18 }}
      className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-card ${classes}`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Fermer la notification" className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-current">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </m.div>
  )
}
