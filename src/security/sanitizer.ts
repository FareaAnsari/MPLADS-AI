/**
 * Government of India MoSPI — MPLADS AI Security Sanitizer
 * Input Sanitization & Anti-Injection Defense Engine
 * Prevents Cross-Site Scripting (XSS), SQLi/NoSQLi injections, and parameter tampering.
 */

// Strip HTML tags and dangerous characters
const DANGEROUS_HTML_PATTERN = /<[^>]*>?/gm;
const JAVASCRIPT_PROTOCOL_PATTERN = /javascript\s*:/gi;
const VBSCRIPT_PROTOCOL_PATTERN = /vbscript\s*:/gi;
const DATA_PROTOCOL_PATTERN = /data\s*:\s*text\/html/gi;
const INLINE_EVENT_PATTERN = /\bon\w+\s*=/gi;
const SQL_INJECTION_TOKENS = /(--|\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|ALTER|EXEC|TRUNCATE)\b\s+)/gi;

/**
 * Sanitizes generic user-supplied strings for safe UI rendering.
 */
export function sanitizeText(input: unknown): string {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') {
    return String(input);
  }

  let sanitized = input
    .replace(DANGEROUS_HTML_PATTERN, '')
    .replace(JAVASCRIPT_PROTOCOL_PATTERN, '')
    .replace(VBSCRIPT_PROTOCOL_PATTERN, '')
    .replace(DATA_PROTOCOL_PATTERN, '')
    .replace(INLINE_EVENT_PATTERN, '')
    .replace(/\0/g, ''); // Remove null bytes

  return sanitized.trim();
}

/**
 * Sanitizes search queries and filter terms, neutralizing SQL/command injection markers.
 */
export function sanitizeSearchQuery(query: unknown): string {
  if (!query || typeof query !== 'string') return '';

  return query
    .replace(SQL_INJECTION_TOKENS, '')
    .replace(/[<>{}[\]\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Escapes characters for HTML output contexts to prevent reflected XSS.
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Recursively deep-sanitizes all string fields within an object payload.
 */
export function sanitizePayload<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return sanitizeText(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizePayload(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      sanitizedObj[key] = sanitizePayload(value);
    }
    return sanitizedObj as T;
  }

  return data;
}
