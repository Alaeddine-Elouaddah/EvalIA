import type { ReactNode } from 'react'
import { ArrowLeft, BookOpenCheck, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react'
import type { AppView } from '../types'
import { Card } from './ui/Card'

interface AuthLayoutProps {
  title: string
  description: string
  onNavigate: (view: AppView) => void
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, description, onNavigate, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative mx-auto grid max-w-6xl items-stretch gap-6 py-5 sm:py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:gap-8 lg:py-10">
      <section className="relative isolate flex min-h-64 flex-col overflow-hidden rounded-[26px] border border-primary-100 bg-gradient-to-br from-white via-sky-50 to-primary-50 p-6 shadow-panel sm:p-8 lg:min-h-[620px] lg:p-10">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="app-grid-pattern absolute inset-0" />
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl" />
          <div className="absolute -bottom-36 -left-24 h-72 w-72 rounded-full bg-primary-200/30 blur-3xl" />
        </div>

        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="group inline-flex min-h-11 w-fit items-center gap-3 rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="Retour à EvalIA ENSIASD"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-sky text-white shadow-button transition-transform group-hover:scale-[1.03]">
            <GraduationCap className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-bold tracking-tight text-ink">Eval<span className="text-primary">IA</span></span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.17em] text-subtle">ENSIASD</span>
          </span>
        </button>

        <div className="my-auto py-8 lg:py-14">
          <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-primary shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Espace académique ENSIASD
          </span>
          <h2 className="mt-5 max-w-lg text-[30px] font-bold leading-tight tracking-[-0.045em] text-ink sm:text-[38px]">
            L’évaluation, pensée pour notre école.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            EvalIA réunit professeurs et étudiants autour d’une expérience simple pour créer, passer et suivre les QCM.
          </p>

          <div className="mt-7 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 p-3.5 shadow-sm backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary">
                <BookOpenCheck className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">Des QCM mieux organisés</span>
                <span className="mt-0.5 block text-xs text-muted">Par matière, cycle et filière.</span>
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 p-3.5 shadow-sm backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-soft text-success">
                <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">Un espace dédié à l’ENSIASD</span>
                <span className="mt-0.5 block text-xs text-muted">Un accès adapté à votre rôle.</span>
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs font-medium text-subtle">EvalIA · Plateforme d’évaluation académique de l’ENSIASD</p>
      </section>

      <Card className="flex flex-col justify-center p-6 sm:p-9 lg:p-10">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="mb-6 inline-flex min-h-10 w-fit items-center gap-2 rounded-lg text-xs font-semibold text-muted transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à l’accueil
        </button>
        <div className="mb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-primary">Votre espace EvalIA</p>
          <h1 className="mt-2 text-[26px] font-bold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        </div>
        {children}
        <div className="mt-7 border-t border-slate-100 pt-5 text-center">
          {footer}
        </div>
      </Card>
    </div>
  )
}
