"""
Canonical Data Access Layer for the Universal MPLADS Intelligence Agent.
Provides single-source-of-truth query, aggregation, filtering, and entity retrieval
over the 30,002+ official eSAKSHI records, MP limits, and SQLite persistence.
"""

import os
import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import pandas as pd
from adapters.dataset_adapter import DatasetAdapter
from database import get_officer_decisions, get_latest_officer_decision

def find_dataset_dir():
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "Dataset")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Dataset")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Dataset")),
        "Dataset",
        "../Dataset",
        "../../Dataset"
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.isdir(c):
            return c
    return "Dataset"

DATASET_DIR = find_dataset_dir()

class CanonicalDataAccess:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CanonicalDataAccess, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return
        self.adapter = DatasetAdapter(DATASET_DIR)
        self._projects_raw = self.adapter.parse_works_completed()
        self._mps_raw = self.adapter.parse_mp_allocated_limits()
        self._expenditures_raw = self.adapter.parse_expenditures()
        
        # Build Indexed lookup dictionaries and DataFrames
        self.df_projects = pd.DataFrame(self._projects_raw) if self._projects_raw else pd.DataFrame()
        self.df_mps = pd.DataFrame(self._mps_raw) if self._mps_raw else pd.DataFrame()
        self.df_exp = pd.DataFrame(self._expenditures_raw) if self._expenditures_raw else pd.DataFrame()

        # Work ID to Project mapping
        self._project_by_id = {}
        for p in self._projects_raw:
            wid = str(p.get("work_id", "")).strip().lower()
            self._project_by_id[wid] = p
            # Also register clean alias without prefix
            clean_alias = wid.replace("ws/mp/", "").replace("ws/", "")
            self._project_by_id[clean_alias] = p

        # Unique canonical entities for resolution
        self.all_states = sorted(list(set(str(s).strip() for s in self.df_projects["state"].dropna().unique() if s))) if not self.df_projects.empty else []
        self.all_constituencies = sorted(list(set(str(c).strip() for c in self.df_projects["constituency"].dropna().unique() if c))) if not self.df_projects.empty else []
        self.all_categories = sorted(list(set(str(cat).strip() for cat in self.df_projects["work_category"].dropna().unique() if cat))) if not self.df_projects.empty else []
        self.all_mp_names = sorted(list(set(str(m).strip() for m in self.df_mps["mp_name"].dropna().unique() if m))) if not self.df_mps.empty else []
        self.all_districts = sorted(list(set(str(d).strip() for d in self.df_projects["ida_office"].dropna().unique() if d))) if not self.df_projects.empty else []

        self._initialized = True

    def get_all_projects(self) -> List[Dict[str, Any]]:
        return self._projects_raw

    def get_all_mps(self) -> List[Dict[str, Any]]:
        return self._mps_raw

    def get_project_by_id(self, work_id: str) -> Optional[Dict[str, Any]]:
        if not work_id:
            return None
        clean = str(work_id).strip().lower()
        if clean in self._project_by_id:
            return self._project_by_id[clean]
        clean_alias = clean.replace("ws/mp/", "").replace("ws/", "").strip()
        if clean_alias in self._project_by_id:
            return self._project_by_id[clean_alias]
        # Partial match
        for k, v in self._project_by_id.items():
            if clean in k or k in clean:
                return v
        return None

    def search_projects(
        self,
        query: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        constituency: Optional[str] = None,
        category: Optional[str] = None,
        mp_name: Optional[str] = None,
        fiscal_year: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        status: Optional[str] = None,
        is_delayed: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Dict[str, Any]], int]:
        """High-performance filtering across 30,002 records."""
        if self.df_projects.empty:
            return [], 0

        df = self.df_projects

        if state:
            st_clean = state.strip().upper()
            df = df[df["state"].str.upper().str.contains(st_clean, na=False)]
        
        if constituency:
            c_clean = constituency.strip().upper()
            df = df[df["constituency"].str.upper().str.contains(c_clean, na=False)]

        if district:
            d_clean = district.strip().upper()
            df = df[df["ida_office"].str.upper().str.contains(d_clean, na=False)]

        if category:
            cat_clean = category.strip().upper()
            df = df[df["work_category"].str.upper().str.contains(cat_clean, na=False)]

        if mp_name:
            mp_clean = mp_name.strip().upper()
            df = df[df["mp_name"].str.upper().str.contains(mp_clean, na=False)]

        if fiscal_year:
            fy_clean = fiscal_year.strip()
            df = df[df["fiscal_year"].astype(str).str.contains(fy_clean, na=False)]

        if min_amount is not None:
            df = df[df["disbursed_amount_inr"] >= min_amount]

        if max_amount is not None:
            df = df[df["disbursed_amount_inr"] <= max_amount]

        if query:
            q_clean = query.strip().lower()
            df = df[
                df["work_title"].str.lower().str.contains(q_clean, na=False) |
                df["work_id"].str.lower().str.contains(q_clean, na=False) |
                df["work_description"].str.lower().str.contains(q_clean, na=False)
            ]

        total_count = len(df)
        paginated_df = df.iloc[offset : offset + limit]
        return paginated_df.to_dict(orient="records"), total_count

    def get_mp_by_name_or_constituency(self, query: str) -> Optional[Dict[str, Any]]:
        """Finds MP by exact or partial name/constituency match."""
        q_clean = query.strip().lower()
        if self.df_mps.empty:
            return None
        
        # Exact/contains name match
        matches = self.df_mps[self.df_mps["mp_name"].str.lower().str.contains(q_clean, na=False)]
        if not matches.empty:
            return matches.iloc[0].to_dict()

        # Constituency match
        c_matches = self.df_mps[self.df_mps["constituency"].str.lower().str.contains(q_clean, na=False)]
        if not c_matches.empty:
            return c_matches.iloc[0].to_dict()

        return None

    def get_state_summary(self, state: Optional[str] = None) -> Dict[str, Any]:
        """Calculates verified macro totals for a state or nationwide."""
        if self.df_projects.empty:
            return {"total_works": 0, "total_sanctioned_inr": 0.0, "total_disbursed_inr": 0.0}

        df = self.df_projects
        if state:
            st_clean = state.strip().upper()
            df = df[df["state"].str.upper().str.contains(st_clean, na=False)]

        total_works = len(df)
        total_sanctioned = float(df["sanctioned_amount_inr"].sum()) if "sanctioned_amount_inr" in df.columns else 0.0
        total_disbursed = float(df["disbursed_amount_inr"].sum()) if "disbursed_amount_inr" in df.columns else 0.0
        
        # Category breakdown
        cat_counts = df["work_category"].value_counts().head(5).to_dict() if not df.empty else {}

        # District breakdown
        district_counts = df["ida_office"].value_counts().head(5).to_dict() if not df.empty else {}

        return {
            "state": state or "National (All India)",
            "total_works": total_works,
            "total_sanctioned_inr": round(total_sanctioned, 2),
            "total_disbursed_inr": round(total_disbursed, 2),
            "utilization_pct": round((total_disbursed / total_sanctioned * 100.0), 2) if total_sanctioned > 0 else 0.0,
            "top_categories": cat_counts,
            "top_districts": district_counts
        }

    def get_time_series_by_state(self, state: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns annual expenditure distribution."""
        if self.df_projects.empty:
            return []
        df = self.df_projects
        if state:
            st_clean = state.strip().upper()
            df = df[df["state"].str.upper().str.contains(st_clean, na=False)]

        if "fiscal_year" not in df.columns:
            return []

        grouped = df.groupby("fiscal_year").agg(
            total_works=("work_id", "count"),
            total_disbursed_inr=("disbursed_amount_inr", "sum")
        ).reset_index()

        return grouped.to_dict(orient="records")

# Singleton accessor
data_access = CanonicalDataAccess()
