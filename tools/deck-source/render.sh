#!/bin/bash
# render.sh <deck.pptx> <outdir> [dpi]
set -e
DECK=$(realpath "$1"); OUTD=$(realpath -m "$2"); DPI=${3:-80}
SK=${PPTX_SKILL_DIR:?set PPTX_SKILL_DIR to the pptx skill folder}
mkdir -p "$OUTD"; rm -f "$OUTD"/*.jpg "$OUTD"/*.pdf
timeout 240 python3 $SK/scripts/office/soffice.py --headless --convert-to pdf --outdir "$OUTD" "$DECK" >/dev/null 2>&1
PDF="$OUTD/$(basename "${DECK%.*}").pdf"
python3 - "$PDF" "$OUTD" "$DPI" <<'PY'
import sys, pymupdf
pdf, out, dpi = sys.argv[1], sys.argv[2], int(sys.argv[3])
doc = pymupdf.open(pdf)
for i, p in enumerate(doc, 1):
    p.get_pixmap(dpi=dpi).save(f"{out}/s{i:02d}.jpg")
print(len(doc), "pages")
PY
