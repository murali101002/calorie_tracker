interface SearchInputProps {
  value: string
  onChange: (v: string) => void
  placeholder: string
  onFilter?: () => void
}

export function SearchInput({ value, onChange, placeholder, onFilter }: SearchInputProps) {
  return (
    <div className="relative flex items-center">
      <span className="material-symbols-outlined absolute left-4 text-outline">search</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant
          rounded-full text-body-md text-on-background placeholder:text-outline-variant
          focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
      />
      {onFilter && (
        <button
          type="button"
          onClick={onFilter}
          className="absolute right-2 w-8 h-8 flex items-center justify-center text-primary
            active:scale-90 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined">tune</span>
        </button>
      )}
    </div>
  )
}
