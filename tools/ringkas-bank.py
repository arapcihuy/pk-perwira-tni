#!/usr/bin/env python3
"""Ringkas bank soal: jumlah soal per bagian + contoh bentuknya.
Hanya untuk pemeriksaan (tidak mengubah apa pun)."""
import json
import glob
import re

for jalur in sorted(glob.glob('data/soal-*.js')):
    isi = open(jalur, encoding='utf-8').read()
    m = re.search(r'=\s*(\{.*\})\s*;?\s*$', isi, re.S)
    if not m:
        print(jalur, '-> pola tidak dikenali')
        continue
    try:
        d = json.loads(m.group(1))
    except Exception as e:
        print(jalur, '-> gagal urai:', e)
        continue
    nama = d.get('nama', '?')
    soal = d.get('soal', [])
    topik = {}
    bergambar = 0
    for s in soal:
        topik[s.get('topik', '-')] = topik.get(s.get('topik', '-'), 0) + 1
        if s.get('gambar') or s.get('gambarUrl'):
            bergambar += 1
    print('%-28s %-18s n=%-5d bergambar=%-4d topik=%s' % (
        jalur.split('/')[-1], nama, len(soal), bergambar,
        ', '.join('%s:%d' % kv for kv in sorted(topik.items(), key=lambda x: -x[1])[:6])))
    if soal:
        s = soal[0]
        print('    contoh kunci:', sorted(s.keys()))
