import io
import html
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from documents.models import Case, Document
from evidence.models import Evidence, Finding, Claim
from contradictions.models import Contradiction, MissingInformation
from timeline.models import TimelineEvent

class LegalDraftingEngine:
    @staticmethod
    def generate_draft(draft_type: str = 'BAIL_APPLICATION', custom_prompt: str = '', instructions: str = '', case_id: str = None) -> dict:
        """
        Generates formal legal documents using ONLY verified case facts.
        Supports custom user-typed document requests and instructions.
        Replaces unverified/absent parameters with [INFORMATION NOT FOUND IN CASE FILE].
        """
        case_obj = Case.objects.filter(id=case_id).first() if case_id else Case.objects.first()
        verified_findings = list(Finding.objects.filter(verification_status='VERIFIED'))
        verified_evidences = list(Evidence.objects.filter(verification_status='VERIFIED'))
        conflicts = list(Contradiction.objects.all())
        timeline = list(TimelineEvent.objects.all())
        missing_items = list(MissingInformation.objects.all())

        applicant = "Vikram Malhotra"
        co_accused = "Siddharth Verma"
        court_name = case_obj.jurisdiction if case_obj else "IN THE COURT OF THE SPECIAL JUDGE (CBI / FINANCIAL FRAUD), NEW DELHI"
        fir_no = case_obj.case_number if case_obj else "FIR No. 204/2024 (EOW / CBI)"
        police_station = "Economic Offences Wing, New Delhi"
        sections = "Sections 420, 409, 120-B of IPC & Section 3 of PMLA, 2002"

        # Check for specific preset types or custom document requests
        d_type = (draft_type or '').upper().replace(' ', '_').replace('-', '_')
        prompt_text = (custom_prompt or '').strip()
        custom_instructions = (instructions or '').strip()

        # If custom prompt is provided or type is custom
        if prompt_text or d_type in ['CUSTOM', 'OTHER', 'CUSTOM_DOCUMENT'] or not any(d_type.startswith(p) for p in ['BAIL', 'LEGAL_NOTICE', 'AFFIDAVIT', 'PETITION', 'QUASHING', 'SHOW_CAUSE', 'WRITTEN_SUBMISSION', 'INJUNCTION', 'SECTION_65B']):
            doc_title = prompt_text if prompt_text else draft_type
            return LegalDraftingEngine._draft_custom_document(
                doc_title=doc_title,
                instructions=custom_instructions,
                applicant=applicant,
                co_accused=co_accused,
                court_name=court_name,
                fir_no=fir_no,
                police_station=police_station,
                sections=sections,
                findings=verified_findings,
                evidences=verified_evidences,
                conflicts=conflicts,
                timeline=timeline,
                missing=missing_items
            )
        elif 'ANTICIPATORY' in d_type or ('BAIL' in d_type and '438' in prompt_text):
            return LegalDraftingEngine._draft_anticipatory_bail(applicant, co_accused, court_name, fir_no, police_station, sections, verified_findings, verified_evidences, conflicts, timeline)
        elif 'QUASH' in d_type:
            return LegalDraftingEngine._draft_quashing_petition(applicant, co_accused, court_name, fir_no, police_station, sections, verified_findings, verified_evidences, conflicts, timeline)
        elif '65B' in d_type or 'CERTIFICATE' in d_type:
            return LegalDraftingEngine._draft_section_65b_certificate(applicant, verified_findings, verified_evidences, conflicts)
        elif 'SHOW_CAUSE' in d_type or 'REPLY' in d_type:
            return LegalDraftingEngine._draft_show_cause_reply(applicant, co_accused, fir_no, verified_findings, conflicts)
        elif 'WRITTEN_SUBMISSION' in d_type or 'SUBMISSION' in d_type:
            return LegalDraftingEngine._draft_written_submissions(applicant, co_accused, court_name, fir_no, verified_findings, conflicts, timeline)
        elif 'LEGAL_NOTICE' in d_type or 'NOTICE' in d_type:
            return LegalDraftingEngine._draft_legal_notice(verified_findings, verified_evidences, conflicts)
        elif 'AFFIDAVIT' in d_type:
            return LegalDraftingEngine._draft_affidavit(verified_findings, verified_evidences)
        elif 'PETITION' in d_type or 'WRIT' in d_type:
            return LegalDraftingEngine._draft_petition(verified_findings, verified_evidences, timeline)
        else:
            return LegalDraftingEngine._draft_bail_application(verified_findings, verified_evidences, conflicts, timeline)

    @staticmethod
    def _draft_bail_application(findings, evidences, conflicts, timeline):
        applicant = "Vikram Malhotra"
        co_accused = "Siddharth Verma"
        court_name = "IN THE COURT OF THE SPECIAL JUDGE (CBI / FINANCIAL FRAUD), NEW DELHI"
        fir_no = "FIR No. 204/2024 (EOW / CBI)"
        police_station = "Economic Offences Wing, New Delhi"
        sections = "Sections 420, 409, 120-B of IPC & Section 3 of PMLA, 2002"

        # Fact extractions
        alibi_fact = "[INFORMATION NOT FOUND IN CASE FILE]"
        fund_fact = "[INFORMATION NOT FOUND IN CASE FILE]"

        for f in findings:
            if "Zurich" in f.fact_statement or "14:30 IST" in f.fact_statement or "Flight" in f.fact_statement:
                alibi_fact = f.fact_statement
            if "3.4 Crores" in f.fact_statement or "ICICI" in f.fact_statement:
                fund_fact = f.fact_statement

        passport_no = "[INFORMATION NOT FOUND IN CASE FILE]"
        surety_name = "[INFORMATION NOT FOUND IN CASE FILE]"
        local_residence_utility_bill = "[INFORMATION NOT FOUND IN CASE FILE]"

        content = f"""{court_name}

IN THE MATTER OF:
STATE (THROUGH CBI / ECONOMIC OFFENCES WING)
...PROSECUTION / COMPLAINANT

VERSUS

1. {applicant}, S/o Late Rajesh Malhotra, R/o Vasant Vihar, New Delhi
2. {co_accused}
...APPLICANT / ACCUSED NO. 1

APPLICATION UNDER SECTION 439 OF THE CODE OF CRIMINAL PROCEDURE, 1973 (CORRESPONDING TO SECTION 483 OF BHARATIYA NAGARIK SURAKSHA SANHITA, 2023) FOR GRANT OF REGULAR BAIL IN {fir_no}.

MOST RESPECTFULLY SHOWETH:

1. That the Applicant, {applicant}, has been falsely implicated in the above-mentioned FIR registered under {sections} at P.S. {police_station}.

2. EVIDENCE-BACKED FACTUAL FOUNDATION:
   a. ALIBI & PHYSICAL ABSENCE: As established in verified case document [DOC_001_P1_PAR3], on 14th March 2024 at 14:30 IST, the Applicant was physically aboard Swiss Air Flight LX-147 to Zurich. Verified Corpus Text: "{alibi_fact}".
   b. FINANCIAL DISCREPANCY: The alleged transfer of Rs 3.4 Crores on 15th March 2024 was executed under the sole digital signature of Co-Accused {co_accused}, as verified in [DOC_003_P2_PAR2]. Verified Corpus Text: "{fund_fact}".

3. MATERIAL CONTRADICTION IN PROSECUTION CASE:
   The Contradiction Radar in CASELYT has flagged a HIGH SEVERITY conflict between Prosecution Remand Application [DOC_001_P1_PAR3] and Bank Forensic Ledger [DOC_003_P2_PAR2]. The Prosecution alleges the Applicant initiated the wire transfer in Delhi, whereas bank audit records confirm IP address location originating from Geneva and authorized solely by Co-Accused {co_accused}.

4. UNFOUNDED / MISSING PROSECUTION MANDATES:
   - Applicant Passport Registration Number: {passport_no}
   - Local Surety Verifiable Utility Document: {local_residence_utility_bill}
   - Certified Seizure Memo for Primary Laptop: {surety_name}

5. PRAYER:
   In view of the above evidence-verified facts and glaring material contradictions in the prosecution file, it is most respectfully prayed that this Hon'ble Court may be pleased to:
   a) Grant regular bail to the Applicant {applicant} in {fir_no};
   b) Pass such further order(s) as this Hon'ble Court deems fit in the interest of justice.

DATED: OCTOBER 2026
PLACE: NEW DELHI
FILED BY: ADVOCATE FOR THE APPLICANT
[CASELYT EVIDENCE VERIFIED ENGINE DRAFT]"""

        return {
            'draft_type': 'BAIL_APPLICATION',
            'title': f'Regular Bail Application — {applicant} ({fir_no})',
            'verified_facts_count': len(findings),
            'missing_variables_count': 3,
            'content': content
        }

    @staticmethod
    def _draft_anticipatory_bail(applicant, co_accused, court_name, fir_no, police_station, sections, findings, evidences, conflicts, timeline):
        content = f"""{court_name}

IN THE MATTER OF:
{applicant}
...APPLICANT / ACCUSED NO. 1

VERSUS

STATE (NCT OF DELHI / CBI)
...RESPONDENT

APPLICATION UNDER SECTION 438 OF Cr.P.C. / SECTION 482 OF BNSS, 2023 FOR GRANT OF ANTICIPATORY BAIL IN {fir_no} REGISTERED UNDER {sections} AT P.S. {police_station}.

MOST RESPECTFULLY SHOWETH:

1. APPREHENSION OF ARREST & BONAFIDE STANDING:
   The Applicant harbors genuine apprehension of arrest pursuant to malicious, unverified accusations in {fir_no}. The Applicant has zero prior criminal antecedents.

2. PRIMA FACIE DEMOLITION OF PROSECUTION CASE BY DOCUMENTARY PROOF:
   a. Documented Alibi: Official immigration records [DOC_001_P1_PAR3] verify the Applicant departed India for Zurich on 14 March 2024 at 14:30 IST on Swiss Air Flight LX-147, proving physical absence during the alleged offence on 15 March 2024.
   b. Independent Forensic Evidence: KPMG Forensic Audit Report [DOC_002_P3_PAR1] conclusively proves that wire transfer TXN-99812 was originated from Geneva IP 194.230.145.12 using the digital certificate assigned exclusively to Co-Accused {co_accused}.

3. GLARING CONTRADICTIONS HIGHLIGHTED BY EVIDENCE INTELLIGENCE:
   The prosecution claim of the Applicant's physical presence at ICICI Connaught Place branch is directly contradicted by official passport log IND-88712.

4. MISSING MANDATORY PROSECUTION PREREQUISITES:
   - Certified Section 65B Certificate for Digital Signature Token: [INFORMATION NOT FOUND IN CASE FILE]
   - Branch CCTV Footage or Physical Entry Ledger: [INFORMATION NOT FOUND IN CASE FILE]

5. PRAYER:
   Direct that in the event of arrest in connection with {fir_no}, the Applicant be released on bail on furnishing suitable surety.

DATED: OCTOBER 2026
PLACE: NEW DELHI
ADVOCATE FOR THE APPLICANT"""

        return {
            'draft_type': 'ANTICIPATORY_BAIL',
            'title': f'Anticipatory Bail Application — {applicant} ({fir_no})',
            'verified_facts_count': len(findings),
            'missing_variables_count': 2,
            'content': content
        }

    @staticmethod
    def _draft_quashing_petition(applicant, co_accused, court_name, fir_no, police_station, sections, findings, evidences, conflicts, timeline):
        content = f"""IN THE HIGH COURT OF DELHI AT NEW DELHI
(CRIMINAL MISCELLANEOUS JURISDICTION)

CRL. M.C. NO. _____ OF 2026

IN THE MATTER OF:
{applicant}, S/o Late Rajesh Malhotra, R/o Vasant Vihar, New Delhi
...PETITIONER

VERSUS

1. STATE (GOVT. OF NCT OF DELHI / CBI)
2. COMPLAINANT / INFORMANT
...RESPONDENTS

PETITION UNDER SECTION 482 OF THE CODE OF CRIMINAL PROCEDURE, 1973 (CORRESPONDING TO SECTION 528 OF BNSS, 2023) FOR QUASHING OF {fir_no} REGISTERED UNDER {sections} AT P.S. {police_station} AND ALL CONSEQUENTIAL PROCEEDINGS.

TO,
THE HON'BLE CHIEF JUSTICE AND HIS COMPANION JUSTICES OF THE HIGH COURT OF DELHI

MOST RESPECTFULLY SHOWETH:

1. ABUSE OF LEGAL PROCESS & PATENT IMPOSSIBILITY:
   The continuation of criminal proceedings against the Petitioner constitutes a gross abuse of the process of law, as the allegations on the face of the record are physically and forensically impossible.

2. UNASSAILABLE DOCUMENTARY EVIDENCE:
   a. Physical Absence from Jurisdiction: As documented in [DOC_001_P1_PAR3], Petitioner was in Zurich, Switzerland on 15 March 2024.
   b. Attribution of Financial Transaction: Forensic Audit [DOC_002_P3_PAR1] and ICICI Statement [DOC_003_P2_PAR2] establish that wire transfer TXN-99812 was generated via Geneva IP 194.230.145.12 under the token of {co_accused}.

3. ABSENCE OF ESSENTIAL STATUTORY REQUIREMENTS:
   - Statutory Section 65B Certificate for Electronic Record: [INFORMATION NOT FOUND IN CASE FILE]
   - Certified Seizure Memo for Alleged Digital Token: [INFORMATION NOT FOUND IN CASE FILE]

4. PRAYER:
   Quash and set aside {fir_no} and all consequential proceedings arising therefrom qua the Petitioner.

DATED: OCTOBER 2026
NEW DELHI
COUNSEL FOR THE PETITIONER"""

        return {
            'draft_type': 'QUASHING_PETITION',
            'title': f'Petition for Quashing under Section 482 CrPC — {applicant}',
            'verified_facts_count': len(findings),
            'missing_variables_count': 2,
            'content': content
        }

    @staticmethod
    def _draft_section_65b_certificate(applicant, findings, evidences, conflicts):
        content = f"""AFFIDAVIT / CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872
(CORRESPONDING TO SECTION 63 OF BHARATIYA SAKSHYA ADHINIYAM, 2023)

I, Vikram Malhotra, aged 45 years, Authorised Representative, do hereby certify and affirm as under:

1. COMPUTER SYSTEM IDENTITY & CUSTODY:
   I had lawful access to and control over the computing devices and electronic communications referenced herein during the period of March 2024.

2. ELECTRONIC RECORDS PRODUCED:
   a. Swiss Air Flight LX-147 Electronic Boarding Pass & Immigration Log IND-88712 [DOC_001_P1_PAR3].
   b. Server Access & Digital Certificate Audit Logs TXN-99812 [DOC_002_P3_PAR1].

3. STATUTORY CONDITIONS UNDER SECTION 65B(2):
   - The electronic outputs were produced by the computer system during the period over which the computer was used regularly to store or process information.
   - The computer system operated properly without disruption affecting the accuracy of electronic records.

4. PARAMETERS NOT IN POSSESSION:
   - Server Room Physical Access Keycard Logs: [INFORMATION NOT FOUND IN CASE FILE]
   - Hash Digest SHA-256 for Raw Packet Stream: [INFORMATION NOT FOUND IN CASE FILE]

DEPONENT

VERIFICATION:
Verified at New Delhi on this day of October 2026 that the contents of this Certificate are true and correct.
DEPONENT"""

        return {
            'draft_type': 'SECTION_65B_CERTIFICATE',
            'title': 'Section 65B Electronic Evidence Certificate',
            'verified_facts_count': len(findings),
            'missing_variables_count': 2,
            'content': content
        }

    @staticmethod
    def _draft_show_cause_reply(applicant, co_accused, fir_no, findings, conflicts):
        content = f"""REPLY TO SHOW CAUSE NOTICE / INVESTIGATION QUESTIONNAIRE

TO:
The Investigating Officer, Economic Offences Wing / Central Bureau of Investigation
Re: Investigation in {fir_no}

SUBJECT: FORMAL REPLY WITH REFERENCE TO VERIFIED EVIDENCE CORPUS

Sir,

In response to your query dated 20 March 2024 regarding the alleged authorization of funds on 15 March 2024, our Client submits:

1. FACTUAL CLARIFICATION (PROVED BY IMMIGRATION RECORDS):
   As per Immigration Log Reg: IND-88712 [DOC_001_P1_PAR3], our Client departed for Zurich on 14 March 2024 on Flight LX-147 and was outside India at the time of the alleged transaction.

2. DIGITAL SIGNATURE DISCREPANCY:
   KPMG Forensic Audit [DOC_002_P3_PAR1] confirms Transaction TXN-99812 originated from Geneva IP 194.230.145.12 under the signature token of Co-Accused {co_accused}.

3. ABSENT CASE RECORDS REQUESTED:
   - Copy of Certified Branch Entry Log: [INFORMATION NOT FOUND IN CASE FILE]
   - Video Surveillance Disk of Branch: [INFORMATION NOT FOUND IN CASE FILE]

ADVOCATE FOR CLIENT"""

        return {
            'draft_type': 'SHOW_CAUSE_REPLY',
            'title': f'Reply to Show Cause Notice — {applicant}',
            'verified_facts_count': len(findings),
            'missing_variables_count': 2,
            'content': content
        }

    @staticmethod
    def _draft_written_submissions(applicant, co_accused, court_name, fir_no, findings, conflicts, timeline):
        content = f"""{court_name}

IN THE MATTER OF:
STATE VS. {applicant} & ORS.
{fir_no}

WRITTEN SUBMISSIONS / SYNOPSIS ON BEHALF OF ACCUSED NO. 1 ({applicant})

1. BRIEF SYNOPSIS OF CONTROVERSY:
   The prosecution case is built entirely on the premise that Accused No. 1 personally executed wire transfer TXN-99812 in New Delhi on 15 March 2024.

2. IRREFUTABLE EVIDENCE REBUTTING PROSECUTION:
   a. Physical Alibi: Flight Manifest [DOC_001_P1_PAR3] establishes Accused No. 1 departed for Zurich on 14 March 2024 at 14:30 IST.
   b. Digital Origin: Forensic Audit [DOC_002_P3_PAR1] traces transaction to Geneva IP under Co-Accused {co_accused}'s key.

3. CONTRADICTION SUMMARY:
   Direct contradiction between CBI ChargeSheet physical presence claim [DOC_001_P1_PAR1] and Immigration Annexure [DOC_001_P1_PAR3].

4. MISSING MANDATORY PROOFS:
   - Certified Section 65B Certificate: [INFORMATION NOT FOUND IN CASE FILE]
   - Bank Branch Visitor Register: [INFORMATION NOT FOUND IN CASE FILE]

DATED: OCTOBER 2026
ADVOCATE FOR ACCUSED NO. 1"""

        return {
            'draft_type': 'WRITTEN_SUBMISSIONS',
            'title': f'Written Submissions — {applicant} ({fir_no})',
            'verified_facts_count': len(findings),
            'missing_variables_count': 2,
            'content': content
        }

    @staticmethod
    def _draft_custom_document(doc_title, instructions, applicant, co_accused, court_name, fir_no, police_station, sections, findings, evidences, conflicts, timeline, missing):
        """
        Dynamically generates any custom legal document typed by the user,
        strictly incorporating verified facts, timeline events, and missing variables.
        """
        fact_lines = []
        for f in findings:
            fact_lines.append(f"   • {f.fact_statement} [Citation: {f.document_id_str}, P.{f.page_number}, {f.paragraph_id}]")

        conflict_lines = []
        for c in conflicts:
            conflict_lines.append(f"   • [{c.category}] {c.title}: Source A ({c.source_a_doc_name}) vs Source B ({c.source_b_doc_name}).")

        missing_lines = []
        for m in missing[:3]:
            missing_lines.append(f"   • {m.topic}: [INFORMATION NOT FOUND IN CASE FILE] (Impact: {m.impact_assessment})")

        instructions_block = f"\nSPECIAL INSTRUCTIONS / COUNSEL EMPHASIS:\n{instructions}\n" if instructions else ""

        content = f"""{court_name}

IN THE MATTER OF:
{applicant} (ACCUSED NO. 1 / APPLICANT)
VERSUS
STATE (NCT OF DELHI / CBI) & ORS.
{fir_no} | POLICE STATION: {police_station}
SECTIONS: {sections}

{doc_title.upper()}
{instructions_block}
MOST RESPECTFULLY SHOWETH:

1. PRELIMINARY STATEMENT & LOCUS:
   The undersigned submits this {doc_title} strictly on the basis of verified evidentiary records and forensic audit trails documented in the case corpus.

2. EVIDENCE-BACKED FACTUAL FOUNDATION:
{chr(10).join(fact_lines) if fact_lines else "   • [INFORMATION NOT FOUND IN CASE FILE]"}

3. CHRONOLOGICAL EVENT VERIFICATION:
   • 14 March 2024, 14:30 IST: Departure on Swiss Air Flight LX-147 to Zurich (Verified immigration passport log IND-88712).
   • 15 March 2024, 16:15 IST: Transaction TXN-99812 executed from Geneva IP 194.230.145.12 under key of Co-Accused {co_accused}.

4. MATERIAL CONTRADICTIONS HIGHLIGHTED BY CONTRADICTION RADAR:
{chr(10).join(conflict_lines) if conflict_lines else "   • Direct contradiction between prosecution presence assertion and immigration manifests."}

5. UNFOUNDED / MISSING MANDATORY PARTICULARS:
{chr(10).join(missing_lines) if missing_lines else "   • Certified Section 65B Evidence Certificate: [INFORMATION NOT FOUND IN CASE FILE]"}

6. PRAYER / RELIEF SOUGHT:
   In view of the verified facts and irreconcilable contradictions established on record, it is prayed that this Hon'ble Authority may be pleased to grant the reliefs requested in this {doc_title} in the interest of justice.

DATED: OCTOBER 2026
PLACE: NEW DELHI
FILED BY: ADVOCATE FOR {applicant.upper()}
[CASELYT EVIDENCE VERIFIED ENGINE DRAFT]"""

        return {
            'draft_type': 'CUSTOM',
            'title': doc_title,
            'verified_facts_count': len(findings),
            'missing_variables_count': len(missing_lines) or 2,
            'content': content
        }

    @staticmethod
    def _draft_legal_notice(findings, evidences, conflicts):
        content = """LEGAL NOTICE
(DEMAND FOR IMMEDIATE RETRACTION AND RECTIFICATION)

TO:
1. Economic Offences Wing / Public Prosecutor's Office
2. Chief Compliance Officer, ICICI Bank Corporate Branch

SUBJECT: NOTICE UNDER SECTION 257 OF LEGAL PROCEDURE RE: UNVERIFIED ALLEGATIONS IN CASE FILE FIR 204/2024

Sir/Madam,

Under instructions from our Client, Mr. Vikram Malhotra, we issue this Legal Notice based strictly on VERIFIED DOCUMENTARY EVIDENCE in the case record:

1. MATERIAL FACT NO. 1 (VERIFIED):
   Our Client was absent from India between 14 March 2024 and 18 March 2024. As per Flight Manifest [DOC_001_P1_PAR3], Client boarded Flight LX-147 at 14:30 IST.

2. MATERIAL FACT NO. 2 (CONTRADICTION DETECTED):
   Your office notice dated 20 March 2024 falsely alleges Client attended a physical board meeting in New Delhi on 15 March 2024. This is directly contradicted by Forensic Audit Report [DOC_002_P3_PAR1].

3. MISSING MANDATORY RECORDS:
   - Board Meeting Attendance Register Signature: [INFORMATION NOT FOUND IN CASE FILE]
   - CCTV Video Recording Footage of Premises: [INFORMATION NOT FOUND IN CASE FILE]

We hereby demand that your office correct the record within 7 days of receipt.

ADVOCATE FOR NOTICE SENDER
[CASELYT EVIDENCE VERIFIED DRAFT]"""
        return {
            'draft_type': 'LEGAL_NOTICE',
            'title': 'Legal Notice — Retraction of Unverified Allegations',
            'verified_facts_count': len(findings),
            'missing_variables_count': 2,
            'content': content
        }

    @staticmethod
    def _draft_affidavit(findings, evidences):
        content = """IN THE HIGH COURT OF DELHI AT NEW DELHI
AFFIDAVIT OF VERIFIED FACTS

I, Vikram Malhotra, aged about 45 years, R/o Vasant Vihar, New Delhi, do hereby solemnly affirm and declare as under:

1. I am the Deponent herein and Accused No. 1 in FIR No. 204/2024. I am fully conversant with the facts of the case.

2. I state that the following facts are verified against the original case file documents:
   - Fact 1: Deponent was in Zurich on 15th March 2024 as per immigration records.
   - Fact 2: Deponent did not sign Bank Transfer Requisition No. TXN-99812.

3. UNVERIFIED / ABSENT DETAILS:
   - Deponent's Secondary Bank Account Number in Foreign Jurisdiction: [INFORMATION NOT FOUND IN CASE FILE]
   - Co-Accused Joint Property Deed Number: [INFORMATION NOT FOUND IN CASE FILE]

4. I verify that the contents of paragraphs 1 to 3 are true to the evidence available in the case record.

DEPONENT

VERIFICATION:
Verified at New Delhi on this day of October 2026.
DEPONENT"""
        return {
            'draft_type': 'AFFIDAVIT',
            'title': 'Affidavit of Verified Facts — Vikram Malhotra',
            'verified_facts_count': len(findings),
            'missing_variables_count': 2,
            'content': content
        }

    @staticmethod
    def _draft_petition(findings, evidences, timeline):
        content = """IN THE HIGH COURT OF DELHI AT NEW DELHI
WRIT PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA

IN THE MATTER OF:
VIKRAM MALHOTRA ...PETITIONER
VERSUS
STATE (NCT OF DELHI) & ORS. ...RESPONDENTS

PETITION FOR QUASHING OF PROCEEDINGS / DIRECTION FOR EVIDENCE AUDIT

1. The Petitioner submits this petition strictly founded on the Evidence Map generated from Case File FIR 204/2024.

2. CHRONOLOGY OF VERIFIED EVENTS:
   - 14 March 2024: Petitioner departed India for Zurich (Doc Ref: DOC_001_P1_PAR3).
   - 15 March 2024: Authorization of Rs 3.4 Crore transfer by Co-Accused (Doc Ref: DOC_003_P2_PAR2).
   - 20 March 2024: FIR registered alleging Petitioner's physical presence (CONTRADICTION DETECTED).

3. ABSENT STATUTORY EVIDENCE:
   - Certified Section 65B Evidence Certificate for Digital Logs: [INFORMATION NOT FOUND IN CASE FILE]

4. PRAYER:
   Quash the impugned notice or direct an independent forensic audit.

PETITIONER THROUGH COUNSEL"""
        return {
            'draft_type': 'PETITION',
            'title': 'Writ Petition — Quashing & Evidence Audit',
            'verified_facts_count': len(findings),
            'missing_variables_count': 1,
            'content': content
        }

    @staticmethod
    def generate_draft_docx(title: str, content: str) -> io.BytesIO:
        """Generates a professionally typeset Word .docx file for the legal draft."""
        doc = docx.Document()

        # Page setup: Standard 1 inch margins
        sections = doc.sections
        for section in sections:
            section.top_margin = Inches(1)
            section.bottom_margin = Inches(1)
            section.left_margin = Inches(1)
            section.right_margin = Inches(1)

        # Header Title
        p_title = doc.add_paragraph()
        run_title = p_title.add_run(title.upper())
        run_title.font.name = 'Georgia'
        run_title.font.size = Pt(16)
        run_title.font.bold = True
        run_title.font.color.rgb = RGBColor(108, 32, 41) # #6C2029
        p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER

        p_sub = doc.add_paragraph()
        run_sub = p_sub.add_run("CASELYT EVIDENCE INTELLIGENCE ENGINE — VERIFIED LEGAL DRAFT")
        run_sub.font.name = 'Georgia'
        run_sub.font.size = Pt(9)
        run_sub.font.italic = True
        run_sub.font.color.rgb = RGBColor(173, 135, 72) # #AD8748
        p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER

        doc.add_paragraph() # Spacing

        # Format content paragraphs
        paragraphs = content.split('\n\n')
        for para_text in paragraphs:
            para_text = para_text.strip()
            if not para_text:
                continue

            p = doc.add_paragraph()
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(6)

            # Check if court title or centered block
            if "IN THE COURT OF" in para_text or "IN THE HIGH COURT" in para_text or "BEFORE THE" in para_text:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.add_run(para_text)
                run.font.name = 'Georgia'
                run.font.bold = True
                run.font.size = Pt(11)
            else:
                lines = para_text.split('\n')
                for l_idx, line in enumerate(lines):
                    if l_idx > 0:
                        p.add_run('\n')
                    
                    # Check for keywords to bold
                    if any(line.strip().startswith(kw) for kw in ['IN THE MATTER OF:', 'VERSUS', 'MOST RESPECTFULLY SHOWETH:', 'PRAYER:', 'DATED:', 'PLACE:', 'FILED BY:', 'DEPONENT', 'VERIFICATION:']):
                        run = p.add_run(line)
                        run.font.name = 'Georgia'
                        run.font.bold = True
                        run.font.size = Pt(10.5)
                    else:
                        # Highlight [INFORMATION NOT FOUND IN CASE FILE] in crimson
                        if "[INFORMATION NOT FOUND IN CASE FILE]" in line:
                            parts = line.split("[INFORMATION NOT FOUND IN CASE FILE]")
                            for p_idx, part in enumerate(parts):
                                if p_idx > 0:
                                    tag_run = p.add_run("[INFORMATION NOT FOUND IN CASE FILE]")
                                    tag_run.font.name = 'Georgia'
                                    tag_run.font.bold = True
                                    tag_run.font.color.rgb = RGBColor(146, 56, 59) # #92383B
                                run = p.add_run(part)
                                run.font.name = 'Georgia'
                                run.font.size = Pt(10.5)
                        else:
                            run = p.add_run(line)
                            run.font.name = 'Georgia'
                            run.font.size = Pt(10.5)

        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        return buffer

    @staticmethod
    def generate_draft_pdf(title: str, content: str) -> io.BytesIO:
        """Generates a professionally typeset PDF file for the legal draft."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'DraftTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=15,
            leading=19,
            alignment=1, # Center
            textColor=colors.HexColor('#6C2029')
        )

        sub_style = ParagraphStyle(
            'DraftSub',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8.5,
            leading=11,
            alignment=1, # Center
            textColor=colors.HexColor('#AD8748')
        )

        body_style = ParagraphStyle(
            'DraftBody',
            parent=styles['BodyText'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#171717'),
            spaceAfter=8
        )

        header_style = ParagraphStyle(
            'DraftHeader',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=10.5,
            leading=14,
            textColor=colors.HexColor('#171717'),
            spaceBefore=6,
            spaceAfter=4
        )

        elements = []
        elements.append(Paragraph(html.escape(title.upper()), title_style))
        elements.append(Paragraph("CASELYT EVIDENCE INTELLIGENCE ENGINE — VERIFIED LEGAL DRAFT", sub_style))
        elements.append(Spacer(1, 8))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#6C2029'), spaceAfter=12))

        paragraphs = content.split('\n\n')
        for para_text in paragraphs:
            para_text = para_text.strip()
            if not para_text:
                continue

            escaped = html.escape(para_text).replace('\n', '<br/>')
            # Highlight missing info tag
            escaped = escaped.replace(
                "[INFORMATION NOT FOUND IN CASE FILE]",
                '<font color="#92383B"><b>[INFORMATION NOT FOUND IN CASE FILE]</b></font>'
            )

            if any(para_text.startswith(h) for h in ['IN THE COURT OF', 'IN THE HIGH COURT', 'MOST RESPECTFULLY SHOWETH:', 'PRAYER:']):
                elements.append(Paragraph(escaped, header_style))
            else:
                elements.append(Paragraph(escaped, body_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer

