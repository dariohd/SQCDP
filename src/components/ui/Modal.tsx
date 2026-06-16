import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
}

export function Modal({ open, onClose, title, children, size = 'lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-primary/10`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-xl font-semibold text-primary">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
