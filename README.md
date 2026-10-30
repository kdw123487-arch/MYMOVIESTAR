# My Movie Star

시상식 컨셉의 개인 영화 기록 사이트입니다. 명작 영화 50편을 둘러보고, 관심 있는 영화를 담고, 본 영화에 별점과 한 줄 감상을 남길 수 있습니다. 화면은 **전체 · 관심 · 평점** 세 탭으로 나뉩니다.

사이트: https://kdw123487-arch.github.io/MYMOVIESTAR/

## 파일 구조

| 경로 | 내용 |
|---|---|
| `index.html` | 사이트 화면·스타일·동작. 영화 목록은 들어 있지 않습니다. |
| `banners.js` | 상세 페이지 배너 그림. 작품마다 전용 배너(`SCENES`)가 있고, 없으면 엑셀 '문양' 칸의 기본 문양을 씁니다. 포스터 사진을 못 불러올 때의 대체 포스터도 여기서 그립니다. |
| `data/films.xlsx` | **영화 목록 원본.** 영화를 추가·수정할 때는 이 파일만 고치면 됩니다. |
| `data/films.json` | 엑셀에서 자동으로 만들어지는 파일. 직접 고치지 마세요. |
| `data/tmdb_report.md` | 자동 변환 때마다 남는 확인 결과(TMDB에서 못 찾은 작품, 관람등급이 없는 작품 등). |
| `tools/xlsx_to_json.py` | 엑셀 → JSON 변환기. TMDB에서 포스터·한국 관람등급·국내 스트리밍 정보를 받아 함께 넣습니다. |
| `.github/workflows/build-data.yml` | 변환기를 자동으로 돌리는 GitHub Action. |
| `favicon.svg`, `og.png`, `tmdb-logo.svg` | 아이콘, 공유 미리보기 이미지, TMDB 로고. |

> 예전에 포스터 매칭·색 분석에 쓰던 도구(`tools/match_posters.py`, `tools/poster_colors.py`와 그 Action)는 작업이 끝나 삭제했습니다. 필요하면 git 기록에서 되살릴 수 있습니다.

## 영화 목록 고치기

1. `data/films.xlsx`를 내려받아 엑셀에서 고칩니다. 칸 설명은 첫 시트 **"사용법"**에 있습니다.
2. GitHub 저장소에서 `data/films.xlsx`를 고친 파일로 교체해 올립니다(Add file → Upload files).
3. GitHub Action이 자동으로 `data/films.json`을 만들고 커밋합니다. 1~3분 뒤 사이트에 반영됩니다.
4. 변환 결과는 `data/tmdb_report.md`에서 확인하세요. TMDB 번호가 틀렸거나 관람등급이 비어 있는 작품이 여기에 적힙니다.

> 이미 있는 영화의 **키**는 바꾸지 마세요. 키가 바뀌면 그 영화에 남긴 별점 기록이 끊어집니다. 목록에서 뺄 영화는 "제외작" 시트로 옮기면 기존 기록이 제목과 함께 유지됩니다.

## 처음 한 번만: TMDB 키 등록

포스터·관람등급·스트리밍 정보는 자동 변환 때 TMDB에서 받아 옵니다. 키는 사이트 코드에 넣지 않고 GitHub 비밀값으로 보관합니다.

1. [themoviedb.org](https://www.themoviedb.org/) → 설정 → API에서 API 키를 복사합니다.
2. 이 저장소의 **Settings → Secrets and variables → Actions → New repository secret**
3. Name: `TMDB_KEY`, Secret: 복사한 키 → Add secret
4. **Actions** 탭 → "Build film data" → **Run workflow**로 한 번 실행합니다.

이후에는 엑셀을 올릴 때마다, 그리고 매주 월요일 새벽에 자동으로 다시 받아 옵니다(스트리밍 정보는 자주 바뀌기 때문입니다).

## 기록 저장 방식

별점·감상·관심 목록은 서버 없이 **각 브라우저**에 저장됩니다.

- **다른 기기로 옮기기**: 평점 탭 아래 버튼을 누르면 기록이 담긴 링크가 만들어집니다. 그 링크를 다른 기기에서 열면 기록이 합쳐집니다.
- **백업 내보내기 / 불러오기**: 기록을 파일(.json)로 저장하거나 되살립니다.

## 직접 변환해 보기 (선택)

```bash
pip install openpyxl
TMDB_KEY=발급받은키 python tools/xlsx_to_json.py   # 키 없이 실행하면 기존 TMDB 정보는 그대로 둡니다
python -m http.server   # http://localhost:8000 에서 확인
```

## 출처

포스터 이미지와 관람등급은 [TMDB](https://www.themoviedb.org/), 스트리밍 정보는 [JustWatch](https://www.justwatch.com/kr)에서 제공받습니다. This product uses the TMDB API but is not endorsed or certified by TMDB.
