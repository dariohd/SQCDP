import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: CheckCircle,
}

const colors = {
  success: 'bg-state-ok text-white',
  error: 'bg-delete text-white',
  warning: 'bg-state-attention text-[#a26c1f]',
  info: 'bg-primary text-white',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  const value: ToastContextValue = {
    toast: add,
    success: (m) => add(m, 'success'),
    error: (m) => add(m, 'error'),
    warning: (m) => add(m, 'warning'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 80 }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl ${colors[t.type]}`}
              >
                <Icon size={20} />
                <span className="flex-1 text-sm font-medium">{t.message}</span>
                <button onClick={() => setToasts((x) => x.filter((i) => i.id !== t.id))}>
                  <X size={16} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast within ToastProvider')
  return ctx
}
