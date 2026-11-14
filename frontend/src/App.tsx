import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import type { AppView, User } from './types'
import { clearAuthSession, getStoredUser } from './api/auth'
import { Navbar } from './components/Navbar'
import { HomePage } from './components/HomePage'
import { LoginPage } from './components/LoginPage'
import { RegisterPage } from './components/RegisterPage'
import { QcmWorkspace } from './components/QcmWorkspace'
import { ProfilePage } from './components/ProfilePage'
import { StudentExamsPage } from './components/StudentExamsPage'
import { AppLayout } from './components/layout/AppLayout'
import { TeacherDataProvider } from './data/TeacherDataContext'
import { AiGenerator } from './pages/teacher/AiGenerator'
import { CreateExam } from './pages/teacher/CreateExam'
import { Dashboard } from './pages/teacher/Dashboard'
import { Exams } from './pages/teacher/Exams'
import { Questions } from './pages/teacher/Questions'
import { Results } from './pages/teacher/Results'
import { Students } from './pages/teacher/Students'
import { JoinExam } from './pages/student/JoinExam'

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser())
  const [currentView, setCurrentView] = useState<AppView>(() =>
    currentUser?.role === 'STUDENT'
      ? window.location.pathname === '/student/join' ? 'student_join_exam' : 'generator'
      : 'home'
  )
  const navigate = useNavigate()

  function handleAuthSuccess(user: User) {
    setCurrentUser(user)
    if (user.role === 'TEACHER') {
      navigate('/teacher/dashboard', { replace: true })
    } else {
      setCurrentView(window.location.pathname === '/student/join' ? 'student_join_exam' : 'generator')
    }
  }

  function handleLogout() {
    clearAuthSession()
    setCurrentUser(null)
    setCurrentView('home')
    navigate('/', { replace: true })
  }

  if (currentUser?.role === 'TEACHER') {
    return (
      <Routes>
          <Route path="/teacher" element={<AppLayout user={currentUser} onLogout={handleLogout} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="exams" element={<Exams />} />
            <Route path="exams/create" element={<CreateExam />} />
            <Route path="ai-generator" element={<AiGenerator />} />
            <Route path="questions" element={<Questions />} />
            <Route path="students" element={<Students />} />
            <Route path="results" element={<Results />} />
            <Route path="profile" element={<ProfilePage user={currentUser} onUpdated={setCurrentUser} />} />
          </Route>
          <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
      </Routes>
    )
  }

  function renderView() {
    if (currentUser?.role === 'STUDENT') {
      switch (currentView) {
        case 'student_exams':
          return <StudentExamsPage />
        case 'student_join_exam':
          return <JoinExam user={currentUser} />
        case 'profile':
          return <ProfilePage user={currentUser} onUpdated={setCurrentUser} />
        default:
          return <QcmWorkspace user={currentUser} />
      }
    }

    switch (currentView) {
      case 'login':
        return <LoginPage onSuccess={handleAuthSuccess} onNavigate={setCurrentView} />
      case 'register':
        return <RegisterPage onSuccess={handleAuthSuccess} onNavigate={setCurrentView} />
      default:
        return <HomePage user={null} onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <Navbar
        user={currentUser}
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {renderView()}
      </main>
      <footer className="border-t border-line bg-surface py-5 text-center text-xs text-muted">
        EvalIA · ENSIASD · Plateforme d’évaluation académique
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <TeacherDataProvider>
        <AppContent />
      </TeacherDataProvider>
    </BrowserRouter>
  )
}

export default App
