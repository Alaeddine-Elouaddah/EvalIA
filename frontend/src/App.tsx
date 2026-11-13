import { useState, useEffect } from 'react'
import type { AppView, User } from './types'
import { getStoredUser, clearAuthSession } from './api/auth'
import { Navbar } from './components/Navbar'
import { HomePage } from './components/HomePage'
import { LoginPage } from './components/LoginPage'
import { RegisterPage } from './components/RegisterPage'
import { QcmWorkspace } from './components/QcmWorkspace'

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<AppView>('home')

  useEffect(() => {
    const user = getStoredUser()
    if (user) {
      setCurrentUser(user)
    }
  }, [])

  function handleAuthSuccess(user: User) {
    setCurrentUser(user)
    setCurrentView('generator')
  }

  function handleLogout() {
    clearAuthSession()
    setCurrentUser(null)
    setCurrentView('home')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar
        user={currentUser}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'home' && (
          <HomePage
            user={currentUser}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onSuccess={handleAuthSuccess}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onSuccess={handleAuthSuccess}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'generator' && (
          currentUser ? (
            <QcmWorkspace user={currentUser} />
          ) : (
            <LoginPage
              onSuccess={handleAuthSuccess}
              onNavigate={(view) => setCurrentView(view)}
            />
          )
        )}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 bg-white">
        EvalIA &copy; 2026 - Plateforme intelligente de génération de QCM et d'évaluation académique (JWT & PostgreSQL)
      </footer>
    </div>
  )
}

export default App
