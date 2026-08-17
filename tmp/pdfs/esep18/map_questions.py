from __future__ import annotations

from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path
import math
import re


ROOT = Path(__file__).resolve().parent
IES_TEXT = ROOT / "iesmaster-esep18-setb-solutions.pdf.txt"
COLUMN_DIR = ROOT / "column-ocr"

PAGE_RANGES = {
    2: range(1, 6),
    3: range(6, 11),
    4: range(11, 17),
    5: range(17, 23),
    6: range(23, 28),
    7: range(28, 32),
    8: range(32, 37),
    9: range(37, 45),
    10: range(45, 51),
    11: range(51, 57),
    12: range(57, 63),
    13: range(63, 69),
    14: range(69, 76),
    15: range(76, 79),
    16: range(79, 84),
    17: range(84, 89),
    18: range(89, 95),
    19: range(95, 100),
    20: range(100, 106),
    21: range(106, 110),
    22: range(110, 115),
    23: range(115, 120),
    24: range(120, 126),
    25: range(126, 131),
    26: range(131, 138),
    27: range(138, 145),
    28: range(145, 151),
}

STOP = {
    "the", "a", "an", "of", "is", "are", "in", "to", "for", "and", "or",
    "with", "which", "following", "consider", "statement", "statements", "above",
    "only", "will", "be", "given", "what", "one", "as", "by", "at", "from",
}


def parse_ies_questions(text: str) -> list[dict[str, str | int]]:
    questions: list[dict[str, str | int]] = []
    cursor = 0
    for number in range(1, 151):
        marker = re.search(rf"(?m)^{number}\.\s", text[cursor:])
        if not marker:
            raise RuntimeError(f"Missing IES question {number}")
        start = cursor + marker.start()
        answer = re.search(r"(?m)^Ans\.\s*\(([a-d*])\)", text[start:])
        if not answer:
            raise RuntimeError(f"Missing IES answer {number}")
        answer_start = start + answer.start()
        cursor = start + answer.end()
        raw = text[start:answer_start]
        raw = re.sub(r"(?m)^IES MASTER\s*$", "", raw)
        raw = re.sub(r"(?m)^SET\s*-\s*B\s*$", "", raw)
        raw = re.sub(r"(?m)^Explanation of Civil Engg\..*$", "", raw)
        questions.append({"set_b": number, "answer": answer.group(1), "raw": raw.strip()})
    return questions


def tokens(text: str) -> list[str]:
    words = re.findall(r"[a-z]{3,}", text.lower())
    return [word for word in words if word not in STOP]


def stem(raw: str) -> str:
    value = re.sub(r"^\d+\.\s*", "", raw)
    option = re.search(r"(?m)^\s*\(a\)\s", value)
    if option:
        value = value[: option.start()]
    return value


def cosine(a: list[str], b: list[str]) -> float:
    ca, cb = Counter(a), Counter(b)
    numerator = sum(value * cb.get(key, 0) for key, value in ca.items())
    denom = math.sqrt(sum(v * v for v in ca.values()) * sum(v * v for v in cb.values()))
    return numerator / denom if denom else 0.0


def score(query: list[str], page: list[str]) -> tuple[float, int, int]:
    matcher = SequenceMatcher(None, query, page, autojunk=False)
    match = matcher.find_longest_match()
    overlap = cosine(query, page)
    coverage = match.size / max(1, min(len(query), 35))
    return overlap + coverage * 1.6, match.b, match.size


def main() -> None:
    ies = parse_ies_questions(IES_TEXT.read_text(encoding="utf-8"))
    pages = {}
    for page in PAGE_RANGES:
        left = (COLUMN_DIR / f"page-{page:02d}-left.txt").read_text(encoding="utf-8")
        right = (COLUMN_DIR / f"page-{page:02d}-right.txt").read_text(encoding="utf-8")
        pages[page] = tokens(left + "\n" + right)

    assignments: dict[int, list[tuple[float, int, int, dict[str, str | int]]]] = {p: [] for p in pages}
    for question in ies:
        query = tokens(stem(str(question["raw"])))[:80]
        candidates = []
        for page, page_tokens in pages.items():
            match_score, position, size = score(query, page_tokens)
            candidates.append((match_score, position, size, page))
        best_score, position, size, best_page = max(candidates)
        assignments[best_page].append((best_score, position, size, question))

    for page, expected_range in PAGE_RANGES.items():
        expected = list(expected_range)
        ranked = sorted(assignments[page], key=lambda row: row[1])
        print(f"\nPAGE {page} expected {expected[0]}-{expected[-1]} candidates={len(ranked)}")
        for index, (match_score, position, size, question) in enumerate(ranked):
            source_number = expected[index] if index < len(expected) else "?"
            preview = " ".join(tokens(stem(str(question["raw"])))[:12])
            print(
                f"  A{str(source_number):>3} <- B{int(question['set_b']):03d} "
                f"score={match_score:.2f} pos={position:03d} run={size:02d} {preview}"
            )


if __name__ == "__main__":
    main()
