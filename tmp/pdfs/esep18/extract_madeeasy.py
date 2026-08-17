from pathlib import Path

import pdfplumber


root = Path(__file__).resolve().parent
source = root / "madeeasy-esep18-seta-solutions.pdf"
target = root / "madeeasy-esep18-seta-solutions.txt"

with pdfplumber.open(source) as pdf:
    pages = [page.extract_text(x_tolerance=2, y_tolerance=3) or "" for page in pdf.pages]

target.write_text("\n\f\n".join(pages), encoding="utf-8")
print({"pages": len(pages), "characters": sum(map(len, pages))})
