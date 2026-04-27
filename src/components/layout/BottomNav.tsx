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
      border-t border-gray-100 shadow-nav pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex justify-center gap-16 items-center h-20 w-full">
        {tabs.map((tab) => {
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl
                transition-all active:scale-90 duration-200 cursor-pointer
                ${active ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-green-500'}`}
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
