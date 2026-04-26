interface EmptyStateProps {
  icon: string
  message: string
}

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="bg-surface-container-low border border-dashed border-outline-variant p-8 rounded-2xl
      flex flex-col items-center justify-center text-center">
      <span className="material-symbols-outlined text-outline-variant text-4xl mb-2">{icon}</span>
      <p className="text-body-md text-outline">{message}</p>
    </div>
  )
}
