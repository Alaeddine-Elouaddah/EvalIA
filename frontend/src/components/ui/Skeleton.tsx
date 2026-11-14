interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={`relative isolate overflow-hidden rounded-xl bg-slate-100 ${className}`}>
      <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>
  )
}
