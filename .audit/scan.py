#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Deteksi distraktor janggal dan soal berulang pada bank soal."""
import json, re, collections
db = json.load(open('.audit/db-new.json'))


def val(s):
    s = s.strip()
    m = re.match(r'^Rp([\d\.]+)$', s)
    if m:
        return int(m.group(1).replace('.', ''))
    m = re.match(r'^(\d+)/(\d+)$', s)
    if m and int(m.group(2)):
        return float(m.group(1)) / float(m.group(2))
    m = re.match(r'^([\d]+(?:[.,]\d+)?)', s)
    if m:
        try:
            return float(m.group(1).replace('.', '').replace(',', '.'))
        except ValueError:
            return None
    return None


aneh = []
for c, v in db.items():
    for q in v['soal']:
        if re.search(r'[⁰¹²³⁴⁵⁶⁷⁸⁹]', q['pilihan'][q['jawaban']]):
            continue
        if re.search(r'[A-Za-z]{3,}', q['pilihan'][q['jawaban']]):
            continue
        kv = val(q['pilihan'][q['jawaban']])
        if kv is None or kv == 0:
            continue
        os2 = [val(p) for p in q['pilihan']]
        os2 = [x for x in os2 if x is not None]
        if len(os2) < 4:
            continue
        rel = [abs(x - kv) / abs(kv) for x in os2 if x != kv]
        if not rel:
            continue
        if max(rel) > 0.6 or (max(rel) > 0.35 and min(rel) > 0.05):
            aneh.append((c, q['id'], q['pilihan'], kv))
print('kandidat distraktor janggal:', len(aneh))
for a in aneh[:45]:
    print('   ', a[0], a[1], a[2], 'kunci:', a[3])

d = collections.defaultdict(list)
for c, v in db.items():
    for q in v['soal']:
        d[(c, ' '.join(q['pertanyaan'].lower().split()))].append(q['id'])
dup = [(c, len(ids), ids, t) for (c, t), ids in d.items() if len(ids) > 1]
print()
print('pertanyaan dengan teks identik:', len(dup))
for x in sorted(dup, key=lambda z: -z[1])[:25]:
    print('   ', x[0], x[1], 'x', x[2], '|', x[3][:58])

isi = collections.defaultdict(list)
for c, v in db.items():
    for q in v['soal']:
        isi[(c, tuple(q['pilihan']), q['pilihan'][q['jawaban']])].append(q['id'])
same = [(k[0], v) for k, v in isi.items() if len(v) > 1]
print()
print('opsi+kunci identik dalam kategori sama:', len(same))
for s in same[:15]:
    print('   ', s)
