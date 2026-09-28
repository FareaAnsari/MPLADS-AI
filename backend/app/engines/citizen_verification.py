"""
Feature 4: Location-Bound Citizen Verification Engine (Phase 3 Step 2)
Validates live camera citizen uploads against project official GPS site coordinates.

Configurable Threshold Constants:
- MAX_ALLOWED_DISTANCE_METERS = 100.0 (100m proximity threshold)

Server-Side Enforcements:
1. Live camera stream capture check (preventing gallery uploads)
2. Geodesic Haversine distance calculation (server-side, tamper-resistant)
3. GPS spoofing / precision disclaimer metadata
"""

import math
from datetime import datetime
from typing import Dict, Any, Optional


class CitizenVerificationEngine:
    MAX_ALLOWED_DISTANCE_METERS: float = 100.0
    DISCLAIMER_TEXT: str = "GPS telemetric data can be subject to hardware imprecision or spoofing. Verification is treated as a supporting signal alongside photo hashing and official documentation."

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates distance in meters between two GPS coordinate pairs."""
        R = 6371000.0 # Earth radius in meters
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * (math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def verify_citizen_submission(
        self,
        citizen_lat: float,
        citizen_lon: float,
        project_lat: float,
        project_lon: float,
        is_live_camera_capture: bool,
        gps_accuracy_meters: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Server-side validation of citizen evidence.
        """
        distance_m = self.haversine_distance(citizen_lat, citizen_lon, project_lat, project_lon)
        within_threshold = distance_m <= self.MAX_ALLOWED_DISTANCE_METERS

        if not is_live_camera_capture:
            status_label = "Gallery upload detected — live camera capture required"
            consistency = "LOCATION_INCONSISTENT"
            verified = False
            signal_code = "REQUIRES_VERIFICATION"
        elif within_threshold:
            status_label = f"Location-consistent evidence captured within {distance_m:.1f}m of designated project location"
            consistency = "LOCATION_CONSISTENT"
            verified = True
            signal_code = "VERIFIED_MATCH"
        else:
            status_label = f"Location inconsistent — capture point is {distance_m:.1f}m away from project site ({self.MAX_ALLOWED_DISTANCE_METERS:.0f}m threshold)"
            consistency = "LOCATION_INCONSISTENT"
            verified = False
            signal_code = "EVIDENCE_CONFLICT"

        return {
            "verified": verified,
            "consistency_status": consistency,
            "signal_code": signal_code,
            "status_label": status_label,
            "distance_to_project_meters": round(distance_m, 2),
            "max_allowed_distance_meters": self.MAX_ALLOWED_DISTANCE_METERS,
            "gps_accuracy_meters": gps_accuracy_meters,
            "is_live_camera_capture": is_live_camera_capture,
            "disclaimer": self.DISCLAIMER_TEXT
        }
