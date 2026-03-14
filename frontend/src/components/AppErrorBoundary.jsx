import React from 'react';
import { ROUTES } from '../constants/routes';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Unexpected rendering error.',
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070f07] p-6">
        <div className="w-full max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <h1 className="text-2xl font-black text-white">Something went wrong</h1>
          <p className="mt-3 text-sm text-red-100/90">
            A UI error occurred. This page is now protected from going blank.
          </p>
          <p className="mt-2 break-all text-xs text-red-100/80">{this.state.message}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              onClick={this.handleReload}
              type="button"
            >
              Reload
            </button>
            <a
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
              href={ROUTES.LOGIN}
            >
              Go to login
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
