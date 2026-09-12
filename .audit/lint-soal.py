#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lint & rapikan penulisan soal: spasi ganda, spasi di ujung, 'x' vs '×',
spasi pada tanda ≥/≤, tanda hubung ganda, dan lain-lain.

Dipakai fix.py (bagian 1i). Menulis laporan ke .audit/laporan-lint.txt
"""
import json
import re

PERBAIKAN = [
    # (nama perbaikan, pola, pengganti) — hanya perbaikan yang aman & tidak mengubah makna
    ('spasi ganda', r'  +', ' '),
    # hanya ' x ' yang berspasi di kedua sisi (perkalian). '3x3' (ukuran matriks/kisi)
    # dibiarkan apa adanya karena itu konvensi penulisan ukuran.
    ('x sebagai perkalian antar angka', r'(?<=\d)\s+x\s+(?=\d)', ' × '),
    ('X besar sebagai perkalian antar angka', r'(?<=\d)\s+X\s+(?=\d)', ' × '),
    # jangan sentuh elipsis '...' — konvensi bank soal memakai spasi sebelum '...'
    # titik dua juga tidak diubah di sini: soal analogi memakai konvensi 'A : B = C : ...'
    ('spasi sebelum tanda baca', r'\s+([,;!?])', r'\1'),
    ('spasi sebelum titik tunggal', r'\s+\.(?![.])', '.'),
    ('spasi pada ≥', r'≥\s+(\d)', r'≥\1'),
    ('spasi pada ≤', r'≤\s+(\d)', r'≤\1'),
    ('tanda hubung ganda', r'--+', '-'),
    ('spasi sebelum persen', r'(\d)\s+%', r'\1%'),
    ('titik dua berlebih', r':\s*:+', ':'),
]


def rapikan_analogi(teks):
    """Soal analogi memakai konvensi 'A : B = C : ...' dengan spasi di kedua sisi titik dua."""
    if '=' not in teks or ':' not in teks:
        return teks, False
    baru = re.sub(r'\s*:\s*', ' : ', teks)
    baru = re.sub(r'\s*=\s*', ' = ', baru)
    baru = re.sub(r'  +', ' ', baru).strip()
    return baru, (baru != teks)


def bersihkan(teks):
    asli = teks
    for _, pola, ganti in PERBAIKAN:
        teks = re.sub(pola, ganti, teks)
    teks = teks.strip()
    return teks, (teks != asli)


def jalankan(db, lapor=True):
    jumlah = 0
    catatan = []
    for kat, v in db.items():
        for q in v['soal']:
            baru, ubah = bersihkan(q['pertanyaan'])
            if kat == 'verbal':
                baru2, ubah2 = rapikan_analogi(baru)
                if ubah2:
                    baru, ubah = baru2, True
            if ubah:
                catatan.append('[%s] pertanyaan %s: %r -> %r' % (kat, q['id'], q['pertanyaan'][:70], baru[:70]))
                q['pertanyaan'] = baru
                jumlah += 1
            for i, p in enumerate(q['pilihan']):
                pb, ubahp = bersihkan(p)
                if ubahp:
                    catatan.append('[%s] pilihan %s#%d: %r -> %r' % (kat, q['id'], i, p[:40], pb[:40]))
                    q['pilihan'][i] = pb
                    jumlah += 1
    if lapor:
        with open('.audit/laporan-lint.txt', 'w', encoding='utf-8') as f:
            f.write('\n'.join(catatan) if catatan else 'tidak ada temuan')
        print('lint soal: %d perbaikan penulisan (laporan: .audit/laporan-lint.txt)' % jumlah)
    return jumlah


if __name__ == '__main__':
    db = json.load(open('.audit/db-new.json'))
    jalankan(db)
