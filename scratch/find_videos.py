import urllib.request
import re
import json

req = urllib.request.Request("https://ramillette.com/", headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

found = set()
for m in re.finditer(r'(https?:[^\s"\'<>]+\.mp4)', html):
    u = m.group(1).replace(r"\/", "/")
    found.add(u)

for m in re.finditer(r'([^\s"\'<>]+\.mp4)', html):
    u = m.group(1).replace(r"\/", "/")
    if "vizupcommerce" in u or "shopify" in u:
        if not u.startswith("http"):
            u = "https://" + u.lstrip(r"\/")
        found.add(u)

print("Found video URLs:")
for u in sorted(found):
    print(u)
