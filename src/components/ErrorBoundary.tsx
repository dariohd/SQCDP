import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[SQCDP] ErrorBoundary', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
            <h1 className="text-xl font-bold text-primary">Une erreur est survenue</h1>
            <p className="mt-3 text-sm text-slate-600">
              {this.state.error.message || "Impossible d'afficher cette page."}
            </p>
            <button
              type="button"
              className="mt-6 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
              onClick={() => {
                this.setState({ error: null })
                window.location.assign('/app')
              }}
            >
              Recharger l'application
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
