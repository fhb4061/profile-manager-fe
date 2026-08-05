import { Component, type ErrorInfo, type ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type Props = {
  children: ReactNode
}

type State = {
  // Incremented on retry to remount the subtree; a plain boolean would leave
  // the failed children mounted with their bad state intact.
  resetKey: number
  hasError: boolean
}

/**
 * Catches render-time throws anywhere below it. Without a boundary React
 * unmounts the whole tree on an uncaught render error, leaving a white screen
 * with no way back other than a manual reload.
 *
 * Must be a class: there is still no hook equivalent of componentDidCatch.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { resetKey: 0, hasError: false }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the detail in the console for debugging; it is deliberately not
    // rendered, since error messages can carry internals or user data.
    console.error('Unhandled render error:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState((prev) => ({ resetKey: prev.resetKey + 1, hasError: false }))
  }

  render() {
    if (!this.state.hasError) {
      return <div key={this.state.resetKey}>{this.props.children}</div>
    }

    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6">
        <Alert variant="destructive" className="max-w-md">
          <TriangleAlert />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <p>
              The page failed to load. Retrying usually fixes it — if it keeps happening, reload the
              app.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={this.handleRetry}>
                Try again
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.location.assign('/')}>
                Back to start
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }
}
