import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, ChevronRight, Menu, Search, UserRound } from 'lucide-react'
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
  const [profileOpen, setProfileOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const reduceMotion = useReducedMotion()
  const labels = pathname.split('/').filter(Boolean).slice(1).map((part) => breadcrumbLabels[part] ?? part)
  const currentLabel = labels.at(-1) ?? 'Tableau de bord'
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key === 'Escape') {
        setNotificationsOpen(false)
        setProfileOpen(false)
      }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  function toggleNotifications() {
    setProfileOpen(false)
    setNotificationsOpen((open) => !open)
  }

  function toggleProfile() {
    setNotificationsOpen(false)
    setProfileOpen((open) => !open)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/80 bg-white/75 shadow-[0_8px_24px_-22px_rgb(15_23_42_/_0.24)] backdrop-blur-2xl">
      <div className="flex min-h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Ouvrir le menu de navigation"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-muted shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-primary lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <div className="hidden min-w-0 items-center gap-2 text-[13px] sm:flex">
          <Link to="/teacher/dashboard" className="font-semibold text-subtle transition hover:text-primary">Mon espace</Link>
          <ChevronRight className="h-4 w-4 text-slate-300" strokeWidth={1.75} aria-hidden="true" />
          <span className="truncate font-bold text-ink">{currentLabel}</span>
        </div>

        <label className="relative ml-auto hidden w-full max-w-[340px] md:block">
          <span className="sr-only">Rechercher dans EvalIA</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" strokeWidth={1.75} aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            placeholder="Rechercher dans l’espace…"
            className="h-11 w-full rounded-xl border border-slate-200/75 bg-white/65 pl-10 pr-16 text-[13px] text-ink outline-none transition-all placeholder:text-subtle hover:border-sky-200 focus:border-sky focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">Ctrl K</kbd>
        </label>

        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={toggleNotifications}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-sky-50 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Bell className="h-[19px] w-[19px]" strokeWidth={1.75} />
            <span className="absolute right-[11px] top-[10px] h-2 w-2 rounded-full bg-primary ring-2 ring-white" aria-label="Notifications non lues" />
          </button>
          <AnimatePresence>
            {notificationsOpen && (
              <m.div
                initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: reduceMotion ? 0 : 0.16 }}
                className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-white/80 bg-white/95 p-4 shadow-panel backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-ink">Notifications</p>
                  <span className="rounded-full bg-primary-50 px-2 py-1 text-[10px] font-bold text-primary">2 nouvelles</span>
                </div>
                <div className="mt-3 space-y-3">
                  <p className="rounded-xl bg-sky-50/70 p-3 text-xs leading-5 text-muted">
                    <span className="font-semibold text-ink">12 nouveaux rendus</span> pour Algorithmique et complexité.
                  </p>
                  <p className="border-t border-slate-100 pt-3 text-xs leading-5 text-muted">
                    Votre examen Bases de données est prêt à être publié.
                  </p>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="relative">
          <button
            type="button"
            onClick={toggleProfile}
            aria-label={`Ouvrir le menu du profil de ${user.name}`}
            aria-expanded={profileOpen}
            className="flex min-h-11 items-center gap-2 rounded-xl p-1 pr-1.5 transition hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-sky-100 text-xs font-bold text-primary ring-1 ring-inset ring-white">
              {initials}
            </span>
            <ChevronDown className={`hidden h-3.5 w-3.5 text-subtle transition-transform sm:block ${profileOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <m.div
                initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: reduceMotion ? 0 : 0.16 }}
                className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 rounded-2xl border border-white/80 bg-white/95 p-2 shadow-panel backdrop-blur-xl"
              >
                <div className="border-b border-slate-100 px-3 py-2.5">
                  <p className="truncate text-sm font-bold text-ink">{user.name}</p>
                  <p className="mt-0.5 text-xs text-subtle">Professeur</p>
                </div>
                <Link to="/teacher/profile" onClick={() => setProfileOpen(false)} className="mt-1 flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-muted transition hover:bg-sky-50 hover:text-primary">
                  <UserRound className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  Mon profil
                </Link>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
