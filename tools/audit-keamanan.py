#!/usr/bin/env python3
"""Audit statis kode server: mencari pola berbahaya yang biasa menjadi celah.

Yang dicari: SQL disusun dari rangkaian teks, eval/Function, kunci rahasia tercecer,
dan penanganan penulisan yang tidak memeriksa sesi lebih dulu.

Jujur soal batasnya: audit statis hanya menemukan pola yang DIKENALI. Ia tidak
membuktikan sistem bebas celah.
"""
import os
import re
import sys

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BERKAS = [os.path.join(APP, 'server', 'src', 'index.js')]

POLA = [
    (r"prepare\s*\(\s*[^)]*\+\s*[a-zA-Z_$]", 'bahaya', 'SQL disusun dari rangkaian teks/variabel'),
    (r"\beval\s*\(|new\s+Function\s*\(", 'bahaya', 'pemakaian eval/new Function'),
    (r"(service_role|SERVICE_ROLE|sk_live|SECRET_KEY\s*=|PASSWORD\s*=)", 'bahaya', 'kemungkinan kunci rahasia tercecer'),
    (r"SELECT\s+\*", 'periksa', 'SELECT * (ambillah kolom yang perlu saja)'),
    (r"Access-Control-Allow-Origin['\"]?\s*:\s*['\"]\*", 'bahaya', 'CORS terbuka untuk semua asal'),
    (r"innerHTML\s*=\s*[^;]*\+", 'periksa', 'penyusunan HTML dari rangkaian teks (risiko XSS)'),
]

temuan = []
for p in BERKAS:
    if not os.path.exists(p):
        continue
    nama = os.path.basename(p)
    t = open(p, encoding='utf-8').read()
    for nomor, baris in enumerate(t.split('\n'), 1):
        if baris.strip().startswith('//') or baris.strip().startswith('*'):
            continue   # lewati komentar: hanya kode yang dinilai
        for pola, tingkat, pesan in POLA:
            if re.search(pola, baris):
                temuan.append((nama, nomor, tingkat, pesan, baris.strip()[:95]))

    # setiap penanganan penulisan harus memeriksa sesi lebih dulu
    for m in re.finditer(r"if \(jalan === '(/api/[a-z0-9\-]+)' && request\.method === 'POST'\)", t):
        blok = t[m.end():m.end() + 500]
        if 'saya' not in blok and 'periksaTokenGoogle' not in blok and 'sesiDariPermintaan' not in blok:
            temuan.append((nama, 0, 'bahaya', 'penulisan tanpa memeriksa sesi: ' + m.group(1), ''))

print('AUDIT KODE SERVER')
print('  berkas diperiksa:', len([p for p in BERKAS if os.path.exists(p)]))
print('  kueri dengan parameter terikat (?) :', len(re.findall(r'\.bind\(', open(BERKAS[0], encoding='utf-8').read())) if os.path.exists(BERKAS[0]) else 0)
if temuan:
    print('  TEMUAN (%d):' % len(temuan))
    for nama, nomor, tingkat, pesan, cuplik in temuan:
        print('    [%s] %s:%s %s | %s' % (tingkat, nama, nomor, pesan, cuplik))
else:
    print('  tidak ada pola berbahaya yang terdeteksi')
print('  catatan: audit statis hanya menemukan pola yang DIKENALI - bukan bukti bebas celah.')
sys.exit(1 if [x for x in temuan if x[2] == 'bahaya'] else 0)
