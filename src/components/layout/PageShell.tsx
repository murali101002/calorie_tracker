import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'
import { FAB } from './FAB'

interface PageShellProps { children: ReactNode }

export function PageShell({ children }: PageShellProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // Scanner is full-screen (no shell)
  if (location.pathname === '/scan') {
    return <>{children}</>
  }

  // Food detail has its own header + fixed bottom button
  if (location.pathname.startsWith('/food/')) {
    return <>{children}</>
  }

  const showFAB = location.pathname === '/' || location.pathname === '/recipes'
  const showBottomNav = location.pathname !== '/scan'

  const fabOnClick = () => {
    if (location.pathname.startsWith('/recipes')) {
      navigate('/recipes/new')
    } else {
      navigate('/scan')
    }
  }

  return (
    <div className="min-h-dvh bg-background text-on-background pb-24">
      <TopNav />
      <main className="max-w-2xl mx-auto pt-6 px-margin-mobile">
        {children}
      </main>
      {showBottomNav && <BottomNav />}
      {showFAB && <FAB onClick={fabOnClick} />}
    </div>
  )
}
