#!/usr/bin/env python3
"""
Assemble MASTER markdown + compile print-ready PDF of the
Master Diploma Orthopaedics Admission Preparation Guide (Bangladesh 2027).
Reads docs/NN-*.md in book order, writes:
  docs/MASTER-DIPLOMA-ORTHOPAEDICS-2027.md   (copy-paste notes)
  build/Master_Diploma_Orthopaedics_2027.pdf (print-ready)
"""
import os, re, html
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, Preformatted)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(BASE, "docs")
OUT_MD = os.path.join(DOCS, "MASTER-DIPLOMA-ORTHOPAEDICS-2027.md")
OUT_PDF = os.path.join(BASE, "build", "Master_Diploma_Orthopaedics_2027.pdf")

# Book order: front matter, body, appendix (Gemini command)
ORDER = ["00", "02", "03", "04", "05", "06", "07", "08", "09"]
APPENDIX = ["01"]

TITLE = "Master Diploma Orthopaedics Admission Preparation Guide"
SUBTITLE = "Bangladesh 2027 Edition \u2014 Top 100 Sureshot Topics"
TAG = "BMU / BSMMU Diploma & MPhil (July 2026) \u00b7 Residency (March 2026)"

# ---------- fonts ----------
def register_fonts():
    try:
        reg = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
        bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        ital = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf"
        pdfmetrics.registerFont(TTFont("DJ", reg))
        pdfmetrics.registerFont(TTFont("DJ-B", bold))
        pdfmetrics.registerFont(TTFont("DJ-I", ital))
        pdfmetrics.registerFontFamily("DJ", normal="DJ", bold="DJ-B",
                                      italic="DJ-I", boldItalic="DJ-B")
        return "DJ"
    except Exception:
        return "Helvetica"

FONT = register_fonts()

# ---------- text sanitising ----------
EMOJI_REMOVE = {0x1F000 + i for i in range(0x1000)} | {0x2700 + i for i in range(0x100)}
EMOJI_CHARS = set("\U0001F518\U0001F4D8\U0001F4D7\U0001F4D9\U0001F4D4"
                  "\U0001F4C4\U0001F4CB\U0001F52C\U0001F3C6\U0001F5D3"
                  "\u2705\u25B6\u27A1\U0001F51D")  # assorted used emoji

def sanitize(t):
    t = t.replace("\u2b50", "\u2605")  # star
    out = []
    for ch in t:
        o = ord(ch)
        if ch in EMOJI_CHARS or (0x1F000 <= o <= 0x1FFFF) or (0x2700 <= o <= 0x27BF):
            continue
        out.append(ch)
    return "".join(out)

def md_to_html(t):
    t = sanitize(t)
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<!\*)\*(?!\*)(.+?)\*(?!\*)", r"<i>\1</i>", t)
    t = t.replace("\u2192", "\u2192")
    return t

# ---------- styles ----------
ss = getSampleStyleSheet()
NAVY = colors.HexColor("#1F3A5F")
STEEL = colors.HexColor("#2E5A88")
LIGHT = colors.HexColor("#DCE6F1")
GREY = colors.HexColor("#555555")

def style(name, **kw):
    kw.setdefault("fontName", FONT)
    return ParagraphStyle(name, **kw)

H1 = style("H1", parent=ss["Heading1"], fontName=FONT, fontSize=17,
           textColor=NAVY, spaceBefore=14, spaceAfter=8, leading=21)
H2 = style("H2", parent=ss["Heading2"], fontName=FONT, fontSize=13,
           textColor=STEEL, spaceBefore=10, spaceAfter=5, leading=16)
H3 = style("H3", parent=ss["Heading3"], fontName=FONT, fontSize=11,
           textColor=NAVY, spaceBefore=7, spaceAfter=3, leading=14)
BODY = style("BODY", fontSize=9.3, leading=13, alignment=TA_JUSTIFY,
             spaceAfter=4)
BULLET = style("BULLET", fontSize=9.3, leading=13, leftIndent=12,
               bulletIndent=2, spaceAfter=2)
CODE = style("CODE", fontName="Courier", fontSize=7.6, leading=10,
             backColor=colors.HexColor("#F2F2F2"), borderPadding=4,
             textColor=colors.HexColor("#222222"))
CELL = style("CELL", fontSize=8.2, leading=10.5)
CELLH = style("CELLH", fontSize=8.4, leading=10.5, textColor=colors.white,
              fontName=FONT)
COVER_T = style("COVER_T", fontSize=24, leading=29, textColor=NAVY,
                alignment=TA_CENTER, fontName=FONT, spaceAfter=6)
COVER_S = style("COVER_S", fontSize=13, leading=17, textColor=STEEL,
                alignment=TA_CENTER)
COVER_TG = style("COVER_TG", fontSize=10, leading=14, textColor=GREY,
                 alignment=TA_CENTER)

def col_widths(n):
    W = 504
    if n == 2: return [170, 334]
    if n == 3: return [92, 206, 206]
    if n == 4: return [42, 222, 90, 150]
    if n == 5: return [70, 140, 90, 100, 104]
    return [W // n] * n

def parse_table(rows):
    data = []
    header = None
    for r in rows:
        cells = [c.strip() for c in r.strip("|").split("|")]
        if set("".join(cells).replace("-", "").replace(":", "")) == set():
            continue  # separator
        if header is None:
            header = [Paragraph(md_to_html(c), CELLH) for c in cells]
            data.append(header)
        else:
            data.append([Paragraph(md_to_html(c), CELL) for c in cells])
    n = len(data[0]) if data else 2
    tbl = Table(data, colWidths=col_widths(n), hAlign="LEFT", repeatRows=1)
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), STEEL),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#9DB4CC")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#EEF3F9")]),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    return tbl

def parse_doc(path):
    flow = []
    with open(path, encoding="utf-8") as f:
        lines = f.read().split("\n")
    i = 0
    in_code = False
    code_buf = []
    while i < len(lines):
        line = lines[i]
        raw = line.rstrip()
        if raw.startswith("```"):
            if in_code:
                flow.append(Preformatted("\n".join(code_buf), CODE))
                code_buf = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue
        if in_code:
            code_buf.append(raw)
            i += 1
            continue
        if raw.strip() == "":
            flow.append(Spacer(1, 4))
            i += 1
            continue
        if raw.startswith("|") and "|" in raw[1:]:
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(lines[i].rstrip())
                i += 1
            flow.append(parse_table(rows))
            flow.append(Spacer(1, 4))
            continue
        if raw.startswith("# "):
            flow.append(Paragraph(md_to_html(raw[2:]), H1)); i += 1; continue
        if raw.startswith("## "):
            flow.append(Paragraph(md_to_html(raw[3:]), H2)); i += 1; continue
        if raw.startswith("### "):
            flow.append(Paragraph(md_to_html(raw[4:]), H3)); i += 1; continue
        if raw.startswith("> "):
            flow.append(Paragraph(md_to_html(raw[2:]), BODY)); i += 1; continue
        if re.match(r"^\s*[-*]\s+", raw):
            txt = re.sub(r"^\s*[-*]\s+", "", raw)
            flow.append(Paragraph(md_to_html(txt), BULLET, bulletText="\u2022"))
            i += 1; continue
        flow.append(Paragraph(md_to_html(raw), BODY)); i += 1
    return flow

def contents_flow():
    items = [
        "How to Use, Structure & Probability System",
        "Syllabus & Exam-Pattern Analysis (BMU/BSMMU)",
        "Previous-Question Trend Analysis",
        "Top-100 Sureshot Topic Index",
        "Part 1 \u2014 Basic Sciences (25 topics)",
        "Part 2 \u2014 Faculty Surgery (20 topics)",
        "Part 3 \u2014 Orthopaedics High-Yield (45 topics)",
        "Part 4 \u2014 SBA / MCQ Bank (180 questions)",
        "Part 5 \u2014 Rapid Revision, Flowcharts, Image-Based, Exam-Night Chart, 3-Month Plan",
        "Appendix A \u2014 Gemini Deep-Research Command",
    ]
    flow = [Paragraph("CONTENTS", H1), Spacer(1, 6)]
    for idx, it in enumerate(items, 1):
        flow.append(Paragraph(f"<b>{idx}.</b>&nbsp;&nbsp;{it}", BODY))
    flow.append(PageBreak())
    return flow

def cover_flow():
    flow = [Spacer(1, 90)]
    flow.append(Paragraph(TITLE, COVER_T))
    flow.append(Spacer(1, 8))
    flow.append(Paragraph(SUBTITLE, COVER_S))
    flow.append(Spacer(1, 14))
    flow.append(Paragraph(TAG, COVER_TG))
    flow.append(Spacer(1, 26))
    flow.append(Paragraph("A pure suggestion &amp; rapid-revision book for the "
                          "Diploma in Orthopaedics (D.Ortho) entrance MCQ test",
                          COVER_TG))
    flow.append(Spacer(1, 10))
    flow.append(Paragraph("Top 100 sureshot topics \u00b7 Basic Sciences \u00b7 Faculty Surgery \u00b7 "
                          "Orthopaedics High-Yield \u00b7 SBA/MCQ \u00b7 Rapid Revision \u00b7 "
                          "Exam-Night Chart \u00b7 3-Month Plan", COVER_TG))
    flow.append(Spacer(1, 30))
    flow.append(Paragraph("Standard references: Apley \u00b7 Campbell \u00b7 Rockwood &amp; Green \u00b7 "
                          "Miller's Review \u00b7 AO Principles \u00b7 Bailey &amp; Love \u00b7 Schwartz \u00b7 "
                          "Gray's \u00b7 Snell \u00b7 Ganong \u00b7 Guyton \u00b7 Robbins \u00b7 Katzung \u00b7 "
                          "Lippincott", COVER_TG))
    flow.append(Spacer(1, 40))
    flow.append(Paragraph("Compiled: July 2027 \u00b7 Probability-rated (very-high \u2192 rare) "
                          "\u00b7 For self-study use only \u2014 verify against current BMU/BSMMU "
                          "notice &amp; named textbooks before the exam.", COVER_TG))
    flow.append(PageBreak())
    return flow

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont(FONT, 7.5)
    canvas.setFillColor(GREY)
    canvas.drawString(54, 30, TITLE + " \u2014 Bangladesh 2027")
    canvas.drawRightString(letter[0] - 54, 30, "Page %d" % doc.page)
    canvas.setStrokeColor(LIGHT)
    canvas.line(54, 38, letter[0] - 54, 38)
    canvas.restoreState()

def build():
    # assemble master markdown
    md_parts = [f"# {TITLE}\n## {SUBTITLE}\n_{TAG}_\n"]
    for key in ORDER:
        p = os.path.join(DOCS, f"{key}-*.md")
        import glob
        fs = sorted(glob.glob(p))
        if fs:
            with open(fs[0], encoding="utf-8") as f:
                md_parts.append(f.read().rstrip())
    for key in APPENDIX:
        fs = sorted(glob.glob(os.path.join(DOCS, f"{key}-*.md")))
        if fs:
            with open(fs[0], encoding="utf-8") as f:
                md_parts.append("\n\n---\n\n# APPENDIX A \u2014 GEMINI DEEP-RESEARCH COMMAND\n" + f.read().rstrip())
    with open(OUT_MD, "w", encoding="utf-8") as f:
        f.write("\n\n".join(md_parts) + "\n")
    print("Wrote", OUT_MD)

    story = cover_flow()
    story += contents_flow()
    for key in ORDER:
        fs = sorted(glob.glob(os.path.join(DOCS, f"{key}-*.md")))
        if fs:
            story += parse_doc(fs[0])
            story.append(Spacer(1, 6))
    for key in APPENDIX:
        fs = sorted(glob.glob(os.path.join(DOCS, f"{key}-*.md")))
        if fs:
            story.append(PageBreak())
            story.append(Paragraph("APPENDIX A \u2014 GEMINI DEEP-RESEARCH COMMAND", H1))
            story += parse_doc(fs[0])

    doc = SimpleDocTemplate(OUT_PDF, pagesize=letter,
                            leftMargin=54, rightMargin=54,
                            topMargin=54, bottomMargin=48,
                            title=TITLE, author="Arena Agent")
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print("Wrote", OUT_PDF)

if __name__ == "__main__":
    build()
