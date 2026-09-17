import { EvidencePhoto } from "@/lib/types";

/**
 * Calculates the Hamming distance between two 64-bit hexadecimal pHash fingerprints.
 * A distance <= 10 indicates near-identical or identical photographs (compression/crop artifacts).
 */
export function calculateHammingDistance(hashA: string, hashB: string): number {
  if (!hashA || !hashB || hashA.length !== hashB.length) {
    return 64; // Maximum divergence
  }

  let distance = 0;
  for (let i = 0; i < hashA.length; i++) {
    const valA = parseInt(hashA[i], 16);
    const valB = parseInt(hashB[i], 16);
    let xor = valA ^ valB;
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

export interface PHashMatchResult {
  triggered: boolean;
  points: number;
  matchedPhotoId?: string;
  matchedProjectId?: string;
  hammingDistance?: number;
  similarityScore: number; // 0 - 100%
  reason: string;
}

export function detectDuplicatePhotos(
  currentPhotos: EvidencePhoto[],
  candidatePool: Array<{ projectId: string; photos: EvidencePhoto[] }>,
  thresholdDistance: number = 10
): PHashMatchResult {
  if (!currentPhotos || currentPhotos.length === 0) {
    return {
      triggered: false,
      points: 0,
      similarityScore: 0,
      reason: "No evidence photo hashes available for comparison.",
    };
  }

  for (const photo of currentPhotos) {
    // If already pre-flagged in synthetic dataset
    if (photo.isDuplicateFlagged && photo.matchedProjectId) {
      const distance = photo.hammingDistance ?? 4;
      const similarity = Math.round(100 - (distance / 64) * 100);
      return {
        triggered: true,
        points: 20,
        matchedPhotoId: photo.matchedPhotoId,
        matchedProjectId: photo.matchedProjectId,
        hammingDistance: distance,
        similarityScore: similarity,
        reason: `Evidence photograph exhibits ${similarity}% pHash visual fingerprint match (Hamming distance ${distance}) with prior project ${photo.matchedProjectId}.`,
      };
    }

    for (const candidate of candidatePool) {
      for (const otherPhoto of candidate.photos) {
        if (photo.id === otherPhoto.id) continue;
        const dist = calculateHammingDistance(photo.pHash, otherPhoto.pHash);
        if (dist <= thresholdDistance) {
          const similarity = Math.round(100 - (dist / 64) * 100);
          return {
            triggered: true,
            points: 20,
            matchedPhotoId: otherPhoto.id,
            matchedProjectId: candidate.projectId,
            hammingDistance: dist,
            similarityScore: similarity,
            reason: `Evidence photograph exhibits ${similarity}% pHash visual fingerprint match (Hamming distance ${dist}) with prior project ${candidate.projectId}.`,
          };
        }
      }
    }
  }

  return {
    triggered: false,
    points: 0,
    similarityScore: 0,
    reason: "No cross-project duplicate perceptual hashes detected.",
  };
}
