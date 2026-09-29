"""
Entity Resolution Tools for the Universal MPLADS Intelligence Agent.
Validates 15-character statutory GSTINs and detects shell contractor clusters via PAN matching.
"""

from typing import Dict, Any, Optional, List
import time
from datetime import datetime
from agent.tools.base import TypedTool, ToolResult, ToolMetadata, ProvenanceTier, UserRole
from engines.entity_resolution import EntityResolutionEngine

entity_engine = EntityResolutionEngine()


class VerifyGSTINTool(TypedTool):
    name = "verify_gstin"
    description = "Validates 15-character statutory GSTIN structure, extracts state code and PAN, and checks format validity."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        gstin = params.get("gstin", "")
        res = entity_engine.validate_gstin_format(gstin)

        return ToolResult(
            tool_name=self.name,
            success=True,
            data=res,
            metadata=ToolMetadata(
                source="Government of India GSTN Format Specification",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"GSTIN: {gstin} (PAN: {res.get('pan_extracted')})",
                timestamp=datetime.utcnow().isoformat()
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class GetVendorResolutionTool(TypedTool):
    name = "get_vendor_resolution"
    description = "Audits contractor registry for duplicate trade names, shared PAN numbers, and potential shell clusters."
    min_role = UserRole.OFFICER

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        audit_res = entity_engine.audit_vendor_registry()

        return ToolResult(
            tool_name=self.name,
            success=True,
            data=audit_res,
            metadata=ToolMetadata(
                source="Contractor & Vendor Entity Resolution Graph",
                provenance_tier=ProvenanceTier.TIER_2,
                citable_anchor=f"Found {len(audit_res.get('flagged_clusters', []))} potential shell entity clusters",
                timestamp=datetime.utcnow().isoformat(),
                engine_version="v1.0.0-entity"
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )
