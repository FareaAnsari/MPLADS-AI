"""
Feature 3: Duplicate Completion Photo Detection Engine (Phase 3 Step 1)
Uses Perceptual Hashing (pHash) and Hamming distance analysis to detect identical
or visually modified photo uploads across different project completion claims.

Configurable Threshold Constants:
- SIMILARITY_THRESHOLD = 0.90 (90% similarity)
- MAX_HAMMING_DISTANCE = 6 (0-6 bits difference out of 64 bits)

Neutral Output Labels:
- "Possible duplicate evidence, review recommended"
- "Photo evidence appears unique"
"""

try:
    from PIL import Image
    import imagehash
    HAS_IMAGE_DEPS = True
except ImportError:
    HAS_IMAGE_DEPS = False
    Image = None
    imagehash = None

import io
import base64
from typing import Dict, Any, Optional, List


class PhotoDuplicationEngine:
    SIMILARITY_THRESHOLD: float = 0.90
    MAX_HAMMING_DISTANCE: int = 6

    @staticmethod
    def compute_phash_from_pil(image: Any) -> str:
        """Computes 64-bit perceptual hash for image."""
        if not HAS_IMAGE_DEPS or image is None:
            return "0000000000000000"
        hash_obj = imagehash.phash(image)
        return str(hash_obj)

    @staticmethod
    def compute_phash_from_base64(b64_string: str) -> Optional[str]:
        """Decodes base64 string and computes pHash."""
        if not HAS_IMAGE_DEPS:
            return "0000000000000000"
        try:
            image_data = base64.b64decode(b64_string)
            image = Image.open(io.BytesIO(image_data))
            return str(imagehash.phash(image))
        except Exception:
            return None

    @staticmethod
    def hamming_distance(hash1_hex: str, hash2_hex: str) -> int:
        """Computes Hamming distance between two 64-bit pHash hex strings."""
        if not hash1_hex or not hash2_hex or len(hash1_hex) != len(hash2_hex):
            return 64
        if not HAS_IMAGE_DEPS or imagehash is None:
            # Fallback hex character difference
            return sum(c1 != c2 for c1, c2 in zip(hash1_hex, hash2_hex))
        h1 = imagehash.hex_to_hash(hash1_hex)
        h2 = imagehash.hex_to_hash(hash2_hex)
        return h1 - h2

    def check_photo_similarity(
        self,
        target_project_id: str,
        target_phash: Optional[str],
        evidence_index: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Scans target pHash against peer evidence index.
        Flags pairs above 90% similarity (Hamming dist <= 6) as 'Possible duplicate evidence'.
        """
        if not target_phash:
            return {
                "project_id": target_project_id,
                "has_photo_evidence": False,
                "duplicate_detected": False,
                "max_similarity_pct": 0.0,
                "matched_project_id": None,
                "status_label": "Photo evidence unavailable",
                "matched_evidence": []
            }

        matches = []
        for item in evidence_index:
            ex_hash = item.get("phash_value")
            other_p_id = item.get("project_id")
            
            if not ex_hash or other_p_id == target_project_id:
                continue

            dist = self.hamming_distance(target_phash, ex_hash)
            similarity_pct = round(max(0.0, (1.0 - (dist / 64.0)) * 100.0), 2)

            if dist <= self.MAX_HAMMING_DISTANCE:
                matches.append({
                    "matched_evidence_id": item.get("evidence_id"),
                    "matched_project_id": other_p_id,
                    "hamming_distance": dist,
                    "similarity_pct": similarity_pct,
                    "is_synthetic": item.get("is_synthetic", False)
                })

        matches.sort(key=lambda x: x["hamming_distance"])
        top_match = matches[0] if matches else None
        duplicate_detected = bool(top_match and top_match["similarity_pct"] >= (self.SIMILARITY_THRESHOLD * 100.0))

        if duplicate_detected:
            status_label = f"Possible duplicate evidence detected ({top_match['similarity_pct']}% similarity with {top_match['matched_project_id']}). Review recommended."
        elif matches:
            status_label = f"Partial visual similarity detected ({matches[0]['similarity_pct']}%). Below 90% threshold."
        else:
            status_label = "Photo evidence appears unique across indexed peer database."

        return {
            "project_id": target_project_id,
            "target_phash": target_phash,
            "has_photo_evidence": True,
            "duplicate_detected": duplicate_detected,
            "max_similarity_pct": top_match["similarity_pct"] if top_match else 0.0,
            "matched_project_id": top_match["matched_project_id"] if top_match else None,
            "similarity_threshold_pct": self.SIMILARITY_THRESHOLD * 100.0,
            "status_label": status_label,
            "matched_evidence": matches
        }
