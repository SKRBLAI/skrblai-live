'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  agentId?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class AgentErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[AgentErrorBoundary] Agent error:', {
        agentId: this.props.agentId,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-80 flex flex-col items-center justify-center bg-gradient-to-br from-red-900/20 via-gray-900/60 to-gray-800/40 backdrop-blur-xl border-2 border-red-500/30 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-white font-semibold mb-2">Agent Unavailable</h3>
          <p className="text-gray-300 text-sm mb-4">
            {this.props.agentId ? `Agent "${this.props.agentId}" encountered an error` : 'This agent encountered an error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}