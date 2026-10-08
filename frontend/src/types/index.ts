export type VerificationStatus = 'VERIFIED' | 'CONFLICTING' | 'UNVERIFIED' | 'NOT FOUND';

export interface DocumentItem {
  id: string;
  filename: string;
  doc_type: 'PDF' | 'DOCX' | 'TXT';
  page_count: number;
  status: 'PENDING' | 'PROCESSING' | 'INDEXED' | 'FAILED';
  ocr_applied: boolean;
  evidence_count: number;
  conflicts_count: number;
  uploaded_at_formatted?: string;
  file?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  evidence_type: 'DOCUMENTARY' | 'TESTIMONIAL' | 'FORENSIC' | 'FINANCIAL' | 'STATUTORY';
  document_id_str: string;
  document_filename: string;
  page_number: number;
  paragraph_id: string;
  source_text: string;
  relevance_score: number;
  verification_status: VerificationStatus;
}

export interface ClaimItem {
  id: string;
  claim_text: string;
  document_id_str: string;
  document_filename: string;
  page_number: number;
  paragraph_id: string;
  evidence_passage: string;
  verification_status: VerificationStatus;
  conflict_notes?: string;
}

export interface FindingItem {
  id: string;
  fact_statement: string;
  category: string;
  verification_status: VerificationStatus;
  document_id_str: string;
  page_number: number;
  paragraph_id: string;
  source_text: string;
}

export interface TimelineEventItem {
  id: string;
  date_str: string;
  title: string;
  description: string;
  document_id_str: string;
  document_filename: string;
  page_number: number;
  paragraph_id: string;
  source_text: string;
  has_conflict: boolean;
  conflict_details?: string;
}

export interface ContradictionItem {
  id: string;
  category: 'DATES' | 'NAMES' | 'LOCATIONS' | 'AMOUNTS' | 'EVENTS' | 'RELATIONSHIPS';
  title: string;
  description: string;
  source_a_doc_name: string;
  source_a_page: number;
  source_a_para: string;
  source_a_text: string;
  source_b_doc_name: string;
  source_b_page: number;
  source_b_para: string;
  source_b_text: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MissingInfoItem {
  id: string;
  topic: string;
  category: 'CONFIRMED' | 'CONFLICTING' | 'MISSING';
  reason_flagged: string;
  impact_assessment: string;
  required_evidence_type: string;
}

export interface GraphNodeItem {
  id: string;
  node_id: string;
  label: string;
  type: 'Person' | 'Location' | 'Date' | 'Event' | 'Document' | 'Evidence' | 'Claim';
  properties: Record<string, any>;
}

export interface GraphEdgeItem {
  id: string;
  source: string;
  target: string;
  relationship: 'Supports' | 'Contradicts' | 'References' | 'Derived From';
  details?: string;
}

export interface AgentStepItem {
  id: string;
  agent_name: string;
  display_title: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  details_summary?: string;
  timestamp_formatted?: string;
}

export interface LegalDraftItem {
  draft_type: string;
  title: string;
  verified_facts_count: number;
  missing_variables_count: number;
  content: string;
}

export interface ResearchAnswer {
  question: string;
  status: VerificationStatus;
  answer: string;
  explanation: string;
  sources: Array<{
    document_name: string;
    page_number: number;
    paragraph_id: string;
    match_score: number;
  }>;
  evidence: Array<{
    source: string;
    page: number;
    paragraph_id: string;
    text: string;
    verification_status: VerificationStatus;
  }>;
  verification: {
    status: VerificationStatus;
    verdict: string;
    checks: {
      source_exists: boolean;
      passage_exists: boolean;
      claim_supported: boolean;
      conflict_check: boolean;
    };
  };
}
