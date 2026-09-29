"""
Guideline & Policy RAG Tools for the Universal MPLADS Intelligence Agent.
Answers statutory rules, permissible/prohibited lists, ceilings, and SLA mandates from MoSPI 2023 Guidelines.
"""

from typing import Dict, Any, Optional, List
import time
from datetime import datetime
from agent.tools.base import TypedTool, ToolResult, ToolMetadata, ProvenanceTier, UserRole
from agent.rag.hybrid_retriever import guideline_retriever


class SearchGuidelinesTool(TypedTool):
    name = "search_guidelines"
    description = "Searches official MoSPI Revised MPLADS Guidelines 2023 for permissible works, prohibited works, ceilings, SLA rules, and SC/ST sub-plan quotas."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        query = params.get("query", "")
        top_k = min(int(params.get("top_k", 3)), 5)
        chapter = int(params.get("chapter")) if params.get("chapter") else None

        results = guideline_retriever.search(query=query, chapter=chapter, top_k=top_k)

        primary_citation = results[0].get("citation") if results else "MoSPI Revised MPLADS Guidelines 2023"

        return ToolResult(
            tool_name=self.name,
            success=True,
            data={"results": results, "query": query},
            metadata=ToolMetadata(
                source="MoSPI Statutory MPLADS Guidelines 2023 (Official Publication)",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=primary_citation,
                timestamp=datetime.utcnow().isoformat(),
                record_count=len(results)
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )
