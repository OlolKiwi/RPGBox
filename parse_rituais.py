import re, json

raw = open('rituais_raw.txt', encoding='utf-8').read()

blocks = [b.strip() for b in raw.split('ver mais') if b.strip()]

entries = []
for b in blocks:
    lines = [l.rstrip() for l in b.splitlines()]
    idx = 0
    while idx < len(lines) and not lines[idx].strip():
        idx += 1
    if idx >= len(lines):
        continue
    name = lines[idx].strip()
    idx += 1
    while idx < len(lines) and lines[idx].strip().lower() == 'adicionar':
        idx += 1
    elem_circle = None
    while idx < len(lines):
        m = re.match(r'^([A-ZÁÉÍÓÚÇÃÕ]+)\s+(\d+)$', lines[idx].strip())
        if m:
            elem_circle = (m.group(1), m.group(2))
            idx += 1
            break
        if not lines[idx].strip():
            idx += 1
            continue
        break
    if not elem_circle:
        print("WARN no element for:", name)
        continue
    elem, circle = elem_circle
    elem_map = {'ENERGIA':'Energia','CONHECIMENTO':'Conhecimento','MORTE':'Morte','SANGUE':'Sangue','MEDO':'Medo','VARIA':'Varia'}
    elem = elem_map.get(elem, elem.capitalize())
    desc_lines = lines[idx:]
    while desc_lines and not desc_lines[-1].strip():
        desc_lines.pop()
    desc = '\n'.join(desc_lines).strip()
    entries.append((name, elem, circle, desc))

def js_str(s):
    return json.dumps(s, ensure_ascii=False)

out = 'var RT_EXTRA = [\n'
for name, elem, circle, desc in entries:
    out += f'  [{js_str(name)},{js_str(elem)},{js_str(circle)},{js_str(desc)}],\n'
out += '];\n'

with open('rituais_extra.js', 'w', encoding='utf-8') as f:
    f.write(out)

print("Parsed", len(entries), "rituals")
PY