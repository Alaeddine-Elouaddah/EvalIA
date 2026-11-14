import React from 'react'
import type { AppView, User } from '../types'
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'

interface HomePageProps {
  user: User | null
  onNavigate: (view: AppView) => void
}

export const HomePage: React.FC<HomePageProps> = ({ user, onNavigate }) => {
  return (
    <div className="space-y-20 pb-16">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white shadow-2xl shadow-indigo-950/10 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute -bottom-48 left-1/4 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-indigo-950/80" />
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-sm font-medium text-indigo-100">
              <Sparkles className="h-4 w-4 text-amber-300" />
              L’évaluation, en plus simple
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Vos cours deviennent
              <span className="mt-1 block bg-gradient-to-r from-indigo-300 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                des QCM interactifs.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              EvalIA aide les enseignants à créer des évaluations depuis leurs PDF et les étudiants à réviser avec des explications immédiates.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {user ? (
                <button
                  onClick={() => onNavigate('generator')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
                >
                  Accéder à l’espace QCM
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('register')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
                  >
                    Commencer gratuitement
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('login')}
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    J’ai déjà un compte
                  </button>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Création depuis un PDF
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Pour enseignants et étudiants
              </span>
            </div>
          </div>

          <div aria-hidden="true" className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 blur-2xl" />
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/15 text-indigo-200">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Votre espace de révision</p>
                    <p className="mt-0.5 text-xs text-slate-400">Un pas après l’autre</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                  En cours
                </span>
              </div>

              <div className="pt-5">
                <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>QUESTION 02</span>
                  <span>02 / 05</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-indigo-400 to-violet-300" />
                </div>
                <p className="mt-5 text-lg font-semibold leading-7 text-white">
                  Quel est l’objectif principal de cette notion ?
                </p>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3.5 py-3 text-sm text-emerald-100">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                    <span>Organiser et relier les concepts clés</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-slate-300">
                    Mémoriser chaque détail sans contexte
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-indigo-300/15 bg-indigo-400/10 p-3.5">
                  <p className="text-xs font-semibold text-indigo-200">À retenir</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Comprenez pourquoi une réponse est juste grâce à une explication après chaque question.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-xl sm:flex">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="text-xs font-medium text-slate-200">Révision interactive</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-1 sm:px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Deux expériences, une plateforme</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Pensée pour enseigner et apprendre
          </h2>
          <p className="mt-3 text-slate-600">Un espace adapté à votre rôle, du support de cours à la révision.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="group rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-950/5 sm:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
              <GraduationCap className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Pour les enseignants</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Créez des QCM à partir de vos cours</h3>
            <p className="mt-3 leading-7 text-slate-600">
              Importez un support PDF, choisissez le nombre de questions et obtenez un questionnaire avec des réponses expliquées.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                Gagnez du temps sur la préparation des évaluations
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                Définissez le nombre de questions souhaité
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                Consultez les justifications des réponses
              </li>
            </ul>
          </article>

          <article className="group rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-950/5 sm:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Brain className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Pour les étudiants</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Progressez à votre rythme</h3>
            <p className="mt-3 leading-7 text-slate-600">
              Testez vos connaissances, obtenez un retour immédiat et revenez sur les explications pour consolider vos acquis.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Suivez votre score question après question
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Comprenez vos erreurs grâce aux explications
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Recommencez pour continuer à vous entraîner
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl rounded-3xl bg-slate-900 px-6 py-8 text-white sm:px-9 sm:py-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
              <Zap className="h-4 w-4" />
              Une plateforme moderne
            </div>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl">Concentrez-vous sur l’apprentissage.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              EvalIA associe un frontend React à un backend Jakarta EE, avec une authentification JWT et une base PostgreSQL.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Accès sécurisé
            </span>
            <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200">
              React
            </span>
            <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200">
              PostgreSQL
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
