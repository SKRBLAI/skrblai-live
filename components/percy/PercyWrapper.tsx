'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPercyConfig, logPercySwitch } from '../../lib/config/percyFeatureFlags';

// Import both versions
import PercyOnboardingRevolutionOptimized from './PercyOnboardingRevolutionOptimized';
import PercyOnboardingRevolutionLegacy from '../legacy/home/PercyOnboardingRevolution';

interface PercyWrapperProps {
  className?: string;
  onAnalysisComplete?: (results: any) => void;
  onAgentSelection?: (agentId: string) => void;
  // Force override the feature flag (for testing)
  forceVersion?: 'legacy' | 'optimized';
}

/**
 * Percy Wrapper Component
 * 
 * This component handles the toggle between Legacy and Optimized Percy versions
 * with error boundaries and performance monitoring.
 */
const PercyWrapper: React.FC<PercyWrapperProps> = ({
  className = '',
  onAnalysisComplete,
  onAgentSelection,
  forceVersion
}) => {
  const [currentVersion, setCurrentVersion] = useState<'legacy' | 'optimized'>('legacy');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Determine which version to use
  useEffect(() => {
    const config = getPercyConfig();
    
    // Force version override for testing
    if (forceVersion) {
      setCurrentVersion(forceVersion);
      logPercySwitch('Wrapper', forceVersion);
      setIsLoading(false);
      return;
    }
    
    // Use feature flag
    const version = config.USE_OPTIMIZED_PERCY ? 'optimized' : 'legacy';
    setCurrentVersion(version);
    logPercySwitch('Wrapper', version);
    setIsLoading(false);
  }, [forceVersion]);

  // Error boundary functionality
  const handleError = (error: Error, errorInfo: any) => {
    console.error('🚨 Percy Component Error:', error, errorInfo);
    setHasError(true);
    setErrorMessage(error.message);
    
    // Auto-fallback to legacy if optimized version fails
    const config = getPercyConfig();
    if (config.AUTO_FALLBACK_ON_ERROR && currentVersion === 'optimized') {
      console.log('🔄 Auto-fallback: Switching to legacy Percy');
      setCurrentVersion('legacy');
      setHasError(false);
    }
  };

  // Performance monitoring
  useEffect(() => {
    const config = getPercyConfig();
    if (!config.ENABLE_PERFORMANCE_MONITORING) return;

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) {
        console.warn(`⚠️  Percy ${currentVersion} render time: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [currentVersion]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-cyan-300">Loading Percy...</p>
        </div>
      </div>
    );
  }

  // Error state with fallback options
  if (hasError) {
    return (
      <div className={`bg-red-900/20 border border-red-400/30 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Percy Component Error
          </h3>
          <p className="text-red-300 mb-4">{errorMessage}</p>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                setHasError(false);
                setCurrentVersion('legacy');
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
            >
              Switch to Legacy Version
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate version
  return (
    <div className={`relative ${className}`}>
      {/* Version indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 z-50 bg-black/80 text-xs text-cyan-300 px-2 py-1 rounded">
          Percy: {currentVersion}
        </div>
      )}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVersion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentVersion === 'optimized' ? (
            <ErrorBoundaryWrapper onError={handleError}>
              <PercyOnboardingRevolutionOptimized
                onAnalysisComplete={onAnalysisComplete}
                onAgentSelection={onAgentSelection}
              />
            </ErrorBoundaryWrapper>
          ) : (
            <ErrorBoundaryWrapper onError={handleError}>
              <PercyOnboardingRevolutionLegacy />
            </ErrorBoundaryWrapper>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Quick toggle for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 right-2 z-50">
          <button
            onClick={() => {
              const newVersion = currentVersion === 'legacy' ? 'optimized' : 'legacy';
              setCurrentVersion(newVersion);
              logPercySwitch('Manual Toggle', newVersion);
            }}
            className="bg-cyan-600/80 text-white text-xs px-3 py-1 rounded hover:bg-cyan-500/80 transition-colors"
          >
            Switch to {currentVersion === 'legacy' ? 'Optimized' : 'Legacy'}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Simple Error Boundary Component
 */
class ErrorBoundaryWrapper extends React.Component<
  { children: React.ReactNode; onError: (error: Error, errorInfo: any) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle error display
    }

    return this.props.children;
  }
}

export default PercyWrapper;