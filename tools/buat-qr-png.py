#!/usr/bin/env python3
"""Buat gambar QR (PNG) untuk sebuah tautan. Dijalankan oleh tools/buat-flyer.py.

Butuh pustaka segno, jadi jalankan dengan penerjemah yang memilikinya:
  ~/venv-siappsikotes/bin/python3 tools/buat-qr-png.py <tautan> <keluaran.png>
"""
import sys
import segno


def main():
    if len(sys.argv) < 3:
        print('pakai: buat-qr-png.py <tautan> <keluaran.png>')
        return 2
    tautan, keluar = sys.argv[1], sys.argv[2]
    q = segno.make(tautan, error='h')
    q.save(keluar, scale=12, border=2, dark='#0a0f18', light='#ffffff')
    print('QR dibuat: %s -> %s' % (tautan, keluar))
    return 0


if __name__ == '__main__':
    sys.exit(main())
