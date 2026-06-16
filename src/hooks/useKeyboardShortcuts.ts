import { useEffect } from 'react'

export function useKeyboardShortcuts(bindings: Record<string, () => void>) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const fn = bindings[e.key.toLowerCase()]
      if (fn) {
        e.preventDefault()
        fn()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [bindings])
}
