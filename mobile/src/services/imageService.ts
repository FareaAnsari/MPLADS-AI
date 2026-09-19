export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export class ImageService {
  /**
   * Validate image file properties and extensions.
   */
  static validateImage(uri?: string | null): ImageValidationResult {
    if (!uri || !uri.trim()) {
      return { valid: false, error: 'No image URI provided.' };
    }

    const lower = uri.toLowerCase();
    const isSupported =
      lower.startsWith('data:image/') ||
      lower.startsWith('ph://') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.webp') ||
      (lower.startsWith('content://') && (lower.includes('image') || lower.includes('media'))) ||
      ((lower.startsWith('file://') || lower.includes('camera') || lower.includes('photo')) &&
        (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp')));

    if (!isSupported) {
      return {
        valid: false,
        error: 'Unsupported image format. Please capture a valid JPEG or PNG photograph.',
      };
    }

    return { valid: true };
  }

  /**
   * Safe base64 converter for uploaded evidence.
   */
  static cleanBase64(rawBase64?: string | null): string | null {
    if (!rawBase64) return null;
    if (rawBase64.includes(';base64,')) {
      return rawBase64.split(';base64,')[1];
    }
    return rawBase64;
  }
}
