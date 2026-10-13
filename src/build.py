#!/usr/bin/env python3
"""src/index.template.html → index.html. {{i:이름}} 자리에 src/icons/의 Lucide 아이콘(ISC)을 넣는다."""
import re, pathlib, sys
R = pathlib.Path(__file__).resolve().parent
def icon(m):
    s = (R / "icons" / f"{m.group(1)}.svg").read_text()
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r"\s+", " ", s).replace("> <", "><").strip()
    s = s.replace('width="24" height="24" ', "").replace("<svg ", '<svg aria-hidden="true" focusable="false" ', 1)
    return s
out = re.sub(r"\{\{i:([a-z-]+)\}\}", icon, (R / "index.template.html").read_text())
target = R.parent / (sys.argv[1] if len(sys.argv) > 1 else "index.html")
target.write_text(out)
print("wrote", target)
