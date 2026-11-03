"""One-off: download two posters and their title logos so colours and lettering can be checked."""
import os, urllib.request
os.makedirs("tmp_posters", exist_ok=True)
for name, path in [("green-book.jpg", "/7BsvSuDQuoqhWmU2fL7W2GOcZHU.jpg"), ("the-greatest-showman.jpg", "/jLkvdw90E4znDs5byCVq0ueOgYy.jpg"),
                   ("green-book-logo.png", "/teZDEtsuxhmeyuEyv6Ww5TrdHJi.png"), ("the-greatest-showman-logo.png", "/301uXAEk7GMaoQah4GSSgkzjp8L.png")]:
    open(f"tmp_posters/{name}", "wb").write(urllib.request.urlopen("https://image.tmdb.org/t/p/w500" + path, timeout=30).read())
