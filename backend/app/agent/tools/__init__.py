"""
Tool Registry for the Universal MPLADS Intelligence Agent.
Manages strongly typed tool lookup, execution, authorization scoping, and parallel dispatch.
"""

from typing import Dict, Any, List, Optional
import asyncio
from agent.tools.base import TypedTool, ToolResult, UserRole
from agent.tools.database_tools import (
    GetProjectTool,
    SearchProjectsTool,
    GetMPTool,
    GetStateStatisticsTool,
    GetTimeSeriesTool
)
from agent.tools.analytics_tools import (
    GetProjectRiskTool,
    GetPeerComparisonTool,
    GetDPRSimilarityTool,
    GetElectionVelocityTool,
    GetRateBenchmarkTool,
    GetGrievanceAnalysisTool,
    GetDecayAnalysisTool,
    AggregateMPUtilizationTool,
    GetDistrictRankingsTool,
    CompareEntitiesTool
)
from agent.tools.geospatial_tools import (
    GetCrossSchemeOverlapTool,
    GetNearbyProjectsTool,
    GenerateMapDataTool
)
from agent.tools.entity_tools import (
    VerifyGSTINTool,
    GetVendorResolutionTool
)
from agent.tools.guideline_tools import (
    SearchGuidelinesTool
)
from agent.tools.sql_tools import (
    RunStructuredQueryTool
)
from agent.tools.report_tools import (
    GenerateReportTool
)


class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, TypedTool] = {}
        self._register_all_tools()

    def _register_all_tools(self):
        tools = [
            # Database
            GetProjectTool(),
            SearchProjectsTool(),
            GetMPTool(),
            GetStateStatisticsTool(),
            GetTimeSeriesTool(),
            # Analytics & ML
            GetProjectRiskTool(),
            GetPeerComparisonTool(),
            GetDPRSimilarityTool(),
            GetElectionVelocityTool(),
            GetRateBenchmarkTool(),
            GetGrievanceAnalysisTool(),
            GetDecayAnalysisTool(),
            AggregateMPUtilizationTool(),
            GetDistrictRankingsTool(),
            CompareEntitiesTool(),
            # Geospatial
            GetCrossSchemeOverlapTool(),
            GetNearbyProjectsTool(),
            GenerateMapDataTool(),
            # Entity
            VerifyGSTINTool(),
            GetVendorResolutionTool(),
            # Guidelines & RAG
            SearchGuidelinesTool(),
            # Structured Query
            RunStructuredQueryTool(),
            # Report
            GenerateReportTool()
        ]
        for t in tools:
            self._tools[t.name] = t

    def get_tool(self, name: str) -> Optional[TypedTool]:
        return self._tools.get(name)

    def list_tools(self, user_role: UserRole = UserRole.CITIZEN) -> List[Dict[str, Any]]:
        return [
            {
                "name": t.name,
                "description": t.description,
                "min_role": t.min_role.value,
                "timeout_seconds": t.timeout_seconds
            }
            for t in self._tools.values()
            if t.is_authorized(user_role)
        ]

    async def execute_tool(
        self,
        tool_name: str,
        params: Dict[str, Any],
        user_role: UserRole = UserRole.CITIZEN
    ) -> ToolResult:
        tool = self.get_tool(tool_name)
        if not tool:
            return ToolResult(
                tool_name=tool_name,
                success=False,
                data=None,
                error=f"Tool '{tool_name}' is not registered.",
                metadata=None
            )
        if not tool.is_authorized(user_role):
            return ToolResult(
                tool_name=tool_name,
                success=False,
                data=None,
                error=f"Access Denied: Tool '{tool_name}' requires minimum role '{tool.min_role.value}'.",
                metadata=None
            )
        try:
            return await asyncio.wait_for(
                tool.execute(params, user_role=user_role),
                timeout=tool.timeout_seconds
            )
        except asyncio.TimeoutError:
            return ToolResult(
                tool_name=tool_name,
                success=False,
                data=None,
                error=f"Tool execution timed out after {tool.timeout_seconds}s.",
                metadata=None
            )
        except Exception as e:
            return ToolResult(
                tool_name=tool_name,
                success=False,
                data=None,
                error=f"Tool execution exception: {str(e)}",
                metadata=None
            )

tool_registry = ToolRegistry()
