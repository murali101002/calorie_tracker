import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { id: 'log', label: 'Log', icon: 'calendar_today', path: '/' },
  { id: 'scan', label: 'Scan', icon: 'barcode_scanner', path: '/scan' },
  { id: 'recipes', label: 'Recipes', icon: 'menu_book', path: '/recipes' },
] as const

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  function getActiveTab(): string {
    if (location.pathname === '/scan') return 'scan'
    if (location.pathname.startsWith('/recipes')) return 'recipes'
    return 'log'
  }

  const activeTab = getActiveTab()

  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-2xl bg-white/95 backdrop-blur-md
      border-t border-outline-variant/20 shadow-nav">
      <div className="flex justify-around items-center h-20 px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl
                transition-all active:scale-90 duration-200 cursor-pointer
                ${active ? 'bg-surface-container text-primary' : 'text-outline hover:text-primary'}`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: active ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                {tab.icon}
              </span>
              <span className="text-[12px] font-medium mt-1">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
