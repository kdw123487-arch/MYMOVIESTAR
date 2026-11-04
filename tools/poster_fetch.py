"""One-off: download the chosen series posters so their style can be checked."""
import os, urllib.request
os.makedirs("tmp_posters", exist_ok=True)
for name, path in [
  ("1281331.jpg", "/7jK6NuxVg1XuEV7UdNa6KO03IgZ.jpg"),
  ("9659.jpg", "/rPjy31ODooytMT4ujLeddvMa0wc.jpg"),
  ("8810.jpg", "/6nWjCl1o5B6gaZ1YjY2jKVSocPB.jpg"),
  ("9355.jpg", "/7sYv92wr9FN5WIg4fFpJ20cVuXb.jpg"),
  ("786892.jpg", "/vHBJBjkJKotI8AJXmrpNG6v2WRG.jpg"),
  ("272.jpg", "/sPX89Td70IDDjVr85jdSBb4rWGr.jpg"),
  ("49026.jpg", "/8JCu1wi83pirpHEbVpmpfowDolX.jpg"),
  ("661374.jpg", "/vDGr1YdrlfbU9wxTOdpf3zChmv9.jpg"),
  ("812583.jpg", "/iV9LM8aUb83BjCCx2RUnKE5sSQg.jpg"),
  ("569094.jpg", "/gtngzBAmyHMCV2rMCqE2WHd0KDJ.jpg"),
  ("911916.jpg", "/9KAe39xqyZnv9J4W3DRGdQqX82h.jpg"),
  ("1451567.jpg", "/7YiB8tOQcY8ApdKkCnjQL5jGkIP.jpg"),
  ("1022789.jpg", "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg"),
  ("240.jpg", "/8a1lJs7mFyGhGhZZDT1azJUoQiZ.jpg"),
  ("242.jpg", "/gh2ShN6ku8VOT8wNyEOgZQwhNtE.jpg"),
  ("165.jpg", "/hQq8xZe5uLjFzSBt4LanNP7SQjl.jpg"),
  ("196.jpg", "/crzoVQnMzIrRfHtQw0tLBirNfVg.jpg"),
  ("78.jpg", "/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg"),
  ("80.jpg", "/gycdE1ARByGQcK4fYR2mgpU6OO.jpg"),
  ("132344.jpg", "/ihQZK0Xp49Utl52Gt3zbnhy13jA.jpg"),
  ("604.jpg", "/8xEVAe84zlL9rkfYT6dZXero4KK.jpg"),
  ("605.jpg", "/qEWiBXJGXK28jGBAm8oFKKTB0WD.jpg"),
  ("624860.jpg", "/8c4a8kE7PizaGQQnditMmI1xbRp.jpg")]:
    open(f"tmp_posters/{name}", "wb").write(urllib.request.urlopen("https://image.tmdb.org/t/p/w185" + path, timeout=30).read())
