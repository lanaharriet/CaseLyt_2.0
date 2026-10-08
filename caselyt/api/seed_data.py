import json
from documents.models import Case, Document, Page, Paragraph
from evidence.models import Evidence, Claim, Finding, GraphNode, GraphEdge
from timeline.models import TimelineEvent
from contradictions.models import Contradiction, MissingInformation
from agents.models import AgentStep

def populate_seed_data():
    """Populates complete seed data for HACKNEX 2026 judging demo."""
    # Reset existing records to avoid duplicate key conflicts
    AgentStep.objects.all().delete()
    MissingInformation.objects.all().delete()
    Contradiction.objects.all().delete()
    TimelineEvent.objects.all().delete()
    GraphEdge.objects.all().delete()
    GraphNode.objects.all().delete()
    Finding.objects.all().delete()
    Claim.objects.all().delete()
    Evidence.objects.all().delete()
    Paragraph.objects.all().delete()
    Page.objects.all().delete()
    Document.objects.all().delete()
    Case.objects.all().delete()

    # 1. Create Case
    case_obj = Case.objects.create(
        title="State vs. Vikram Malhotra & Ors. (Financial Fraud & Alibi Verification)",
        case_number="FIR No. 204/2024 (EOW / Special CBI Court)",
        jurisdiction="High Court of Delhi / Special CBI Court, New Delhi",
        description="Complex financial fraud and criminal conspiracy prosecution involving alleged wire transfers of Rs 3.4 Crores, disputed flight alibis, and conflicting bank transaction audit logs."
    )

    # 2. Create Documents
    doc1 = Document.objects.create(
        case=case_obj,
        filename="FIR_204_2024_CBI_ChargeSheet.pdf",
        doc_type="PDF",
        page_count=14,
        status="INDEXED",
        ocr_applied=True,
        evidence_count=8,
        conflicts_count=2
    )

    doc2 = Document.objects.create(
        case=case_obj,
        filename="Forensic_Audit_Report_KPMG_2024.pdf",
        doc_type="PDF",
        page_count=28,
        status="INDEXED",
        ocr_applied=False,
        evidence_count=12,
        conflicts_count=1
    )

    doc3 = Document.objects.create(
        case=case_obj,
        filename="ICICI_Bank_Ledger_Statement_2024.docx",
        doc_type="DOCX",
        page_count=6,
        status="INDEXED",
        ocr_applied=False,
        evidence_count=5,
        conflicts_count=1
    )

    doc4 = Document.objects.create(
        case=case_obj,
        filename="Witness_Deposition_Siddharth_Verma.pdf",
        doc_type="PDF",
        page_count=9,
        status="INDEXED",
        ocr_applied=True,
        evidence_count=4,
        conflicts_count=2
    )

    # 3. Create Pages & Paragraphs for doc1 (ChargeSheet)
    p1_d1 = Page.objects.create(document=doc1, page_number=1, content="Charge sheet filed by Economic Offences Wing under Sections 420, 409, 120-B of IPC. Accused No. 1 Vikram Malhotra is alleged to have instructed the transfer of Rs 3.4 Crores on 15 March 2024 while present in New Delhi office.")
    para1 = Paragraph.objects.create(
        id=f"DOC_{str(doc1.id)[:6]}_P1_PAR1",
        page=p1_d1,
        paragraph_number=1,
        text="Charge sheet filed by Economic Offences Wing under Sections 420, 409, 120-B of IPC. Accused No. 1 Vikram Malhotra is alleged to have instructed the transfer of Rs 3.4 Crores on 15 March 2024 while present in New Delhi office."
    )
    para2 = Paragraph.objects.create(
        id=f"DOC_{str(doc1.id)[:6]}_P1_PAR2",
        page=p1_d1,
        paragraph_number=2,
        text="Investigating Officer states Accused No. 1 personally authorized Bank Transaction TXN-99812 from ICICI Connaught Place branch."
    )
    para3 = Paragraph.objects.create(
        id=f"DOC_{str(doc1.id)[:6]}_P1_PAR3",
        page=p1_d1,
        paragraph_number=3,
        text="On 14th March 2024 at 14:30 IST, Accused No. 1 boarded Swiss Air Flight LX-147 to Zurich according to Immigration Passport Log Reg: IND-88712."
    )

    # Pages & Paragraphs for doc2 (Forensic Audit)
    p1_d2 = Page.objects.create(document=doc2, page_number=3, content="KPMG Forensic Audit Section 4.2: Digital Signature & IP Analysis for Transaction TXN-99812.")
    para4 = Paragraph.objects.create(
        id=f"DOC_{str(doc2.id)[:6]}_P3_PAR1",
        page=p1_d2,
        paragraph_number=1,
        text="Digital Audit Log confirms Transaction TXN-99812 for Rs 3.4 Crores originated from Geneva IP Address 194.230.145.12 at 16:15 IST, authorized by digital key assigned to Siddharth Verma."
    )

    # Pages & Paragraphs for doc3 (Bank Ledger)
    p1_d3 = Page.objects.create(document=doc3, page_number=2, content="ICICI Bank Ledger Statement Account No. 9940129910.")
    para5 = Paragraph.objects.create(
        id=f"DOC_{str(doc3.id)[:6]}_P2_PAR2",
        page=p1_d3,
        paragraph_number=2,
        text="Transfer Requisition TXN-99812 in the amount of INR 3,40,00,000/- was debited on 15 March 2024. Beneficiary: Alpine Capital Holdings Ltd., Zurich."
    )

    # Pages & Paragraphs for doc4 (Witness Deposition)
    p1_d4 = Page.objects.create(document=doc4, page_number=2, content="Sworn Deposition of Witness Siddharth Verma taken before Metropolitan Magistrate.")
    para6 = Paragraph.objects.create(
        id=f"DOC_{str(doc4.id)[:6]}_P2_PAR1",
        page=p1_d4,
        paragraph_number=1,
        text="Witness states: 'I never touched the digital security token on 15 March 2024. Mr. Vikram Malhotra kept all corporate banking passwords in his personal safe.'"
    )

    # 4. Create Evidence Records
    ev1 = Evidence.objects.create(
        case=case_obj,
        title="Immigration Passport Log & Boarding Record",
        evidence_type="DOCUMENTARY",
        document=doc1,
        document_id_str="FIR_204_2024_CBI_ChargeSheet.pdf",
        page_number=1,
        paragraph_id=para3.id,
        source_text="On 14th March 2024 at 14:30 IST, Accused No. 1 boarded Swiss Air Flight LX-147 to Zurich according to Immigration Passport Log Reg: IND-88712.",
        relevance_score=0.98,
        verification_status="VERIFIED"
    )

    ev2 = Evidence.objects.create(
        case=case_obj,
        title="KPMG IP Address & Digital Signature Analysis",
        evidence_type="FORENSIC",
        document=doc2,
        document_id_str="Forensic_Audit_Report_KPMG_2024.pdf",
        page_number=3,
        paragraph_id=para4.id,
        source_text="Digital Audit Log confirms Transaction TXN-99812 for Rs 3.4 Crores originated from Geneva IP Address 194.230.145.12 at 16:15 IST, authorized by digital key assigned to Siddharth Verma.",
        relevance_score=0.96,
        verification_status="VERIFIED"
    )

    ev3 = Evidence.objects.create(
        case=case_obj,
        title="ICICI Bank Ledger Wire Requisition TXN-99812",
        evidence_type="FINANCIAL",
        document=doc3,
        document_id_str="ICICI_Bank_Ledger_Statement_2024.docx",
        page_number=2,
        paragraph_id=para5.id,
        source_text="Transfer Requisition TXN-99812 in the amount of INR 3,40,00,000/- was debited on 15 March 2024. Beneficiary: Alpine Capital Holdings Ltd., Zurich.",
        relevance_score=0.92,
        verification_status="VERIFIED"
    )

    ev4 = Evidence.objects.create(
        case=case_obj,
        title="Physical Presence Assertion in CBI ChargeSheet",
        evidence_type="DOCUMENTARY",
        document=doc1,
        document_id_str="FIR_204_2024_CBI_ChargeSheet.pdf",
        page_number=1,
        paragraph_id=para1.id,
        source_text="Accused No. 1 Vikram Malhotra is alleged to have instructed the transfer of Rs 3.4 Crores on 15 March 2024 while present in New Delhi office.",
        relevance_score=0.88,
        verification_status="CONFLICTING"
    )

    # 5. Create Claims & Findings
    Claim.objects.create(
        case=case_obj,
        claim_text="Vikram Malhotra was physically in Zurich on 15th March 2024 during the wire transfer.",
        source_document=doc1,
        document_id_str="FIR_204_2024_CBI_ChargeSheet.pdf",
        page_number=1,
        paragraph_id=para3.id,
        evidence_passage=para3.text,
        verification_status="VERIFIED"
    )

    Claim.objects.create(
        case=case_obj,
        claim_text="Vikram Malhotra personally signed the wire transfer requisition at ICICI Connaught Place branch on 15th March 2024.",
        source_document=doc1,
        document_id_str="FIR_204_2024_CBI_ChargeSheet.pdf",
        page_number=1,
        paragraph_id=para2.id,
        evidence_passage=para2.text,
        verification_status="CONFLICTING",
        conflict_notes="Directly contradicted by KPMG Forensic Audit showing Geneva IP origin and Siddharth Verma digital key signature."
    )

    Finding.objects.create(
        case=case_obj,
        fact_statement="Accused Vikram Malhotra departed India on Swiss Air Flight LX-147 at 14:30 IST on 14 March 2024.",
        category="Fact",
        verification_status="VERIFIED",
        document_id_str="FIR_204_2024_CBI_ChargeSheet.pdf",
        page_number=1,
        paragraph_id=para3.id,
        source_text=para3.text
    )

    Finding.objects.create(
        case=case_obj,
        fact_statement="Transaction TXN-99812 for Rs 3.4 Crores was executed under the digital key of Co-Accused Siddharth Verma from Geneva IP 194.230.145.12.",
        category="Financial Fact",
        verification_status="VERIFIED",
        document_id_str="Forensic_Audit_Report_KPMG_2024.pdf",
        page_number=3,
        paragraph_id=para4.id,
        source_text=para4.text
    )

    # 6. Create Timeline Events
    TimelineEvent.objects.create(
        case=case_obj,
        date_str="14 March 2024, 14:30 IST",
        title="Vikram Malhotra Flight Departure to Zurich",
        description="Immigration passport logs confirm Vikram Malhotra boarded Flight LX-147 to Zurich.",
        document=doc1,
        document_id_str="FIR_204_2024_CBI_ChargeSheet.pdf",
        page_number=1,
        paragraph_id=para3.id,
        source_text=para3.text,
        has_conflict=False
    )

    TimelineEvent.objects.create(
        case=case_obj,
        date_str="15 March 2024, 11:00 IST",
        title="Alleged New Delhi Physical Office Meeting",
        description="Prosecution alleges Vikram Malhotra chaired board meeting in New Delhi office.",
        document=doc1,
        document_id_str="FIR_204_2024_CBI_ChargeSheet.pdf",
        page_number=1,
        paragraph_id=para1.id,
        source_text=para1.text,
        has_conflict=True,
        conflict_details="Contradicted by Flight LX-147 immigration log confirming physical presence in Switzerland."
    )

    TimelineEvent.objects.create(
        case=case_obj,
        date_str="15 March 2024, 16:15 IST",
        title="Debit of Rs 3.4 Crores via Digital Signature",
        description="Wire transfer debited to Alpine Capital Holdings authorized by Siddharth Verma's key from Geneva IP.",
        document=doc2,
        document_id_str="Forensic_Audit_Report_KPMG_2024.pdf",
        page_number=3,
        paragraph_id=para4.id,
        source_text=para4.text,
        has_conflict=True,
        conflict_details="Contradicted by Witness Deposition where Siddharth Verma denies executing transaction."
    )

    # 7. Create Contradiction Radar Items
    Contradiction.objects.create(
        case=case_obj,
        category="LOCATIONS",
        title="Physical Alibi vs. Prosecution Office Allegation",
        description="Prosecution alleges Vikram Malhotra was physically present in New Delhi office on 15 March 2024, whereas official immigration records prove departure to Zurich on 14 March 2024.",
        source_a_doc=doc1,
        source_a_doc_name="FIR_204_2024_CBI_ChargeSheet.pdf",
        source_a_page=1,
        source_a_para=para1.id,
        source_a_text=para1.text,
        source_b_doc=doc1,
        source_b_doc_name="FIR_204_2024_CBI_ChargeSheet.pdf (Immigration Annexure)",
        source_b_page=1,
        source_b_para=para3.id,
        source_b_text=para3.text,
        severity="HIGH"
    )

    Contradiction.objects.create(
        case=case_obj,
        category="RELATIONSHIPS",
        title="Digital Key Authorization vs Witness Deposition",
        description="Forensic Audit attributes digital signature authorization to Siddharth Verma's key, whereas Siddharth Verma testifies under oath that he never touched the security token.",
        source_a_doc=doc2,
        source_a_doc_name="Forensic_Audit_Report_KPMG_2024.pdf",
        source_a_page=3,
        source_a_para=para4.id,
        source_a_text=para4.text,
        source_b_doc=doc4,
        source_b_doc_name="Witness_Deposition_Siddharth_Verma.pdf",
        source_b_page=2,
        source_b_para=para6.id,
        source_b_text=para6.text,
        severity="HIGH"
    )

    # 8. Create Missing Information Items
    MissingInformation.objects.create(
        case=case_obj,
        topic="CCTV Video Recording of ICICI Bank Branch",
        category="MISSING",
        reason_flagged="Prosecution asserts physical branch visit by Accused No. 1 on 15 March 2024, but no CCTV footage or visitor log register was submitted in case file.",
        impact_assessment="Critical to disprove physical branch visit allegations.",
        required_evidence_type="Certified Section 65B Digital Media File"
    )

    MissingInformation.objects.create(
        case=case_obj,
        topic="Certified Section 65B Certificate for Geneva IP Log",
        category="MISSING",
        reason_flagged="KPMG Forensic Audit cites Geneva IP 194.230.145.12, but lacks mandatory statutory Certificate under Section 65B of Indian Evidence Act.",
        impact_assessment="Inadmissibility challenge under statutory rules.",
        required_evidence_type="Statutory 65B Evidence Certificate"
    )

    MissingInformation.objects.create(
        case=case_obj,
        topic="Swiss Air Flight LX-147 Passenger Manifest Confirmation",
        category="CONFIRMED",
        reason_flagged="Confirmed via official Passport Immigration Log IND-88712 attached in Annexure 4.",
        impact_assessment="Fully establishes physical absence from jurisdiction.",
        required_evidence_type="Immigration Record"
    )

    # 9. Create Evidence Graph Nodes & Edges (React Flow Topology)
    n1 = GraphNode.objects.create(case=case_obj, node_id="person_vikram", label="Vikram Malhotra (Accused No. 1)", type="Person", properties_json=json.dumps({"role": "Promoter & Accused", "location": "Zurich"}))
    n2 = GraphNode.objects.create(case=case_obj, node_id="person_siddharth", label="Siddharth Verma (Co-Accused / Witness)", type="Person", properties_json=json.dumps({"role": "Director & Token Holder"}))
    n3 = GraphNode.objects.create(case=case_obj, node_id="doc_chargesheet", label="CBI ChargeSheet FIR 204/2024", type="Document", properties_json=json.dumps({"pages": 14}))
    n4 = GraphNode.objects.create(case=case_obj, node_id="doc_kpmg", label="KPMG Forensic Audit Report", type="Document", properties_json=json.dumps({"pages": 28}))
    n5 = GraphNode.objects.create(case=case_obj, node_id="event_flight", label="Flight LX-147 to Zurich (14 Mar 2024)", type="Event", properties_json=json.dumps({"date": "14 March 2024"}))
    n6 = GraphNode.objects.create(case=case_obj, node_id="claim_alibi", label="Claim: Flight Alibi Verified", type="Claim", properties_json=json.dumps({"status": "VERIFIED"}))
    n7 = GraphNode.objects.create(case=case_obj, node_id="ev_transfer", label="Wire Transfer Rs 3.4 Cr (TXN-99812)", type="Evidence", properties_json=json.dumps({"amount": "Rs 3.4 Crores"}))

    GraphEdge.objects.create(case=case_obj, source="doc_chargesheet", target="event_flight", relationship="Derived From", details="Page 1 Paragraph 3")
    GraphEdge.objects.create(case=case_obj, source="event_flight", target="claim_alibi", relationship="Supports", details="Proves physical absence from India")
    GraphEdge.objects.create(case=case_obj, source="person_vikram", target="claim_alibi", relationship="References", details="Accused No. 1 Alibi")
    GraphEdge.objects.create(case=case_obj, source="doc_kpmg", target="ev_transfer", relationship="References", details="Geneva IP Log Analysis")
    GraphEdge.objects.create(case=case_obj, source="person_siddharth", target="ev_transfer", relationship="Contradicts", details="Disputes key authorization under oath")

    # 10. Agent Activity Panel Logs
    AgentStep.objects.create(case=case_obj, agent_name="Planner", display_title="✓ Case Strategy & Corpus Map Built", status="COMPLETED", details_summary="Loaded 4 documents, 57 pages, 89 paragraphs.")
    AgentStep.objects.create(case=case_obj, agent_name="Retriever", display_title="✓ Hybrid Retrieval & Vector Indexing Complete", status="COMPLETED", details_summary="BM25 + Dense Embeddings initialized.")
    AgentStep.objects.create(case=case_obj, agent_name="Fact Extractor", display_title="✓ Key Facts & Entities Extracted", status="COMPLETED", details_summary="Extracted 8 core entities and 14 verified claims.")
    AgentStep.objects.create(case=case_obj, agent_name="Timeline Builder", display_title="✓ Event Timeline Built with Conflict Markers", status="COMPLETED", details_summary="Generated chronological sequence 14-20 March 2024.")
    AgentStep.objects.create(case=case_obj, agent_name="Contradiction Detector", display_title="✓ Contradictions Detected (2 High Severity)", status="COMPLETED", details_summary="Flagged Location & Token Authorization conflicts.")
    AgentStep.objects.create(case=case_obj, agent_name="Missing Info Detector", display_title="✓ Missing Information Audit Complete", status="COMPLETED", details_summary="Flagged 2 missing statutory evidence items.")
    AgentStep.objects.create(case=case_obj, agent_name="Verifier", display_title="✓ Verification Gate Execution Complete", status="COMPLETED", details_summary="Every conclusion strictly bound to source text.")

    print("Seed data successfully populated!")
    return case_obj
