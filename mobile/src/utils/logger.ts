import { Config } from '../config';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class Logger {
  private sanitize(val: any): any {
    if (val === null || val === undefined) return val;
    if (typeof val === 'string') {
      // Redact Bearer tokens, passwords, secrets, JWTs, and API keys
      return val
        .replace(/Bearer\s+[A-Za-z0-9-_=.]+/gi, 'Bearer [REDACTED]')
        .replace(/("?(password|secret|credential|token|apiKey|refresh_token|access_token)"?\s*[:=]\s*)"[^"]+"/gi, '$1"[REDACTED]"')
        .replace(/gsk_[a-zA-Z0-9_-]+/g, '[REDACTED_API_KEY]')
        .replace(/sk_[a-zA-Z0-9_-]+/g, '[REDACTED_API_KEY]');
    }
    if (typeof val === 'object') {
      if (Array.isArray(val)) {
        return val.map((item) => this.sanitize(item));
      }
      const sanitizedObj: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        const lowerKey = k.toLowerCase();
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('credential') ||
          lowerKey.includes('authorization') ||
          lowerKey.includes('apikey')
        ) {
          sanitizedObj[k] = '[REDACTED]';
        } else {
          sanitizedObj[k] = this.sanitize(v);
        }
      }
      return sanitizedObj;
    }
    return val;
  }

  private formatMessage(level: LogLevel, tag: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${tag}]: ${this.sanitize(message)}`;
  }

  debug(tag: string, message: string, ...args: any[]): void {
    if (Config.enableDebugLogs) {
      console.debug(
        this.formatMessage('DEBUG', tag, message),
        ...args.map((a) => this.sanitize(a))
      );
    }
  }

  info(tag: string, message: string, ...args: any[]): void {
    console.info(
      this.formatMessage('INFO', tag, message),
      ...args.map((a) => this.sanitize(a))
    );
  }

  warn(tag: string, message: string, ...args: any[]): void {
    console.warn(
      this.formatMessage('WARN', tag, message),
      ...args.map((a) => this.sanitize(a))
    );
  }

  error(tag: string, message: string, error?: any): void {
    console.error(
      this.formatMessage('ERROR', tag, message),
      this.sanitize(error) || ''
    );
  }
}

export const logger = new Logger();
