#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Susun ulang fix.py: blok 'rapikan distraktor' dipindah setelah penerapan koreksi
supaya membaca data yang sudah dikoreksi, dan memakai setq() alih-alih F()."""
import re
p = '.audit/fix.py'
s = open(p, encoding='utf-8').read()

start = s.index('# ============================================================ 1b.')
end = s.index('# ============================================================ 2. terapkan koreksi')
blok = s[start:end]
s = s[:start] + s[end:]

# F(...) di dalam blok -> setq(...)
blok = blok.replace("F('", "setq('")
blok = blok.replace('# --- (f) soal duplikat', '# --- (f) soal duplikat')

# akar yang dipakai ulang -> ganti ke nilai yang belum terpakai
blok = blok.replace('pertanyaan="√324 = ...", pilihan=["17", "18", "19", "20"], jawaban=1',
                    'pertanyaan="√729 = ...", pilihan=["25", "26", "27", "28"], jawaban=2')
blok = blok.replace('pembahasan="√324 = 18, karena 18 × 18 = 324."',
                    'pembahasan="√729 = 27, karena 27 × 27 = 729."')
blok = blok.replace('pertanyaan="√441 = ...", pilihan=["19", "20", "21", "22"], jawaban=2',
                    'pertanyaan="√784 = ...", pilihan=["26", "27", "28", "29"], jawaban=2')
blok = blok.replace('pembahasan="√441 = 21, karena 21 × 21 = 441."',
                    'pembahasan="√784 = 28, karena 28 × 28 = 784."')
blok = blok.replace('pertanyaan="√529 = ...", pilihan=["21", "22", "23", "24"], jawaban=2',
                    'pertanyaan="√841 = ...", pilihan=["27", "28", "29", "30"], jawaban=2')
blok = blok.replace('pembahasan="√529 = 23, karena 23 × 23 = 529."',
                    'pembahasan="√841 = 29, karena 29 × 29 = 841."')

helper = '''
def setq(cat, qid, **kw):
    """Ubah langsung satu soal di db (dipakai setelah koreksi utama diterapkan)."""
    for so in db[cat]['soal']:
        if so['id'] == qid:
            so.update(kw)
            return
    raise KeyError((cat, qid))

'''
blok = helper + blok

anchor = "print('PERINGATAN setelah koreksi:'"
s = s.replace(anchor, blok + anchor, 1)
open(p, 'w', encoding='utf-8').write(s)
print('blok dipindah. panjang file:', len(s))
print('cek urutan: 1b ->', s.index('# --- (a) opsi bilangan'), '| setq ->', s.index('def setq'), '| apply ->', s.index('PERINGATAN setelah koreksi'))
