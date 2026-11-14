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
  { to: '/teacher/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/teacher/exams', label: 'Mes examens', icon: ClipboardList, end: true },
  { to: '/teacher/exams/create', label: 'Créer un examen', icon: Plus },
  { to: '/teacher/ai-generator', label: 'Générateur IA', icon: Sparkles },
  { to: '/teacher/students', label: 'Étudiants', icon: UsersRound },
  { to: '/teacher/results', label: 'Résultats & notes', icon: BarChart3 },
]

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
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
        aria-label="Navigation enseignant"
      >
        <div className={`flex h-[84px] items-center border-b border-line ${collapsed ? 'justify-center px-2' : 'gap-3 px-5'}`}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-surface shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className={`${collapsed ? 'lg:hidden' : ''} min-w-0`}>
              <p className="text-lg font-extrabold tracking-tight text-primary">EvalIA</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">ENSIASD</p>
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="ml-auto hidden rounded-lg p-2 text-muted transition hover:bg-canvas hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary lg:inline-flex"
            aria-label={collapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'}
            title={collapsed ? 'Déplier le menu' : 'Replier le menu'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <div className={`px-3 pb-2 pt-5 ${collapsed ? 'lg:px-2' : ''}`}>
          <nav className="space-y-1" aria-label="Navigation principale">
            {navigation.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onCloseMobile}
                title={collapsed ? label : undefined}
                className={({ isActive }) => `group relative flex min-h-11 items-center gap-3 rounded-lg border-l-[3px] px-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-transparent text-muted hover:bg-canvas hover:text-ink'
                } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span className={`truncate ${collapsed ? 'lg:sr-only' : ''}`}>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-line p-3">
          <div className={`mb-3 flex items-center gap-3 rounded-lg bg-canvas p-3 ${collapsed ? 'lg:hidden' : ''}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary">
                {initials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                <p className="text-xs text-muted">Professeur</p>
              </div>
          </div>
          {collapsed && (
            <div
              className="mb-3 hidden h-10 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary lg:flex"
              title={`${user.name} — Professeur`}
            >
              {initials(user.name)}
            </div>
          )}
          <Link
            to="/teacher/profile"
            onClick={onCloseMobile}
            title={collapsed ? 'Mon profil' : undefined}
            className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted transition hover:bg-canvas hover:text-ink ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <Settings2 className="h-[18px] w-[18px] shrink-0" />
            <span className={collapsed ? 'lg:sr-only' : ''}>Mon profil</span>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            title={collapsed ? 'Déconnexion' : undefined}
            className={`mt-1 flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted transition hover:bg-danger-soft hover:text-danger ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span className={collapsed ? 'lg:sr-only' : ''}>Déconnexion</span>
          </button>
          <div className={`${collapsed ? 'hidden' : 'mt-4 flex items-center justify-center gap-1.5 border-t border-line pt-3 text-[11px] text-muted'}`}>
            <CircleHelp className="h-3.5 w-3.5" />
            ENSIASD · Édition académique
          </div>
        </div>
      </aside>
    </>
  )
}
