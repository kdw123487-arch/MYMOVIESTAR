"""One-off: list and download every English title logo TMDB has for Chungking Express (11104)."""
import os, json, urllib.request, urllib.parse
KEY = os.environ["TMDB_KEY"].strip()
h = {"accept": "application/json"}; q = {"include_image_language": "en,zh,cn,null"}
if len(KEY) > 40: h["Authorization"] = "Bearer " + KEY
else: q["api_key"] = KEY
d = json.load(urllib.request.urlopen(urllib.request.Request("https://api.themoviedb.org/3/movie/11104/images?" + urllib.parse.urlencode(q), headers=h), timeout=30))
os.makedirs("tmp_posters", exist_ok=True)
logos = d.get("logos", [])
json.dump([{k: l.get(k) for k in ("file_path", "iso_639_1", "vote_average", "vote_count", "width", "height")} for l in logos], open("tmp_posters/list.json", "w"), indent=1)
for i, l in enumerate(logos[:16]):
    fp = l["file_path"]
    open(f"tmp_posters/{i:02d}{fp[-4:]}", "wb").write(urllib.request.urlopen("https://image.tmdb.org/t/p/w500" + fp, timeout=30).read())
