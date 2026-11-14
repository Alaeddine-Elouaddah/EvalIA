import React, { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import { AlertCircle, Camera, CheckCircle2, Loader2, Save, Trash2, UserRound } from 'lucide-react'
import { fetchUserProfile, updateUserProfile } from '../api/auth'
import type { User } from '../types'

interface ProfilePageProps {
  user: User
  onUpdated: (user: User) => void
}

const MAX_PHOTO_SIZE = 2 * 1024 * 1024
const ACCEPTED_PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdated }) => {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user.profilePhoto ?? null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileReady, setProfileReady] = useState(false)
  const [readingPhoto, setReadingPhoto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchUserProfile()
      .then((profile) => {
        if (!active) return
        setName(profile.name)
        setEmail(profile.email)
        setProfilePhoto(profile.profilePhoto)
        setProfileReady(true)
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil')
        }
      })
      .finally(() => {
        if (active) setLoadingProfile(false)
      })

    return () => {
      active = false
    }
  }, [])

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(null)
    setSuccess(null)

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setError('Choisissez une image PNG, JPEG ou WebP.')
      return
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setError('La photo ne doit pas dépasser 2 Mo.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setProfilePhoto(reader.result)
      setReadingPhoto(false)
    }
    reader.onerror = () => {
      setReadingPhoto(false)
      setError('Impossible de lire ce fichier image.')
    }
    setReadingPhoto(true)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const updated = await updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        currentPassword,
        newPassword,
        profilePhoto,
      })
      const updatedUser: User = {
        ...user,
        name: updated.name,
        email: updated.email,
        profilePhoto: updated.profilePhoto ?? null,
      }
      onUpdated(updatedUser)
      setCurrentPassword('')
      setNewPassword('')
      setSuccess('Votre profil a été mis à jour.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Mon compte</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Modifier mon profil</h1>
        <p className="mt-2 text-sm text-slate-600">
        Modifiez vos informations, votre mot de passe et votre photo de profil.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-4 border-b border-slate-100 pb-6 sm:flex-row">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-400">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Photo de profil" className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-10 w-10" />
            )}
          </div>
          <div className="text-center sm:text-left">
            <p className="font-semibold text-slate-900">Photo de profil</p>
            <p className="mt-1 text-xs text-slate-500">PNG, JPEG ou WebP, 2 Mo maximum.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <Camera className="h-4 w-4" />
                Choisir une photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  className="sr-only"
                  aria-label="Choisir une photo de profil"
                />
              </label>
              {profilePhoto && (
                <button
                  type="button"
                  onClick={() => setProfilePhoto(null)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer la photo
                </button>
              )}
              {readingPhoto && <span className="self-center text-xs text-slate-500">Lecture de la photo…</span>}
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-slate-700">Nom complet</label>
            <input
              id="profile-name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-1.5 block text-sm font-medium text-slate-700">Adresse e-mail</label>
            <input
              id="profile-email"
              type="email"
              required
              maxLength={150}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <div>
            <label htmlFor="current-password" className="mb-1.5 block text-sm font-medium text-slate-700">Mot de passe actuel</label>
            <input
              id="current-password"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
            <input
              id="new-password"
              type="password"
              minLength={6}
              autoComplete="new-password"
              placeholder="Laisser vide pour ne pas le modifier"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
          {loadingProfile ? (
            <p className="inline-flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement du profil…
            </p>
          ) : !profileReady ? (
            <p className="text-xs text-rose-700">Profil non chargé. Rechargez la page pour réessayer.</p>
          ) : <span />}
          <button
            type="submit"
            disabled={saving || loadingProfile || readingPhoto || !profileReady}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </section>
  )
}
