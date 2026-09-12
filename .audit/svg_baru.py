# -*- coding: utf-8 -*-
"""20 SVG baru untuk soal tes gambar (id tg31-tg50).

Gaya mengikuti SVG yang sudah ada di aplikasi:
- tanpa deklarasi <?xml ...?>, atribut kutip satu ('), satu baris tanpa newline
- kanvas 300x150 background #0c1829, <rect> kanvas sebagai elemen pertama
- garis/bentuk utama #4a90d9, aksen/tanda tanya #ffd700
- teks utama #fff, keterangan kecil #7a96b8 font-size 11 text-anchor middle
"""

BLUE = '#4a90d9'
GOLD = '#ffd700'
WHITE = '#fff'
GREY = '#7a96b8'
RED = '#e45b5b'
GREEN = '#22cc4a'

HEAD = ("<svg xmlns='http://www.w3.org/2000/svg' width='300' height='150' "
        "style='background:#0c1829'><rect width='300' height='150' fill='#0c1829'/>")


def n(v):
    return '%g' % v


def svg(*parts):
    return HEAD + ''.join(parts) + '</svg>'


def circ(cx, cy, r, stroke=BLUE, fill='none', sw=2):
    return "<circle cx='%s' cy='%s' r='%s' fill='%s' stroke='%s' stroke-width='%s'/>" % (
        n(cx), n(cy), n(r), fill, stroke, n(sw))


def box(x, y, w, h, stroke=BLUE, fill='none', sw=2):
    return "<rect x='%s' y='%s' width='%s' height='%s' fill='%s' stroke='%s' stroke-width='%s'/>" % (
        n(x), n(y), n(w), n(h), fill, stroke, n(sw))


def poly(points, fill='none', stroke=BLUE, sw=2, opacity=None):
    o = " opacity='%s'" % n(opacity) if opacity is not None else ''
    return "<polygon points='%s' fill='%s' stroke='%s' stroke-width='%s'%s/>" % (
        points, fill, stroke, n(sw), o)


def ln(x1, y1, x2, y2, stroke=BLUE, sw=2):
    return "<line x1='%s' y1='%s' x2='%s' y2='%s' stroke='%s' stroke-width='%s'/>" % (
        n(x1), n(y1), n(x2), n(y2), stroke, n(sw))


def t(x, y, s, fill=WHITE, size=14, anchor='middle'):
    return "<text x='%s' y='%s' fill='%s' font-size='%s' text-anchor='%s'>%s</text>" % (
        n(x), n(y), fill, n(size), anchor, s)


def dot(cx, cy, r=4, fill=BLUE, stroke=BLUE):
    return "<circle cx='%s' cy='%s' r='%s' fill='%s' stroke='%s'/>" % (
        n(cx), n(cy), n(r), fill, stroke)


def pola_titik(cx, cy, offsets, r=4):
    return ''.join(dot(cx + dx, cy + dy, r) for dx, dy in offsets)


def grup_kotak(cx, jumlah, cy=72, s=13, gap=4):
    """Kelompok kotak kecil (maks 3 per baris) untuk deret tg38."""
    rows = []
    rem = jumlah
    while rem > 0:
        take = min(3, rem)
        rows.append(take)
        rem -= take
    pitch = s + gap
    total_h = len(rows) * s + (len(rows) - 1) * gap
    top = cy - total_h / 2.0
    out = []
    for idx, cnt in enumerate(rows):
        w = cnt * s + (cnt - 1) * gap
        x0 = cx - w / 2.0
        y0 = top + idx * pitch
        for j in range(cnt):
            out.append(box(x0 + j * pitch, y0, s, s))
    return ''.join(out)


# tg31 - deret berulang: lingkaran, segitiga, persegi, lingkaran, '?'
tg31 = svg(
    circ(38, 72, 22),
    poly('93,50 71,94 115,94'),
    box(126, 50, 44, 44),
    circ(203, 72, 22),
    t(256, 88, '?', GOLD, 46),
    t(150, 138, 'lanjutan pola', GREY, 11),
)

# tg32 - panah berputar searah jarum jam: atas, kanan, bawah, '?'
tg32 = svg(
    t(50, 90, '&#8593;', BLUE, 44),
    t(122, 90, '&#8594;', BLUE, 44),
    t(194, 90, '&#8595;', BLUE, 44),
    t(258, 90, '?', GOLD, 46),
    t(150, 138, 'putar searah jarum jam', GREY, 11),
)

# tg33 - 'd' dicerminkan kiri-kanan
tg33 = svg(
    t(45, 96, 'd', WHITE, 64),
    t(150, 88, '&#8594;', BLUE, 40),
    t(255, 96, '?', GOLD, 64),
    t(150, 138, 'cermin kiri-kanan', GREY, 11),
)

# tg34 - 'p' dicerminkan atas-bawah
tg34 = svg(
    t(45, 96, 'p', WHITE, 64),
    t(150, 88, '&#8594;', BLUE, 40),
    t(255, 96, '?', GOLD, 64),
    t(150, 138, 'cermin atas-bawah', GREY, 11),
)

# tg35 - persegi besar dengan dua diagonal bersilangan
tg35 = svg(
    box(60, 20, 180, 110),
    ln(60, 20, 240, 130),
    ln(240, 20, 60, 130),
)

# tg36 - kisi persegi 2x2
tg36 = svg(
    box(90, 15, 120, 120),
    ln(150, 15, 150, 135),
    ln(90, 75, 210, 75),
)

# tg37 - deret titik: 1, 2, 3, 4 titik per kotak
_offs = {
    0: [(0, 0)],
    1: [(-9, -9), (9, 9)],
    2: [(-10, -8), (10, -8), (0, 9)],
    3: [(-10, -10), (10, -10), (-10, 10), (10, 10)],
}
_p37 = []
for _i in range(4):
    _x = 20 + _i * 65
    _cx = _x + 25
    _p37.append(box(_x, 40, 50, 50))
    _p37.append(pola_titik(_cx, 65, _offs[_i]))
    _p37.append(t(_cx, 108, str(_i + 1), GREY, 11))
tg37 = svg(*_p37)

# tg38 - deret jumlah kotak: 1, 3, 5, 7 kotak
tg38 = svg(''.join(grup_kotak(cx, nk) for cx, nk in
                   zip([45, 110, 175, 240], [1, 3, 5, 7])))

# tg39 - 6 lingkaran bergantian merah/biru
_cx39 = [32, 79, 126, 173, 221, 268]
_p39 = []
for _i, _cx in enumerate(_cx39):
    _c = RED if _i % 2 == 0 else BLUE
    _p39.append(circ(_cx, 66, 19, stroke=_c, fill=_c))
    _p39.append(t(_cx, 112, str(_i + 1), GREY, 11))
tg39 = svg(*_p39)

# tg40 - 6 kotak bergantian penuh/kosong
_p40 = []
for _i, _cx in enumerate(_cx39):
    if _i % 2 == 0:
        _p40.append(box(_cx - 17, 49, 34, 34, stroke=BLUE, fill=BLUE))
    else:
        _p40.append(box(_cx - 17, 49, 34, 34))
    _p40.append(t(_cx, 112, str(_i + 1), GREY, 11))
tg40 = svg(*_p40)

# tg41 - persegi berisi lingkaran kecil, lalu lingkaran besar + '?'
tg41 = svg(
    box(30, 30, 90, 90),
    circ(75, 75, 18),
    t(150, 84, '&#8594;', BLUE, 38),
    circ(240, 75, 48),
    t(240, 90, '?', GOLD, 42),
)

# tg42 - lingkaran berisi lingkaran kecil, lalu persegi besar + '?'
tg42 = svg(
    circ(75, 75, 45),
    circ(75, 75, 15),
    t(150, 84, '&#8594;', BLUE, 38),
    box(195, 30, 90, 90),
    t(240, 90, '?', GOLD, 42),
)

# tg43 - matriks 3x3: titik diagonal + '?'
tg43 = svg(
    box(87, 12, 126, 126),
    ln(129, 12, 129, 138),
    ln(171, 12, 171, 138),
    ln(87, 54, 213, 54),
    ln(87, 96, 213, 96),
    dot(108, 33, 10, fill=BLUE, stroke=BLUE),
    dot(150, 33, 10, fill=WHITE, stroke=BLUE),
    t(150, 87, '?', GOLD, 32),
)

# tg44 - deret angka 2, 4, 6, 8, '?'
tg44 = svg(
    t(35, 90, '2', WHITE, 44),
    t(90, 90, '4', WHITE, 44),
    t(145, 90, '6', WHITE, 44),
    t(200, 90, '8', WHITE, 44),
    t(255, 90, '?', GOLD, 46),
    t(150, 138, 'lanjutan deret', GREY, 11),
)

# tg45 - bentuk besar/kecil bergantian: lingkaran besar, lingkaran kecil,
#        persegi besar, persegi kecil, lingkaran besar, '?'
tg45 = svg(
    circ(30, 70, 17),
    circ(76, 70, 9),
    box(105, 53, 34, 34),
    box(159, 61, 18, 18),
    circ(214, 70, 17),
    t(260, 88, '?', GOLD, 38),
)

# tg46 - segitiga ujung ke atas + panah putar 90 derajat, lalu '?'
tg46 = svg(
    poly('70,30 42,95 98,95'),
    t(150, 86, '&#8635;', BLUE, 40),
    t(150, 122, '90 derajat', GREY, 11),
    poly('230,30 202,95 258,95'),
    t(230, 88, '?', GOLD, 30),
)

# tg47 - angka 6 diputar 180 derajat, lalu '?'
tg47 = svg(
    t(70, 102, '6', WHITE, 80),
    t(150, 90, '&#8635;', BLUE, 44),
    t(150, 128, '180 derajat', GREY, 11),
    t(240, 102, '?', GOLD, 80),
)

# tg48 - deret titik kelipatan tiga: 3, 6, 9 titik
_p48 = []
for _i, _x in enumerate([20, 78, 136]):
    _cx = _x + 27
    _cy = 72
    _p48.append(box(_x, 45, 54, 54))
    if _i == 0:
        _o = [(-15, 0), (0, 0), (15, 0)]
    elif _i == 1:
        _o = [(-15, -9), (0, -9), (15, -9), (-15, 9), (0, 9), (15, 9)]
    else:
        _o = [(-15, -15), (0, -15), (15, -15), (-15, 0), (0, 0), (15, 0),
              (-15, 15), (0, 15), (15, 15)]
    _p48.append(pola_titik(_cx, _cy, _o))
    _p48.append(t(_cx, 118, str(_i * 3 + 3), GREY, 11))
_p48.append(t(243, 88, '?', GOLD, 44))
tg48 = svg(*_p48)

# tg49 - matriks 2x2 angka: 1, 2 / 3, '?'
tg49 = svg(
    box(90, 25, 60, 50),
    box(150, 25, 60, 50),
    box(90, 75, 60, 50),
    box(150, 75, 60, 50),
    t(120, 62, '1', WHITE, 34),
    t(180, 62, '2', WHITE, 34),
    t(120, 112, '3', WHITE, 34),
    t(180, 112, '?', GOLD, 34),
)

# tg50 - 6 bendera bergantian merah, kuning, hijau
_cx50 = [32, 78, 124, 170, 216, 262]
_warna50 = [RED, GOLD, GREEN, RED, GOLD, GREEN]
_p50 = []
for _i, _cx in enumerate(_cx50):
    _p50.append(ln(_cx - 12, 35, _cx - 12, 100, GREY, 2))
    _w = _warna50[_i]
    _p50.append(box(_cx - 12, 35, 32, 22, stroke=_w, fill=_w))
    _p50.append(t(_cx, 118, str(_i + 1), GREY, 11))
tg50 = svg(*_p50)

SVG_BARU = {
    'tg31': tg31,
    'tg32': tg32,
    'tg33': tg33,
    'tg34': tg34,
    'tg35': tg35,
    'tg36': tg36,
    'tg37': tg37,
    'tg38': tg38,
    'tg39': tg39,
    'tg40': tg40,
    'tg41': tg41,
    'tg42': tg42,
    'tg43': tg43,
    'tg44': tg44,
    'tg45': tg45,
    'tg46': tg46,
    'tg47': tg47,
    'tg48': tg48,
    'tg49': tg49,
    'tg50': tg50,
}
