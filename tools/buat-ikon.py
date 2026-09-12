#!/usr/bin/env python3
"""Cetak ikon aplikasi dari static/icons/logo.svg.

Menghasilkan:
  icon-192.png            - ikon PWA biasa
  icon-512.png            - ikon PWA besar
  icon-maskable-512.png   - ikon maskable (grafik aman di dalam area tengah, untuk Android)
  apple-touch-icon-180.png- ikon iOS
  favicon-32.png          - ikon tab peramban

Cara kerja: membuka berkas SVG di peramban sungguhan (Playwright) lalu memotretnya pada
ukuran yang diminta. Tidak ada alat gambar tambahan yang dibutuhkan.

Pakai:  python3 tools/buat-ikon.py
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IKON = os.path.join(ROOT, 'static', 'icons')
SVG = os.path.join(IKON, 'logo.svg')

UKURAN = [
    ('icon-192.png', 192, 1.0),
    ('icon-512.png', 512, 1.0),
    ('icon-maskable-512.png', 512, 0.74),   # grafik diperkecil agar aman saat dipotong bentuk apa pun
    ('apple-touch-icon-180.png', 180, 1.0),
    ('favicon-32.png', 32, 1.0),
]


def main():
    if not os.path.exists(SVG):
        print('logo.svg tidak ditemukan:', SVG)
        return 1
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('Playwright belum terpasang (pip install playwright && playwright install chromium)')
        return 1

    svg_isi = open(SVG, encoding='utf-8').read()
    hasil = []

    with sync_playwright() as p:
        browser = None
        for cara in (lambda: p.chromium.launch(channel='chrome'), lambda: p.chromium.launch()):
            try:
                browser = cara()
                break
            except Exception:
                continue
        if browser is None:
            print('tidak bisa meluncurkan peramban')
            return 1

        for nama, ukuran, skala in UKURAN:
            page = browser.new_page(viewport={'width': ukuran, 'height': ukuran},
                                    device_scale_factor=1)
            dalam = int(round(ukuran * skala))
            sisa = (ukuran - dalam) // 2
            html = ('<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
                    'html,body{margin:0;padding:0;background:transparent;width:%dpx;height:%dpx;'
                    'display:flex;align-items:center;justify-content:center;overflow:hidden}'
                    'svg{width:%dpx;height:%dpx;display:block}</style></head><body>%s</body></html>'
                    % (ukuran, ukuran, dalam, dalam, svg_isi))
            page.set_content(html, wait_until='load')
            keluaran = os.path.join(IKON, nama)
            # potret hanya kotak dalam (rata tengah), sisanya transparan untuk maskable
            page.screenshot(path=keluaran, omit_background=True,
                            clip={'x': sisa, 'y': sisa, 'width': dalam, 'height': dalam})
            page.close()
            hasil.append((nama, ukuran, os.path.getsize(keluaran)))
        browser.close()

    print('ikon dicetak dari logo.svg:')
    for nama, ukuran, byte in hasil:
        print('  %-26s %4dpx  %6.1f KB' % (nama, ukuran, byte / 1024))
    return 0


if __name__ == '__main__':
    sys.exit(main())
