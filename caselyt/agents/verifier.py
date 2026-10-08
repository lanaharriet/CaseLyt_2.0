from documents.models import Document, Paragraph
from contradictions.models import Contradiction

class VerificationGate:
    @staticmethod
    def verify_claim(claim_text: str, document_id_str: str = None, page_number: int = 1, paragraph_id: str = None, source_text: str = None) -> dict:
        """
        Executes strict 5-stage Verification Gate:
        1. Source Exists?
        2. Passage Exists?
        3. Claim Supported?
        4. Conflict Check?
        5. Output Status
        """
        # Step 1: Check Source Existence
        if not document_id_str and not paragraph_id:
            return {
                'status': 'NOT FOUND',
                'verdict': 'NOT FOUND IN PROVIDED DOCUMENTS',
                'checks': {
                    'source_exists': False,
                    'passage_exists': False,
                    'claim_supported': False,
                    'conflict_check': False,
                },
                'reason': 'No document citation or source reference provided.'
            }

        # Step 2: Check Passage Existence
        target_passage = ""
        if paragraph_id:
            p_obj = Paragraph.objects.filter(id=paragraph_id).first()
            if p_obj:
                target_passage = p_obj.text
            elif source_text:
                target_passage = source_text
        elif source_text:
            target_passage = source_text

        if not target_passage or len(target_passage.strip()) == 0:
            return {
                'status': 'NOT FOUND',
                'verdict': 'NOT FOUND IN PROVIDED DOCUMENTS',
                'checks': {
                    'source_exists': True,
                    'passage_exists': False,
                    'claim_supported': False,
                    'conflict_check': False,
                },
                'reason': 'Source passage text missing or non-existent in corpus.'
            }

        # Step 3: Claim Supported check
        # Match core keywords between claim and passage
        claim_keywords = set(w.lower() for w in claim_text.split() if len(w) > 3)
        passage_keywords = set(w.lower() for w in target_passage.split() if len(w) > 3)
        
        overlap = claim_keywords.intersection(passage_keywords)
        overlap_ratio = len(overlap) / (len(claim_keywords) or 1)

        if overlap_ratio < 0.25:
            return {
                'status': 'UNVERIFIED',
                'verdict': 'UNVERIFIED — Passage does not sufficiently support claim',
                'checks': {
                    'source_exists': True,
                    'passage_exists': True,
                    'claim_supported': False,
                    'conflict_check': False,
                },
                'reason': 'Corpus passage exists but semantic overlap is below verification threshold.'
            }

        # Step 4: Conflict Check
        # Check if any detected contradiction involves this document/passage
        conflicts = Contradiction.objects.filter(
            source_a_para=paragraph_id
        ) | Contradiction.objects.filter(
            source_b_para=paragraph_id
        )

        has_conflict = conflicts.exists()

        if has_conflict:
            conflict_obj = conflicts.first()
            return {
                'status': 'CONFLICTING',
                'verdict': f'CONFLICTING — Contradiction detected with {conflict_obj.source_b_doc_name if conflict_obj.source_a_para == paragraph_id else conflict_obj.source_a_doc_name}',
                'checks': {
                    'source_exists': True,
                    'passage_exists': True,
                    'claim_supported': True,
                    'conflict_check': True, # Triggered conflict
                },
                'conflict_details': conflict_obj.description,
                'source_text': target_passage
            }

        # Step 5: VERIFIED Output
        return {
            'status': 'VERIFIED',
            'verdict': 'VERIFIED IN SOURCE TEXT',
            'checks': {
                'source_exists': True,
                'passage_exists': True,
                'claim_supported': True,
                'conflict_check': False, # Clean, no conflict
            },
            'source_text': target_passage
        }
