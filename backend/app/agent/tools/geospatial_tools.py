"""
Geospatial Tools for the Universal MPLADS Intelligence Agent.
Provides cross-scheme double-dipping detection, geo-radius proximity search,
and map marker/cluster payload generation.
"""

from typing import Dict, Any, Optional, List
import time
import math
from datetime import datetime
from agent.tools.base import TypedTool, ToolResult, ToolMetadata, ProvenanceTier, UserRole
from agent.data_access import data_access
from engines.cross_scheme_engine import CrossSchemeDetectorEngine

cross_scheme_engine = CrossSchemeDetectorEngine()


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class GetCrossSchemeOverlapTool(TypedTool):
    name = "get_cross_scheme_overlap"
    description = "Scans PMGSY (OMMAS) and MGNREGA asset registries for overlapping assets within 500m of an MPLADS project site."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        work_id = params.get("work_id", "")
        project = data_access.get_project_by_id(work_id)

        lat = float(project.get("latitude", params.get("latitude", 25.0383)) if project else params.get("latitude", 25.0383))
        lon = float(project.get("longitude", params.get("longitude", 85.3235)) if project else params.get("longitude", 85.3235))
        title = project.get("work_title", "Rural Road Construction") if project else params.get("title", "Rural Road")

        overlap_result = cross_scheme_engine.scan_project_overlaps(
            work_id=work_id,
            work_title=title,
            latitude=lat,
            longitude=lon,
            sanctioned_amount_inr=float(project.get("disbursed_amount_inr", 0)) if project else 0.0
        )

        return ToolResult(
            tool_name=self.name,
            success=True,
            data=overlap_result,
            metadata=ToolMetadata(
                source="PMGSY OMMAS GIS MIS & MGNREGA Public Asset Register",
                provenance_tier=ProvenanceTier.TIER_2,
                citable_anchor=f"Geo-proximity Match ({len(overlap_result.get('matches', []))} cross-scheme assets within 500m)",
                timestamp=datetime.utcnow().isoformat(),
                engine_version="v2.1.0-geospatial"
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class GetNearbyProjectsTool(TypedTool):
    name = "get_nearby_projects"
    description = "Finds all MPLADS works within a specific radius (in km) from given GPS coordinates or district centroid."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        lat = float(params.get("latitude", 19.7515))
        lon = float(params.get("longitude", 75.7139))
        radius_km = float(params.get("radius_km", 25.0))
        limit = min(int(params.get("limit", 20)), 100)

        all_projects = data_access.get_all_projects()
        nearby = []

        for p in all_projects:
            p_lat = p.get("latitude")
            p_lon = p.get("longitude")
            if p_lat is not None and p_lon is not None:
                dist = haversine_distance_km(lat, lon, float(p_lat), float(p_lon))
                if dist <= radius_km:
                    p_copy = dict(p)
                    p_copy["distance_km"] = round(dist, 2)
                    nearby.append(p_copy)

        nearby.sort(key=lambda x: x["distance_km"])
        matched = nearby[:limit]

        return ToolResult(
            tool_name=self.name,
            success=True,
            data={
                "center_lat": lat,
                "center_lon": lon,
                "radius_km": radius_km,
                "total_matched": len(nearby),
                "projects": matched
            },
            metadata=ToolMetadata(
                source="eSAKSHI Spatial Mapping Layer",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"{len(nearby)} works within {radius_km}km radius",
                timestamp=datetime.utcnow().isoformat(),
                record_count=len(matched)
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class GenerateMapDataTool(TypedTool):
    name = "generate_map_data"
    description = "Formats project coordinates into interactive map marker and cluster GeoJSON structures for UI display."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        state = params.get("state")
        records, _ = data_access.search_projects(state=state, limit=100)

        markers = []
        for r in records:
            if r.get("latitude") and r.get("longitude"):
                markers.append({
                    "id": r.get("work_id"),
                    "title": r.get("work_title"),
                    "category": r.get("work_category"),
                    "amount": r.get("disbursed_amount_inr"),
                    "position": [r.get("latitude"), r.get("longitude")],
                    "state": r.get("state"),
                    "district": r.get("ida_office")
                })

        return ToolResult(
            tool_name=self.name,
            success=True,
            data={"state": state or "National", "marker_count": len(markers), "markers": markers},
            metadata=ToolMetadata(
                source="eSAKSHI Centroid Mapping",
                provenance_tier=ProvenanceTier.TIER_1,
                timestamp=datetime.utcnow().isoformat(),
                record_count=len(markers)
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )
