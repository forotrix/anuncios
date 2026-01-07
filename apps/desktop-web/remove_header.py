from pathlib import Path
path = Path('src/screens/PerfilCuenta/PerfilCuenta.tsx')
text = path.read_text()
start = text.find('<div className="absolute w-full h')
if start == -1:
    raise SystemExit('start not found')
end_marker = '<Link href="/anuncio"'
end = text.find(end_marker, start)
if end == -1:
    raise SystemExit('end marker not found')
end = text.find('</Link>', end)
if end == -1:
    raise SystemExit('closing </Link> not found')
end += len('</Link>')
while end < len(text) and text[end] in '\r\n':
    end += 1
new_text = text[:start] + text[end:]
path.write_text(new_text)
