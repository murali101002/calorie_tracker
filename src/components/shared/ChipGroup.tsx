interface ChipGroupProps {
  items: { id: string; label: string }[]
  selectedId: string
  onSelect: (id: string) => void
  className?: string
}

export function ChipGroup({ items, selectedId, onSelect, className = '' }: ChipGroupProps) {
  return (
    <div className={`flex gap-2 overflow-x-auto pb-2 hide-scrollbar ${className}`}>
      {items.map((item) => {
        const selected = item.id === selectedId
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`whitespace-nowrap px-4 py-1 rounded-full text-label-lg transition-all
              active:scale-95 cursor-pointer
              ${selected
                ? 'bg-primary-container text-white shadow-md'
                : 'bg-surface-container-lowest border border-outline-variant text-outline hover:border-primary-container'
              }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
