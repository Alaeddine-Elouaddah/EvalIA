import { Check } from 'lucide-react'

interface StepperProps {
  steps: string[]
  currentStep: number
  onStepSelect?: (index: number) => void
}

export function Stepper({ steps, currentStep, onStepSelect }: StepperProps) {
  return (
    <nav aria-label="Étapes de création" className="grid grid-cols-4 gap-2">
      {steps.map((label, index) => {
        const content = (
          <>
            <span className={`h-1 w-full rounded-full ${index <= currentStep ? 'bg-primary' : 'bg-line'}`} />
            <span className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${index === currentStep ? 'text-primary' : index < currentStep ? 'text-ink' : 'text-muted'}`}>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${index < currentStep ? 'bg-success-soft text-success' : index === currentStep ? 'bg-primary text-surface' : 'bg-canvas text-muted'}`}>
                {index < currentStep ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="truncate">{label}</span>
            </span>
          </>
        )

        return (
          <div key={label} className="min-w-0">
            {onStepSelect && index < currentStep ? (
              <button type="button" className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" onClick={() => onStepSelect(index)}>
                {content}
              </button>
            ) : (
              <div aria-current={index === currentStep ? 'step' : undefined}>{content}</div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
