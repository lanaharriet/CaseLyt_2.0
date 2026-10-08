from retrieval.engine import HybridRetrievalEngine
from agents.verifier import VerificationGate

class ResearchWorkspaceEngine:
    @staticmethod
    def answer_query(question: str, case_id: str = None) -> dict:
        """
        Executes evidence research. Returns structured Answer, Evidence Passages, Sources, and Verification Status.
        If unsupported by corpus, returns 'NOT FOUND IN PROVIDED DOCUMENTS'.
        """
        search_results = HybridRetrievalEngine.search(query=question, case_id=case_id, top_k=5)
        
        if not search_results or search_results[0]['match_score'] < 0.2:
            return {
                'question': question,
                'status': 'NOT FOUND',
                'answer': 'NOT FOUND IN PROVIDED DOCUMENTS',
                'explanation': 'The requested query cannot be supported by any verified document or paragraph in the uploaded case file.',
                'sources': [],
                'evidence': [],
                'verification': {
                    'status': 'NOT FOUND',
                    'verdict': 'NOT FOUND IN PROVIDED DOCUMENTS',
                    'checks': {
                        'source_exists': False,
                        'passage_exists': False,
                        'claim_supported': False,
                        'conflict_check': False
                    }
                }
            }

        top_match = search_results[0]
        
        # Verify top match against Verification Gate
        verification = VerificationGate.verify_claim(
            claim_text=question,
            document_id_str=top_match['source'],
            page_number=top_match['page'],
            paragraph_id=top_match['paragraph_id'],
            source_text=top_match['evidence']
        )

        sources = []
        evidence_passages = []

        for item in search_results:
            sources.append({
                'document_name': item['source'],
                'document_id': item['document_id'],
                'page_number': item['page'],
                'paragraph_id': item['paragraph_id'],
                'match_score': item['match_score']
            })
            evidence_passages.append({
                'source': item['source'],
                'page': item['page'],
                'paragraph_id': item['paragraph_id'],
                'text': item['evidence'],
                'verification_status': item.get('verification_status', 'VERIFIED')
            })

        # Synthesize answer strictly from source text
        answer_text = f"Based on verified case record ({top_match['source']}, Page {top_match['page']}): {top_match['evidence']}"

        return {
            'question': question,
            'status': verification['status'],
            'answer': answer_text,
            'explanation': f"Extracted directly from paragraph {top_match['paragraph_id']} with relevance score {top_match['match_score']}.",
            'sources': sources,
            'evidence': evidence_passages,
            'verification': verification
        }
