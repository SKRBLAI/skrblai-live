'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Could integrate with Sentry, LogRocket, etc.
      console.error('Production error logged:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px] flex flex-col items-center justify-center p-8 cosmic-glass rounded-2xl border-2 border-red-400/60 shadow-[0_0_24px_#FF4C4C80]"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-6xl mb-4">🚨</div>
          <h2 className="text-2xl font-bold text-red-300 mb-4">Something went wrong</h2>
          <p className="text-gray-300 text-center mb-6 max-w-md">
            An unexpected error occurred while loading this component. Please try refreshing the page.
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="w-full max-w-2xl">
              <summary className="cursor-pointer text-yellow-300 mb-2 font-semibold">
                Error Details (Development)
              </summary>
              <div className="bg-gray-900/80 p-4 rounded-lg text-sm text-gray-300 overflow-auto max-h-60">
                <p className="font-semibold text-red-300 mb-2">{this.state.error.message}</p>
                <pre className="whitespace-pre-wrap text-xs">{this.state.error.stack}</pre>
                {this.state.errorInfo && (
                  <div className="mt-4">
                    <p className="font-semibold text-yellow-300 mb-2">Component Stack:</p>
                    <pre className="whitespace-pre-wrap text-xs">{this.state.errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-400 text-white font-semibold rounded-xl shadow hover:from-red-600 hover:to-orange-500 transition"
            >
              Refresh Page
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-500 text-white font-semibold rounded-xl shadow hover:from-gray-700 hover:to-gray-600 transition"
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 