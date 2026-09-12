#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Beri label topik pada setiap soal (untuk filter Bank Soal & drill per topik).

Aturan berbasis kata kunci per kategori, diurutkan dari yang paling spesifik.
Jalankan: python3 .audit/tag-soal.py   (menulis .audit/topik.json)
"""
import json
import re
import collections

ATURAN = {
    'tkw': [
        ('tni-au', r'\bau\b|auri|lanud|skadron|paskhas|kopasgat|ksau|swa bhuwana|pesawat|f-16|rafale|nasams|t-50|sukhoi|hercules|tucano|adisutjipto|abdulrachman|halim|iswahjudi|suryadarma|dakota'),
        ('pancasila', r'sila|pancasila|garuda|bhinneka|piagam jakarta|kesaktian'),
        ('uud', r'pasal|uud 1945|amandemen|amendemen|mpr|dpr|dpd|mahkamah|komisi yudisial|bpk|pemilu|kpu|presiden|negara hukum|ham|hak asasi'),
        ('tni-umum', r'\btni\b|prajurit|sapta marga|sumpah|cadek|tridek|doktrin|tkr|kartika eka paksi|jalesveva|tri ubaya|kopassus|marinir|denjaka|batalyon|kompi|pangkat|ksad|kasal|panglima|komponen|omsp|alutsista'),
        ('ketahanan', r'ketahanan|wawasan nusantara|sishankam|bela negara|gatra|trigatra|pancagatra|nusantara|komponen cadangan|psdn'),
        ('sejarah', r'tanggal|hari |proklamasi|bpupki|ppki|rengasdengklok|linggarjati|renville|kmb|meja bundar|djuanda|trikora|dwikora|sumpah pemuda|kebangkitan|budi utomo|pahlawan|pertempuran|g30s|kemerdekaan|provinsi|ikn|pulau'),
    ],
    'uud': [('khusus-uud', r'.')],
    'matematika': [
        ('aljabar', r'nilai x|nilai y|nilai xy|nilai x²|persamaan|2x|3x|4x|5x|6x|7x|8x|9x|p = |q = |a = |b = '),
        ('persen-untung', r'%|persen|diskon|untung|rugi|harga'),
        ('geometri', r'luas|keliling|volume|persegi|segitiga|lingkaran|kubus|balok|trapesium|hipotenusa|rusuk|jari-jari|diameter'),
        ('deret', r'deret|suku ke'),
        ('statistik', r'rata-rata|median|modus'),
        ('perbandingan-pekerja', r'pekerja|hari|pipa|kolam|perbandingan|x:y'),
        ('kecepatan', r'kecepatan|km/jam|jarak|menempuh|waktu tempuh'),
        ('peluang-bilangan', r'peluang|cara|dipilih|prima|fpb|kpk|faktorial'),
    ],
    'bahasa_inggris': [
        ('passive', r'passive|submitted|inspected|lowered|must be|was |were |cleared|dilakukan oleh'),
        ('conditional', r'if i|had i|would have|conditional|if the'),
        ('subjunctive', r'suggested that|demanded|insisted|essential that|wish|as if'),
        ('inversion', r'hardly|seldom|rarely|not only|under no circumstances|not until|only after'),
        ('agreement', r'salah secara grammar|correct sentence|correctly|neither|each |the number of|a series of|equipment|news|police|along with'),
        ('tenses', r'yesterday|last |since|already|been |marched|attacked|survived|had |have |has '),
        ('vocabulary', r'sinonim|antonim|closest in meaning|opposite in meaning|means|word .* means|altitude|takeoff|patrol|minimum|offensive|ascend|ally|reinforce|airbase|aircraft|missile|squadron|deploy|wing'),
        ('idiom', r'idiom'),
        ('reading', r'main idea|according to|why was|what did|what was|what is the'),
        ('preposition', r'guard duty|in the loop|preposition'),
    ],
    'penalaran_logika': [
        ('deret-huruf', r'deret huruf|huruf berikutnya'),
        ('sandi', r'kode|a=1|dalam angka|digeser|menjadi '),
        ('matriks-gambar', r'matriks|pola gambar|pola berikut'),
        ('silogisme', r'semua |beberapa |tidak ada |kesimpulan'),
        ('urutan', r'lebih cepat|lebih tinggi|lebih lambat|lebih pendek|lebih berat|terkuat|tercepat|tertinggi|urutan'),
        ('hari', r'jika hari|hari lagi|hari ke-'),
        ('peluang', r'peluang|bola|kotak ada'),
        ('deret-angka', r'deret|angka berikutnya|suku'),
        ('implikasi', r'jika .*maka|asap|api|hujan|basah'),
    ],
    'numerik': [
        ('fpb-kpk', r'^(FPB|KPK) dari'),
        ('pecahan', r'\d/\d'),
        ('desimal', r'\d,\d'),
        ('persen', r'% dari|berapa persen'),
        ('akar-pangkat', r'√|Akar dari|[⁰¹²³⁴⁵⁶⁷⁸⁹]'),
        ('deret', r'deret|suku ke'),
        ('harga', r'harga|buku|diskon|Rp'),
        ('rata-rata', r'rata-rata|jumlah seluruh'),
        ('perkalian-pembagian', r'[x×÷/]'),
        ('hitung-cepat', r'^[\d\s\+\-]+='),
    ],
    'verbal': [
        ('analogi', r':.*=|: *\.\.\.'),
        ('baku', r'baku|kbbi|tidak baku|penulisan'),
        ('efektif', r'efektif|mubazir'),
        ('idiom', r'ungkapan|idiom'),
        ('sinonim', r'sinonim|makna sama|bersinonim'),
        ('antonim', r'antonim|lawan kata'),
    ],
    'kraepelin': [
        ('aturan-satuan', r'berapa hasil|menjumlahkan'),
        ('pengetahuan-tes', r'kolom|jenis|aturan kraepelin|berapa banyak'),
        ('strategi', r'strategi|ritme|nilai kraepelin|paling mempengaruhi|waktu tinggal'),
    ],
    'tes_gambar': [
        ('hitung-bangun', r'berapa banyak|berapa banyak segitiga|berapa banyak persegi|berapa banyak kubus|berapa sisi'),
        ('cermin-rotasi', r'cermin|bayangan|diputar|rotasi|putar'),
        ('matriks', r'matriks|kisi|grid'),
        ('analogi-gambar', r'analogi|berisi'),
        ('deret-pola', r'deret|pola|urutan ke'),
    ],
    'kepribadian': [
        ('integritas', r'curang|palsu|memalsukan|menyuap|uang|jujur|kesalahan|rahasia|melanggar aturan|barang'),
        ('kepemimpinan', r'memimpin|pemimpin|tim yang|bawahan|senior|membimbing|mengambil keputusan'),
        ('disiplin', r'terlambat|jaga|apel|aturan|prosedur|pelanggaran|tugas tambahan|jadwal'),
        ('kerja-sama', r'rekan|kelompok|anggota|berselisih|membantu|korsa|menolong'),
        ('komunikasi', r'atasan|menyampaikan|kritik|berbeda pendapat|briefing|bicara'),
        ('tanggung-jawab', r'gagal|salah|mengakui|tanggung jawab|tidak lulus|cedera|lelah|panik'),
    ],
}


def pilih_topik(kat, teks):
    for nama, pola in ATURAN.get(kat, []):
        if re.search(pola, teks, re.I):
            return nama
    return 'umum'


def main():
    db = json.load(open('.audit/db-new.json'))
    hasil = {}
    sebaran = collections.Counter()
    for kat, v in db.items():
        for q in v['soal']:
            t = q['pertanyaan']
            topik = pilih_topik(kat, t)
            # aturan cadangan: kategori tertentu memakai tipe soal yang khas
            if topik == 'umum':
                if kat == 'bahasa_inggris':
                    topik = 'vocabulary'
                elif kat == 'verbal':
                    topik = 'sinonim'
                elif kat == 'numerik':
                    topik = 'hitung-cepat'
                elif kat == 'matematika':
                    topik = 'statistik'
                elif kat == 'kepribadian':
                    topik = 'kerja-sama'
                elif kat == 'tkw':
                    topik = 'uud'
                elif kat == 'penalaran_logika':
                    topik = 'silogisme'
                elif kat == 'tes_gambar':
                    topik = 'deret-pola'
                elif kat == 'kraepelin':
                    topik = 'aturan-satuan'
            hasil[q['id']] = topik
            sebaran[(kat, topik)] += 1

    json.dump(hasil, open('.audit/topik.json', 'w'), ensure_ascii=False, indent=0)
    print('total soal bertag:', len(hasil))
    print()
    for kat in db:
        baris = sorted([(t, n) for (k, t), n in sebaran.items() if k == kat], key=lambda x: -x[1])
        total = sum(n for _, n in baris)
        print('%-18s %s' % (kat + ' (%d)' % total, ' | '.join('%s %d' % (t, n) for t, n in baris)))


if __name__ == '__main__':
    main()
