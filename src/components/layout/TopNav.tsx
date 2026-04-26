import { useUserStore } from '../../stores/useUserStore'

export function TopNav() {
  const profile = useUserStore((s) => s.profile)

  return (
    <header className="w-full top-0 sticky z-50 bg-white border-b border-gray-100 shadow-sm">
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
          <span className="text-xl font-semibold text-green-600">
            MacroTrack
          </span>
        </div>
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-50 transition-colors active:scale-95 duration-150">
          <span className="material-symbols-outlined text-gray-500">settings</span>
        </button>
      </div>
    </header>
  )
}
