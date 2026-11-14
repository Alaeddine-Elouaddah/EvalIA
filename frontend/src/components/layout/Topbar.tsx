import { useState } from 'react'
import { Bell, ChevronRight, Menu, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import type { User } from '../../types'

interface TopbarProps {
  user: User
  onOpenMobileMenu: () => void
}

const breadcrumbLabels: Record<string, string> = {
  dashboard: 'Tableau de bord',
  exams: 'Mes examens',
  create: 'Créer un examen',
  'ai-generator': 'Générateur IA',
  questions: 'Banque de questions',
  students: 'Étudiants',
  results: 'Résultats & notes',
  profile: 'Mon profil',
}

export function Topbar({ user, onOpenMobileMenu }: TopbarProps) {
  const { pathname } = useLocation()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const labels = pathname.split('/').filter(Boolean).slice(1).map((part) => breadcrumbLabels[part] ?? part)
  const currentLabel = labels.at(-1) ?? 'Tableau de bord'
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="flex min-h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Ouvrir le menu de navigation"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition hover:bg-canvas hover:text-ink lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
          <Link to="/teacher/dashboard" className="font-medium text-muted transition hover:text-primary">
            Espace enseignant
          </Link>
          <ChevronRight className="h-4 w-4 text-muted/60" />
          <span className="truncate font-semibold text-ink">{currentLabel}</span>
        </div>

        <label className="relative ml-auto hidden w-full max-w-xs md:block">
          <span className="sr-only">Rechercher dans EvalIA</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Rechercher…"
            className="h-10 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-muted/70 hover:border-primary-300 focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>

        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-muted transition hover:bg-canvas hover:text-ink"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-line bg-surface p-4 shadow-xl">
              <p className="text-sm font-bold text-ink">Notifications</p>
              <div className="mt-3 space-y-3">
                <p className="text-xs leading-5 text-muted">
                  <span className="font-semibold text-ink">12 nouveaux rendus</span> pour Algorithmique et complexité.
                </p>
                <p className="border-t border-line pt-3 text-xs leading-5 text-muted">
                  Votre examen Bases de données est prêt à être publié.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="hidden h-9 w-px bg-line sm:block" />
        <Link
          to="/teacher/profile"
          aria-label={`Profil de ${user.name}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary ring-2 ring-surface transition hover:ring-primary-200"
        >
          {initials}
        </Link>
      </div>
    </header>
  )
}
