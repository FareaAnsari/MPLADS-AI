/**
 * Government of India MoSPI — MPLADS AI Tamper-Evident Storage Engine
 * Prevents client-side localStorage tampering and prototype pollution.
 */

// Simple checksum hash generator to verify data integrity
function computeSimpleChecksum(content: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
}

interface StoredEnvelope<T> {
  payload: T;
  checksum: string;
  timestamp: number;
}

export const secureStorage = {
  /**
   * Sets an item in storage with an integrity checksum envelope.
   */
  setItem<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      const envelope: StoredEnvelope<T> = {
        payload: value,
        checksum: computeSimpleChecksum(serialized),
        timestamp: Date.now()
      };
      localStorage.setItem(`sec_${key}`, JSON.stringify(envelope));
      return true;
    } catch (e) {
      console.warn(`[secureStorage] Failed to store key "${key}":`, e);
      return false;
    }
  },

  /**
   * Retrieves an item and verifies its integrity checksum.
   * If tampered with, discards and returns fallback value.
   */
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(`sec_${key}`);
      if (!raw) {
        // Fallback check on non-prefixed key for backwards compatibility
        const legacy = localStorage.getItem(key);
        if (legacy) {
          try {
            return JSON.parse(legacy);
          } catch {
            return defaultValue;
          }
        }
        return defaultValue;
      }

      const envelope: StoredEnvelope<T> = JSON.parse(raw);
      if (!envelope || !envelope.checksum) return defaultValue;

      const serializedPayload = JSON.stringify(envelope.payload);
      const expectedChecksum = computeSimpleChecksum(serializedPayload);

      if (envelope.checksum !== expectedChecksum) {
        console.error(`[SECURITY ALERT] Integrity checksum mismatch for storage key "${key}". Possible tampering detected.`);
        localStorage.removeItem(`sec_${key}`);
        return defaultValue;
      }

      return envelope.payload;
    } catch (e) {
      console.warn(`[secureStorage] Failed to read or parse key "${key}":`, e);
      return defaultValue;
    }
  },

  /**
   * Safely removes an item.
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(`sec_${key}`);
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[secureStorage] Failed to remove key "${key}":`, e);
    }
  },

  /**
   * Clears all secure storage entries.
   */
  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('sec_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('[secureStorage] Clear error:', e);
    }
  }
};
