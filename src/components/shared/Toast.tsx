import { useEffect } from 'react'

interface ToastProps {
  message: string
  visible: boolean
  onDismiss: () => void
}

export function Toast({ message, visible, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDismiss, 2500)
    return () => clearTimeout(timer)
  }, [visible, onDismiss])

  if (!visible) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-60 px-6 py-3 bg-primary-container text-white rounded-xl shadow-lg animate-slide-up">
      {message}
    </div>
  )
}
