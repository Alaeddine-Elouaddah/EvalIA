import React from 'react'
import type { User, AppView } from '../types'
import { LogOut, BookOpen, User as UserIcon, Sparkles } from 'lucide-react'

interface NavbarProps {
  user: User | null
  currentView: AppView
  onNavigate: (view: AppView) => void
  onLogout: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ user, currentView, onNavigate, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text text-transparent">
            EvalIA
          </span>
        </button>

        <nav className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
              currentView === 'home'
                ? 'text-indigo-600 bg-indigo-50 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Accueil
          </button>

          {user && (
            <button
              onClick={() => onNavigate('generator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                currentView === 'generator'
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Générateur QCM</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
                  <span
                    className={`inline-block text-[11px] font-bold px-1.5 py-0.2 rounded-md ${
                      user.role === 'TEACHER'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {user.role === 'TEACHER' ? 'Professeur' : 'Étudiant'}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Se déconnecter"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => onNavigate('login')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer ${
                  currentView === 'login'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition cursor-pointer"
              >
                Créer un compte
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
