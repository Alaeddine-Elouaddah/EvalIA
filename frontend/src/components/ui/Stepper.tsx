import { Check } from 'lucide-react'

interface StepperProps {
  steps: string[]
  currentStep: number
  onStepSelect?: (index: number) => void
}

export function Stepper({ steps, currentStep, onStepSelect }: StepperProps) {
  const progress = steps.length > 1 ? `${(Math.min(currentStep, steps.length - 1) / (steps.length - 1)) * 100}%` : '0%'

  return (
    <nav aria-label="Étapes de création" className="relative">
      <div className="absolute left-[12.5%] right-[12.5%] top-4 h-0.5 rounded-full bg-slate-100" aria-hidden="true">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-sky transition-[width] duration-300" style={{ width: progress }} />
      </div>
      <ol className="relative flex items-start justify-between gap-1">
        {steps.map((label, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep
          const content = (
            <>
              <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-200 ${
                isComplete
                  ? 'border-primary bg-primary text-white shadow-button'
                  : isCurrent
                    ? 'border-primary bg-white text-primary ring-4 ring-sky-100'
                    : 'border-slate-200 bg-white text-subtle'
              }`}>
                {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </span>
              <span className={`mt-2 max-w-full truncate text-center text-[11px] font-semibold sm:text-xs ${isCurrent ? 'text-primary' : isComplete ? 'text-slate-700' : 'text-subtle'}`}>
                {label}
              </span>
            </>
          )

          return (
            <li key={label} className="flex min-w-0 flex-1 justify-center">
              {onStepSelect && index < currentStep ? (
                <button type="button" className="flex min-w-0 flex-col items-center rounded-xl px-1 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" onClick={() => onStepSelect(index)}>
                  {content}
                </button>
              ) : (
                <div aria-current={isCurrent ? 'step' : undefined} className="flex min-w-0 flex-col items-center px-1 text-center">
                  {content}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
