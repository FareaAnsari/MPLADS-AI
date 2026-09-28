"""
Contractor & Vendor Entity Resolution Engine
Performs statutory GSTIN validation and internal fuzzy-matching to detect potential shell-entity clusters.
"""

from typing import List, Dict, Any, Optional
import re
import difflib

class EntityResolutionEngine:
    def __init__(self):
        self._gstin_regex = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")

    def validate_gstin_format(self, gstin: str) -> Dict[str, Any]:
        """Validates 15-character statutory GSTIN structure according to GSTN rules."""
        cleaned = gstin.strip().upper()
        is_valid = bool(self._gstin_regex.match(cleaned))
        
        state_code = cleaned[:2] if len(cleaned) >= 2 else ""
        pan = cleaned[2:12] if len(cleaned) >= 12 else ""

        return {
            "gstin": cleaned,
            "is_valid_format": is_valid,
            "state_code": state_code,
            "pan_extracted": pan,
            "verification_status": "ACTIVE_GSTIN_FORMAT" if is_valid else "INVALID_GSTIN_FORMAT",
            "source": "Government of India GSTN Format Specification",
            "transparency_note": "Format verified. Live MCA/GST bulk API cross-checks require authorized portal access."
        }

    def detect_fuzzy_duplicates(self, vendors: List[Dict[str, Any]], similarity_threshold: float = 0.80) -> List[Dict[str, Any]]:
        """
        Fuzzy-matches contractor/vendor names and addresses within the internal registry
        to flag potential duplicate shell entities.
        """
        duplicate_clusters = []
        visited = set()

        for i, v1 in enumerate(vendors):
            v1_id = v1.get("vendor_id") or v1.get("id") or str(i)
            if v1_id in visited:
                continue

            name1 = (v1.get("vendor_name") or v1.get("name") or "").lower().strip()
            pan1 = (v1.get("gstin") or "")[2:12].upper()
            cluster = [v1]

            for j, v2 in enumerate(vendors):
                if i == j:
                    continue
                v2_id = v2.get("vendor_id") or v2.get("id") or str(j)
                name2 = (v2.get("vendor_name") or v2.get("name") or "").lower().strip()
                pan2 = (v2.get("gstin") or "")[2:12].upper()

                # Check string similarity
                similarity = difflib.SequenceMatcher(None, name1, name2).ratio()
                is_same_pan = bool(pan1 and pan2 and pan1 == pan2)

                if similarity >= similarity_threshold or is_same_pan:
                    cluster.append(v2)
                    visited.add(v2_id)

            if len(cluster) > 1:
                visited.add(v1_id)
                duplicate_clusters.append({
                    "cluster_id": f"cluster-{len(duplicate_clusters) + 1}",
                    "primary_name": v1.get("vendor_name") or v1.get("name"),
                    "matched_entities_count": len(cluster),
                    "similarity_score": round(similarity * 100, 1) if not is_same_pan else 100.0,
                    "entities": [
                        {
                            "id": ent.get("vendor_id") or ent.get("id"),
                            "name": ent.get("vendor_name") or ent.get("name"),
                            "gstin": ent.get("gstin"),
                            "state": ent.get("state"),
                            "contracts_count": ent.get("contracts_count", 0),
                        }
                        for ent in cluster
                    ],
                    "flag_type": "COMMON_PAN_MATCH" if is_same_pan else "NAME_SIMILARITY_CLUSTER",
                    "observation": "AI Audit Observation: Multiple entity profiles share matching PAN or near-identical trade registration names. Human review advised."
                })

        return duplicate_clusters

    def verify_gstin_format_and_state(self, gstin: str) -> Dict[str, Any]:
        """Wrapper for format and state code verification."""
        return self.validate_gstin_format(gstin)

    def audit_vendor_registry(self) -> Dict[str, Any]:
        """Runs audit across the internal registry and returns flagged shell clusters."""
        # Standard vendor registry sample
        registry = [
            {"vendor_id": "v-01", "vendor_name": "Bharat Infrastructure & Paving Pvt Ltd", "gstin": "10AAACB1234F1Z5", "state": "Bihar", "contracts_count": 8},
            {"vendor_id": "v-02", "vendor_name": "Bharat Infra & Paving Private Limited", "gstin": "10AAACB1234F1Z5", "state": "Bihar", "contracts_count": 5},
            {"vendor_id": "v-03", "vendor_name": "Pune Civil Works & Construction", "gstin": "27BBBCD5678G2Z1", "state": "Maharashtra", "contracts_count": 12},
            {"vendor_id": "v-04", "vendor_name": "Faridkot Earthmovers & Builders", "gstin": "03CCCCD9988H1Z9", "state": "Punjab", "contracts_count": 4}
        ]
        clusters = self.detect_fuzzy_duplicates(registry)
        return {
            "total_registered_vendors": len(registry),
            "flagged_duplicate_clusters_count": len(clusters),
            "vendor_clusters": clusters,
            "transparency_notice": (
                "Entity resolution uses internal string-similarity and shared PAN matching. "
                "Direct real-time MCA21 / GSTN bulk querying requires authorized government enterprise interconnect."
            )
        }

