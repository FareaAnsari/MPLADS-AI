"""
Pratyaksh DPR Text-Similarity & Copy-Paste NLP Scanner
------------------------------------------------------
Compares project justification/DPR (Detailed Project Report) text across works in
the repository to detect duplicate, boilerplate, or copy-pasted project scopes
across geographically distant constituencies.

Uses TF-IDF vectorization and cosine similarity calculations.
"""

import re
import math
from typing import Dict, Any, List, Optional
from datetime import datetime

DPR_SIMILARITY_ENGINE_VERSION = "2.1.0-dpr-nlp"


def tokenize_and_vectorize(text: str) -> Dict[str, float]:
    """Generates normalized term frequency vectors for a text."""
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    if not words:
        return {}
    
    stop_words = {
        "the", "and", "for", "with", "this", "that", "from", "under", "mplads",
        "scheme", "project", "work", "construction", "proposed", "shall", "will"
    }
    
    tf = {}
    for w in words:
        if w not in stop_words:
            tf[w] = tf.get(w, 0.0) + 1.0
            
    # Normalize vector to unit length
    magnitude = math.sqrt(sum(v * v for v in tf.values()))
    if magnitude == 0:
        return {}
    return {k: v / magnitude for k, v in tf.items()}


def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    """Calculates cosine similarity between two normalized TF vectors."""
    common_keys = set(vec1.keys()).intersection(set(vec2.keys()))
    dot_product = sum(vec1[k] * vec2[k] for k in common_keys)
    return max(0.0, min(1.0, dot_product))


class DPRSimilarityEngine:
    def __init__(self):
        self.engine_version = DPR_SIMILARITY_ENGINE_VERSION

    def scan_dpr_similarity(
        self,
        target_work_id: str,
        target_dpr_text: str,
        corpus_projects: List[Dict[str, Any]],
        similarity_threshold: float = 0.65
    ) -> Dict[str, Any]:
        """
        Scans target DPR text against the corpus of other projects to detect copy-paste patterns.
        """
        target_vec = tokenize_and_vectorize(target_dpr_text)
        matches = []

        for proj in corpus_projects:
            pid = proj.get("work_id", "")
            if pid.lower() == target_work_id.lower():
                continue
                
            proj_dpr = proj.get("dpr_justification") or proj.get("work_title") or ""
            if not proj_dpr:
                continue

            proj_vec = tokenize_and_vectorize(proj_dpr)
            sim = cosine_similarity(target_vec, proj_vec)

            if sim >= similarity_threshold:
                # Find matching keyword snippets
                shared_terms = list(set(target_vec.keys()).intersection(set(proj_vec.keys())))
                matches.append({
                    "matched_work_id": pid,
                    "matched_work_title": proj.get("work_title", ""),
                    "matched_state": proj.get("state", ""),
                    "matched_constituency": proj.get("constituency", ""),
                    "similarity_score": round(sim, 3),
                    "shared_key_terms": shared_terms[:8],
                    "is_cross_district": proj.get("constituency", "") != target_work_id
                })

        matches.sort(key=lambda x: x["similarity_score"], reverse=True)
        max_sim = matches[0]["similarity_score"] if matches else 0.0
        is_flagged = max_sim >= similarity_threshold

        return {
            "work_id": target_work_id,
            "engine_version": self.engine_version,
            "similarity_threshold": similarity_threshold,
            "is_copy_paste_flagged": is_flagged,
            "highest_similarity_score": max_sim,
            "duplicate_matches_count": len(matches),
            "matches": matches[:5],
            "audit_observation": (
                f"AI Audit Observation: High text overlap ({round(max_sim * 100, 1)}%) detected against "
                f"{len(matches)} other registered DPR submission(s). "
                "Investigate if boilerplate technical specifications were reused across disparate geographic areas without site-specific soil/topography surveys."
            ) if is_flagged else "DPR text exhibits unique project-specific engineering scope.",
            "scanned_at": datetime.utcnow().isoformat()
        }
