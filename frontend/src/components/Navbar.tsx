import { useState } from 'react'
import type { User, AppView } from '../types'
import { BookOpen, GraduationCap, KeyRound, LogOut, Menu, Sparkles, UserRound, X } from 'lucide-react'

interface NavbarProps {
  user: User | null
  currentView: AppView
  onNavigate: (view: AppView) => void
  onLogout: () => void
}

export function Navbar({ user, currentView, onNavigate, onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  function navigate(view: AppView) {
    onNavigate(view)
    setMenuOpen(false)
  }

  const navClass = (view: AppView) => `flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold transition md:w-auto ${
    currentView === view ? 'bg-primary-50 text-primary' : 'text-muted hover:bg-sky-50 hover:text-ink'
  }`

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur">
      <div className="relative mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate(user?.role === 'STUDENT' ? 'generator' : 'home')} aria-label="Retour à EvalIA" className="group flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-surface shadow-panel transition-transform group-hover:scale-105">
            {user?.role === 'STUDENT' ? <GraduationCap className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </span>
          <span className="text-xl font-extrabold tracking-tight text-primary">EvalIA</span>
          <span className="hidden border-l border-line pl-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted sm:inline">ENSIASD</span>
        </button>

        <button
          type="button"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-muted transition hover:bg-canvas hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav
          id="primary-navigation"
          aria-label="Navigation principale"
          className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b border-line bg-surface px-4 py-4 shadow-panel md:static md:flex md:flex-row md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          {!user && (
            <>
              <button type="button" onClick={() => navigate('home')} className={navClass('home')}>Accueil</button>
              <button type="button" onClick={() => navigate('login')} className={navClass('login')}>Connexion</button>
              <button type="button" onClick={() => navigate('register')} className="min-h-11 rounded-[10px] bg-gradient-to-r from-primary-600 to-sky px-4 text-left text-sm font-semibold text-white shadow-button transition hover:-translate-y-0.5 hover:shadow-button-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">Créer un compte étudiant</button>
            </>
          )}

          {user?.role === 'STUDENT' && (
            <>
              <button type="button" onClick={() => navigate('student_join_exam')} aria-current={currentView === 'student_join_exam' ? 'page' : undefined} className={navClass('student_join_exam')}><KeyRound className="h-4 w-4" />Rejoindre un examen</button>
              <button type="button" onClick={() => navigate('student_exams')} aria-current={currentView === 'student_exams' ? 'page' : undefined} className={navClass('student_exams')}><BookOpen className="h-4 w-4" />Examens</button>
              <button type="button" onClick={() => navigate('generator')} aria-current={currentView === 'generator' ? 'page' : undefined} className={navClass('generator')}><Sparkles className="h-4 w-4" />Générateur IA</button>
              <button type="button" onClick={() => navigate('profile')} aria-current={currentView === 'profile' ? 'page' : undefined} className={navClass('profile')}><UserRound className="h-4 w-4" />Mon profil</button>
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-3 md:ml-2 md:mt-0 md:border-l md:border-t-0 md:pl-3 md:pt-0">
                <span className="hidden text-sm font-semibold text-ink sm:inline">{user.name}</span>
                <button type="button" onClick={() => { onLogout(); setMenuOpen(false) }} title="Se déconnecter" aria-label="Se déconnecter" className="rounded-lg p-2 text-muted transition hover:bg-danger-soft hover:text-danger">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
