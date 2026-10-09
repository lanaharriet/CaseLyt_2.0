from agents.orchestrator import CaselytAgentOrchestrator

class ResearchWorkspaceEngine:
    @staticmethod
    def answer_query(question: str, case_id: str = None) -> dict:
        """
        Executes document-grounded RAG query orchestrated via LangGraph.
        Returns structured Answer, Evidence Passages, Sources, and Verification Status.
        If unsupported by corpus, safely returns 'NOT FOUND IN PROVIDED DOCUMENTS'.
        """
        return CaselytAgentOrchestrator.run_rag_query(question=question, case_id=case_id)

