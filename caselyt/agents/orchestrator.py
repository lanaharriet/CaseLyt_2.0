import os
import json
import logging
from typing import TypedDict, List, Dict, Any, Optional
from django.conf import settings
from langgraph.graph import StateGraph, END
from retrieval.engine import HybridRetrievalEngine
from agents.verifier import VerificationGate
from agents.models import AgentStep
from documents.models import Case

logger = logging.getLogger(__name__)

class AgentState(TypedDict):
    question: str
    case_id: Optional[str]
    retrieved_docs: List[Dict[str, Any]]
    verification: Dict[str, Any]
    status: str  # 'VERIFIED' | 'CONFLICTING' | 'UNVERIFIED' | 'NOT FOUND'
    answer: str
    explanation: str
    sources: List[Dict[str, Any]]
    evidence: List[Dict[str, Any]]
    steps_log: List[Dict[str, Any]]


def _log_agent_step(case_id: Optional[str], agent_name: str, display_title: str, status: str, details_summary: str):
    """Persists real LangGraph agent event to database for the Agent Activity Dashboard."""
    try:
        case_obj = None
        if case_id:
            case_obj = Case.objects.filter(id=case_id).first()
        if not case_obj:
            case_obj = Case.objects.first()
        
        if case_obj:
            AgentStep.objects.create(
                case=case_obj,
                agent_name=agent_name,
                display_title=display_title,
                status=status,
                details_summary=details_summary
            )
    except Exception as e:
        logger.warning(f"Could not persist AgentStep log: {e}")


# ==========================================================
# LANGGRAPH NODE FUNCTIONS
# ==========================================================

def retrieve_node(state: AgentState) -> Dict[str, Any]:
    """Node 1: Executes Hybrid BM25 + Dense Retrieval over Case Records."""
    question = state.get("question", "").strip()
    case_id = state.get("case_id")
    
    search_results = HybridRetrievalEngine.search(query=question, case_id=case_id, top_k=5)
    
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

    _log_agent_step(
        case_id=case_id,
        agent_name="Retriever",
        display_title=f"✓ Hybrid Retrieval ({len(search_results)} candidate passages)",
        status="COMPLETED",
        details_summary=f"BM25 + Dense scoring retrieved {len(search_results)} relevant segments for: '{question[:60]}'."
    )

    return {
        "retrieved_docs": search_results,
        "sources": sources,
        "evidence": evidence_passages,
    }


def verify_node(state: AgentState) -> Dict[str, Any]:
    """Node 2: Executes 5-Stage Verification Gate & Contradiction Audit."""
    search_results = state.get("retrieved_docs", [])
    question = state.get("question", "")
    case_id = state.get("case_id")

    # If no results or relevance too low, mark as NOT FOUND
    if not search_results or search_results[0].get("match_score", 0) < 0.2:
        ver_res = {
            'status': 'NOT FOUND',
            'verdict': 'NOT FOUND IN PROVIDED DOCUMENTS',
            'checks': {
                'source_exists': False,
                'passage_exists': False,
                'claim_supported': False,
                'conflict_check': False,
                'citation_resolved': False
            },
            'reason': 'No relevant document or paragraph found in case corpus.'
        }
        _log_agent_step(
            case_id=case_id,
            agent_name="Verifier",
            display_title="✗ Verification Gate: NOT FOUND IN CASE FILE",
            status="COMPLETED",
            details_summary=f"No matching evidence for query '{question[:60]}'."
        )
        return {
            "verification": ver_res,
            "status": "NOT FOUND"
        }

    top_match = search_results[0]
    verification = VerificationGate.verify_claim(
        claim_text=question,
        document_id_str=top_match.get('source'),
        page_number=top_match.get('page', 1),
        paragraph_id=top_match.get('paragraph_id'),
        source_text=top_match.get('evidence')
    )

    _log_agent_step(
        case_id=case_id,
        agent_name="Verifier",
        display_title=f"✓ Verification Gate: {verification.get('status', 'VERIFIED')}",
        status="COMPLETED",
        details_summary=f"Verdict: {verification.get('verdict', '')} (Checks: Source={verification['checks'].get('source_exists')}, Conflict={verification['checks'].get('conflict_check')})."
    )

    return {
        "verification": verification,
        "status": verification.get("status", "VERIFIED")
    }


def abstain_node(state: AgentState) -> Dict[str, Any]:
    """Node 3A: Safe Abstention Node — Guaranteed Zero Hallucination."""
    case_id = state.get("case_id")
    question = state.get("question", "")
    
    _log_agent_step(
        case_id=case_id,
        agent_name="Reasoning Engine",
        display_title="✓ Safe Abstention Enforced",
        status="COMPLETED",
        details_summary=f"Query '{question[:50]}' absent or ungrounded in case documents. Returned strictly bounded abstention."
    )

    return {
        "status": "NOT FOUND",
        "answer": "NOT FOUND IN PROVIDED DOCUMENTS",
        "explanation": "The requested query cannot be supported by any verified document or paragraph in the uploaded case file.",
        "sources": [],
        "evidence": []
    }


def synthesize_node(state: AgentState) -> Dict[str, Any]:
    """Node 3B: Gemini RAG / Grounded Synthesis with Paragraph-Level Citations."""
    question = state.get("question", "")
    case_id = state.get("case_id")
    status = state.get("status", "VERIFIED")
    evidence_passages = state.get("evidence", [])
    top_match = state.get("retrieved_docs", [{}])[0]
    verification = state.get("verification", {})

    api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.getenv('GEMINI_API_KEY', '')
    synthesized_answer = None

    # Attempt Gemini API Generation if key is configured
    if api_key and api_key.strip():
        try:
            from google import genai
            client = genai.Client(api_key=api_key.strip())
            
            context_blocks = []
            for i, ev in enumerate(evidence_passages, 1):
                context_blocks.append(
                    f"[{i}] Document: {ev.get('source')} (Page {ev.get('page')}, Para ID: {ev.get('paragraph_id')})\n"
                    f"Verification Status: {ev.get('verification_status', 'VERIFIED')}\n"
                    f"Excerpt: \"{ev.get('text')}\""
                )
            context_str = "\n\n".join(context_blocks)

            system_instruction = (
                "You are CASELYT 2.0, an evidence-grounded agentic legal intelligence workstation. "
                "Your operating principle is: READ -> FIND -> REASON -> VERIFY -> PROVE.\n"
                "Rules:\n"
                "1. Answer the user question STRICTLY using ONLY the provided verified evidence passages.\n"
                "2. Every factual statement MUST cite its source in brackets: [DocName, Page X, Para ID].\n"
                "3. If any detail is not directly supported by the evidence, mark it as [INFORMATION NOT FOUND IN CASE FILE].\n"
                "4. If there is a contradiction in the evidence (status CONFLICTING), explicitly point out both conflicting sources.\n"
                "5. Never hallucinate or extrapolate beyond the provided text."
            )

            prompt = (
                f"User Question: {question}\n\n"
                f"Verification Gate Status: {status}\n\n"
                f"Verified Case Corpus Evidence Passages:\n{context_str}\n\n"
                f"Please produce a concise, authoritative, evidence-grounded legal answer with exact citations:"
            )

            gemini_model = getattr(settings, 'GEMINI_MODEL', '') or os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')
            response = client.models.generate_content(
                model=gemini_model,
                contents=prompt,
                config={
                    'system_instruction': system_instruction,
                    'temperature': 0.1,
                }
            )
            if response and response.text:
                synthesized_answer = response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini API invocation failed ({e}), falling back to deterministic synthesis.")

    # Fallback to deterministic grounded citation synthesis
    if not synthesized_answer:
        doc_name = top_match.get('source', 'Case Record')
        page = top_match.get('page', 1)
        para_id = top_match.get('paragraph_id', '')
        text = top_match.get('evidence', '')

        if status == 'CONFLICTING':
            conflict_details = verification.get('conflict_details', 'Contradiction detected in case file.')
            synthesized_answer = (
                f"CONFLICT DETECTED in case records ({doc_name}, Page {page}, [{para_id}]): {text}\n\n"
                f"Evidentiary Discrepancy: {conflict_details}"
            )
        else:
            synthesized_answer = f"Based on verified case record ({doc_name}, Page {page}, [{para_id}]): {text}"

    explanation = (
        f"Extracted directly from paragraph {top_match.get('paragraph_id')} "
        f"with relevance score {top_match.get('match_score', 1.0)}."
    )

    _log_agent_step(
        case_id=case_id,
        agent_name="Synthesizer",
        display_title="✓ Document-Grounded Answer Generated",
        status="COMPLETED",
        details_summary=f"Synthesized answer with {len(evidence_passages)} citations (Status: {status})."
    )

    return {
        "answer": synthesized_answer,
        "explanation": explanation,
    }


# ==========================================================
# ROUTING CONDITION
# ==========================================================

def route_after_verification(state: AgentState) -> str:
    """Conditional Edge: routes to abstain if status is NOT FOUND or UNVERIFIED, else synthesize."""
    if state.get("status") in ["NOT FOUND", "UNVERIFIED"]:
        return "abstain"
    return "synthesize"


# ==========================================================
# LANGGRAPH BUILDER
# ==========================================================

def build_caselyt_graph():
    """Builds and compiles the StateGraph workflow."""
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("retrieve", retrieve_node)
    workflow.add_node("verify", verify_node)
    workflow.add_node("abstain", abstain_node)
    workflow.add_node("synthesize", synthesize_node)

    # Add Edges
    workflow.set_entry_point("retrieve")
    workflow.add_edge("retrieve", "verify")
    
    # Conditional Routing from verify
    workflow.add_conditional_edges(
        "verify",
        route_after_verification,
        {
            "abstain": "abstain",
            "synthesize": "synthesize"
        }
    )

    workflow.add_edge("abstain", END)
    workflow.add_edge("synthesize", END)

    return workflow.compile()


# Global compiled workflow instance
caselyt_orchestrator = build_caselyt_graph()


class CaselytAgentOrchestrator:
    @staticmethod
    def run_rag_query(question: str, case_id: Optional[str] = None) -> Dict[str, Any]:
        """Executes end-to-end LangGraph RAG query with verification and step logging."""
        initial_state: AgentState = {
            "question": question,
            "case_id": case_id,
            "retrieved_docs": [],
            "verification": {},
            "status": "UNVERIFIED",
            "answer": "",
            "explanation": "",
            "sources": [],
            "evidence": [],
            "steps_log": []
        }

        final_state = caselyt_orchestrator.invoke(initial_state)

        return {
            "question": question,
            "status": final_state.get("status", "NOT FOUND"),
            "answer": final_state.get("answer", "NOT FOUND IN PROVIDED DOCUMENTS"),
            "explanation": final_state.get("explanation", ""),
            "sources": final_state.get("sources", []),
            "evidence": final_state.get("evidence", []),
            "verification": final_state.get("verification", {
                "status": "NOT FOUND",
                "verdict": "NOT FOUND IN PROVIDED DOCUMENTS",
                "checks": {
                    "source_exists": False,
                    "passage_exists": False,
                    "claim_supported": False,
                    "conflict_check": False,
                    "citation_resolved": False
                }
            })
        }
