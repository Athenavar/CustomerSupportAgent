import os
import json
import math
import re
from collections import Counter
from typing import List, Dict, Optional
from app.core.config import settings

class PurePythonRAGEngine:
    def __init__(self, storage_path: str = "./kb_store.json"):
        self.storage_path = storage_path
        self.documents: Dict[str, Dict] = {}
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.load_store()

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r"\b[a-zA-Z0-9_\-\.]+\b", text.lower())

    def _compute_vector(self, tokens: List[str]) -> Dict[str, float]:
        tf = Counter(tokens)
        total = len(tokens) or 1
        vec = {}
        for token, count in tf.items():
            idf_val = self.idf.get(token, 1.0)
            vec[token] = (count / total) * idf_val
        # Normalize vector
        magnitude = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        return {k: v / magnitude for k, v in vec.items()}

    def _recalculate_idf(self):
        total_docs = len(self.documents)
        if total_docs == 0:
            return
        doc_freq = Counter()
        for item in self.documents.values():
            unique_tokens = set(self._tokenize(item["text"]))
            for t in unique_tokens:
                doc_freq[t] += 1

        self.idf = {
            token: math.log((1 + total_docs) / (1 + freq)) + 1.0
            for token, freq in doc_freq.items()
        }

    def load_store(self):
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.documents = data.get("documents", {})
                    self._recalculate_idf()
            except Exception:
                self.documents = {}

    def save_store(self):
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump({"documents": self.documents}, f, indent=2)

    def index_document(self, doc_id: str, content: str, metadata: dict):
        self.documents[doc_id] = {
            "id": doc_id,
            "text": content,
            "metadata": metadata
        }
        self._recalculate_idf()
        self.save_store()

    def search(self, query: str, filters: Optional[dict] = None, top_k: int = 4) -> List[Dict]:
        if not self.documents:
            return []

        query_tokens = self._tokenize(query)
        query_vec = self._compute_vector(query_tokens)
        
        results = []
        for doc_id, item in self.documents.items():
            meta = item["metadata"]
            
            # Apply metadata filter
            if filters:
                match = True
                for fk, fv in filters.items():
                    if fv and str(meta.get(fk, "")).lower() != str(fv).lower():
                        match = False
                        break
                if not match:
                    continue

            doc_tokens = self._tokenize(item["text"])
            doc_vec = self._compute_vector(doc_tokens)

            # Cosine similarity
            cosine_score = sum(query_vec.get(token, 0.0) * doc_vec.get(token, 0.0) for token in query_vec)

            # Keyword exact boost (error codes, model numbers, parts)
            exact_hits = sum(1 for qt in query_tokens if qt in doc_tokens)
            keyword_score = exact_hits / (len(query_tokens) or 1)

            combined_score = (cosine_score * 0.7) + (keyword_score * 0.3)

            if combined_score > 0.05 or not filters:
                results.append({
                    "text": item["text"],
                    "metadata": meta,
                    "dense_score": round(cosine_score, 3),
                    "sparse_score": round(keyword_score, 3),
                    "combined_score": round(combined_score, 3)
                })

        ranked = sorted(results, key=lambda x: x["combined_score"], reverse=True)
        return ranked[:top_k]

rag_engine = PurePythonRAGEngine()
