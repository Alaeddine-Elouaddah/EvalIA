import React, { useState } from 'react'
import type { AppView, User } from '../types'
import { loginUser } from '../api/auth'
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'

interface LoginModalProps {
  onSuccess: (user: User) => void
  onNavigate: (view: AppView) => void
}

export const LoginPage: React.FC<LoginModalProps> = ({ onSuccess, onNavigate }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await loginUser(email, password)
      onSuccess({
        id: res.id,
        name: res.name,
        email: res.email,
        role: res.role,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Bon retour sur EvalIA</h2>
          <p className="text-sm text-slate-500 mt-1">
            Connectez-vous à votre espace étudiant ou enseignant
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Pas encore de compte ?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
