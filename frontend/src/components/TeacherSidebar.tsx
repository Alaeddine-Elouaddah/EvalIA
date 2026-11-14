import React from 'react'
import { BarChart3, ClipboardList, GraduationCap, Sparkles, UsersRound } from 'lucide-react'
import type { AppView } from '../types'

interface TeacherSidebarProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
}

const items: { view: AppView; label: string; icon: typeof ClipboardList }[] = [
  { view: 'teacher_dashboard', label: 'Examens', icon: ClipboardList },
  { view: 'teacher_students', label: 'Étudiants', icon: UsersRound },
  { view: 'teacher_grades', label: 'Notes', icon: BarChart3 },
  { view: 'generator', label: 'Générateur IA', icon: Sparkles },
]

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ currentView, onNavigate }) => (
  <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:sticky lg:top-24 lg:w-60 lg:self-start">
    <div className="hidden px-3 pb-3 pt-2 lg:block">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Espace enseignant</p>
    </div>
    <nav aria-label="Menu enseignant" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map(({ view, label, icon: Icon }) => {
        const active = currentView === view
        return (
          <button
            type="button"
            key={view}
            aria-current={active ? 'page' : undefined}
            onClick={() => onNavigate(view)}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition lg:w-full ${
              active
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon className={`h-4 w-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>{label}</span>
          </button>
        )
      })}
      <div className="hidden border-t border-slate-100 pt-1 lg:block" />
      <div className="hidden items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-slate-400 lg:flex">
        <GraduationCap className="h-4 w-4" />
        EvalIA Enseignant
      </div>
    </nav>
  </aside>
)
