"""
Intent Router and Multilingual Normalizer for the Universal MPLADS Intelligence Agent.
Classifies user queries into 25+ distinct intent categories and supports compound multi-intent queries.
"""

from enum import Enum
from typing import List, Dict, Any, Tuple
import re


class IntentType(str, Enum):
    OUT_OF_SCOPE = "OUT_OF_SCOPE"
    MP_LOOKUP = "MP_LOOKUP"
    MP_PROFILE = "MP_PROFILE"
    CONSTITUENCY_LOOKUP = "CONSTITUENCY_LOOKUP"
    PROJECT_LOOKUP = "PROJECT_LOOKUP"
    PROJECT_SEARCH = "PROJECT_SEARCH"
    PROJECT_TIMELINE = "PROJECT_TIMELINE"
    FINANCIAL_ANALYSIS = "FINANCIAL_ANALYSIS"
    EXPENDITURE_ANALYSIS = "EXPENDITURE_ANALYSIS"
    UTILIZATION_ANALYSIS = "UTILIZATION_ANALYSIS"
    STATUS_ANALYSIS = "STATUS_ANALYSIS"
    RISK_ANALYSIS = "RISK_ANALYSIS"
    ANOMALY_ANALYSIS = "ANOMALY_ANALYSIS"
    DUPLICATE_ANALYSIS = "DUPLICATE_ANALYSIS"
    BENCHMARK_ANALYSIS = "BENCHMARK_ANALYSIS"
    GEOSPATIAL_QUERY = "GEOSPATIAL_QUERY"
    DOCUMENT_QUERY = "DOCUMENT_QUERY"
    GUIDELINE_QUERY = "GUIDELINE_QUERY"
    POLICY_QUERY = "POLICY_QUERY"
    TREND_ANALYSIS = "TREND_ANALYSIS"
    COMPARISON = "COMPARISON"
    AGGREGATION = "AGGREGATION"
    RANKING = "RANKING"
    REPORT_GENERATION = "REPORT_GENERATION"
    MAP_QUERY = "MAP_QUERY"
    MULTI_HOP_QUERY = "MULTI_HOP_QUERY"
    DEEP_RESEARCH = "DEEP_RESEARCH"
    FOLLOW_UP_QUERY = "FOLLOW_UP_QUERY"
    UNKNOWN = "UNKNOWN"


class IntentRouter:
    def __init__(self):
        self._hinglish_mappings = [
            (r'\b(kitna|kitne|kitni)\b', 'how much / how many'),
            (r'\b(paisa|funds|rupaye|raashi)\b', 'funds expenditure sanctioned'),
            (r'\b(kharch|kharcha|spent|disbursed)\b', 'expenditure disbursed'),
            (r'\b(sanction|manzoor)\b', 'sanctioned'),
            (r'\b(kaam|project|projects|yojana)\b', 'works projects'),
            (r'\b(kaun|who|kiska)\b', 'who mp'),
            (r'\b(kyun|kyu|reason|wajah)\b', 'why risk factor explanation'),
            (r'\b(deri|delay|ruka hua|late)\b', 'delayed duration'),
            (r'\b(naksha|map|kahan)\b', 'map geospatial location'),
            (r'\b(complete|pura|adhura|incomplete)\b', 'status progress'),
            (r'\b(research|investigation|jaanchna|dossier)\b', 'deep research complete analysis')
        ]

    def detect_language(self, text: str) -> str:
        """Detects whether text is English, Hindi, or Hinglish."""
        hindi_chars = len(re.findall(r'[\u0900-\u097F]', text))
        if hindi_chars > 3:
            return "hi"
        hinglish_words = {"kitna", "kitne", "paisa", "kharch", "kaam", "kyun", "kaun", "kahan", "batao", "dikhao", "mein", "par", "hai", "hain", "karo", "sadak", "paani"}
        tokens = set(re.findall(r'\b[a-z]+\b', text.lower()))
        if len(tokens.intersection(hinglish_words)) >= 1:
            return "hinglish"
        return "en"

    def classify_intent(self, text: str) -> Tuple[List[IntentType], Dict[str, Any]]:
        """
        Classifies query into primary and secondary compound intents.
        """
        q = text.lower().strip()
        intents = set()
        metadata = {
            "detected_language": self.detect_language(text),
            "is_deep_research": False,
            "requires_sql": False,
            "requires_rag": False,
            "requires_ml": False,
            "requires_geo": False
        }

        # 1. Out-of-Scope Detection (rejection guardrail)
        if re.search(r'\b(write.*python|write.*code|write.*script|write.*java|write.*c\+\+|build.*website|create.*website|solve.*math|tell.*joke|joke|weather|medical advice|travel advice|recipe|play game|movie)\b', q):
            intents.add(IntentType.OUT_OF_SCOPE)
            return [IntentType.OUT_OF_SCOPE], metadata

        # 2. Deep Research Mode
        if re.search(r'\b(deep research|complete investigation|complete analysis|dossier|full audit|detail analysis|jaanchna)\b', q):
            intents.add(IntentType.DEEP_RESEARCH)
            metadata["is_deep_research"] = True

        # 3. Utilization & Quantitative Financial Aggregation
        if re.search(r'\b(0%|zero percent|zero utilization|0 utilization|used 0%|spent nothing|no expenditure|not spent anything|zero budget|unutilized|budget utilization|utilization percentage|utilization rate|who spent.*most|highest expenditure|lowest utilization|less than.*%)\b', q):
            intents.add(IntentType.UTILIZATION_ANALYSIS)
            intents.add(IntentType.FINANCIAL_ANALYSIS)
            intents.add(IntentType.AGGREGATION)
            metadata["requires_sql"] = True

        # 4. Risk & Anomaly
        if re.search(r'\b(risk|anomaly|flagged|signal|why is.*flagged|kyun.*risk|unusual|verification|alert)\b', q):
            intents.add(IntentType.RISK_ANALYSIS)
            intents.add(IntentType.ANOMALY_ANALYSIS)
            metadata["requires_ml"] = True

        # 5. Duplicate / Cross Scheme / DPR Plagiarism
        if re.search(r'\b(duplicate|copy-paste|plagiarism|similar|pmgsy|mgnrega|double dipping|cross scheme)\b', q):
            intents.add(IntentType.DUPLICATE_ANALYSIS)
            metadata["requires_ml"] = True
            metadata["requires_geo"] = True

        # 6. Guidelines / Policy / MoSPI Rules
        if re.search(r'\b(guideline|guidelines|policy|rule|rules|permissible|prohibited|calamity|sc.*st|ceiling|mandate|norm|prohibit|allow)\b', q):
            intents.add(IntentType.GUIDELINE_QUERY)
            intents.add(IntentType.POLICY_QUERY)
            metadata["requires_rag"] = True

        # 7. General Financial & Expenditure
        if re.search(r'\b(how much|sanctioned|spent|disbursed|expenditure|cost|crore|lakh|budget|paisa|kharch|kharcha|kitna|kitne|kitni)\b', q) and IntentType.UTILIZATION_ANALYSIS not in intents:
            intents.add(IntentType.FINANCIAL_ANALYSIS)
            intents.add(IntentType.EXPENDITURE_ANALYSIS)
            intents.add(IntentType.AGGREGATION)
            metadata["requires_sql"] = True

        # 8. Rankings & Extremes
        if re.search(r'\b(highest|most|lowest|least|top|rank|ranking|maximum|minimum|who spent.*most|which district has.*most)\b', q):
            intents.add(IntentType.RANKING)
            intents.add(IntentType.AGGREGATION)

        # 9. Status & Delay
        if re.search(r'\b(delay|delayed|incomplete|completed|progress|physical progress|status|deri|adhura)\b', q):
            intents.add(IntentType.STATUS_ANALYSIS)
            metadata["requires_sql"] = True

        # 10. MP Lookup / Profile
        if re.search(r'\b(mp|member of parliament|who is the mp|tell me about|profile of|details of|who is|about mp|hon\'ble)\b', q):
            intents.add(IntentType.MP_LOOKUP)
            intents.add(IntentType.MP_PROFILE)

        # 11. Comparison
        if re.search(r'\b(compare|comparison|versus|vs|difference|better|who spent more)\b', q):
            intents.add(IntentType.COMPARISON)
            intents.add(IntentType.BENCHMARK_ANALYSIS)

        # 12. Project Lookup / Search
        if re.search(r'\b(project|projects|work|works|ws/mp|kaam|list|show)\b', q):
            intents.add(IntentType.PROJECT_SEARCH)
            metadata["requires_sql"] = True

        # 13. Geospatial / Map
        if re.search(r'\b(map|nearby|within.*km|distance|location|geospatial|coordinates|naksha|kahan)\b', q):
            intents.add(IntentType.GEOSPATIAL_QUERY)
            intents.add(IntentType.MAP_QUERY)
            metadata["requires_geo"] = True

        # 14. Report Generation
        if re.search(r'\b(report|export|download|csv|json|pdf|summary sheet)\b', q):
            intents.add(IntentType.REPORT_GENERATION)

        # 15. Follow-up anaphora check
        if re.search(r'\b(that mp|that project|the third one|the first one|which one|why\?|it|they|these|which have|only those)\b', q):
            intents.add(IntentType.FOLLOW_UP_QUERY)

        if not intents:
            intents.add(IntentType.MP_LOOKUP)

        return sorted(list(intents), key=lambda x: x.value), metadata

intent_router = IntentRouter()

