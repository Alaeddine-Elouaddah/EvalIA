import React, { useEffect, useRef } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'md' | 'lg'
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusable = () => dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) ?? []
    focusable()[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const items = focusable()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <m.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby={description ? 'modal-description' : undefined}
            ref={dialogRef}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 5 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
            className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-white/80 bg-white/95 shadow-panel backdrop-blur-xl ${size === 'lg' ? 'max-w-3xl' : 'max-w-xl'}`}
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 id="modal-title" className="text-lg font-bold tracking-tight text-ink">{title}</h2>
                {description && <p id="modal-description" className="mt-1 text-sm leading-6 text-muted">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer la fenêtre"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted transition hover:bg-sky-50 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="px-5 py-5 sm:px-6">{children}</div>
            {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4 sm:px-6">{footer}</footer>}
          </m.section>
        </m.div>
      )}
    </AnimatePresence>
  )
}
