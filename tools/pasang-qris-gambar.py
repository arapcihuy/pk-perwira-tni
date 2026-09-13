#!/usr/bin/env python3
"""Pasang QRIS milik pemilik dari tangkapan layar: baca gambar, sahkan, rapikan, tanam nominal.

Pemilik cukup mengirim gambar QRIS dari aplikasi banknya. Alat ini:
  1. Membaca kode QR di dalam gambar (pemindai QR).
  2. Menyatakan isinya: penyedia, NMID, nama merchant, kota, dan memastikan checksum SAH.
     (Kalau gambar bukan QRIS, alat berhenti dan memberi tahu - tidak memasang yang salah.)
  3. Menyusun ulang jadi QR tajam berukuran layar dengan NOMINAL TERTANAM (mis. Rp 39.000),
     memakai tools/buat-qris.py (checksum dihitung ulang, standar EMVCo).
  4. Menyalakan pembayaran dan menyembunyikan nomor rekening supaya layar bayar bersih (QRIS saja).

Contoh:
  ~/venv-siappsikotes/bin/python tools/pasang-qris-gambar.py ~/Downloads/qris-livin.png
  ~/venv-siappsikotes/bin/python tools/pasang-qris-gambar.py ~/Downloads/qris-livin.png --jumlah 39000 --kirim
"""
import argparse
import os
import re
import subprocess
import sys

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KELUAR = os.path.join(APP, 'static', 'img', 'qris-bayar.png')
BUAT = os.path.join(APP, 'tools', 'buat-qris.py')
FITUR11 = os.path.join(APP, 'static', 'js', 'fitur11.js')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('gambar', help='berkas tangkapan layar QRIS dari aplikasi bank')
    ap.add_argument('--jumlah', type=int, default=39000, help='nominal yang ditanam (default 39000)')
    ap.add_argument('--tanpa-jumlah', action='store_true', help='biarkan pembeli mengetik nominal sendiri')
    ap.add_argument('--kirim', action='store_true')
    a = ap.parse_args()

    if not os.path.exists(a.gambar):
        print('gambar tidak ditemukan:', a.gambar)
        return 2

    # 1) baca kode QR dari gambar
    try:
        import cv2
    except ImportError:
        print('pemindai QR (opencv) tidak tersedia di Python ini.')
        print('Jalankan dengan: ~/venv-siappsikotes/bin/python tools/pasang-qris-gambar.py ...')
        return 3
    img = cv2.imread(a.gambar)
    if img is None or img.size == 0:
        print('gambar tidak terbaca.')
        return 2
    isi, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
    if not isi:
        print('Tidak ada kode QR yang terbaca di gambar itu.')
        print('Pastikan tangkapan layarnya hanya berisi kode QRIS (potong bagian lain), lalu coba lagi.')
        return 1
    print('isi QR terbaca (%d karakter): %s...' % (len(isi), isi[:60]))

    # 2) sahkan sebagai QRIS
    r = subprocess.run([sys.executable, BUAT, '--periksa', isi], capture_output=True, text=True)
    print('--- pemeriksaan isi ---')
    print((r.stdout or '').strip())
    if r.returncode != 0 or 'SAH' not in (r.stdout or '') or 'NMID' not in (r.stdout or ''):
        print('\nBERHENTI: isi QR itu bukan QRIS yang sah (atau checksumnya rusak).')
        print('Jangan dipasang. Kirim ulang tangkapan layar yang lebih jelas, atau salin teks QRIS dari aplikasi bank.')
        return 1

    m = re.search(r'NMID\s*:\s*(\S+)', r.stdout or '')
    nmid = m.group(1) if m else ''
    mnama = re.search(r'nama merchant:\s*(.+)', r.stdout or '')
    print('merchant:', (mnama.group(1).strip() if mnama else '?'), '| NMID:', nmid)

    # 3) susun ulang jadi QR tajam (dengan nominal bila diminta)
    os.makedirs(os.path.dirname(KELUAR), exist_ok=True)
    if a.tanpa_jumlah:
        cmd = [sys.executable, BUAT, '--statis', isi, '--tanpa-jumlah', '--keluar', KELUAR]
    else:
        cmd = [sys.executable, BUAT, '--statis', isi, '--jumlah', str(a.jumlah), '--keluar', KELUAR]
    r2 = subprocess.run(cmd, capture_output=True, text=True)
    print('--- pembuatan QR ---')
    print((r2.stdout or '').strip()[-600:])
    if r2.returncode != 0 or not os.path.exists(KELUAR):
        print('gagal membuat gambar QR.')
        return 1
    print('gambar terpasang: static/img/qris-bayar.png (%.1f KB)' % (os.path.getsize(KELUAR) / 1024))

    # 4) nyalakan pembayaran + sembunyikan rekening (QRIS saja)
    t = open(FITUR11, encoding='utf-8').read()
    t = re.sub(r"gambarQris:\s*'[^']*'", "gambarQris: 'static/img/qris-bayar.png'", t, count=1)
    if 'tampilkanRekening' not in t:
        t = re.sub(r"(rekening:\s*'[^']*',)", r"\1\n  tampilkanRekening: false,", t, count=1)
    t = re.sub(r"tampilkanRekening:\s*(true|false)", "tampilkanRekening: false", t, count=1)
    t = re.sub(r"aktif:\s*false", "aktif: true", t, count=1)
    open(FITUR11, 'w', encoding='utf-8').write(t)
    cek = subprocess.run(['node', '--check', FITUR11], capture_output=True, text=True)
    print('--- pengaturan ---')
    print('  sintaks fitur11 :', 'OK' if cek.returncode == 0 else cek.stderr[:200])
    print('  gambarQris      : static/img/qris-bayar.png')
    print('  tampilkanRekening:', 'false (QRIS saja)' if 'tampilkanRekening: false' in t else 'true')
    if cek.returncode != 0:
        return 1

    if a.kirim:
        pesan = '/tmp/pesan-qris.txt'
        open(pesan, 'w', encoding='utf-8').write(
            'feat: layar bayar memakai QRIS pemilik (nominal tertanam, nomor rekening disembunyikan)\n\n'
            'Gambar QRIS dari aplikasi bank pemilik dibaca dengan pemindai QR, checksumnya diperiksa (harus SAH),\n'
            'lalu disusun ulang menjadi QR tajam dengan nominal tertanam. Nomor rekening tidak lagi ditampilkan\n'
            'sehingga layar bayar bersih dan pembeli cukup memindai.\n')
        r3 = subprocess.run(['bash', 'tools/kirim.sh', pesan], cwd=APP, capture_output=True, text=True)
        print((r3.stdout or '')[-600:])
        return r3.returncode
    print('\nLangkah berikutnya: bash tools/kirim.sh /tmp/pesan-qris.txt')
    return 0


if __name__ == '__main__':
    sys.exit(main())
