import { useEffect } from 'react'
import { animate, m, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
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
  accent: 'bg-amber-50 text-amber-700',
  success: 'bg-success-soft text-success',
  info: 'bg-sky-50 text-sky-700',
}

function AnimatedValue({ value }: { value: string | number }) {
  const numericValue = typeof value === 'number' ? value : Number.parseFloat(value)
  const canAnimate = Number.isFinite(numericValue) && /[\d]/.test(String(value))
  const suffix = typeof value === 'string' && canAnimate ? value.slice(String(numericValue).length) : ''
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { damping: 24, stiffness: 72 })
  const display = useTransform(springValue, (current) => `${Number.isInteger(numericValue) ? Math.round(current) : current.toFixed(1)}${suffix}`)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!canAnimate) return
    const controls = animate(motionValue, numericValue, { duration: reduceMotion ? 0 : 0.75, ease: 'easeOut' })
    return () => controls.stop()
  }, [canAnimate, motionValue, numericValue, reduceMotion])

  if (!canAnimate) return <>{value}</>
  return <m.span>{display}</m.span>
}

function Sparkline() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 24" className="h-7 w-16 text-primary/70">
      <path d="M2 19.5 12 16l9 2 10-9 10 4 9-8 12 2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
      <circle cx="62" cy="7" r="2" fill="currentColor" />
    </svg>
  )
}

export function StatCard({ label, value, detail, icon: Icon, tone = 'primary' }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-muted">{label}</p>
          <p className="mt-3 text-[32px] font-bold leading-none tracking-[-0.04em] text-ink">
            <AnimatedValue value={value} />
          </p>
          <p className="mt-2 text-xs leading-5 text-subtle">{detail}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneStyles[tone]}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[11px] font-medium text-subtle">Vue d’ensemble</span>
        <Sparkline />
      </div>
    </Card>
  )
}
