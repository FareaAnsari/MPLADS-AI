/**
 * Government of India MoSPI — MPLADS AI PII Data Masking Layer
 * Safeguards Personally Identifiable Information (PII) including Aadhaar,
 * Bank Accounts, Mobile Numbers, PAN, and Tax Identifiers.
 */

/**
 * Masks a 12-digit Aadhaar number, showing only the final 4 digits.
 * e.g. "5489 1234 5678" -> "XXXX-XXXX-5678"
 */
export function maskAadhaar(aadhaar: string | null | undefined): string {
  if (!aadhaar) return 'XXXX-XXXX-XXXX';
  const clean = aadhaar.replace(/\D/g, '');
  if (clean.length < 4) return 'XXXX-XXXX-XXXX';
  const last4 = clean.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

/**
 * Masks bank account numbers according to RBI and PFMS banking security standards.
 * e.g. "9876543210987" -> "XXXXXXXX0987"
 */
export function maskBankAccount(accountNo: string | null | undefined): string {
  if (!accountNo) return 'XXXXXXXXXXXX';
  const clean = String(accountNo).replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  const visible = clean.slice(-4);
  const maskedLength = Math.max(4, clean.length - 4);
  return 'X'.repeat(maskedLength) + visible;
}

/**
 * Masks an Indian mobile number, keeping the country prefix and last 3 digits.
 * e.g. "+91 98765 43210" -> "+91 XXXXX XX210"
 */
export function maskMobile(mobile: string | null | undefined): string {
  if (!mobile) return '+91 XXXXX XXXXX';
  const digits = mobile.replace(/\D/g, '');
  if (digits.length < 4) return '+91 XXXXX XXXXX';
  const last3 = digits.slice(-3);
  return `+91 XXXXX XX${last3}`;
}

/**
 * Partially masks PAN or GSTIN registration numbers for public display.
 * e.g. "27AABCS1429B1Z8" -> "27AAB****1Z8"
 */
export function maskPanOrGst(id: string | null | undefined): string {
  if (!id) return 'N/A';
  const clean = id.trim();
  if (clean.length < 8) return clean;
  const prefix = clean.slice(0, 5);
  const suffix = clean.slice(-3);
  return `${prefix}****${suffix}`;
}

/**
 * Masks user email addresses.
 * e.g. "farea.ansari@nic.in" -> "f***i@nic.in"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return '******@gov.in';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `*@${domain}`;
  const first = local[0];
  const last = local[local.length - 1];
  return `${first}${'*'.repeat(Math.min(local.length - 2, 4))}${last}@${domain}`;
}

/**
 * Universal PII Masker: Automatically infers and masks phone, email, Aadhaar or generic PII.
 */
export function maskPII(value: string | null | undefined): string {
  if (!value) return '';
  const str = String(value).trim();
  if (str.includes('@')) {
    return maskEmail(str);
  }
  const digits = str.replace(/\D/g, '');
  if (digits.length === 12) {
    return maskAadhaar(str);
  }
  if (digits.length >= 10 && digits.length <= 11) {
    return maskMobile(str);
  }
  if (str.length > 5) {
    return `${str.slice(0, 2)}***${str.slice(-2)}`;
  }
  return '***';
}

