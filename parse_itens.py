import re, json

raw = open('itens_raw.txt', encoding='utf-8').read()

# Split into blocks by "ver mais"
blocks = [b.strip() for b in raw.split('ver mais') if b.strip()]

STAT_KEYS = {'Categoria', 'Dano', 'Crítico', 'Alcance', 'Tipo', 'Espaços', 'Munição', 'Defesa', 'Efeito'}

entries = []
for b in blocks:
    lines = [l.rstrip() for l in b.splitlines()]
    # Remove leading/trailing empties
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        continue

    # First non-empty line = name
    name = lines[0].strip()
    idx = 1

    # Skip empties
    while idx < len(lines) and not lines[idx].strip():
        idx += 1

    # Optional group line: a line that doesn't start with a stat key and contains no ":"
    group = None
    # Known groups from the data
    known_groups = ['Armas Simples', 'Armas Táticas', 'Armas Pesadas', 'Munições', 'Proteções', 'Acessórios', 'Explosivos', 'Itens Operacionais', 'Itens Paranormais']
    # Check if next line is a group (no colon, or matches known group)
    if idx < len(lines):
        candidate = lines[idx].strip()
        if ':' not in candidate and (candidate in known_groups or ' - ' in candidate):
            group = candidate
            idx += 1
            while idx < len(lines) and not lines[idx].strip():
                idx += 1
        elif candidate.startswith('Defesa:'):
            group = 'Proteções'

    # Parse stats
    stats = {}
    while idx < len(lines):
        line = lines[idx].strip()
        if not line:
            idx += 1
            continue
        if line.lower() == 'adicionar':
            idx += 1
            j = idx
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and lines[j].strip().upper() in ('MORTE','SANGUE','CONHECIMENTO','ENERGIA','VARIA','MEDO'):
                group = 'Itens Paranormais'
                stats['_element'] = lines[j].strip().upper()
                idx = j + 1
                while idx < len(lines) and not lines[idx].strip():
                    idx += 1
            break
        # stat line: "Key: value"
        if ':' in line:
            key, val = line.split(':', 1)
            key = key.strip()
            val = val.strip()
            if key in STAT_KEYS:
                stats[key] = val
                idx += 1
                continue
        # If not a stat and not adicionar, break
        break

    # Rest is description
    desc_lines = lines[idx:]
    while desc_lines and not desc_lines[-1].strip():
        desc_lines.pop()
    # Remove "adicionar" if present
    desc_lines = [l for l in desc_lines if l.strip().lower() != 'adicionar']
    desc = '\n'.join(desc_lines).strip()

    # Build category letter and spaces
    cat = stats.get('Categoria', '0')
    # Normalize category
    if cat == '-':
        cat = '0'
    spaces_str = stats.get('Espaços', '1')
    try:
        spaces = int(spaces_str)
    except:
        spaces = 1

    # Build description text with stats
    parts = []
    if '_element' in stats:
        parts.append('Elemento: ' + stats.pop('_element'))
    if 'Dano' in stats:
        parts.append('Dano: ' + stats['Dano'])
    if 'Crítico' in stats:
        parts.append('Crítico: ' + stats['Crítico'])
    if 'Alcance' in stats:
        parts.append('Alcance: ' + stats['Alcance'])
    if 'Tipo' in stats:
        parts.append('Tipo: ' + stats['Tipo'])
    if 'Munição' in stats:
        parts.append('Munição: ' + stats['Munição'])
    if 'Defesa' in stats:
        parts.append('Defesa: ' + stats['Defesa'])
    if 'Efeito' in stats:
        parts.append('Efeito: ' + stats['Efeito'])
    stats_str = ' · '.join(parts)
    if stats_str and desc:
        full_desc = stats_str + '\n\n' + desc
    elif stats_str:
        full_desc = stats_str
    else:
        full_desc = desc

    # Determine group
    if group is None:
        group = 'Outros'

    # Simplify group to 5 categories
    gl=(group or '').lower()
    if 'arma' in gl: group='Armas'
    elif 'muni' in gl: group='Munições'
    elif 'prote' in gl: group='Proteções'
    elif 'paranorm' in gl: group='Itens Paranormais'
    else: group='Geral'
    entries.append((name, cat, spaces, full_desc, group))

# Build JS array (CAT format: [name, cat, spaces, desc, group])
def js_str(s):
    return json.dumps(s, ensure_ascii=False)

out = 'var ITENS_EXTRA = [\n'
for name, cat, spaces, desc, group in entries:
    out += f'  [{js_str(name)},{js_str(cat)},{spaces},{js_str(desc)},{js_str(group)}],\n'
out += '];\n'

with open('itens_extra.js', 'w', encoding='utf-8') as f:
    f.write(out)

print("Parsed", len(entries), "items")
# Show first few
for e in entries[:5]:
    print(e[0], '|', e[1], '|', e[4])
PY