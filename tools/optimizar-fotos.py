#!/usr/bin/env python3
"""Optimiza las fotos del carrusel: genera AVIF + WebP redimensionados.

Uso:
    pip install pillow
    python3 tools/optimizar-fotos.py ruta/a/foto-6.jpg [mas fotos...]

Si no le pasás rutas, reprocesa cualquier .jpg/.jpeg/.png que encuentre en img/.
Salida: img/<nombre>.avif y img/<nombre>.webp (el original no se toca).
El ancho maximo es 1200px, suficiente para el carrusel (520px CSS) en
pantallas de hasta 2.3x de densidad, que cubre celulares actuales.
"""
import os
import sys
import glob
from PIL import Image, ImageOps

MAX_WIDTH = 1200
AVIF_QUALITY = 64   # elegido midiendo SSIM: ~0.95 con el menor peso
WEBP_QUALITY = 84   # respaldo para navegadores sin AVIF (Safari < 16.4)
OUT_DIR = 'img'


def optimizar(path):
    base = os.path.splitext(os.path.basename(path))[0]
    im = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    if im.width > MAX_WIDTH:
        im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS)

    avif = os.path.join(OUT_DIR, base + '.avif')
    webp = os.path.join(OUT_DIR, base + '.webp')
    # Guardar sin metadata: no se copia EXIF (ubicacion, dispositivo, fecha).
    im.save(avif, 'AVIF', quality=AVIF_QUALITY, speed=2)
    im.save(webp, 'WEBP', quality=WEBP_QUALITY, method=6)

    src_kb = os.path.getsize(path) / 1024
    print(f"{base}: {src_kb:.0f}KB -> {im.width}x{im.height} "
          f"avif={os.path.getsize(avif)/1024:.0f}KB webp={os.path.getsize(webp)/1024:.0f}KB")
    return im.width, im.height


def main():
    rutas = sys.argv[1:]
    if not rutas:
        for ext in ('jpg', 'jpeg', 'png'):
            rutas += glob.glob(os.path.join(OUT_DIR, f'*.{ext}'))
    if not rutas:
        sys.exit('No hay .jpg/.jpeg/.png que optimizar. Pasá las rutas como argumento.')

    os.makedirs(OUT_DIR, exist_ok=True)
    for r in sorted(rutas):
        w, h = optimizar(r)
        print(f'  -> acordate de poner width="{w}" height="{h}" en el <img> de index.html')


if __name__ == '__main__':
    main()
