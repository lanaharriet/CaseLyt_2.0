from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from api.seed_data import populate_seed_data
from agents.orchestrator import CaselytAgentOrchestrator
from agents.verifier import VerificationGate
from agents.models import AgentStep
from documents.models import Case, Document, Paragraph

class CaselytLangGraphTests(TestCase):
    def setUp(self):
        self.case = populate_seed_data()
        self.client = APIClient()

    def test_verified_rag_query(self):
        """Test LangGraph RAG on a verified fact (Swiss Air flight departure)."""
        query = "Did Vikram Malhotra board Flight LX-147 to Zurich?"
        res = CaselytAgentOrchestrator.run_rag_query(question=query, case_id=str(self.case.id))
        
        self.assertIn(res['status'], ['VERIFIED', 'CONFLICTING'])
        self.assertTrue(len(res['evidence']) > 0)
        self.assertTrue(len(res['sources']) > 0)
        self.assertIn("LX-147", res['answer'])
        self.assertTrue(res['verification']['checks']['source_exists'])
        self.assertTrue(res['verification']['checks']['passage_exists'])

    def test_safe_abstention_on_unsupported_query(self):
        """Test LangGraph safe abstention when query is absent in case files."""
        query = "What brand of blue bicycle was stolen from the parking lot?"
        res = CaselytAgentOrchestrator.run_rag_query(question=query, case_id=str(self.case.id))
        
        self.assertEqual(res['status'], 'NOT FOUND')
        self.assertEqual(res['answer'], 'NOT FOUND IN PROVIDED DOCUMENTS')
        self.assertEqual(len(res['sources']), 0)
        self.assertEqual(len(res['evidence']), 0)
        self.assertFalse(res['verification']['checks']['source_exists'])

    def test_contradiction_detection_in_rag(self):
        """Test that conflicting claims are flagged as CONFLICTING."""
        query = "Was Vikram Malhotra present in New Delhi office on 15 March 2024?"
        res = CaselytAgentOrchestrator.run_rag_query(question=query, case_id=str(self.case.id))
        
        self.assertEqual(res['status'], 'CONFLICTING')
        self.assertTrue(res['verification']['checks']['conflict_check'])
        self.assertIn("CONFLICT", res['answer'])

    def test_langgraph_step_logging(self):
        """Test that LangGraph writes real execution steps to AgentStep database model."""
        initial_count = AgentStep.objects.count()
        query = "Who authorized the wire transfer of Rs 3.4 Crores?"
        res = CaselytAgentOrchestrator.run_rag_query(question=query, case_id=str(self.case.id))
        
        new_count = AgentStep.objects.count()
        self.assertGreater(new_count, initial_count)
        
        retriever_step = AgentStep.objects.filter(agent_name="Retriever").last()
        verifier_step = AgentStep.objects.filter(agent_name="Verifier").last()
        self.assertIsNotNone(retriever_step)
        self.assertIsNotNone(verifier_step)

    def test_verification_gate_direct(self):
        """Test VerificationGate logic directly."""
        para_clean = Paragraph.objects.filter(text__icontains="INR 3,40,00,000").first()
        self.assertIsNotNone(para_clean)
        
        res_clean = VerificationGate.verify_claim(
            claim_text="Transfer Requisition TXN-99812 INR 3,40,00,000 debited Alpine Capital Holdings",
            document_id_str=para_clean.page.document.filename,
            page_number=para_clean.page.page_number,
            paragraph_id=para_clean.id,
            source_text=para_clean.text
        )
        self.assertEqual(res_clean['status'], 'VERIFIED')
        self.assertTrue(res_clean['checks']['citation_resolved'])
        self.assertTrue(res_clean['checks']['claim_supported'])
        self.assertFalse(res_clean['checks']['conflict_check'])

        # Test conflicting claim
        para_conflict = Paragraph.objects.filter(text__icontains="LX-147").first()
        res_conflict = VerificationGate.verify_claim(
            claim_text="Vikram Malhotra Swiss Air Flight LX-147 Zurich",
            document_id_str=para_conflict.page.document.filename,
            page_number=para_conflict.page.page_number,
            paragraph_id=para_conflict.id,
            source_text=para_conflict.text
        )
        self.assertEqual(res_conflict['status'], 'CONFLICTING')
        self.assertTrue(res_conflict['checks']['conflict_check'])

    def test_research_workspace_api_endpoint(self):
        """Test the /api/research/query/ REST API."""
        response = self.client.post('/api/research/query/', {
            'question': 'What IP address executed transaction TXN-99812?',
            'case_id': str(self.case.id)
        }, format='json')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('status', data)
        self.assertIn('answer', data)
        self.assertIn('verification', data)
        self.assertIn('194.230.145.12', data['answer'])
