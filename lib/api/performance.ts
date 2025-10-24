/**
 * Performance monitoring wrapper for API routes
 * Logs when handlers take >300ms (dev only)
 */

export function withPerformanceLogging<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  routeName: string
) {
  return async (...args: T): Promise<R> => {
    if (process.env.NODE_ENV !== 'development') {
      return handler(...args);
    }

    const startTime = Date.now();
    const result = await handler(...args);
    const duration = Date.now() - startTime;

    if (duration > 300) {
      console.warn(`🐌 Slow API route: ${routeName} took ${duration}ms`);
    } else if (duration > 100) {
      console.log(`⚡ API route: ${routeName} took ${duration}ms`);
    }

    return result;
  };
}
