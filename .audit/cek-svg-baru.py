#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verifikasi gambar baru (tes gambar & Kraepelin) sesuai spesifikasi."""
import re
import sys
import xml.etree.ElementTree as ET

sys.path.insert(0, '/Users/mac/tni-belajar/.audit')
from svg_tambahan import SVG_TAMBAHAN
from svg_kraepelin import SVG_KRAEPELIN

print('svg tambahan:', len(SVG_TAMBAHAN), '| svg kraepelin:', len(SVG_KRAEPELIN))
for d in (SVG_TAMBAHAN, SVG_KRAEPELIN):
    for k, v in d.items():
        ET.fromstring(v)
print('semua XML valid')

spek = {
    'k101': ([8, 6, 4, 9, 3, 7], [5, 2, 8, 1, 6, 4], [7, 3, 9, 5, 2, 8]),
    'k115': ([8, 3, 9, 2, 6, 5], [7, 6, 4, 9, 8, 3], [3, 5, 2, 7, 4, 9]),
}
for k, (c1, c2, c3) in spek.items():
    svg = SVG_KRAEPELIN[k]
    angka = [int(x) for x in re.findall(r"font-size='18'[^>]*>(\d)<", svg)]
    target = c1 + c2 + c3
    print(k, 'angka:', angka, '| cocok dengan spesifikasi:', angka == target)

for k in ['tg52', 'tg53', 'tg61', 'tg69', 'tg75', 'tg68', 'tg60']:
    svg = SVG_TAMBAHAN[k]
    print(k, '| line:', len(re.findall('<line', svg)), '| circle:', len(re.findall('<circle', svg)),
          '| rect:', len(re.findall('<rect', svg)), '| polygon:', len(re.findall('<polygon', svg)),
          '| teks:', re.findall(r'>([^<>]{1,16})</text>', svg)[:5])
