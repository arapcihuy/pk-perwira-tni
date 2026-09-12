#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cek cepat beberapa kelemahan bank soal & aplikasi (bahan evaluasi)."""
import json
import collections

db = json.load(open('.audit/db-new.json'))

c = collections.Counter()
for v in db.values():
    for q in v['soal']:
        c[q['jawaban']] += 1
tot = sum(c.values())
print('Sebaran posisi kunci jawaban (A-D):')
for k in sorted(c):
    print('   %s: %d soal (%.1f%%)' % (chr(65 + k), c[k], c[k] * 100.0 / tot))

tanpa = sum(1 for v in db.values() for q in v['soal'] if 'INGAT: ' not in q['pembahasan'])
print('Soal tanpa baris INGAT:', tanpa)
pendek = sum(1 for v in db.values() for q in v['soal'] if len(q['pembahasan']) < 150)
print('Pembahasan < 150 karakter:', pendek)
print('Bobot kategori:', {k: len(v['soal']) for k, v in db.items()})
