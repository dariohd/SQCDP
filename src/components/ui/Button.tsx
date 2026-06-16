import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'action' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30',
  secondary:
    'bg-white text-primary border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5',
  action:
    'bg-state-attention text-[#a26c1f] hover:bg-action-btn-hover shadow-md',
  danger:
    'bg-delete text-white hover:bg-[#a21d1d] shadow-md',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100',
}

export function Button({
  variant = 'primary',
  children,
  loading,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
