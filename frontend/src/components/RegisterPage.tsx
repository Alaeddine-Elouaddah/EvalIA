import React, { useState } from 'react'
import type { AppView, User } from '../types'
import { registerUser } from '../api/auth'
import { AlertCircle, ArrowRight, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

interface RegisterPageProps {
  onSuccess: (user: User) => void
  onNavigate: (view: AppView) => void
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onNavigate }) => {
  const [name, setName] = useState('')
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
      const res = await registerUser(name, email, password)
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
    <AuthLayout
      title="Créer votre compte"
      description="Rejoignez EvalIA pour accéder aux évaluations de l’ENSIASD."
      onNavigate={onNavigate}
      footer={(
        <p className="text-sm text-muted">
          Vous avez déjà un compte ?{' '}
          <button type="button" onClick={() => onNavigate('login')} className="font-bold text-primary transition hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
            Se connecter
          </button>
        </p>
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-primary-100 bg-primary-50/70 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
            <GraduationCap className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-bold text-ink">Compte étudiant</span>
            <span className="mt-0.5 block text-xs text-muted">Inscription dédiée aux étudiants</span>
          </span>
        </div>
        <Badge status="info">ENSIASD</Badge>
      </div>

      {error && (
        <div role="alert" aria-live="assertive" className="mb-5 flex items-start gap-3 rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="register-name"
          label="Nom complet"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. Sarah Alami"
          leadingIcon={<UserRound className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        />
        <Input
          id="register-email"
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
          id="register-password"
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6 caractères minimum"
          hint="Choisissez un mot de passe d’au moins 6 caractères."
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
          {loading ? 'Création du compte…' : 'Créer mon compte étudiant'}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs leading-5 text-subtle">
        En créant votre compte, vous rejoignez l’espace académique EvalIA de l’ENSIASD.
      </p>
    </AuthLayout>
  )
}
