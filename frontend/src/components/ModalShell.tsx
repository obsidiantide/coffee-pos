import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  title: ReactNode
  onClose: () => void
  children: ReactNode
  /** Tailwind max-width class for the dialog panel. */
  maxWidth?: string
  /** Close when the backdrop is clicked. Disable for forms with unsaved input. */
  closeOnBackdrop?: boolean
}

export default function ModalShell({
  title,
  onClose,
  children,
  maxWidth = 'max-w-md',
  closeOnBackdrop = true,
}: Props) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-white rounded-lg shadow-xl ${maxWidth} w-full max-h-[90vh] overflow-auto animate-fadeInScale`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          {title}
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
