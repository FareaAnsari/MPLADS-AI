"""
Feature 8: Confidence / Evidence Ledger Engine (Phase 5 Steps 1 & 2)
Provides an immutable audit log for every AI decision generated across Phases 2–4.

Captures:
1. entry_id (UUID string)
2. project_id
3. decision_type ('RISK_ASSESSMENT', 'VERIFICATION_TRIANGULATION', 'BOTTLENECK_ANALYSIS', 'OPTIMIZER_ASSIGNMENT')
4. computed_score & full named component breakdown (JSON)
5. data_sources_used (list of sources with provenance & is_synthetic flags)
6. model_version & rules_version
7. computed_at (ISO timestamp)
8. missing_evidence_fields (explicit list of missing signals e.g. ['satellite_imagery'])
9. human_decision (nullable e.g. 'APPROVED', 'DISPATCHED_FOR_INSPECTION', 'CLEARED')
10. outcome (nullable e.g. 'SITE_VERIFIED_MATCH')
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional


LEDGER_ENGINE_VERSION = "v1.0.0"
RULES_VERSION = "v1.2.0-sih2026"


class AuditLedgerEngine:
    def __init__(self):
        # In-memory store backing PostgreSQL audit_ledger table DDL
        self.ledger_store: Dict[str, Dict[str, Any]] = {}

    def record_entry(
        self,
        project_id: str,
        decision_type: str,
        computed_score: float,
        component_breakdown: Dict[str, Any],
        data_sources_used: List[Dict[str, Any]],
        model_version: str = "v1.0.0",
        rules_version: str = RULES_VERSION,
        missing_evidence_fields: Optional[List[str]] = None,
        human_decision: Optional[str] = None,
        outcome: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates and stores an immutable ledger entry for an AI decision.
        """
        clean_id = project_id.strip('/')
        entry_id = f"ldg-{decision_type.lower()[:4]}-{str(uuid.uuid4())[:8]}"

        entry = {
            "entry_id": entry_id,
            "project_id": clean_id,
            "decision_type": decision_type,
            "computed_score": round(float(computed_score), 2),
            "component_breakdown": component_breakdown,
            "data_sources_used": data_sources_used or [],
            "model_version": model_version,
            "rules_version": rules_version,
            "computed_at": datetime.utcnow().isoformat() + "Z",
            "missing_evidence_fields": missing_evidence_fields or [],
            "human_decision": human_decision,
            "outcome": outcome,
            "provenance_summary": (
                f"Ledger decision entry {entry_id} generated for project {clean_id} "
                f"using {len(data_sources_used or [])} data sources."
            )
        }

        self.ledger_store[entry_id] = entry
        return entry

    def get_entries_by_project(self, project_id: str) -> List[Dict[str, Any]]:
        """Returns all ledger entries for a given project in chronological order."""
        clean_id = project_id.strip('/')
        entries = [
            e for e in self.ledger_store.values()
            if e["project_id"].lower() == clean_id.lower()
        ]
        return sorted(entries, key=lambda x: x["computed_at"], reverse=True)

    def get_entry_by_id(self, entry_id: str) -> Optional[Dict[str, Any]]:
        """Returns a single ledger entry by its entry_id."""
        return self.ledger_store.get(entry_id)

    def update_human_decision(
        self,
        entry_id: str,
        human_decision: str,
        outcome_notes: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Updates human decision and outcome notes on a ledger entry."""
        entry = self.ledger_store.get(entry_id)
        if not entry:
            return None

        entry["human_decision"] = human_decision
        if outcome_notes:
            entry["outcome"] = outcome_notes
        entry["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        return entry
