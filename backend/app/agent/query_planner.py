"""
Structured Query Planner for the Universal MPLADS Intelligence Agent.
Translates intent and resolved entities into validated, typed execution plans.
Prevents arbitrary SQL injection and ensures resource bounds.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from agent.router import IntentType
from agent.entity_resolver import ResolvedEntities


class QueryPlan(BaseModel):
    operation: str = Field(..., description="Operation: lookup, search, aggregate, compare, deep_research, rag")
    target_entity: str = Field("works", description="Entity: works, mps, guidelines, statistics, vendors")
    filters: Dict[str, Any] = Field(default_factory=dict, description="Validated filter dictionary")
    metrics: List[str] = Field(default_factory=lambda: ["disbursed_amount_inr"], description="Metrics to compute")
    aggregations: List[str] = Field(default_factory=lambda: ["sum", "count"], description="Aggregations to apply")
    group_by: Optional[str] = Field(None, description="Grouping dimension")
    limit: int = Field(20, ge=1, le=100, description="Max records to return")
    tools_to_invoke: List[str] = Field(default_factory=list, description="Ordered list of tool names")


class QueryPlanner:
    def plan(
        self,
        intents: List[IntentType],
        entities: ResolvedEntities,
        user_query: str
    ) -> QueryPlan:
        tools = []
        filters = {}
        operation = "search"
        target_entity = "works"
        group_by = None

        if entities.state:
            filters["state"] = entities.state
        if entities.district:
            filters["district"] = entities.district
        if entities.constituency:
            filters["constituency"] = entities.constituency
        if entities.work_category:
            filters["category"] = entities.work_category
        if entities.mp_name:
            filters["mp_name"] = entities.mp_name
        if entities.fiscal_year:
            filters["fiscal_year"] = entities.fiscal_year
        if entities.min_amount:
            filters["min_amount"] = entities.min_amount
        if entities.max_amount:
            filters["max_amount"] = entities.max_amount

        # Determine Tool Call Sequence based on Intent
        if IntentType.DEEP_RESEARCH in intents:
            operation = "deep_research"
            tools = [
                "get_project",
                "get_project_risk",
                "get_peer_comparison",
                "get_cross_scheme_overlap",
                "get_dpr_similarity",
                "search_guidelines"
            ]
        elif IntentType.RISK_ANALYSIS in intents or IntentType.ANOMALY_ANALYSIS in intents:
            operation = "risk_analysis"
            tools = ["get_project_risk", "get_peer_comparison"]
            if entities.work_id:
                tools.insert(0, "get_project")
        elif IntentType.GUIDELINE_QUERY in intents or IntentType.POLICY_QUERY in intents:
            operation = "rag"
            target_entity = "guidelines"
            tools = ["search_guidelines"]
        elif IntentType.MP_LOOKUP in intents:
            operation = "lookup"
            target_entity = "mps"
            tools = ["get_mp"]
        elif IntentType.GEOSPATIAL_QUERY in intents or IntentType.MAP_QUERY in intents:
            operation = "geospatial"
            tools = ["generate_map_data", "get_cross_scheme_overlap"]
        elif IntentType.REPORT_GENERATION in intents:
            operation = "report"
            tools = ["generate_report"]
        elif IntentType.AGGREGATION in intents or IntentType.FINANCIAL_ANALYSIS in intents:
            operation = "aggregate"
            tools = ["get_state_statistics", "run_structured_query"]
        elif entities.work_id:
            operation = "lookup"
            tools = ["get_project"]
        else:
            operation = "search"
            tools = ["search_projects"]

        return QueryPlan(
            operation=operation,
            target_entity=target_entity,
            filters=filters,
            metrics=["disbursed_amount_inr", "sanctioned_amount_inr"],
            aggregations=["sum", "count", "mean"],
            group_by=group_by,
            limit=20,
            tools_to_invoke=tools
        )

query_planner = QueryPlanner()
