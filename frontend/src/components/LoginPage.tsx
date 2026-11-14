import React, { useState } from 'react'
import type { AppView, User } from '../types'
import { loginUser } from '../api/auth'
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

interface LoginModalProps {
  onSuccess: (user: User) => void
  onNavigate: (view: AppView) => void
}

export const LoginPage: React.FC<LoginModalProps> = ({ onSuccess, onNavigate }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <AuthLayout
      title="Heureux de vous retrouver"
      description="Connectez-vous à votre espace étudiant ou professeur ENSIASD."
      onNavigate={onNavigate}
      footer={(
        <p className="text-sm text-muted">
          Vous n’avez pas encore de compte ?{' '}
          <button type="button" onClick={() => onNavigate('register')} className="font-bold text-primary transition hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
            Créer un compte étudiant
          </button>
        </p>
      )}
    >
      {error && (
        <div role="alert" aria-live="assertive" className="mb-5 flex items-start gap-3 rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="login-email"
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre adresse e-mail"
          leadingIcon={<Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        />
        <Input
          id="login-password"
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Saisissez votre mot de passe"
          leadingIcon={<LockKeyhole className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          trailingAction={(
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              aria-pressed={showPassword}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-subtle transition hover:bg-sky-50 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          )}
        />

        <Button type="submit" className="mt-2 w-full" size="lg" loading={loading} icon={<ArrowRight className="h-4 w-4" />}>
          {loading ? 'Connexion en cours…' : 'Se connecter'}
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-subtle">
        <LockKeyhole className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
        Votre espace académique ENSIASD
      </div>
    </AuthLayout>
  )
}
