let showToast: ((message: string) => void) | null = null

export function registerDemoReadOnlyToast(fn: (message: string) => void) {
  showToast = fn
}

export function notifyDemoReadOnly() {
  showToast?.('Mode démo : connectez-vous pour modifier les données')
}
