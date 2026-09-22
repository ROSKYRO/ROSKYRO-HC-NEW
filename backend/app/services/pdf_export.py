"""
Builds the single consolidated PDF behind the Admin Dashboard's
"Download Full Report (PDF)" button — one table per data set, in the
same order the dashboard's own tabs read left to right, so what's in the
PDF always matches what's on screen.

Kept deliberately dumb: this module only knows how to lay out
(title, columns, rows) sections on a page. All the actual data-fetching
and field selection lives in routers/admin.py, right next to the
existing list endpoints it reuses — so the export never drifts out of
sync with what those endpoints already return.
"""
from datetime import datetime, timezone
from io import BytesIO
from typing import Any, Iterable, Optional, Sequence

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer,
)

# Mirrors the web app's brand tokens (frontend/tailwind.config.js) so the
# export reads as the same product, not a generic report.
BRAND_VIOLET = colors.HexColor("#4B21C4")
BRAND_MAGENTA = colors.HexColor("#D91C82")
INK = colors.HexColor("#111827")
INK_MUTED = colors.HexColor("#4B5563")
ROW_ALT = colors.HexColor("#F3F0FC")
GRID_LINE = colors.HexColor("#E5E7EB")


def _cell(value: Any) -> str:
    """Render one field for the table — never leaves a truly empty cell,
    which is easy to misread as a missing column rather than a blank value."""
    if value is None:
        return "\u2014"  # —
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if isinstance(value, datetime):
        return value.strftime("%d %b %Y, %I:%M %p")
    text = str(value)
    return text if text.strip() else "\u2014"


def _table(header: Sequence[str], rows: Sequence[Sequence[Any]], col_widths=None) -> Table:
    data = [list(header)] + [[_cell(v) for v in row] for row in rows]
    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_VIOLET),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ROW_ALT]),
        ("GRID", (0, 0), (-1, -1), 0.4, GRID_LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return table


def build_admin_export_pdf(
    sections: Iterable[dict],
    generated_by: Optional[str] = None,
) -> BytesIO:
    """
    sections: iterable of
        {"title": str, "columns": [str, ...], "rows": [[cell, ...], ...], "col_widths": [mm, ...] (optional)}
    Returns an in-memory PDF (BytesIO, already seek(0)'d).
    """
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=landscape(A4),
        leftMargin=14 * mm, rightMargin=14 * mm,
        topMargin=14 * mm, bottomMargin=14 * mm,
        title="ROSKYRO — Admin Data Export",
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "RTitle", parent=styles["Title"], textColor=BRAND_VIOLET,
        fontName="Helvetica-Bold", fontSize=20, spaceAfter=2,
    )
    meta_style = ParagraphStyle(
        "RMeta", parent=styles["Normal"], textColor=INK_MUTED, fontSize=9, spaceAfter=16,
    )
    heading_style = ParagraphStyle(
        "RHeading", parent=styles["Heading2"], textColor=BRAND_MAGENTA,
        fontName="Helvetica-Bold", fontSize=13, spaceBefore=2, spaceAfter=8,
    )
    empty_style = ParagraphStyle(
        "REmpty", parent=styles["Normal"], textColor=INK_MUTED, fontSize=9, spaceAfter=10,
    )

    story = []
    story.append(Paragraph("ROSKYRO \u2014 Full Admin Data Export", title_style))
    meta = f"Generated {datetime.now(timezone.utc).strftime('%d %b %Y, %I:%M %p UTC')}"
    if generated_by:
        meta += f" \u00b7 by {generated_by}"
    story.append(Paragraph(meta, meta_style))

    for section in sections:
        rows = section["rows"]
        story.append(Paragraph(f"{section['title']} ({len(rows)})", heading_style))
        if not rows:
            story.append(Paragraph("No records.", empty_style))
        else:
            story.append(_table(section["columns"], rows, section.get("col_widths")))
        story.append(Spacer(1, 8 * mm))

    doc.build(story)
    buf.seek(0)
    return buf
