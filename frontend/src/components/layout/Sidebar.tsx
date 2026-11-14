import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import {
  BarChart3,
  CircleHelp,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings2,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'
import type { User } from '../../types'

interface SidebarProps {
  user: User
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapsed: () => void
  onCloseMobile: () => void
  onLogout: () => void
}

const navigation = [
  { section: 'Espace', to: '/teacher/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { section: 'Évaluations', to: '/teacher/exams', label: 'Mes examens', icon: ClipboardList, end: true },
  { section: 'Évaluations', to: '/teacher/exams/create', label: 'Créer un examen', icon: Plus },
  { section: 'Évaluations', to: '/teacher/ai-generator', label: 'Générateur IA', icon: Sparkles },
  { section: 'Suivi', to: '/teacher/students', label: 'Étudiants', icon: UsersRound },
  { section: 'Suivi', to: '/teacher/results', label: 'Résultats & notes', icon: BarChart3 },
]

const sections = ['Espace', 'Évaluations', 'Suivi']

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function Sidebar({
  user,
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onCloseMobile,
  onLogout,
}: SidebarProps) {
  const reduceMotion = useReducedMotion()
  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <m.button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/80 bg-white/85 shadow-panel backdrop-blur-2xl transition-[width,transform] duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
        aria-label="Navigation enseignant"
      >
        <div className={`flex h-[84px] shrink-0 items-center border-b border-slate-100/80 ${collapsed ? 'justify-center px-2' : 'gap-3 px-5'}`}>
          <Link to="/teacher/dashboard" onClick={onCloseMobile} aria-label="EvalIA, tableau de bord" className="group flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-sky text-white shadow-button transition-transform duration-200 group-hover:scale-[1.03]">
              <GraduationCap className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className={`${collapsed ? 'lg:hidden' : ''} min-w-0`}>
              <span className="block text-[17px] font-bold tracking-[-0.04em] text-ink">Eval<span className="text-primary">IA</span></span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-subtle">ENSIASD</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="ml-auto hidden h-11 w-11 items-center justify-center rounded-xl text-subtle transition hover:bg-sky-50 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary lg:inline-flex"
            aria-label={collapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'}
            title={collapsed ? 'Déplier le menu' : 'Replier le menu'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <nav className={`min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-5 ${collapsed ? 'lg:px-2' : ''}`} aria-label="Navigation principale">
          {sections.map((section) => (
            <div key={section} className="mb-5 last:mb-0">
              <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-subtle ${collapsed ? 'lg:sr-only' : ''}`}>{section}</p>
              <div className="space-y-1">
                {navigation.filter((item) => item.section === section).map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onCloseMobile}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) => `group relative flex min-h-11 items-center gap-3 overflow-hidden rounded-xl px-3 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                      isActive ? 'text-primary' : 'text-slate-600 hover:bg-sky-50/80 hover:text-ink'
                    } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <m.span layoutId="sidebar-active-item" className="absolute inset-0 rounded-xl bg-primary-50 ring-1 ring-inset ring-primary-100/70" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                        {isActive && <span className="absolute bottom-2 left-0 top-2 z-10 w-[3px] rounded-r-full bg-primary" aria-hidden="true" />}
                        <Icon className={`relative z-10 h-[18px] w-[18px] shrink-0 ${isActive ? 'text-primary' : 'text-slate-400 transition-colors group-hover:text-sky'}`} strokeWidth={1.75} aria-hidden="true" />
                        <span className={`relative z-10 truncate ${collapsed ? 'lg:sr-only' : ''}`}>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-100/80 p-3">
          <div className={`mb-2 flex items-center gap-3 rounded-2xl border border-sky-100/70 bg-gradient-to-br from-white to-sky-50/70 p-3 ${collapsed ? 'lg:hidden' : ''}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-xs font-bold text-primary">
              {initials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-ink">{user.name}</p>
              <p className="mt-0.5 text-[11px] font-medium text-muted">Professeur</p>
            </div>
            <span className="h-2 w-2 shrink-0 rounded-full bg-success ring-4 ring-success/10" title="Compte actif" />
          </div>
          {collapsed && (
            <div className="mb-2 hidden h-10 items-center justify-center rounded-xl bg-primary-100 text-xs font-bold text-primary lg:flex" title={`${user.name} — Professeur`}>
              {initials(user.name)}
            </div>
          )}
          <Link
            to="/teacher/profile"
            onClick={onCloseMobile}
            title={collapsed ? 'Mon profil' : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-sky-50 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <Settings2 className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className={collapsed ? 'lg:sr-only' : ''}>Mon profil</span>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            title={collapsed ? 'Déconnexion' : undefined}
            className={`mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-slate-600 transition hover:bg-danger-soft hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-danger ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className={collapsed ? 'lg:sr-only' : ''}>Déconnexion</span>
          </button>
          <div className={`${collapsed ? 'hidden' : 'mt-3 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-3 text-[10px] font-medium text-subtle'}`}>
            <CircleHelp className="h-3.5 w-3.5" strokeWidth={1.75} />
            ENSIASD · Édition académique
          </div>
        </div>
      </aside>
    </>
  )
}
