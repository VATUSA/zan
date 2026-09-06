import { Component } from 'react'

// A render-time throw (a null field the code didn't expect, a shape mismatch that slipped
// past a fetch's own error handling) currently blanks the entire page with nothing in the
// UI - only a stack trace in the console. React only catches these with a class component;
// there's no hook equivalent. This wraps the whole router so one broken page shows a message
// instead of taking down the site.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error in page:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy text-ink font-mulish grid place-items-center text-center px-10">
          <div>
            <p className="text-lg font-bold mb-2">Something went wrong.</p>
            <p className="text-muted2 mb-6">Try reloading the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gold hover:bg-goldLight text-navy font-bold rounded-full"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
