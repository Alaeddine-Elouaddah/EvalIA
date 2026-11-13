import React from 'react'
import type { AppView, User } from '../types'
import { Sparkles, Brain, GraduationCap, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

interface HomePageProps {
  user: User | null
  onNavigate: (view: AppView) => void
}

export const HomePage: React.FC<HomePageProps> = ({ user, onNavigate }) => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 text-center">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30">
          <div className="w-[600px] h-[600px] bg-gradient-to-tr from-indigo-300 via-purple-300 to-pink-300 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Plateforme intelligente d'évaluation académique</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Transformez vos cours en <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              QCM interactifs propulsés par l'IA
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            EvalIA permet aux <strong>enseignants</strong> de concevoir des évaluations en quelques secondes à partir de documents PDF, et aux <strong>étudiants</strong> de s'auto-évaluer avec des explications pédagogiques instantanées.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <button
                onClick={() => onNavigate('generator')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition cursor-pointer"
              >
                <span>Accéder à l'espace QCM</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('register')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition cursor-pointer"
                >
                  <span>Commencer gratuitement</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 shadow-sm transition cursor-pointer"
                >
                  J'ai déjà un compte
                </button>
              </>
            )}
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Génération instantanée via PDF</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Espaces Étudiant & Enseignant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Sécurité JWT & PostgreSQL</span>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Feature Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Un espace pensé pour chaque rôle</h2>
          <p className="mt-2 text-slate-600">Choisissez votre profil lors de l'inscription pour une expérience sur mesure</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card Teacher */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50/60 to-white border border-purple-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-6 shadow-md shadow-purple-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-md">
              Pour les Enseignants (Teachers)
            </span>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">Créez des QCM en un clic</h3>
            <p className="mt-2 text-slate-600 leading-relaxed">
              Téléchargez votre support de cours ou vos fiches au format PDF. L'intelligence artificielle extrait les concepts clés et génère des questions précises avec solutions détaillées.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Gain de temps considérable sur la rédaction d'examens</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Choix du nombre de questions ciblées</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Explications automatiques et justifications des réponses</span>
              </li>
            </ul>
          </div>

          {/* Card Student */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-200">
              <Brain className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
              Pour les Étudiants (Students)
            </span>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">Révisez et évaluez vos acquis</h3>
            <p className="mt-2 text-slate-600 leading-relaxed">
              Testez vos connaissances en temps réel sur n'importe quel chapitre. Validez chaque réponse et progressez grâce au feedback pédagogique immédiat.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Entraînement interactif avec score instantané</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Compréhension immédiate des erreurs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Répétez à volonté sur vos polycopiés de cours</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Zap className="w-4 h-4" />
              <span>Architecture Moderne & Robuste</span>
            </div>
            <h3 className="text-2xl font-bold mt-1">Conçu avec les standards de l'industrie</h3>
            <p className="text-slate-400 text-sm mt-1">
              Backend Jakarta EE & MicroProfile, Base de données PostgreSQL, Authentification JWT, et Frontend React avec Tailwind CSS.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-xs font-mono text-slate-300 border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              JWT Auth
            </div>
            <div className="px-3 py-2 bg-slate-800 rounded-lg text-xs font-mono text-slate-300 border border-slate-700">
              PostgreSQL
            </div>
            <div className="px-3 py-2 bg-slate-800 rounded-lg text-xs font-mono text-slate-300 border border-slate-700">
              Tailwind CSS
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
