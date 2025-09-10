import { NextRequest, NextResponse } from 'next/server';

export interface LogContext {
  method: string;
  path: string;
  status: number;
  duration: number;
  userId?: string;
  error?: string;
  timestamp: string;
}

export class Logger {
  private static instance: Logger;
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  private constructor() {}
  
  log(level: 'info' | 'warn' | 'error', message: string, context?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level,
      message,
      timestamp,
      ...context
    };
    
    // In production, you might want to send to a logging service
    if (level === 'error') {
      console.error('[LOGGER]', JSON.stringify(logEntry));
      
      // Send alert to N8N if configured
      this.sendAlert({
        kind: 'error',
        route: context?.path || 'unknown',
        status: context?.status || 500,
        msg: message,
        timestamp
      });
    } else {
      console.log(`[LOGGER:${level.toUpperCase()}]`, JSON.stringify(logEntry));
    }
  }
  
  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }
  
  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }
  
  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }
  
  private async sendAlert(alert: {
    kind: string;
    route: string;
    status: number;
    msg: string;
    timestamp: string;
  }) {
    const webhookUrl = process.env.N8N_WEBHOOK_ALERTS;
    if (!webhookUrl) return;
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error('[LOGGER] Failed to send alert to N8N:', error);
    }
  }
}

export const logger = Logger.getInstance();

// Middleware wrapper for API routes
export function withLogging<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    const startTime = Date.now();
    
    try {
      const response = await handler(...args);
      const duration = Date.now() - startTime;
      
      logger.info('API Request', {
        method: request.method,
        path: request.nextUrl.pathname,
        status: response.status,
        duration,
        userAgent: request.headers.get('user-agent'),
      });
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('API Error', {
        method: request.method,
        path: request.nextUrl.pathname,
        status: 500,
        duration,
        error: errorMessage,
      });
      
      // Return a proper error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}