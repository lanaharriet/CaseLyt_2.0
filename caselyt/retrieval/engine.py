import re
from rank_bm25 import BM25Okapi
from documents.models import Paragraph, Document
from evidence.models import Evidence, Claim
from timeline.models import TimelineEvent

STOP_WORDS = {
    'what', 'which', 'where', 'when', 'who', 'whom', 'whose', 'why', 'how',
    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'because', 'as', 'until',
    'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to',
    'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'all', 'any', 'both', 'each',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can',
    'will', 'just', 'don', 'should', 'now', 'is', 'was', 'are', 'were',
    'did', 'does', 'do', 'has', 'have', 'had', 'been', 'being', 'having'
}

class HybridRetrievalEngine:
    @staticmethod
    def search(query: str, case_id: str = None, top_k: int = 10):
        all_terms = [t.lower() for t in re.findall(r'\w+', query) if len(t) > 1]
        query_terms = [t for t in all_terms if t not in STOP_WORDS and len(t) > 2]
        if not query_terms and all_terms:
            query_terms = all_terms

        
        # 1. Fetch paragraphs
        paras = Paragraph.objects.all()
        if case_id:
            paras = paras.filter(page__document__case_id=case_id)
        
        para_list = list(paras.select_related('page', 'page__document'))
        results = []

        # BM25 Indexing
        if para_list and query_terms:
            corpus = [re.findall(r'\w+', p.text.lower()) for p in para_list]
            bm25 = BM25Okapi(corpus)
            doc_scores = bm25.get_scores(query_terms)

            for idx, score in enumerate(doc_scores):
                if score > 0.1:
                    p = para_list[idx]
                    results.append({
                        'type': 'DOCUMENT_PARAGRAPH',
                        'source': p.page.document.filename,
                        'document_id': str(p.page.document.id),
                        'page': p.page.page_number,
                        'paragraph_id': p.id,
                        'evidence': p.text,
                        'match_score': round(float(score), 3),
                        'verification_status': 'VERIFIED'
                    })

        # 2. Search Evidence records
        evidences = Evidence.objects.all()
        if case_id:
            evidences = evidences.filter(case_id=case_id)
        for ev in evidences:
            text_match = sum(1 for term in query_terms if term in ev.title.lower() or term in ev.source_text.lower())
            if text_match > 0 or not query_terms:
                score = (text_match / (len(query_terms) or 1)) * 3.5 + ev.relevance_score
                results.append({
                    'type': 'EVIDENCE_RECORD',
                    'source': ev.document_id_str,
                    'document_id': str(ev.document.id) if ev.document else ev.document_id_str,
                    'page': ev.page_number,
                    'paragraph_id': ev.paragraph_id,
                    'evidence': ev.source_text,
                    'match_score': round(score, 3),
                    'verification_status': ev.verification_status
                })

        # 3. Search Timeline Events
        timeline = TimelineEvent.objects.all()
        if case_id:
            timeline = timeline.filter(case_id=case_id)
        for te in timeline:
            text_match = sum(1 for term in query_terms if term in te.title.lower() or term in te.description.lower() or term in te.source_text.lower())
            if text_match > 0:
                results.append({
                    'type': 'TIMELINE_EVENT',
                    'source': te.document_id_str,
                    'document_id': str(te.document.id) if te.document else te.document_id_str,
                    'page': te.page_number,
                    'paragraph_id': te.paragraph_id,
                    'evidence': f"[{te.date_str}] {te.title} — {te.source_text}",
                    'match_score': round(text_match * 2.0, 3),
                    'verification_status': 'CONFLICTING' if te.has_conflict else 'VERIFIED'
                })

        # Rerank results descending by match_score
        results.sort(key=lambda x: x['match_score'], reverse=True)
        return results[:top_k]
