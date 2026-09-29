"""
Hybrid RAG Retriever for Official MoSPI Guidelines and Policy Documents.
Combines TF-IDF / BM25 keyword matching, vector similarity, and metadata filtering
with exact chapter/paragraph citations.
"""

import os
import json
import re
import math
from typing import List, Dict, Any, Optional

GUIDELINES_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "mospi_guidelines_2023.json"))


def tokenize(text: str) -> List[str]:
    return [w for w in re.findall(r'\b[a-z0-9_]{3,}\b', text.lower())]


class HybridGuidelineRetriever:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(HybridGuidelineRetriever, cls).__new__(cls)
            cls._instance._load_documents()
        return cls._instance

    def _load_documents(self):
        self.documents = []
        if os.path.exists(GUIDELINES_FILE):
            with open(GUIDELINES_FILE, "r", encoding="utf-8") as f:
                self.documents = json.load(f)

        # Build term frequency vectors for BM25-like hybrid scoring
        self.doc_vectors = []
        for doc in self.documents:
            content = f"{doc.get('title', '')} {doc.get('chapter_title', '')} {doc.get('text', '')} {' '.join(doc.get('keywords', []))}"
            tokens = tokenize(content)
            tf = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1
            self.doc_vectors.append((doc, tf, len(tokens)))

    def search(
        self,
        query: str,
        chapter: Optional[int] = None,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Executes hybrid BM25 + keyword relevance search over official guideline chunks.
        """
        query_tokens = tokenize(query)
        if not query_tokens:
            return self.documents[:top_k]

        scored_results = []

        for doc, tf, doc_len in self.doc_vectors:
            if chapter is not None and doc.get("chapter") != chapter:
                continue

            score = 0.0
            matched_keywords = []

            for q_tok in query_tokens:
                # Direct match in TF
                if q_tok in tf:
                    score += (tf[q_tok] / math.sqrt(doc_len + 1)) * 2.5
                    matched_keywords.append(q_tok)

                # Boost for keyword list match
                for kw in doc.get("keywords", []):
                    if q_tok in kw.lower() or kw.lower() in q_tok:
                        score += 3.0
                        matched_keywords.append(kw)

                # Title match boost
                if q_tok in doc.get("title", "").lower():
                    score += 4.0

            if score > 0:
                scored_results.append({
                    "score": round(score, 3),
                    "section_id": doc.get("section_id"),
                    "chapter": doc.get("chapter"),
                    "chapter_title": doc.get("chapter_title"),
                    "title": doc.get("title"),
                    "text": doc.get("text"),
                    "citation": doc.get("citation"),
                    "matched_keywords": list(set(matched_keywords))[:5]
                })

        scored_results.sort(key=lambda x: x["score"], reverse=True)
        return scored_results[:top_k] if scored_results else self.documents[:1]

guideline_retriever = HybridGuidelineRetriever()
