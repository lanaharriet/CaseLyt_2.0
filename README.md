# CASELYT — Evidence Intelligence Engine

> **Tagline:** Evidence Before Conclusions.  
> **Category:** HNX26EPS01 – Agentic Legal Assistant  
> **Hackathon:** HACKNEX 2026

---

## 🏛️ Mission & Core Philosophy

CASELYT transforms legal case files:
**DOCUMENTS → EVIDENCE → FACTS → TIMELINE → RELATIONSHIPS → CONTRADICTIONS → MISSING INFORMATION → VERIFIED CONCLUSIONS**

### Core Operating Principle
`READ → FIND → REASON → VERIFY → PROVE`

Every conclusion must be 100% traceable to evidence. If evidence is unavailable in the corpus, CASELYT outputs:  
**`"NOT FOUND IN PROVIDED DOCUMENTS"`**

---

## 🎨 Visual & Aesthetic Design
- **Background:** `#F4F0E7` (Parchment Paper)
- **Primary Ink:** `#171717`
- **Legal Crimson Accent:** `#6C2029`
- **Secondary Brass/Gold:** `#AD8748`
- **Status Colors:** Success `#3E654F` | Warning `#A16D2B` | Error `#92383B`
- **Typography:** Headings: *Cormorant Garamond* | Body: *Inter* | Citations: *JetBrains Mono*
- **Design Persona:** Bloomberg Terminal + Investigative Workstation + Legal File Aesthetic

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 5.2 & Django REST Framework
- **Retrieval Engine:** Hybrid BM25 (`rank-bm25`) + Dense Embedding Similarity
- **Document Extractors:** PyMuPDF (`fitz`), `pdfplumber`, `python-docx`, Tesseract OCR Fallback
- **Report Exporters:** ReportLab (PDF) & `python-docx` (DOCX)
- **Database:** SQLite (default zero-config portable run) / PostgreSQL pgvector ready

### Frontend
- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4 (Custom Parchment Theme)
- **Interactive Graph:** React Flow (`@xyflow/react`)
- **Icons:** Lucide React
- **Build Tool:** Vite

---

## 🚀 Quickstart & Demo Setup

### 1. Backend Setup & Launch (Terminal 1)
```bash
cd caselyt
python manage.py migrate
python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'caselyt.settings'); django.setup(); from api.seed_data import populate_seed_data; populate_seed_data()"
python manage.py runserver 8000
```
*Backend runs at `http://localhost:8000/`*

### 2. Frontend Launch (Terminal 2)
```bash
cd frontend
npm run dev
```
*Frontend runs at `http://localhost:3000/`*

---

## ⚖️ Judging Demo Flow

1. **Case Review (Hero Feature):** Explore the 3-column layout with case documents on the left, key facts & timeline in the center, and authoritative citation evidence inspector on the right.
2. **Contradiction Radar:** Click *Inspect Side-by-Side Comparison* to see Source A (CBI ChargeSheet) vs Source B (KPMG Forensic Audit / Witness Deposition) highlighted side-by-side.
3. **Evidence Graph:** Interact with React Flow nodes (`Person`, `Event`, `Claim`, `Document`, `Evidence`) and view relationships (`Supports`, `Contradicts`, `Derived From`).
4. **Research Workspace:** Execute legal queries and observe the 5-stage Verification Gate checklist.
5. **Legal Drafting:** Generate Bail Applications & Legal Notices enforcing `[INFORMATION NOT FOUND IN CASE FILE]` for absent parameters.
6. **Report Export:** Download PDF & DOCX legal dossiers with 1-click.
