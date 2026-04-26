import { useUserStore } from '../../stores/useUserStore'

export function TopNav() {
  const profile = useUserStore((s) => s.profile)

  return (
    <header className="w-full top-0 sticky z-50 bg-surface-container-lowest border-b border-outline-variant/30 shadow-sm">
      <div className="flex items-center justify-between px-4 h-16 w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                <span className="material-symbols-outlined text-primary text-xl">person</span>
              </div>
            )}
          </div>
          <span className="text-xl font-semibold text-primary-container">
            MacroTrack
          </span>
        </div>
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-150">
          <span className="material-symbols-outlined text-outline">settings</span>
        </button>
      </div>
    </header>
  )
}
