interface FABProps {
  onClick: () => void
  visible?: boolean
}

export function FAB({ onClick, visible = true }: FABProps) {
  if (!visible) return null

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-4 w-14 h-14 bg-primary-container text-white rounded-full
        shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40 cursor-pointer"
      aria-label="Add"
    >
      <span className="material-symbols-outlined text-3xl">add</span>
    </button>
  )
}
