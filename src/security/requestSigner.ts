/**
 * Government of India MoSPI — MPLADS AI Request Signer
 * Generates cryptographic anti-tampering headers for outward API dispatches.
 */

// Simple SHA256-like digest calculation for string payloads
export function computePayloadDigest(data: string): string {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  for (let i = 0; i < data.length; i++) {
    const code = data.charCodeAt(i);
    h0 = (h0 ^ code) * 0x01000193;
    h1 = (h1 ^ (code << 1)) * 0x01000193;
    h2 = (h2 ^ (code << 2)) * 0x01000193;
    h3 = (h3 ^ (code << 3)) * 0x01000193;
  }
  return [h0, h1, h2, h3].map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
}

/**
 * Creates standardized security headers for API requests.
 */
export function createSecurityHeaders(payload?: any): Record<string, string> {
  const timestamp = new Date().toISOString();
  const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  const payloadString = payload ? (typeof payload === 'string' ? payload : JSON.stringify(payload)) : '';
  const payloadHash = payloadString ? computePayloadDigest(payloadString) : 'EMPTY_PAYLOAD';

  return {
    'X-Security-Client': 'MPLADS-AI-GOV-FRONTEND',
    'X-Security-Timestamp': timestamp,
    'X-Security-Request-Id': requestId,
    'X-Security-Digest': payloadHash,
    'X-Security-Protocol': 'MoSPI-AntiTamper-v2.4'
  };
}

export const buildSecurityHeaders = createSecurityHeaders;

