"""
Pratyaksh Synthetic Evidence Generator (Phase 3 Step 0)
Generates a small, clean synthetic demonstration evidence dataset for photo duplication
and citizen location verification testing.

Every record is explicitly tagged:
- is_synthetic: True
- source_type: "SYNTHETIC_DEMO"
- source: "Synthetic Demonstration Data — Not Official Government Data"
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Pre-computed pHash hex values for duplicate pairs demonstration
# Pair 1: Identical perceptual hashes (Hamming distance = 0)
PHASH_PAIR_1_A = "a1b2c3d4e5f60718"
PHASH_PAIR_1_B = "a1b2c3d4e5f60718"

# Pair 2: Near-identical perceptual hashes (Hamming distance = 2)
PHASH_PAIR_2_A = "f8e7d6c5b4a39281"
PHASH_PAIR_2_B = "f8e7d6c5b4a39283" # 1 bit difference

# Unique hashes (Hamming distance > 15)
UNIQUE_HASHES = [
    "1122334455667788",
    "99aabbccddeeff00",
    "1234567890abcdef",
    "fedcba0987654321",
    "0011223344556677"
]


class SyntheticEvidenceGenerator:
    @staticmethod
    def generate_demo_evidence_store(sample_projects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Creates indexable evidence store for demo project list.
        Injects 2 duplicate pairs and unique evidence for testing.
        """
        evidence_records = []
        now = datetime.now()

        for idx, project in enumerate(sample_projects[:15]):
            p_id = project.get("work_id")
            p_lat = project.get("latitude", 25.0961)
            p_lon = project.get("longitude", 85.3131)

            # Assign synthetic evidence properties
            if idx == 0:
                phash = PHASH_PAIR_1_A
                submitted_by = "OFFICIAL_INSPECTOR"
                ev_type = "OFFICIAL_COMPLETION_PHOTO"
                status = "REQUIRES_VERIFICATION"
            elif idx == 1:
                phash = PHASH_PAIR_1_B # Duplicate of project 0!
                submitted_by = "OFFICIAL_INSPECTOR"
                ev_type = "OFFICIAL_COMPLETION_PHOTO"
                status = "EVIDENCE_CONFLICT"
            elif idx == 2:
                phash = PHASH_PAIR_2_A
                submitted_by = "OFFICIAL_INSPECTOR"
                ev_type = "OFFICIAL_COMPLETION_PHOTO"
                status = "REQUIRES_VERIFICATION"
            elif idx == 3:
                phash = PHASH_PAIR_2_B # Near-duplicate of project 2!
                submitted_by = "OFFICIAL_INSPECTOR"
                ev_type = "OFFICIAL_COMPLETION_PHOTO"
                status = "EVIDENCE_CONFLICT"
            elif idx < 8:
                phash = UNIQUE_HASHES[idx - 4]
                submitted_by = "CITIZEN"
                ev_type = "CITIZEN_LIVE_CAMERA"
                status = "VERIFIED_MATCH"
            else:
                phash = None
                submitted_by = "UNAVAILABLE"
                ev_type = "NO_EVIDENCE"
                status = "INDEPENDENT_EVIDENCE_UNAVAILABLE"

            if phash:
                evidence_records.append({
                    "evidence_id": str(uuid.uuid4()),
                    "project_id": p_id,
                    "evidence_type": ev_type,
                    "submitted_by_role": submitted_by,
                    "phash_value": phash,
                    "image_url": f"https://example.gov.in/mplads/evidence/{p_id.replace('/', '_')}.jpg",
                    "latitude": p_lat + (0.0003 if idx % 2 == 0 else 0.005), # Close or offset GPS
                    "longitude": p_lon + (0.0003 if idx % 2 == 0 else 0.005),
                    "is_live_camera_capture": True if submitted_by == "CITIZEN" else False,
                    "timestamp_captured": (now - timedelta(days=idx * 2)).isoformat(),
                    "verification_status": status,
                    # Provenance Metadata
                    "source": "Synthetic Demonstration Evidence — Not Official Government Data",
                    "source_type": "SYNTHETIC_DEMO",
                    "is_synthetic": True
                })

        return evidence_records
