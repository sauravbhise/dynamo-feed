import { Component, type ReactNode } from "react";

/** Last-resort boundary: a render error shows a friendly reload card instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[app] render error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="grid h-dvh place-items-center bg-ink p-8 text-center"
          role="alert"
          data-testid="error-boundary"
        >
          <div>
            <h1 className="font-display text-2xl text-cream">Something broke</h1>
            <p className="mt-2 text-sm text-muted">That one's on us — a quick reload usually sorts it out.</p>
            <button
              onClick={() => window.location.reload()}
              data-testid="error-reload"
              className="mt-5 rounded-full bg-sage px-5 py-2.5 text-sm font-bold text-sage-deep transition hover:scale-105 active:scale-95"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
