"""List every file under deploy/<site>/ with its SHA-256, for the agent on the web server. Refuses anything that is not a static web file."""
import hashlib, json, os, re, sys
from pathlib import Path

EXT = {"html", "htm", "css", "js", "mjs", "json", "xml", "txt", "svg", "png", "jpg", "jpeg", "webp", "avif", "gif", "ico",
       "mp4", "webm", "woff", "woff2", "ttf", "otf", "pdf", "webmanifest", "map"}
MAX = 80 * 1048576
PATH_OK = re.compile(r"^[A-Za-z0-9_][A-Za-z0-9_.-]*(/[A-Za-z0-9_][A-Za-z0-9_.-]*)*$")
root, files, bad = Path("deploy"), [], []
for p in sorted(root.rglob("*")):
    rel = p.relative_to(root).as_posix()
    if not p.is_file() or rel in ("manifest.json", "README.md"):
        continue
    site, _, path = rel.partition("/")
    size = p.stat().st_size
    ok = (path and re.fullmatch(r"[a-z0-9.-]+", site) and PATH_OK.match(path) and ".." not in path
          and p.suffix.lower().lstrip(".") in EXT and 0 < size <= MAX and p.name != "heal-status.txt")
    if not ok:
        bad.append(rel)
        continue
    files.append({"site": site, "path": path, "sha256": hashlib.sha256(p.read_bytes()).hexdigest(), "size": size})
if bad:
    print("Not allowed in deploy/ (static web files only, plain names, under 80 MB):", *bad, sep="\n  ")
    sys.exit(1)
(root / "manifest.json").write_text(json.dumps({"commit": os.environ["GITHUB_SHA"], "files": files}, indent=1) + "\n", encoding="utf-8")
print(len(files), "file(s) in the manifest for commit", os.environ["GITHUB_SHA"][:7])
