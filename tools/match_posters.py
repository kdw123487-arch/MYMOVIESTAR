"""Find, among all of a film's TMDB posters, the one that matches a reference poster.

data/poster_refs.json holds {film key: {"fp": 12x18 RGB fingerprint, "ratio": w/h}}
(fingerprints only - no images). For each film every TMDB poster is downloaded at
w92, reduced to the same fingerprint and compared; the closest one is written to the
'포스터' column of data/films.xlsx when it is clearly the same picture.
Writes data/poster_match.md. Needs TMDB_KEY, openpyxl, pillow.
"""
import io, json, os, sys, urllib.parse, urllib.request
from pathlib import Path
from openpyxl import load_workbook
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
REFS, XLSX, JSON, REPORT = (ROOT / "data" / n for n in ("poster_refs.json", "films.xlsx", "films.json", "poster_match.md"))
KEY = os.environ.get("TMDB_KEY", "").strip()
SAME = 22          # mean channel difference (0-255) below which two posters count as the same picture


def api(path, **params):
    headers = {"accept": "application/json"}
    if len(KEY) > 40:
        headers["Authorization"] = "Bearer " + KEY
    else:
        params["api_key"] = KEY
    url = f"https://api.themoviedb.org/3{path}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=20) as r:
        return json.load(r)


def fingerprint(data):
    return list(Image.open(io.BytesIO(data)).convert("RGB").resize((12, 18), Image.Resampling.BOX).tobytes())


def diff(a, b):
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a)


def main():
    if not KEY:
        sys.exit("TMDB_KEY가 필요합니다.")
    refs = json.loads(REFS.read_text(encoding="utf-8"))
    films = {f["key"]: f for f in json.loads(JSON.read_text(encoding="utf-8"))["films"]}
    wb = load_workbook(XLSX)
    ws = wb["추천작"]
    head = [c.value for c in ws[1]]
    c_key, c_poster = head.index("키") + 1, head.index("포스터") + 1
    row_of = {ws.cell(r, c_key).value: r for r in range(2, ws.max_row + 1)}
    lines = ["# 포스터 매칭 결과", "", "| 영화 | 결과 | 차이 | 포스터 |", "|---|---|---|---|"]
    for key, ref in refs.items():
        tid = ((films.get(key) or {}).get("tm") or {}).get("id")
        best = (999, None)
        try:
            posters = api(f"/movie/{tid}/images").get("posters", [])
        except Exception as e:
            lines.append(f"| {ref['en']} | TMDB 오류 ({e}) | | |")
            continue
        for p in posters:
            if abs(p.get("aspect_ratio", 0.667) - ref["ratio"]) > 0.03:
                continue
            try:
                with urllib.request.urlopen("https://image.tmdb.org/t/p/w92" + p["file_path"], timeout=20) as r:
                    d = diff(fingerprint(r.read()), ref["fp"])
            except Exception:
                continue
            if d < best[0]:
                best = (d, p["file_path"])
        d, path = best
        if path and d <= SAME:
            ws.cell(row_of[key], c_poster, path)
            lines.append(f"| {ref['en']} | 찾음 | {d:.1f} | {path} |")
        else:
            lines.append(f"| {ref['en']} | 못 찾음 (가장 가까운 것 {d:.1f}) | | {path or ''} |")
        print(lines[-1])
    wb.save(XLSX)
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
