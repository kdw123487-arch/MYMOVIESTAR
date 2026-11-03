"""One-off: download ten title logos so they can be previewed."""
import os, urllib.request
os.makedirs("tmp_posters", exist_ok=True)
for name, path in [
  ("pulp-fiction-logo.png", "/kpuNKsIzVbK3LDVo4iOJDAY0y7d.png"),
  ("back-to-the-future-logo.svg", "/7hXsyx9em5FhNdeEf0tehFmG06r.svg"),
  ("knives-out-logo.png", "/7oCGn4lB3eWiUhts1C04c5yZd2J.png"),
  ("amelie-logo.png", "/pIjwwbSgqq6sMbL0Umr7zKmEEUF.png"),
  ("cinema-paradiso-logo.png", "/ai7T0EYyCL2guG3o62jwuECvEjK.png"),
  ("mad-max-fury-road-logo.png", "/cBAO0i9fZCux5SqJnizRECS8qfU.png"),
  ("the-godfather-logo.png", "/kysDTCloxUPJ1BILI4f8gs74fcr.png"),
  ("spider-man-into-the-spider-verse-logo.png", "/xrM5rEtoW0Hd0QXmy5b4WBGZuHd.png"),
  ("coco-logo.png", "/pLlaM6lXpKbwVCUdsqJ7axwb5UF.png"),
  ("la-la-land-logo.svg", "/97DYpdDmiOpfn9l9I2dGxDH01t1.svg")]:
    open(f"tmp_posters/{name}", "wb").write(urllib.request.urlopen("https://image.tmdb.org/t/p/w500" + path, timeout=30).read())
