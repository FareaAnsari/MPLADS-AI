"""
MPLADS AI Data Adapter — Raw CSV Source to Canonical Schema Transformer (Phase 2 Enhanced)
Converts raw eSAKSHI / data.gov.in CSV exports into canonical schema entities.
Attaches provenance metadata: source, source_type, retrieved_at, is_synthetic, confidence.
"""

import os
import glob
import re
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Any, Optional

# District/State approximate centroids mapping for spatial analysis
STATE_CENTROIDS = {
    "BIHAR": (25.0961, 85.3131),
    "PUNJAB": (31.1471, 75.3412),
    "KERALA": (10.8505, 76.2711),
    "MAHARASHTRA": (19.7515, 75.7139),
    "UTTAR PRADESH": (26.8467, 80.9462),
    "WEST BENGAL": (22.9868, 87.8550),
    "JAMMU AND KASHMIR": (33.7782, 76.5762),
    "UTTARAKHAND": (30.0668, 79.0193),
    "TAMIL NADU": (11.1271, 78.6569),
    "KARNATAKA": (15.3173, 75.7139),
    "RAJASTHAN": (27.0238, 74.2179),
    "GUJARAT": (22.2587, 71.1924),
    "ODISHA": (20.9517, 85.0985),
    "ASSAM": (26.2006, 92.9376),
    "MADHYA PRADESH": (22.9734, 78.6569),
    "TELANGANA": (18.1124, 79.0193),
    "ANDHRA PRADESH": (15.9129, 79.7400),
    "HARYANA": (29.0588, 76.0856),
    "JHARKHAND": (23.6102, 85.2799),
    "CHHATTISGARH": (21.2787, 81.8661)
}


class DatasetAdapter:
    def __init__(self, dataset_dir: str):
        self.dataset_dir = dataset_dir
        self._works_cache = None
        self._exp_cache = None
        self._mps_cache = None

    def clean_amount(self, val: Any) -> float:
        """Parses currency strings into float values."""
        if pd.isna(val) or val is None:
            return 0.0
        val_str = str(val).replace(',', '').replace('₹', '').strip()
        try:
            return float(val_str)
        except ValueError:
            return 0.0

    def parse_date(self, date_str: Any) -> Optional[datetime]:
        """Parses various date formats e.g. 05-Sep-2024, 2024-09-05, 21-Aug-2026."""
        if pd.isna(date_str) or not date_str or date_str == "N/A":
            return None
        d_str = str(date_str).strip()
        for fmt in ("%d-%b-%Y", "%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(d_str, fmt)
            except ValueError:
                pass
        return None

    def extract_fiscal_year(self, work_id: str) -> str:
        """Extracts fiscal year (e.g. 2024-2025) from work_id string."""
        match = re.search(r'(\d{4}-\d{4})', work_id)
        return match.group(1) if match else "2024-2025"

    def get_centroid(self, state: str, ida: str) -> tuple:
        """Assigns spatial lat/lon centroid for spatial signal calculation."""
        import zlib
        st_clean = state.strip().upper() if state else "UNKNOWN"
        base_lat, base_lon = STATE_CENTROIDS.get(st_clean, (20.5937, 78.9629))
        # Deterministic IDA hash for local jitter (+- 0.2 deg) across all runs
        ida_val = ida if ida else "UNKNOWN"
        h_lat = zlib.crc32(ida_val.encode("utf-8"))
        h_lon = zlib.crc32((ida_val + "lon").encode("utf-8"))
        jitter_lat = (h_lat % 100 - 50) / 250.0
        jitter_lon = (h_lon % 100 - 50) / 250.0
        return round(base_lat + jitter_lat, 4), round(base_lon + jitter_lon, 4)

    def parse_mp_allocated_limits(self) -> List[Dict[str, Any]]:
        """Parses Lok Sabha and Rajya Sabha allocated limit CSVs."""
        if self._mps_cache is not None:
            return self._mps_cache
        records = []
        files = [
            ("Allocated Limit for Honble MPs.csv", "LOK_SABHA"),
            ("Allocated Limit for Honble MPs RajyaSabha (1).csv", "RAJYA_SABHA")
        ]

        for filename, house in files:
            filepath = os.path.join(self.dataset_dir, filename)
            if not os.path.exists(filepath):
                continue
            
            df = pd.read_csv(filepath)
            for _, row in df.iterrows():
                mp_name = row.get("Hon'ble Members of Parliaments") or row.get("Hon'ble Members of Parliament")
                state = row.get("State")
                constituency = row.get("Constituency", None)
                category = row.get("Elected/Nominated", "ELECTED")
                allocated = self.clean_amount(row.get("Allocated AMOUNT ( ₹ )", 0))

                if pd.isna(mp_name) or not mp_name:
                    continue

                records.append({
                    "mp_name": str(mp_name).strip(),
                    "house": house,
                    "category": "NOMINATED" if "Nominated" in str(category) else "ELECTED",
                    "state": str(state).strip() if not pd.isna(state) else "UNKNOWN",
                    "constituency": str(constituency).strip() if not pd.isna(constituency) and constituency else None,
                    "allocated_limit_inr": allocated,
                    # Provenance Metadata
                    "source": f"data.gov.in / eSAKSHI ({filename})",
                    "source_type": "OFFICIAL_PUBLIC",
                    "source_url": "https://data.gov.in/",
                    "retrieved_at": datetime.now().isoformat(),
                    "is_synthetic": False,
                    "data_quality_score": 1.00
                })
        return records

    def parse_works_completed(self) -> List[Dict[str, Any]]:
        """Parses Works Completed CSVs into canonical projects."""
        if self._works_cache is not None:
            return self._works_cache
        records = []
        files = glob.glob(os.path.join(self.dataset_dir, "Works Completed*.csv"))

        for filepath in files:
            filename = os.path.basename(filepath)
            df = pd.read_csv(filepath)
            for idx, row in df.iterrows():
                work_raw = row.get("Work")
                work_category = row.get("Work Category", "Normal/Others")
                state = row.get("State", "UNKNOWN")
                ida = row.get("IDA", "UNKNOWN")
                desc = row.get("Work Description", "")
                mp_name = row.get("Hon'ble Members of Parliament", "")
                constituency = row.get("Constituency", "")
                image_val = row.get("Image", "N/A")
                completion_date_str = row.get("Completion Date", "")
                amount = self.clean_amount(row.get("Amount Disbursed ( ₹ )", 0))

                if pd.isna(work_raw) or not work_raw:
                    continue

                work_str = str(work_raw).strip()
                work_id_match = re.match(r'^(WS/MP[\d/\-]+)', work_str)
                work_id = work_id_match.group(1).rstrip('-').strip() if work_id_match else f"WS/MP/{idx}"
                work_title = work_str[len(work_id):].lstrip(' -') if work_id_match else work_str
                
                fiscal_year = self.extract_fiscal_year(work_id)
                comp_dt = self.parse_date(completion_date_str)
                lat, lon = self.get_centroid(state, ida)

                records.append({
                    "work_id": work_id,
                    "work_category": str(work_category).strip(),
                    "work_title": work_title if work_title else work_str,
                    "work_description": str(desc).strip() if not pd.isna(desc) else None,
                    "mp_name": str(mp_name).strip() if not pd.isna(mp_name) else None,
                    "ida_office": str(ida).strip() if not pd.isna(ida) else None,
                    "state": str(state).strip(),
                    "constituency": str(constituency).strip() if not pd.isna(constituency) else None,
                    "sanctioned_amount_inr": amount,
                    "disbursed_amount_inr": amount,
                    "fiscal_year": fiscal_year,
                    "current_stage": "COMPLETION_REPORTED",
                    "completion_date": comp_dt.strftime("%Y-%m-%d") if comp_dt else None,
                    "completion_month": comp_dt.month if comp_dt else None,
                    "has_official_images": True if str(image_val).lower() in ['images', 'yes', 'true'] else False,
                    "latitude": lat,
                    "longitude": lon,
                    # Provenance Metadata
                    "source": f"data.gov.in / eSAKSHI ({filename})",
                    "source_type": "OFFICIAL_PUBLIC",
                    "source_url": "https://data.gov.in/",
                    "retrieved_at": datetime.now().isoformat(),
                    "is_synthetic": False,
                    "data_quality_score": 1.00
                })
        return records

    def parse_expenditures(self) -> List[Dict[str, Any]]:
        """Parses Expenditure CSV files into payment milestones."""
        if self._exp_cache is not None:
            return self._exp_cache
        records = []
        files = glob.glob(os.path.join(self.dataset_dir, "Expenditure on Completed*.csv"))

        for filepath in files:
            filename = os.path.basename(filepath)
            df = pd.read_csv(filepath)
            for _, row in df.iterrows():
                work_id = row.get("Work ID") or row.get("Work")
                state = row.get("State", "")
                exp_date_str = row.get("Expenditure Date", "")
                vendor = row.get("Vendor Name", "")
                status = row.get("Payment Status", "DISBURSED")
                amount = self.clean_amount(row.get("Fund Disbursed Amount ( ₹ )", 0))

                if pd.isna(work_id) or not work_id:
                    continue

                exp_dt = self.parse_date(exp_date_str)

                records.append({
                    "work_id": str(work_id).strip().rstrip('-').strip(),
                    "state": str(state).strip(),
                    "expenditure_date": exp_dt.strftime("%Y-%m-%d") if exp_dt else None,
                    "expenditure_month": exp_dt.month if exp_dt else None,
                    "vendor_name": str(vendor).strip() if not pd.isna(vendor) else None,
                    "payment_status": str(status).strip() if not pd.isna(status) else "DISBURSED",
                    "fund_disbursed_amount_inr": amount,
                    # Provenance Metadata
                    "source": f"data.gov.in / eSAKSHI ({filename})",
                    "source_type": "OFFICIAL_PUBLIC",
                    "retrieved_at": datetime.now().isoformat(),
                    "is_synthetic": False
                })
        return records
