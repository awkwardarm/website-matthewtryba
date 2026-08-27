#!/usr/bin/env python3
"""Import Claude Design .dc.html print sheets as Eleventy pages under src/docs/.

The repo — not Claude Design — is the source of truth for these documents. Edit
them here. This script exists for the one case where that is not enough: pulling
a redesign back out of the Design canvas after reworking a document there.

    python3 scripts/import-design-doc.py

It OVERWRITES every file it knows about in src/docs/, so commit or stash local
edits first. Point SRC at the unzipped Design project export, then check the
result: the canvas strips it does are heuristic, not a parser.

What it strips or rewrites:
  - the <x-dc>/<helmet> canvas wrapper, support.js, image-slot.js, and the
    shared <style> block (that now lives in assets/doc.css)
  - <main class="doc"> becomes <article class="doc"> — base.njk already
    supplies the page's one <main>
  - <image-slot> custom elements become plain <img>
  - canvas resize artifacts (a stamped "width: 589px; height: 279px")
  - relative asset paths, which become /images/docs/...
"""
import os, re, pathlib

REPO = pathlib.Path(__file__).resolve().parent.parent

# Override with DESIGN_EXPORT=/path/to/export when the folder moves.
SRC = pathlib.Path(os.environ.get(
    "DESIGN_EXPORT",
    pathlib.Path.home() / "Downloads" / "Documents - TRYBA MUSIC"))
OUT = REPO / "src" / "docs"
UPDATED = "August 26, 2026"

# slug: (source basename, title, description, extra <style> block or None)
PATHWAY_STYLE = """    <style>
        /* Production Pathway is a landscape sheet — wider column, tighter print margins */
        body { --doc-width: 11in; }
        .doc { padding: 36px clamp(24px, 4vw, 0.7in) 56px; }
        .doc-actions { padding: 0 clamp(24px, 4vw, 0.7in); }
        .doc a.pp-link { font-weight: 500; }

        /* The roadmap is a four-column landscape table. Its row wrappers are
           inert by default -- display:contents takes them out of the layout
           entirely, so the desktop grid and the printed sheet are exactly what
           they were before the rows existed. */
        .doc .pp-row { display: contents; }

        /* Above the phone breakpoint the table keeps its real proportions and
           scrolls if the window is genuinely too narrow. */
        @media screen and (min-width: 721px) {
            .doc .pp-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
            .doc .pp-scroll > div { min-width: 660px; }
        }

        /* On a phone, four columns cannot be squeezed -- the grid clips its own
           overflow, so narrowing it silently eats text. Reflow to one card per
           phase instead: phase name, then each populated column beneath it,
           labelled. Each cell already carries its row's background, so the
           deepening blue down the phases survives the change. */
        @media screen and (max-width: 720px) {
            /* The grid carries display/background/border as inline styles, so
               unwinding it here needs !important -- nothing else outranks them. */
            .doc .pp-scroll > div {
                display: block !important;
                background: none !important;
                border: 0 !important;
                border-radius: 0 !important;
                overflow: visible !important;
            }
            .doc .pp-row {
                display: block;
                border: 1px solid #DEE2E6;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            /* Two classes, so this outranks .pp-row above regardless of order. */
            .doc .pp-row.pp-head { display: none; }
            .doc .pp-row > div { padding: 11px 14px !important; }
            /* A phase with nothing due and no homework should not show empty
               Payments and Admin blocks. */
            .doc .pp-row > div:empty { display: none; }
            .doc .pp-row > div[data-col]::before {
                content: attr(data-col);
                display: block;
                font-size: 9.5px;
                font-weight: 600;
                letter-spacing: 0.14em;
                text-transform: uppercase;
                color: #7B8794;
                margin-bottom: 5px;
            }
        }
        @page { size: letter landscape; margin: 0; }
        @media print {
            .doc { padding: 0 0.6in !important; }
            .doc .hdr-space, .doc .ftr-space { height: 0.34in !important; }
            .doc .running-hdr { padding: 0.28in 0.6in 0 !important; }
            .doc .running-ftr { padding: 0 0.6in 0.28in !important; }
        }
    </style>
"""

DOCS = [
    ("services-and-pricing", "Services & Pricing - TRYBA MUSIC",
     "Services & Pricing | Matthew Tryba",
     "The full menu of ways to work together, from a Creative Date through a finished, release-ready record.", None),
    ("studio-rates", "Studio Rates - TRYBA MUSIC",
     "Studio Rates | Matthew Tryba",
     "A la carte studio services — mixing, vocal production, and additional production — at flat per-song rates.", None),
    ("production-pathway", "Production Pathway - TRYBA MUSIC",
     "Production Pathway | Matthew Tryba",
     "The five phases of a record, from the Creative Date through release, and what happens in each.", PATHWAY_STYLE),
    ("creative-date-checklist-in-studio", "Creative Date Checklist - In Studio - TRYBA MUSIC",
     "Creative Date Checklist — In Studio | Matthew Tryba",
     "How to prepare for an in-studio Creative Date: what to bring, what to send ahead, and what to expect.", None),
    ("remote-vocal-recording", "Remote Vocal Recording - One Sheet - TRYBA MUSIC",
     "Remote Vocal Recording | Matthew Tryba",
     "How remote vocal recording works and the two gear paths for building a home rig that records release-ready vocals.", None),
    ("remote-vocal-tech-setup", "Remote Vocal Session - Tech Setup Guide - TRYBA MUSIC",
     "Remote Vocal Session — Tech Setup Guide | Matthew Tryba",
     "A quick technical setup guide for a remote vocal session, so the first ten minutes are spent singing, not troubleshooting.", None),
    ("faq-pros-copyrights-splits", "PROs - Copyrights - Royalty Splits - FAQ - TRYBA MUSIC",
     "FAQ: PROs, Copyrights & Royalty Splits | Matthew Tryba",
     "Frequently asked questions about performing rights organizations, copyright registration, and how royalty splits work.", None),
    ("faq-music-distribution", "Music Distribution - Master Audio - FAQ - TRYBA MUSIC",
     "FAQ: Music Distribution & Master Audio | Matthew Tryba",
     "Frequently asked questions about distributing your music and delivering master audio to streaming platforms.", None),
    ("faq-independent-music-promotion", "Independent Music Promotion - Content Strategy - FAQ - TRYBA MUSIC",
     "FAQ: Independent Music Promotion | Matthew Tryba",
     "Frequently asked questions about promoting an independent release and building a content strategy around it.", None),
    ("faq-sync-licensing", "Sync Licensing - Pitching - FAQ - TRYBA MUSIC",
     "FAQ: Sync Licensing & Pitching | Matthew Tryba",
     "Frequently asked questions about sync licensing, what makes a track pitchable, and how placements happen.", None),
]


# The canvas editor stamps a pixel width/height onto anything the user dragged a
# resize handle over. On paper that was harmless; on a phone it pins a paragraph
# to 589px and pushes the whole sheet sideways. The authored document styles are
# minified ("width:96px"), the editor writes spaced CSS ("width: 589px") — which
# makes the two safely distinguishable.
CANVAS_SIZING = re.compile(r';?\s*width:\s\d+px(?:;\s*height:\s\d+px)?(?=["\s;])')


def split_div_children(html):
    """Return (before, [direct child divs], after) for the outermost div in html."""
    open_end = html.index(">") + 1
    close_start = html.rindex("</div>")
    inner = html[open_end:close_start]
    kids, depth, cur = [], 0, None
    for m in re.finditer(r"<div\b|</div>", inner):
        if m.group(0) == "<div":
            if depth == 0:
                cur = m.start()
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                kids.append(inner[cur:m.end()])
    return html[:open_end], kids, html[close_start:]


PATHWAY_COLS = ("Phase", "What to Expect", "Payments", "Admin / Homework")


def pathway_rows(html):
    """Group the roadmap grid's flat cells into rows so it can reflow on a phone.

    The grid is 8 rows x 4 columns of sibling <div>s in row-major order. Wrapping
    each group of four in a .pp-row lets narrow screens render one card per phase
    instead of four crushed columns. The wrappers carry display:contents by
    default, so on desktop and in print they vanish from layout and the grid is
    exactly what it was.

    Columns 1-3 get a data-col label that only becomes visible in card mode.
    """
    i = html.index('<div style="display:grid; grid-template-columns:14%')
    depth, end = 0, None
    for m in re.finditer(r"<div\b|</div>", html[i:]):
        depth += 1 if m.group(0) == "<div" else -1
        if depth == 0:
            end = i + m.end()
            break
    if end is None:
        raise SystemExit("could not find the end of the roadmap grid")

    grid = html[i:end]
    head, cells, tail = split_div_children(grid)
    if len(cells) % 4:
        raise SystemExit(f"roadmap grid has {len(cells)} cells, not a multiple of 4")

    rows = []
    for r in range(0, len(cells), 4):
        group = []
        for c, cell in enumerate(cells[r:r + 4]):
            if r and c:  # skip the header row, and the phase column
                cell = cell.replace("<div ", f'<div data-col="{PATHWAY_COLS[c]}" ', 1)
            group.append(cell)
        cls = "pp-row pp-head" if r == 0 else "pp-row"
        rows.append(f'\n        <div class="{cls}">' + "".join(group) + "</div>")

    rebuilt = head + "".join(rows) + "\n      " + tail
    return html[:i] + '<div class="pp-scroll">' + rebuilt + "</div>" + html[end:]


def strip_canvas_sizing(html):
    return CANVAS_SIZING.sub('', html)

IMAGE_SLOT_OPEN = re.compile(r'<image-slot\b([^>]*)>', re.S)


def attr(blob, name):
    m = re.search(rf'{name}="([^"]*)"', blob)
    return m.group(1) if m else None


def convert_image_slots(html):
    """Replace the canvas <image-slot> custom element with a plain <img>.

    Two shapes exist: a slot carrying its own src, and a slot wrapping an <img>.
    Both become a single <img> keeping the slot's inline sizing/border styles.
    """
    def repl(m):
        blob = m.group(0)
        open_attrs = m.group(1)
        inner = m.group(2)
        style = attr(open_attrs, "style") or ""
        alt = attr(open_attrs, "placeholder") or ""
        inner_img = re.search(r'<img\b[^>]*>', inner)
        if inner_img:
            src = attr(inner_img.group(0), "src")
        else:
            src = attr(open_attrs, "src")
        if not src:
            raise SystemExit(f"image-slot with no resolvable src: {blob[:120]}")
        # The slot's own style carries the box; add object-fit so the photo behaves
        # the way the canvas runtime made it behave.
        style = style.rstrip("; ") + "; object-fit: contain; object-position: center;"
        return f'<img src="{src}" alt="{alt}" style="{style}">'

    return re.sub(r'<image-slot\b([^>]*)>(.*?)</image-slot>', repl, html, flags=re.S)


def convert(slug, basename, title, description, extra_style):
    raw = (SRC / f"{basename}.dc.html").read_text()

    # Some exports carry canvas positioning on the <main> (position:absolute;
    # left/top) — matched loosely so those attributes are dropped, not inherited.
    m = re.search(r'<main class="doc"[^>]*>(.*)</main>\s*</x-dc>', raw, re.S)
    if not m:
        raise SystemExit(f"could not locate <main class=\"doc\"> body in {basename}")
    body = m.group(1)

    body = convert_image_slots(body)
    body = strip_canvas_sizing(body)
    if slug == "production-pathway":
        body = pathway_rows(body)

    # Asset paths: the canvas kept everything relative to the project folder.
    body = body.replace('src="assets/tryba-mark.png"', 'src="/images/docs/tryba-mark.png"')
    body = re.sub(r'src="\./([^"/]+\.(?:jpg|jpeg|png|svg))"', r'src="/images/docs/\1"', body)

    leftovers = re.findall(r'src="(?!/)[^"]*"', body)
    if leftovers:
        raise SystemExit(f"{slug}: unrewritten relative src {leftovers}")
    if "image-slot" in body or "<x-dc" in body:
        raise SystemExit(f"{slug}: canvas markup survived conversion")

    # Quote every value: titles carry "|" and descriptions carry ": ", both of
    # which YAML would otherwise read as syntax.
    def y(v):
        return '"' + v.replace('\\', '\\\\').replace('"', '\\"') + '"'

    front = (
        "---\n"
        f"title: {y(title)}\n"
        f"description: {y(description)}\n"
        f"updated: {y(UPDATED)}\n"
        "---\n"
    )
    style = extra_style or ""
    out = front + style + '    <article class="doc">' + body + "</article>\n"
    (OUT / f"{slug}.html").write_text(out)
    return len(out.splitlines())


if not SRC.is_dir():
    raise SystemExit(f"Design export not found: {SRC}\n"
                     f"Set DESIGN_EXPORT to the unzipped project folder.")

for slug, basename, title, description, extra_style in DOCS:
    n = convert(slug, basename, title, description, extra_style)
    print(f"  {n:4d} lines  src/docs/{slug}.html")

print("\nRe-run `npm run serve` and check each page — especially print preview.")
