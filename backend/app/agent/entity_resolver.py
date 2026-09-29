"""
Canonical Entity Resolution System for the Universal MPLADS Intelligence Agent.
Resolves MPs, Constituencies, States, Districts, Projects, Categories, and Conversational Anaphora.
"""

import re
import difflib
from typing import Dict, Any, Optional, List
from agent.data_access import data_access


class ResolvedEntities:
    def __init__(self):
        self.mp_name: Optional[str] = None
        self.constituency: Optional[str] = None
        self.state: Optional[str] = None
        self.district: Optional[str] = None
        self.work_id: Optional[str] = None
        self.work_category: Optional[str] = None
        self.fiscal_year: Optional[str] = None
        self.min_amount: Optional[float] = None
        self.max_amount: Optional[float] = None
        self.radius_km: Optional[float] = None
        self.is_anaphoric: bool = False
        self.anaphora_target: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            k: v for k, v in self.__dict__.items()
            if v is not None and not k.startswith("_")
        }


class EntityResolver:
    def __init__(self):
        self._states_upper = {s.upper(): s for s in data_access.all_states}
        self._categories_upper = {c.upper(): c for c in data_access.all_categories}

    def resolve(self, text: str, session_context: Optional[Dict[str, Any]] = None) -> ResolvedEntities:
        entities = ResolvedEntities()
        q = text.strip()
        q_lower = q.lower()

        # 1. Project / Work ID extraction (e.g. WS/MP/1234, MPLADS-2024-001, HERO-001)
        work_id_match = re.search(r'\b(ws/mp/[\d/\-]+|mplads-[\w\-]+|hero-[\w\-]+)\b', q_lower)
        if work_id_match:
            raw_id = work_id_match.group(1).upper()
            matched_proj = data_access.get_project_by_id(raw_id)
            entities.work_id = matched_proj.get("work_id") if matched_proj else raw_id

        # 2. State extraction
        for st_upper, st_canonical in self._states_upper.items():
            if st_upper.lower() in q_lower:
                entities.state = st_canonical
                break
        if not entities.state:
            # Fuzzy match state
            for word in re.findall(r'\b[a-zA-Z]{4,}\b', q):
                matches = difflib.get_close_matches(word.upper(), list(self._states_upper.keys()), n=1, cutoff=0.85)
                if matches:
                    entities.state = self._states_upper[matches[0]]
                    break

        # 3. Constituency / District extraction
        if not entities.constituency:
            for c in data_access.all_constituencies:
                if len(c) > 3 and c.lower() in q_lower:
                    entities.constituency = c
                    break

        if not entities.district:
            for d in data_access.all_districts:
                if len(d) > 3 and d.lower() in q_lower:
                    entities.district = d
                    break

        # 4. MP Name extraction
        for mp in data_access.all_mp_names:
            parts = mp.lower().split()
            # If at least 2 consecutive name parts match or a distinctive part matches
            if len(parts) >= 2 and f"{parts[0]} {parts[1]}" in q_lower:
                entities.mp_name = mp
                break
            elif len(mp) > 6 and mp.lower() in q_lower:
                entities.mp_name = mp
                break

        # 5. Category extraction
        for cat_upper, cat_canonical in self._categories_upper.items():
            if cat_upper.lower() in q_lower:
                entities.work_category = cat_canonical
                break
        if not entities.work_category:
            if "road" in q_lower or "pathway" in q_lower:
                entities.work_category = "Roads & Pathways"
            elif "water" in q_lower or "drinking" in q_lower:
                entities.work_category = "Drinking Water"
            elif "school" in q_lower or "education" in q_lower or "classroom" in q_lower:
                entities.work_category = "Education"
            elif "health" in q_lower or "hospital" in q_lower or "toilet" in q_lower:
                entities.work_category = "Health & Sanitation"

        # 6. Fiscal Year extraction (e.g., 2024-2025, 2024-25, 2023)
        fy_match = re.search(r'\b(20\d{2}[-\s]?20\d{2}|20\d{2}[-\s]?\d{2}|20\d{2})\b', q)
        if fy_match:
            entities.fiscal_year = fy_match.group(1).replace(" ", "")

        # 7. Financial Amount thresholds (e.g., ₹50 lakh, 1 crore, 50L)
        crore_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)', q_lower)
        if crore_match:
            val = float(crore_match.group(1)) * 10000000.0
            if "above" in q_lower or "over" in q_lower or "more than" in q_lower or "greater" in q_lower:
                entities.min_amount = val
            elif "below" in q_lower or "under" in q_lower or "less than" in q_lower:
                entities.max_amount = val
            else:
                entities.min_amount = val

        lakh_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)', q_lower)
        if lakh_match and not crore_match:
            val = float(lakh_match.group(1)) * 100000.0
            if "above" in q_lower or "over" in q_lower or "more than" in q_lower or "greater" in q_lower:
                entities.min_amount = val
            elif "below" in q_lower or "under" in q_lower or "less than" in q_lower:
                entities.max_amount = val
            else:
                entities.min_amount = val

        # 8. Conversational Anaphora & Context Carry-over
        if session_context:
            if not entities.work_id:
                # Check for ordinal reference like "the third one", "second project"
                ordinal_map = {"first": 0, "second": 1, "third": 2, "fourth": 3, "fifth": 4, "1st": 0, "2nd": 1, "3rd": 2}
                for word, idx in ordinal_map.items():
                    if word in q_lower:
                        prev_results = session_context.get("previous_results", [])
                        if len(prev_results) > idx:
                            entities.work_id = prev_results[idx].get("work_id")
                            entities.is_anaphoric = True
                            entities.anaphora_target = f"{word} previous result"
                            break

                if not entities.work_id and re.search(r'\b(that project|this project|the project|it)\b', q_lower):
                    entities.work_id = session_context.get("current_project")
                    entities.is_anaphoric = True

            if not entities.mp_name and re.search(r'\b(that mp|this mp|his|her|hon\'ble mp)\b', q_lower):
                entities.mp_name = session_context.get("current_mp")
                entities.is_anaphoric = True

            if not entities.state:
                entities.state = session_context.get("current_state")

            if not entities.constituency:
                entities.constituency = session_context.get("current_constituency")

        return entities

entity_resolver = EntityResolver()
