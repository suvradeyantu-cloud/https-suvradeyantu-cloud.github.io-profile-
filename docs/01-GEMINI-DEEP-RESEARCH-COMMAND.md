# 🔬 GEMINI DEEP RESEARCH COMMAND (Professional / Copy-Paste Ready)
### Use this prompt in Google Gemini (gemini.google.com → "Deep Research") to independently validate & enrich this book

---

> **INSTRUCTIONS TO USER:** Copy everything between the two `=====` lines and paste into Gemini Deep Research. Replace bracketed `[...]` fields with your specific exam session if needed.

```
=====================================================================
ROLE
You are a senior medical education researcher and orthopaedic residency
examiner with 20+ years of experience preparing candidates for
postgraduate entrance examinations in Bangladesh.

OBJECTIVE
Produce a rigorous, evidence-based research dossier that validates and
extends a "Master Diploma Orthopaedics Admission Preparation Guide
(Bangladesh, 2027 Edition)" for the Diploma in Orthopaedics entrance
examination conducted by Bangladesh Medical University (BMU) / Bangabandhu
Sheikh Mujib Medical University (BSMMU), including affiliated institutes
and NITOR.

CONTEXT
- Target exam: Diploma in Orthopaedics (D.Ortho) admission MCQ test,
  academic session July 2026 / 2027 intake.
- Parallel exams to benchmark: BSMMU MD/MS (Residency) Orthopaedics
  written MCQ (session up to March 2026) and BMU M.Phil Orthopaedics.
- No single fixed public syllabus is published; the test draws from
  MBBS Basic Sciences + Faculty of Surgery + Orthopaedics.
- Candidate profile: MBBS graduates; need high-yield, probability-ranked
  topics, previous-question trends, SBA/MCQ patterns, and references.

RESEARCH TASKS (perform all, cite sources)
T1. Recover and summarise the official BMU/BSMMU Diploma & M.Phil
    admission notices for July 2026: eligibility, seat matrix, exam
    format (marks, number of MCQs, negative marking), and timeline.
T2. Recover BSMMU Residency (Orthopaedics) admission MCQ pattern up to
    March 2026: subject weightage, question style, recurring themes.
T3. Mine publicly available previous-year MCQ/SBA from BMU, BSMMU,
    NITOR, and Bangladesh PG entrance banks; extract the TOP 100 most
    frequently repeated orthopaedic + basic-science + surgery topics.
T4. For each of those 100 topics, assign a yield probability
    (Very High / High / Moderate / Low / Rare) with the rationale based
    on repetition frequency and syllabus weighting.
T5. Identify examiner-favourite SBA stems (e.g., "All are true EXCEPT",
    "Most common...", "Best investigation...", "First-line
    management...") and the classic distractors used in Bangladesh.
T6. Cross-check every factual claim against standard references:
    Apley, Campbell, Rockwood & Green, Miller's Review, AO Principles
    (Ortho); Bailey & Love, Schwartz, Sabiston (Surgery); Gray's, Snell,
    Ganong, Guyton, Robbins, Katzung, Lippincott (Basic Sciences).
T7. Build a "Previous-Question Trend Analysis" table: topic → years
    seen → variant asked → predicted 2027 probability.
T8. Flag any Bangladesh-specific epidemiology (e.g., road-traffic
    trauma, open fractures, spinal TB / Pott's, vitamin-D deficiency,
    rickets, osteomyelitis patterns) that raises yield.

SOURCES (prioritise, in order)
1. bmu.ac.bd and bsmmu.edu.bd official notices
2. NITOR (nitor.gov.bd) academic resources
3. Bangladesh PG medical entrance question banks (doctorsgang,
   medicos community repos, Bengali medical coaching sites)
4. Standard textbooks listed above (verify facts)
5. Cochrane / PubMed for management controversies
6. Orthopaedic society guidelines (AAOS, BOA, BOS)

CONSTRAINTS
- Cite every statistic or claim with [source name / URL].
- Prefer 2020–2026 evidence; note if a fact is older but still standard.
- Distinguish "verified from official notice" vs "derived from question
  banks / examiner lore" — do NOT overstate certainty.
- Output in Markdown, Bangladesh/Bengali-friendly phrasing allowed.
- Flag anything that contradicts this book so the author can correct it.

OUTPUT FORMAT
1. Executive summary (bullet points).
2. Exam-pattern table (BMU Diploma July 2026 vs BSMMU Residency Mar 2026).
3. Subject weightage estimate (Basic Sciences / Surgery / Ortho %).
4. Top-100 topic table: # | Topic | Category | Repeat count | Probability | Key refs.
5. Examiner-favourite SBA stem library (≥30 stems with model answers).
6. Previous-question trend analysis table.
7. Gaps / contradictions vs the existing draft book.
8. Recommended 3-month study weightage per subject.

VALIDATION CRITERIA
- Every probability rating has a stated reason.
- No un-cited "100% common" claim without evidence.
- At least 15 distinct web/PDF sources referenced.
- Output is directly usable to update the preparation book.
=====================================================================
```

---

### 💡 How to use this with the rest of the book
- Paste into Gemini → let it return the dossier → cross-check against `04-TOP-100-INDEX.md`.
- Where Gemini's probability differs from ours, trust the **higher-confidence** source and note it in your revision margin.
- Use Gemini's "Examiner-favourite SBA stem library" to expand `08-SBA-MCQ-BANK.md`.
