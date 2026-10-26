"""films.xlsx -> films.json builder for My Movie Star.

Usage:  python tools/xlsx_to_json.py
Needs:  pip install openpyxl
Env:    TMDB_KEY (optional) - TMDB v3 API key or v4 read token. When set, each film is
        checked against TMDB and its poster, Korean age rating and Korean streaming
        services are stored in the JSON. When not set, the TMDB data already in
        films.json is kept as it is.

Sheet "추천작": one film per row, columns named in COLUMNS below (order doesn't matter).
Sheet "제외작": films removed from the list; kept so earlier ratings still show their titles.
Also writes data/tmdb_report.md: what was checked, fixed or missing.
"""
import json, os, re, sys, time, unicodedata, urllib.parse, urllib.request
from datetime import date
from difflib import SequenceMatcher
from pathlib import Path
from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT, REPORT = ROOT / "data" / "films.xlsx", ROOT / "data" / "films.json", ROOT / "data" / "tmdb_report.md"

# Excel header -> JSON field
COLUMNS = {
    "키": "key", "제목": "ko", "원제": "en", "연도": "y", "국가": "n", "장르": "g",
    "러닝타임": "rt", "감독": "dir", "출연": "cast", "수상": "aw", "한줄소개": "p",
    "줄거리": "s", "추천이유": "w", "관람포인트1": "pt1", "관람포인트2": "pt2", "관람포인트3": "pt3",
    "넷플릭스오리지널": "nf", "TMDB_ID": "tmdb", "관람등급": "age", "색상": "pal", "문양": "m", "영문폰트": "ef", "배경색": "bg",
}
MOTIFS = {"sun", "waves", "bands", "rings", "split", "peaks", "arch", "rays", "grid", "dots", "trees"}
FONTS = {"classic", "elegant", "noir", "epic", "typewriter", "mono", "bold", "scifi", "gothic", "western", "retro", "script", "hand", "comic", "light", "neon"}
AGES = {"전체": "ALL", "ALL": "ALL", "12": "12", "15": "15", "18": "18", "19": "18", "청불": "18", "청소년관람불가": "18"}
HEX = re.compile(r"#[0-9a-fA-F]{6}")


def slug(en):
    s = unicodedata.normalize("NFD", en.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return "r:" + re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def rows(ws):
    it = ws.iter_rows(values_only=True)
    head = [str(h).strip() if h is not None else "" for h in next(it)]
    for r in it:
        if any(v not in (None, "") for v in r):
            yield {head[i]: v for i, v in enumerate(r) if i < len(head) and head[i]}


def clean(v):
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    return str(v).strip()


def fail(n, msg):
    sys.exit(f"{n}행: {msg}")


def film(row, n):
    f = {COLUMNS[k]: clean(v) for k, v in row.items() if k in COLUMNS}
    for need in ("ko", "en"):
        if not f.get(need):
            fail(n, f"'{[k for k, v in COLUMNS.items() if v == need][0]}' 칸이 비어 있습니다.")
    out = {"key": f.get("key") or slug(f["en"]), "ko": f["ko"], "en": f["en"]}
    for k in ("y", "n", "g", "dir", "cast", "aw", "p", "s", "w"):
        if f.get(k):
            out[k] = f[k]
    for k in ("rt", "tmdb"):
        if f.get(k):
            out[k] = int(float(f[k]))
    pts = [f[k] for k in ("pt1", "pt2", "pt3") if f.get(k)]
    if pts:
        out["pt"] = pts
    if f.get("nf", "").upper() in ("O", "Y", "1", "TRUE", "예"):
        out["nf"] = 1
    if f.get("age"):
        a = AGES.get(f["age"].replace("세", "").strip())
        if not a:
            fail(n, f"관람등급은 전체/12/15/18 중 하나여야 합니다 ({f['age']}).")
        out["age"] = a
    if f.get("pal"):
        pal = [c.strip() for c in f["pal"].split(",")]
        if len(pal) != 3 or not all(HEX.fullmatch(c) for c in pal):
            fail(n, "색상은 '#aabbcc, #aabbcc, #aabbcc' 형식이어야 합니다.")
        out["pal"] = pal
    if f.get("m"):
        if f["m"] not in MOTIFS:
            fail(n, f"문양은 {', '.join(sorted(MOTIFS))} 중 하나여야 합니다.")
        out["m"] = f["m"]
    if f.get("ef"):
        if f["ef"] not in FONTS:
            fail(n, f"영문폰트는 {', '.join(sorted(FONTS))} 중 하나여야 합니다.")
        out["ef"] = f["ef"]
    if f.get("bg"):
        if not HEX.fullmatch(f["bg"]):
            fail(n, "배경색은 #aabbcc 형식이어야 합니다.")
        out["bg"] = f["bg"].lower()
    return out


# ---------------- TMDB ----------------
KEY = os.environ.get("TMDB_KEY", "").strip()
API = "https://api.themoviedb.org/3"


def api(path, **params):
    params = {k: v for k, v in params.items() if v not in (None, "")}
    headers = {"accept": "application/json"}
    if len(KEY) > 40:
        headers["Authorization"] = "Bearer " + KEY
    else:
        params["api_key"] = KEY
    url = f"{API}{path}?{urllib.parse.urlencode(params)}"
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=20) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if e.code != 429 and attempt == 3:
                raise
        except urllib.error.URLError:
            if attempt == 3:
                raise
        time.sleep(1.5 * (attempt + 1))


def norm(s):
    s = unicodedata.normalize("NFD", str(s or "").lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def year(s):
    m = re.search(r"\d{4}", str(s or ""))
    return int(m.group()) if m else 0


def same_film(f, m):
    """Does TMDB movie m look like Excel row f? (title close enough and year within 1)"""
    if not m:
        return False
    t = max(SequenceMatcher(None, norm(f["en"]), norm(x)).ratio() for x in (m.get("title"), m.get("original_title")))
    y_ok = not f.get("y") or abs(year(m.get("release_date")) - year(f["y"])) <= 1
    return y_ok and (t >= 0.6 or norm(f["en"]) in norm(m.get("title")))


DETAIL = dict(append_to_response="release_dates,watch/providers,images", include_image_language="ja,en,null", language="en-US")


def find(f, notes):
    if f.get("tmdb"):
        m = api(f"/movie/{f['tmdb']}", **DETAIL)
        if same_film(f, m):
            return m
        notes.append(f"TMDB_ID {f['tmdb']}이(가) 이 영화와 맞지 않아 제목으로 다시 찾았습니다" + (f" (그 번호는 「{m.get('title')}」, {m.get('release_date','')[:4]})" if m else ""))
    for y in (year(f.get("y")) or None, None):
        s = api("/search/movie", query=f["en"], year=y, include_adult="false") or {}
        best = max(s.get("results") or [], default=None,
                   key=lambda r: (same_film(f, r), SequenceMatcher(None, norm(f["en"]), norm(r.get("title"))).ratio(), r.get("vote_count", 0)))
        if best and same_film(f, best):
            m = api(f"/movie/{best['id']}", **DETAIL)
            notes.append(f"제목 검색으로 찾음 → TMDB_ID {best['id']} (엑셀의 TMDB_ID를 이 번호로 바꾸면 다음부터 바로 찾습니다)")
            return m
    notes.append("TMDB에서 이 영화를 찾지 못했습니다")
    return None


def korean_age(m):
    for r in (m.get("release_dates") or {}).get("results", []):
        if r.get("iso_3166_1") == "KR":
            for d in r.get("release_dates", []):
                c = str(d.get("certification") or "").strip()
                if not c:
                    continue
                if re.match(r"(?i)all|전체", c):
                    return "ALL"
                for k in ("12", "15"):
                    if k in c:
                        return k
                if re.search(r"18|19|청", c):
                    return "18"
    return None


def enrich(f):
    notes = []
    m = find(f, notes)
    if not m:
        return None, notes
    lang = "ja" if m.get("original_language") == "ja" else "en"
    posters = [p for p in (m.get("images") or {}).get("posters", []) if p.get("iso_639_1") == lang]
    posters.sort(key=lambda p: (p.get("vote_average", 0), p.get("vote_count", 0)), reverse=True)
    poster = posters[0]["file_path"] if posters else m.get("poster_path")
    kr = (m.get("watch/providers") or {}).get("results", {}).get("KR", {})
    def plats(*kinds):
        seen, out = set(), []
        for kind in kinds:
            for p in kr.get(kind) or []:
                name = p.get("provider_name", "")
                if p["provider_id"] in seen or re.search(r"(?i)with ads|\bads\b|광고", name):
                    continue
                seen.add(p["provider_id"])
                out.append({"n": name, "l": p.get("logo_path")})
        return out
    tm = {"id": m["id"], "p": poster, "age": korean_age(m),
          "w": {"link": kr.get("link", ""), "sub": plats("flatrate"), "rent": plats("rent", "buy")[:6]},
          "at": date.today().isoformat()}
    if not poster:
        notes.append("포스터가 없습니다")
    if not tm["age"] and not f.get("age"):
        notes.append("TMDB에 한국 관람등급이 없습니다 — 엑셀 '관람등급' 칸을 채워 주세요")
    if not tm["w"]["sub"] and not tm["w"]["rent"]:
        notes.append("국내 스트리밍 정보가 없습니다")
    return tm, notes


def main():
    wb = load_workbook(SRC, read_only=True, data_only=True)
    films = [film(r, i + 2) for i, r in enumerate(rows(wb["추천작"]))]
    keys = [f["key"] for f in films]
    dup = {k for k in keys if keys.count(k) > 1}
    if dup:
        sys.exit("키가 겹칩니다: " + ", ".join(sorted(dup)))
    retired = {}
    if "제외작" in wb.sheetnames:
        for r in rows(wb["제외작"]):
            f = {COLUMNS[k]: clean(v) for k, v in r.items() if k in COLUMNS}
            k = f.get("key") or slug(f["en"])
            retired[k] = {x: f[x] for x in ("ko", "en", "y", "n") if f.get(x)}

    old = {}
    if OUT.exists():
        try:
            old = {f["key"]: f.get("tm") for f in json.loads(OUT.read_text(encoding="utf-8"))["films"]}
        except Exception:
            pass
    report = []
    if KEY:
        for f in films:
            try:
                tm, notes = enrich(f)
            except Exception as e:  # network trouble: keep what we had
                tm, notes = old.get(f["key"]), [f"TMDB 요청 실패 ({e}) — 이전 정보를 유지했습니다"]
            if tm:
                f["tm"] = tm
            if notes:
                report.append((f, notes))
            time.sleep(0.05)
    else:
        for f in films:
            if old.get(f["key"]):
                f["tm"] = old[f["key"]]
        print("TMDB_KEY가 없어 TMDB 정보는 기존 값을 그대로 썼습니다.")

    OUT.write_text(json.dumps({"films": films, "retired": retired}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    if KEY:
        lines = [f"# TMDB 확인 결과 ({date.today().isoformat()})", "",
                 f"- 전체 {len(films)}편 · 포스터 {sum(1 for f in films if (f.get('tm') or {}).get('p'))}편 · "
                 f"관람등급 {sum(1 for f in films if f.get('age') or (f.get('tm') or {}).get('age'))}편 · "
                 f"스트리밍 정보 {sum(1 for f in films if (f.get('tm') or {}).get('w', {}).get('sub') or (f.get('tm') or {}).get('w', {}).get('rent'))}편", ""]
        lines += [f"- **{f['ko']}** ({f['en']}): " + " / ".join(n) for f, n in report] or ["- 확인이 필요한 작품이 없습니다."]
        REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
        print("\n".join(lines))
    print(f"{len(films)}편 → {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
