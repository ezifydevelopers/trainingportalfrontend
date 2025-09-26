/**
 * Logger utility for conditional console logging based on environment variables
 */

// Check if debug mode is enabled
const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
const isDevelopment = import.meta.env.MODE === 'development';
const isStaging = import.meta.env.MODE === 'staging';
const isProduction = import.meta.env.MODE === 'production';

// Logger class for conditional logging
class Logger {
  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    // Always log errors
    if (level === 'error') return true;
    
    // Log everything in development if debug mode is enabled
    if (isDevelopment && isDebugMode) return true;
    
    // Log warnings and errors in staging and production
    if (isStaging || isProduction) {
      return level === 'warn' || level === 'error';
    }
    
    // Log warnings and errors in production
    if (level === 'warn' || level === 'error') return true;
    
    return false;
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
    }
  }

  // Special methods for common debugging scenarios
  apiRequest(url: string, method: string, data?: any): void {
    if (this.shouldLog('debug')) {
    }
  }

  apiResponse(url: string, status: number, data?: any): void {
    if (this.shouldLog('debug')) {
    }
  }

  websocketEvent(event: string, data?: any): void {
    if (this.shouldLog('debug')) {
    }
  }

  userAction(action: string, data?: any): void {
    if (this.shouldLog('debug')) {
    }
  }
}

// Create and export a singleton instance
export const logger = new Logger();

// Export individual methods for convenience
export const { debug, info, warn, error, apiRequest, apiResponse, websocketEvent, userAction } = logger;

// Export environment info
export const env = {
  isDevelopment,
  isStaging,
  isProduction,
  isDebugMode,
  apiUrl: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001'}/api`,
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001',
  wsUrl: import.meta.env.VITE_WS_URL || (import.meta.env.DEV ? 'ws://localhost:7001' : ''),
  appName: import.meta.env.VITE_APP_NAME || 'Training Portal',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
};
