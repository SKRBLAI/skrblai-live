const SERVER_SENTRY_DSN = process.env.SENTRY_DSN;

if (SERVER_SENTRY_DSN) {
  try {
    const Sentry = require('@sentry/nextjs');
    Sentry.init({
    dsn: SERVER_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    
    // Server-specific configuration
    beforeSend(event: any) {
      // Filter out non-critical errors
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'ChunkLoadError' || error?.type === 'ResizeObserver loop limit exceeded') {
          return null;
        }
      }
      return event;
    },
    
      integrations: [
        // Add server-specific integrations
      ],
    });
  } catch (error) {
    console.log('[SENTRY] Sentry package not installed, skipping server initialization');
  }
} else {
  console.log('[SENTRY] Server DSN not configured, Sentry disabled');
}