import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import type { User } from '../../types'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface AppLayoutProps {
  user: User
  onLogout: () => void
}

export function AppLayout({ user, onLogout }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="relative isolate min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 text-ink">
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
            <div className="app-grid-pattern absolute inset-0" />
            <div className="absolute -left-40 -top-52 h-[30rem] w-[30rem] rounded-full bg-sky-300/25 blur-3xl" />
            <div className="absolute -right-48 top-1/3 h-[34rem] w-[34rem] rounded-full bg-primary-300/20 blur-3xl" />
          </div>
          <Sidebar
            user={user}
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
            onCloseMobile={() => setMobileOpen(false)}
            onLogout={onLogout}
          />
          <div className={`relative z-10 min-h-screen transition-[padding] duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
            <Topbar user={user} onOpenMobileMenu={() => setMobileOpen(true)} />
            <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
              <m.div
                key={pathname}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
              >
                <Outlet />
              </m.div>
            </main>
          </div>
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}
