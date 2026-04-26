import { useNavigate } from 'react-router-dom'

interface NavAction {
  icon: string
  onClick: () => void
  label?: string
}

interface DetailTopNavProps {
  title: string
  actions?: NavAction[]
}

export function DetailTopNav({ title, actions = [] }: DetailTopNavProps) {
  const navigate = useNavigate()

  return (
    <header className="w-full top-0 sticky z-50 bg-white border-b border-outline-variant/20 shadow-sm h-16 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="hover:bg-surface-container-low transition-colors p-2 rounded-full active:scale-95 duration-150 cursor-pointer"
        >
          <span className="material-symbols-outlined text-on-background">arrow_back</span>
        </button>
        <div className="flex flex-col">
          <span className="text-on-background font-semibold text-lg">{title}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions.map((action, i) => (
          <button
            key={i}
            type="button"
            onClick={action.onClick}
            className="hover:bg-surface-container-low transition-colors p-2 rounded-full active:scale-95 duration-150 cursor-pointer"
            aria-label={action.label}
          >
            <span className="material-symbols-outlined text-on-background">{action.icon}</span>
          </button>
        ))}
      </div>
    </header>
  )
}
