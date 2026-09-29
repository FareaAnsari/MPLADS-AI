"""
Base classes and schemas for the Typed Tool Layer of the Universal MPLADS Intelligence Agent.
Enforces strict Pydantic schemas, execution timeouts, authorization policies, and provenance metadata.
"""

from enum import Enum
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from abc import ABC, abstractmethod
import time


class UserRole(str, Enum):
    CITIZEN = "CITIZEN"
    MP = "MP"
    OFFICER = "OFFICER"
    ADMIN = "ADMIN"


class ProvenanceTier(int, Enum):
    TIER_1 = 1  # Real, Sourced, Citable (eSAKSHI, CPWD DSR, ECI Gazette, Sentinel-2)
    TIER_2 = 2  # Real Schema / Curated Reference Registry (PMGSY, MGNREGA, CPGRAMS)
    TIER_3 = 3  # Synthetic Demonstration Data (pHash demo pairs, cost-inflated simulations)


class ToolMetadata(BaseModel):
    source: str = Field(..., description="Authoritative source origin of the data")
    provenance_tier: ProvenanceTier = Field(ProvenanceTier.TIER_1, description="Data Provenance Tier (1, 2, or 3)")
    citable_anchor: Optional[str] = Field(None, description="Exact section, page, or table reference")
    record_count: int = Field(1, description="Number of underlying records aggregated/retrieved")
    timestamp: str = Field(..., description="Timestamp of retrieval or engine execution")
    engine_version: Optional[str] = Field(None, description="Version of analytical engine if applicable")


class ToolResult(BaseModel):
    tool_name: str
    success: bool = True
    data: Any
    metadata: ToolMetadata
    error: Optional[str] = None
    execution_time_ms: float = 0.0


class TypedTool(ABC):
    name: str
    description: str
    min_role: UserRole = UserRole.CITIZEN
    timeout_seconds: float = 3.0

    def is_authorized(self, role: UserRole) -> bool:
        hierarchy = {
            UserRole.CITIZEN: 1,
            UserRole.MP: 2,
            UserRole.OFFICER: 3,
            UserRole.ADMIN: 4,
        }
        return hierarchy.get(role, 1) >= hierarchy.get(self.min_role, 1)

    @abstractmethod
    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        """Executes the tool with the provided validated parameters."""
        pass
