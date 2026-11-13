import React, { useState } from 'react'
import type { AppView, User, UserRole } from '../types'
import { registerUser } from '../api/auth'
import { Lock, Mail, User as UserIcon, GraduationCap, BookOpen, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'

interface RegisterPageProps {
  onSuccess: (user: User) => void
  onNavigate: (view: AppView) => void
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onNavigate }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('STUDENT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await registerUser(name, email, password, role)
      onSuccess({
        id: res.id,
        name: res.name,
        email: res.email,
        role: res.role,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-10 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Créer un compte EvalIA</h2>
          <p className="text-sm text-slate-500 mt-1">Rejoignez la plateforme et choisissez votre profil</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Je suis un :
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                  role === 'STUDENT'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Étudiant</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('TEACHER')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                  role === 'TEACHER'
                    ? 'border-purple-600 bg-purple-50 text-purple-800 ring-2 ring-purple-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>Enseignant</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nom complet
            </label>
            <div className="relative">
              <UserIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Sarah Alami"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@universite.ma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 text-sm transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Création du compte...</span>
              </>
            ) : (
              <>
                <span>Créer mon compte ({role === 'TEACHER' ? 'Enseignant' : 'Étudiant'})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Déjà inscrit ?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
