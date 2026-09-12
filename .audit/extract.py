#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ekstrak SOAL_DATABASE dari data/soal.js ke .audit/db.json (bahan kerja audit)."""
import json, os

os.makedirs('.audit', exist_ok=True)
s = open('data/soal.js', encoding='utf-8').read()
i = s.index('{', s.index('SOAL_DATABASE'))
depth = 0
for n, ch in enumerate(s[i:]):
    if ch == '{':
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0:
            end = i + n + 1
            break
db = json.loads(s[i:end])
json.dump(db, open('.audit/db.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('kategori:', len(db), '| total soal:', sum(len(v['soal']) for v in db.values()))
