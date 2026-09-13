#!/usr/bin/env python3
"""Ubah tautan pembayaran (checkout platform) menjadi QR di aplikasi.

Kenapa: QRIS hanya terbit dari bank/PJSP. Tetapi kalau pemilik sudah punya halaman checkout
(mis. Lynk.id / Avora / Saweria / Ratapay), halaman itu SENDIRI sudah menerima QRIS, VA, dan e-wallet.
Maka aplikasi cukup menampilkan QR dari tautan checkout itu: pembeli memindai, membayar di halaman
platform, dan kode/produk terkirim otomatis oleh platform. Pemilik tidak perlu menyiapkan gambar QRIS.

Contoh:
  ~/venv-siappsikotes/bin/python tools/buat-qr-tautan.py --tautan "https://lynk.id/..." --kirim
  ~/venv-siappsikotes/bin/python tools/buat-qr-tautan.py --tautan "..." --nama "Akses penuh SiapPsikotes"
"""
import argparse
import os
import re
import shutil
import subprocess
import sys

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KELUAR = os.path.join(APP, 'static', 'img', 'qr-bayar.png')
FITUR11 = os.path.join(APP, 'static', 'js', 'fitur11.js')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tautan', required=True, help='tautan halaman pembayaran/checkout')
    ap.add_argument('--nama', default='SiapPsikotes', help='nama merchant untuk isi QR (opsional)')
    ap.add_argument('--kirim', action='store_true')
    ap.add_argument('--matikan', action='store_true', help='hapus QR tautan (kembali ke cara sebelumnya)')
    a = ap.parse_args()

    if not re.match(r'^https?://', a.tautan):
        print('tautan harus dimulai dengan http:// atau https://')
        return 2

    t = open(FITUR11, encoding='utf-8').read()

    if a.matikan:
        t = re.sub(r"tautanBayar:\s*'[^']*'", "tautanBayar: ''", t, count=1)
        t = re.sub(r"gambarQris:\s*'[^']*'", "gambarQris: ''", t, count=1)
        t = re.sub(r"tampilkanRekening:\s*(true|false)", "tampilkanRekening: true", t, count=1)
        open(FITUR11, 'w', encoding='utf-8').write(t)
        print('QR tautan dimatikan; cara pembayaran sebelumnya dipakai lagi')
        return 0

    # 1) buat QR dari tautannya (pustaka gambar ada di venv)
    try:
        import segno
    except ImportError:
        print('pustaka gambar QR tidak ada. Jalankan dengan ~/venv-siappsikotes/bin/python')
        return 3
    os.makedirs(os.path.dirname(KELUAR), exist_ok=True)
    segno.make(a.tautan, error='m').save(KELUAR, scale=8, border=3, dark='#0e1626', light='#ffffff')
    print('QR tautan dibuat: static/img/qr-bayar.png (%.1f KB)' % (os.path.getsize(KELUAR) / 1024))

    # 2) periksa QR-nya benar-benar memuat tautan itu
    try:
        import cv2
        img = cv2.imread(KELUAR)
        isi, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
        print('uji baca ulang QR:', 'COCOK' if isi == a.tautan else 'TIDAK COCOK (%s)' % isi[:50])
        if isi != a.tautan:
            return 1
    except ImportError:
        print('(pemindai QR tidak ada; uji baca ulang dilewati)')

    # 3) pasang ke pengaturan
    if 'tautanBayar' not in t:
        t = re.sub(r"(tautan:\s*'[^']*',)", r"\1\n  tautanBayar: '',           // halaman checkout platform (QR ditampilkan dari tautan ini)", t, count=1)
    t = re.sub(r"tautanBayar:\s*'[^']*'", "tautanBayar: '%s'" % a.tautan.replace("'", "\\'"), t, count=1)
    t = re.sub(r"gambarQris:\s*'[^']*'", "gambarQris: 'static/img/qr-bayar.png'", t, count=1)
    t = re.sub(r"aktif:\s*false", "aktif: true", t, count=1)
    if 'tampilkanRekening' not in t:
        t = re.sub(r"(rekening:\s*'[^']*',)", r"\1\n  tampilkanRekening: true,", t, count=1)
    # dengan QR tautan, nomor rekening tidak perlu ditampilkan
    t = re.sub(r"tampilkanRekening:\s*(true|false)", "tampilkanRekening: false", t, count=1)
    open(FITUR11, 'w', encoding='utf-8').write(t)

    cek = subprocess.run(['node', '--check', FITUR11], capture_output=True, text=True)
    print('sintaks fitur11:', 'OK' if cek.returncode == 0 else cek.stderr[:200])
    if cek.returncode != 0:
        return 1
    print('pengaturan: tautanBayar aktif, gambarQris = static/img/qr-bayar.png, rekening disembunyikan')

    if a.kirim:
        pesan = '/tmp/pesan-qr-tautan.txt'
        open(pesan, 'w', encoding='utf-8').write(
            'feat: pembayaran lewat QR dari tautan checkout platform\n\n'
            'Aplikasi menampilkan QR yang memuat tautan halaman pembayaran platform (yang di dalamnya sudah ada\n'
            'QRIS, VA, dan e-wallet). Pembeli memindai, membayar di halaman platform, dan kode/produk dikirim\n'
            'otomatis oleh platform - sehingga pemilik tidak perlu menyiapkan gambar QRIS sendiri.\n\n'
            'QR dibuat lokal (tanpa layanan pihak ketiga) dan dibaca ulang untuk memastikan isinya benar.\n')
        r = subprocess.run(['bash', 'tools/kirim.sh', pesan], cwd=APP, capture_output=True, text=True)
        print((r.stdout or '')[-600:])
        return r.returncode
    print('\nLangkah berikutnya: bash tools/kirim.sh /tmp/pesan-qr-tautan.txt')
    print('Catatan: layar bayar perlu menampilkan tombol buka tautan - jalankan pemasangan tampilan lebih dulu.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
