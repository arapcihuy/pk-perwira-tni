#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cari duplikat sejati: kategori + pertanyaan + himpunan opsi + kunci."""
import json, collections
db = json.load(open('.audit/db-new.json'))
grup = collections.defaultdict(list)
for c, v in db.items():
    for q in v['soal']:
        sig = (c, ' '.join(q['pertanyaan'].lower().split()),
               tuple(sorted(q['pilihan'])), q['pilihan'][q['jawaban']])
        grup[sig].append(q['id'])
dup = [(k[0], v, k[1][:55], k[3]) for k, v in grup.items() if len(v) > 1]
print('grup duplikat sejati:', len(dup))
for d in sorted(dup, key=lambda x: (x[0], x[1])):
    print('  %-18s %-22s kunci=%-28s | %s' % (d[0], ','.join(d[1]), d[3], d[2]))
