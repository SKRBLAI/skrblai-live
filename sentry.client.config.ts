const CLIENT_SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (CLIENT_SENTRY_DSN) {
  try {
    const Sentry = require('@sentry/nextjs');
    Sentry.init({
    dsn: CLIENT_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    
    // Client-specific configuration
    beforeSend(event: any) {
      // Filter out non-critical client errors
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (
          error?.type === 'ChunkLoadError' || 
          error?.type === 'ResizeObserver loop limit exceeded' ||
          error?.value?.includes('Non-Error promise rejection captured')
        ) {
          return null;
        }
      }
      return event;
    },
    
      integrations: [
        // Add client-specific integrations
        new Sentry.BrowserTracing({
          // Set sampling rate for performance monitoring
          tracePropagationTargets: ['localhost', /^https:\/\/.*\.skrblai\.io\/api/],
        }),
      ],
    });
  } catch (error) {
    console.log('[SENTRY] Sentry package not installed, skipping client initialization');
  }
} else {
  console.log('[SENTRY] Client DSN not configured, Sentry disabled');
}