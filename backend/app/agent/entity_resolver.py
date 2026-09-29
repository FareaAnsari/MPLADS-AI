"""
Canonical Entity Resolution System for the Universal MPLADS Intelligence Agent.
Resolves MPs, Aliases, Constituencies, States, Districts, Projects, Categories, and Conversational Anaphora.
"""

import re
import difflib
from typing import Dict, Any, Optional, List
from agent.data_access import data_access

# Curated High-Precision MP Alias & Nickname Registry
MP_ALIAS_REGISTRY: Dict[str, str] = {
    # Maharashtra Notable Aliases
    "bhalya mama": "BALYA MAMA SURESH GOPINATH MHATRE",
    "bhalya mama mhatre": "BALYA MAMA SURESH GOPINATH MHATRE",
    "balya mama": "BALYA MAMA SURESH GOPINATH MHATRE",
    "balya mama mhatre": "BALYA MAMA SURESH GOPINATH MHATRE",
    "suresh mhatre": "BALYA MAMA SURESH GOPINATH MHATRE",
    "suresh gopinath mhatre": "BALYA MAMA SURESH GOPINATH MHATRE",
    "bhiwandi mp": "BALYA MAMA SURESH GOPINATH MHATRE",
    "balubhau": "DHANORKAR PRATIBHA SURESH ALIAS BALUBHAU",
    "pratibha dhanorkar": "DHANORKAR PRATIBHA SURESH ALIAS BALUBHAU",
    "chandrapur mp": "DHANORKAR PRATIBHA SURESH ALIAS BALUBHAU",
    "shrikant shinde": "DR. SHRIKANT EKNATH SHINDE",
    "dr shrikant shinde": "DR. SHRIKANT EKNATH SHINDE",
    "kalyan mp": "DR. SHRIKANT EKNATH SHINDE",
    "amol kolhe": "Amol Ramsing Kolhe",
    "dr amol kolhe": "Amol Ramsing Kolhe",
    "shirur mp": "Amol Ramsing Kolhe",
    "chhatrapati shahu": "CHHATRAPATI SHAHU SHAHAJI",
    "shahu maharaj": "CHHATRAPATI SHAHU SHAHAJI",
    "shahu chhatrapati": "CHHATRAPATI SHAHU SHAHAJI",
    "kolhapur mp": "CHHATRAPATI SHAHU SHAHAJI",
    "rajabhau": "RAJABHAU",
    "rajabhau waje": "RAJABHAU",
    "nashik mp": "RAJABHAU",
    "murlidhar mohol": "MURLIDHAR MOHOL",
    "mohol": "MURLIDHAR MOHOL",
    "pune mp": "MURLIDHAR MOHOL",
    "supriya sule": "SUPRIYA SULE",
    "sule": "SUPRIYA SULE",
    "baramati mp": "SUPRIYA SULE",
    "nitin gadkari": "Nitin Jairam Gadkari",
    "gadkari": "Nitin Jairam Gadkari",
    "nagpur mp": "Nitin Jairam Gadkari",
    "arvind sawant": "Arvind Ganpat Sawant",
    "mumbai south mp": "Arvind Ganpat Sawant",
    "varsha gaikwad": "GAIKWAD VARSHA EKNATH",
    "mumbai north central mp": "GAIKWAD VARSHA EKNATH",
    "nilesh lanke": "NILESH DNYANDEV LANKE",
    "ahmednagar mp": "NILESH DNYANDEV LANKE",
    "narayan rane": "NARAYAN TATU RANE",
    "ratnagiri mp": "NARAYAN TATU RANE",

    # National Notable MP Aliases
    "rahul gandhi": "RAHUL GANDHI",
    "rahul g": "RAHUL GANDHI",
    "rahul": "RAHUL GANDHI",
    "rae bareli mp": "RAHUL GANDHI",
    "narendra modi": "NARENDRA MODI",
    "modi": "NARENDRA MODI",
    "modiji": "NARENDRA MODI",
    "varanasi mp": "NARENDRA MODI",
    "dimple yadav": "DIMPLE YADAV",
    "mainpuri mp": "DIMPLE YADAV",
    "akhilesh yadav": "AKHILESH YADAV",
    "akhilesh": "AKHILESH YADAV",
    "kannauj mp": "AKHILESH YADAV",
    "hema malini": "HEMA MALINI",
    "mathura mp": "HEMA MALINI",
    "shashi tharoor": "SHASHI THAROOR",
    "tharoor": "SHASHI THAROOR",
    "thiruvananthapuram mp": "SHASHI THAROOR",
    "kanimozhi": "KANIMOZHI KARUNANIDHI",
    "thoothukkudi mp": "KANIMOZHI KARUNANIDHI",
    "ravi kishan": "RAVI KISHAN",
    "gorakhpur mp": "RAVI KISHAN",
    "kangana ranaut": "KANGANA RANAUT",
    "kangana": "KANGANA RANAUT",
    "mandi mp": "KANGANA RANAUT",
    "asaduddin owaisi": "ASADUDDIN OWAISI",
    "owaisi": "ASADUDDIN OWAISI",
    "hyderabad mp": "ASADUDDIN OWAISI",
    "pappu yadav": "RAJESH RANJAN ALIAS PAPPU YADAV",
    "rajesh ranjan": "RAJESH RANJAN ALIAS PAPPU YADAV",
    "purnia mp": "RAJESH RANJAN ALIAS PAPPU YADAV",
    "chirag paswan": "CHIRAG PASWAN",
    "hajipur mp": "CHIRAG PASWAN"
}


def normalize_phonetic_text(text: str) -> str:
    """Normalizes transliterated Hindi/Marathi and common phonetic substitutions."""
    t = text.lower()
    t = re.sub(r'bh', 'b', t)
    t = re.sub(r'dh', 'd', t)
    t = re.sub(r'th', 't', t)
    t = re.sub(r'gh', 'g', t)
    t = re.sub(r'ph', 'p', t)
    t = re.sub(r'kh', 'k', t)
    t = re.sub(r'sh', 's', t)
    t = re.sub(r'w', 'v', t)
    t = re.sub(r'ee', 'i', t)
    t = re.sub(r'oo', 'u', t)
    t = re.sub(r'aa', 'a', t)
    # Strip honorifics & boilerplate
    t = re.sub(r'\b(dr|adv|shri|smt|honble|hon|mp|ji|saheb|sahab|patil|mama|dada|bhai|nana|bapu|kumar|rao|singh)\b', '', t)
    t = re.sub(r'[^a-z0-9\s]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


class ResolvedEntities:
    def __init__(self):
        self.mp_name: Optional[str] = None
        self.constituency: Optional[str] = None
        self.state: Optional[str] = None
        self.district: Optional[str] = None
        self.house: Optional[str] = None
        self.work_id: Optional[str] = None
        self.work_category: Optional[str] = None
        self.fiscal_year: Optional[str] = None
        self.min_amount: Optional[float] = None
        self.max_amount: Optional[float] = None
        self.min_utilization: Optional[float] = None
        self.max_utilization: Optional[float] = None
        self.min_projects: Optional[int] = None
        self.max_projects: Optional[int] = None
        self.is_delayed: Optional[bool] = None
        self.is_completed: Optional[bool] = None
        self.radius_km: Optional[float] = None
        self.is_anaphoric: bool = False
        self.anaphora_target: Optional[str] = None
        self.ambiguous_candidates: List[str] = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            k: v for k, v in self.__dict__.items()
            if v is not None and not k.startswith("_")
        }


class EntityResolver:
    def __init__(self):
        self._states_upper = {s.upper(): s for s in data_access.all_states}
        self._categories_upper = {c.upper(): c for c in data_access.all_categories}
        
        # Build normalized MP mapping
        self._phonetic_mps = {}
        for mp in data_access.all_mp_names:
            norm = normalize_phonetic_text(mp)
            if norm:
                self._phonetic_mps[norm] = mp

    def resolve(self, text: str, session_context: Optional[Dict[str, Any]] = None) -> ResolvedEntities:
        entities = ResolvedEntities()
        q = text.strip()
        q_lower = q.lower()

        # 1. Project / Work ID extraction (e.g. WS/MP/1234, MPLADS-2024-001, HERO-001)
        work_id_match = re.search(r'\b(ws/mp/[\d/\-]+|ws/[\d/\-]+|mplads-[\w\-]+|hero-[\w\-]+)\b', q_lower)
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

        # 4. Comprehensive MP Resolution (Alias Registry -> Phonetic -> Token Match -> Substring -> Fuzzy)
        # Check alias registry first
        for alias, canonical_mp in MP_ALIAS_REGISTRY.items():
            if alias in q_lower:
                entities.mp_name = canonical_mp
                break

        if not entities.mp_name:
            clean_query_subject = q_lower
            for prefix in ["tell me about", "who is", "profile of", "details of", "information on", "about", "mp", "honble", "hon'ble"]:
                clean_query_subject = clean_query_subject.replace(prefix, " ")
            clean_query_subject = clean_query_subject.strip()

            # Direct Substring Check
            for mp in data_access.all_mp_names:
                mp_low = mp.lower()
                parts = mp_low.split()
                if len(parts) >= 2 and f"{parts[0]} {parts[1]}" in clean_query_subject:
                    entities.mp_name = mp
                    break
                elif len(mp) > 5 and mp_low in clean_query_subject:
                    entities.mp_name = mp
                    break

            # Phonetic / Normalization Match
            if not entities.mp_name:
                q_phonetic = normalize_phonetic_text(clean_query_subject)
                if len(q_phonetic) >= 3:
                    for norm_mp, canon_mp in self._phonetic_mps.items():
                        if q_phonetic in norm_mp or norm_mp in q_phonetic:
                            entities.mp_name = canon_mp
                            break

            # Fuzzy Match
            if not entities.mp_name and len(clean_query_subject) >= 4:
                matches = difflib.get_close_matches(clean_query_subject.upper(), [m.upper() for m in data_access.all_mp_names], n=1, cutoff=0.72)
                if matches:
                    matched_upper = matches[0]
                    for mp in data_access.all_mp_names:
                        if mp.upper() == matched_upper:
                            entities.mp_name = mp
                            break

        # 5. Work Category extraction
        for cat_upper, cat_canonical in self._categories_upper.items():
            if cat_upper.lower() in q_lower:
                entities.work_category = cat_canonical
                break
        if not entities.work_category:
            if "road" in q_lower or "pathway" in q_lower or "sadak" in q_lower or "rasta" in q_lower:
                entities.work_category = "Roads & Pathways"
            elif "water" in q_lower or "drinking" in q_lower or "paani" in q_lower or "jal" in q_lower:
                entities.work_category = "Drinking Water"
            elif "school" in q_lower or "education" in q_lower or "classroom" in q_lower or "shiksha" in q_lower:
                entities.work_category = "Education"
            elif "health" in q_lower or "hospital" in q_lower or "toilet" in q_lower or "swasthya" in q_lower:
                entities.work_category = "Health & Sanitation"

        # 6. Quantitative Constraints & Thresholds
        # Zero / Non-utilization triggers (handling % as non-word char)
        if re.search(r'(0\s*%|0\s*percent|zero\s*percent|zero\s*utilization|0\s*utilization|spent\s*nothing|no\s*expenditure|used\s*0|zero\s*budget|not\s*spent|kharch\s*nahi)', q_lower):
            entities.max_utilization = 0.0
            entities.min_utilization = 0.0

        util_match = re.search(r'(?:less than|under|below|<)\s*(\d+(?:\.\d+)?)\s*%', q_lower)
        if util_match:
            entities.max_utilization = float(util_match.group(1))

        # Project Count constraints (e.g. "more than 5 projects", "> 5 projects", "more than five projects")
        proj_count_words = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10}
        proj_count_match = re.search(r'(?:more than|above|greater than|>)\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:projects|works|kaam)?', q_lower)
        if proj_count_match:
            val_raw = proj_count_match.group(1)
            entities.min_projects = proj_count_words.get(val_raw, int(val_raw) if val_raw.isdigit() else 1)

        # Financial Amount thresholds (Crore / Lakh)
        crore_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)', q_lower)
        if crore_match:
            val = float(crore_match.group(1)) * 10000000.0
            if any(k in q_lower for k in ["above", "over", "more than", "greater", ">"]):
                entities.min_amount = val
            elif any(k in q_lower for k in ["below", "under", "less than", "<"]):
                entities.max_amount = val
            else:
                entities.min_amount = val

        lakh_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)', q_lower)
        if lakh_match and not crore_match:
            val = float(lakh_match.group(1)) * 100000.0
            if any(k in q_lower for k in ["above", "over", "more than", "greater", ">"]):
                entities.min_amount = val
            elif any(k in q_lower for k in ["below", "under", "less than", "<"]):
                entities.max_amount = val
            else:
                entities.min_amount = val

        # Parliamentary House extraction
        if "lok sabha" in q_lower or re.search(r'\b(ls)\b', q_lower):
            entities.house = "LOK_SABHA"
        elif "rajya sabha" in q_lower or re.search(r'\b(rs)\b', q_lower):
            entities.house = "RAJYA_SABHA"

        # Delay / Completion Status
        if re.search(r'\b(delay|delayed|deri|late|stalled|pending|adhura)\b', q_lower):
            entities.is_delayed = True
        if re.search(r'\b(completed|complete|pura)\b', q_lower):
            entities.is_completed = True

        # 7. Conversational Context Carry-over
        if session_context:
            if not entities.work_id:
                if re.search(r'\b(that project|this project|the project|it)\b', q_lower):
                    entities.work_id = session_context.get("current_project")
                    entities.is_anaphoric = True

            if not entities.mp_name and re.search(r'\b(that mp|this mp|his|her|hon\'ble mp|them|they)\b', q_lower):
                entities.mp_name = session_context.get("current_mp")
                entities.is_anaphoric = True

            if not entities.state:
                entities.state = session_context.get("current_state")

            if not entities.constituency:
                entities.constituency = session_context.get("current_constituency")

            if not entities.house and session_context.get("current_house"):
                entities.house = session_context.get("current_house")

        return entities

entity_resolver = EntityResolver()
