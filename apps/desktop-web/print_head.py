from pathlib import Path
text = Path('src/screens/PerfilCuenta/PerfilCuenta.tsx').read_text()
print(text[:400])
