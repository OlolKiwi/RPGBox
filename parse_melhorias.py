import re, json

raw = open('melhorias.txt', encoding='utf-8').read()
lines = raw.splitlines()

SECTIONS = {'MODIFICAÇÔES', 'MALDIÇÔES', 'MODIFICACOES', 'MALDICOES', 'MODIFICAÇÕES', 'MALDIÇÕES'}
# normalize
def norm_sec(s):
    s = s.strip().upper()
    if 'MODIF' in s: return 'MODIFICAÇÔES'
    if 'MALD' in s: return 'MALDIÇÔES'
    return s

ELEMENTS = {'CONHECIMENTO','ENERGIA','MORTE','SANGUE','VARIA','MEDO'}

sections = []
current_section = None
current_items = []

def flush_item(item_lines):
    if not item_lines:
        return None
    name = item_lines[0].strip()
    if not name or set(name) <= set('\\'):
        return None
    rest = [l for l in item_lines[1:] if l.strip()]
    tag = ''
    desc_lines = rest
    if len(rest) >= 1:
        first = rest[0].strip()
        if first.upper() in ELEMENTS:
            tag = first.upper()
            # normalize tag to capitalized
            tag = first.capitalize() if first.isupper() else first
            # keep original casing for element names
            tag = first
            desc_lines = rest[1:]
        elif len(first.split()) <= 2 and not first.endswith('.') and not first.endswith('!') and not first.endswith('?'):
            tag = first
            desc_lines = rest[1:]
    desc = ' '.join(l.strip() for l in desc_lines).strip()
    return {'name': name, 'tag': tag, 'desc': desc}

i = 0
n = len(lines)
while i < n:
    line = lines[i].strip()
    if not line:
        i += 1
        continue
    if line.lower() == 'adicionar':
        i += 1
        continue
    upper = line.upper()
    is_section = upper in SECTIONS or upper == 'MODIFICACOES' or upper == 'MALDICOES' or upper == 'MODIFICAÇÔES' or upper == 'MALDIÇÔES' or upper == 'MODIFICAÇÕES' or upper == 'MALDIÇÕES'
    if is_section and len(line) > 3:
        if current_section is not None:
            sections.append({'section': current_section, 'items': current_items})
        current_section = 'MODIFICAÇÔES' if 'MODIF' in upper else 'MALDIÇÔES'
        current_items = []
        i += 1
        continue
    # accumulate item
    item_lines = [lines[i]]
    i += 1
    while i < n:
        l = lines[i].strip()
        if not l:
            it = flush_item(item_lines)
            if it: current_items.append(it)
            item_lines = []
            i += 1
            while i < n and not lines[i].strip():
                i += 1
            break
        if l.lower() == 'adicionar':
            it = flush_item(item_lines)
            if it: current_items.append(it)
            item_lines = []
            i += 1
            while i < n and not lines[i].strip():
                i += 1
            break
        if l.upper() in SECTIONS or l.strip().upper() == 'MODIFICAÇÔES' or l.strip().upper() == 'MALDIÇÔES' or l.strip().upper() == 'MODIFICACOES' or l.strip().upper() == 'MALDICOES':
            it = flush_item(item_lines)
            if it: current_items.append(it)
            item_lines = []
            break
        item_lines.append(lines[i])
        i += 1
    if item_lines:
        it = flush_item(item_lines)
        if it: current_items.append(it)
        item_lines = []

if current_section is not None:
    sections.append({'section': current_section, 'items': current_items})

# Build JS
def js_str(s):
    return json.dumps(s, ensure_ascii=False)

out = 'var MELHORIAS = [\n'
for sec in sections:
    out += '  {section:' + js_str(sec['section']) + ', items:[\n'
    for it in sec['items']:
        out += '    {name:' + js_str(it['name']) + ', tag:' + js_str(it['tag']) + ', desc:' + js_str(it['desc']) + '},\n'
    out += '  ]},\n'
out += '];\n'

with open('melhorias_op.js', 'w', encoding='utf-8') as f:
    f.write(out)

print("Sections:", [(s['section'], len(s['items'])) for s in sections])
PY