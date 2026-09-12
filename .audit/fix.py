#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Perbaikan bank soal PK Perwira: koreksi kunci/opsi + upgrade pembahasan.

Jalankan dari root repo:  /usr/bin/python3 .audit/fix.py
Menulis ulang data/soal.js (objek per objek, format tetap) + laporan .audit/FIX-REPORT.md
"""
import json, re, base64, math, sys
from math import gcd

SRC = 'data/soal.js'
db = json.load(open('.audit/db.json'))

# ============================================================ helpers
def svg(s):
    return 'data:image/svg+xml;base64,' + base64.b64encode(s.encode()).decode()

SUP = str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹', '0123456789')

def factors(n):
    out = {}
    d = 2
    while d * d <= n:
        while n % d == 0:
            out[d] = out.get(d, 0) + 1
            n //= d
        d += 1
    if n > 1:
        out[n] = out.get(n, 0) + 1
    return out

def fact_str(n):
    f = factors(n)
    return ' × '.join('%d' % p if e == 1 else '%d^%d' % (p, e) for p, e in sorted(f.items()))

def lcm(a, b):
    return a * b // gcd(a, b)

# ============================================================ 1. KOREKSI SOAL
# format: (kategori, id) -> dict berisi field yang diganti
FIX = {}

def F(cat, qid, **kw):
    FIX.setdefault((cat, qid), {}).update(kw)

# --- matematika -----------------------------------------------------------
# m58: 2x+5=17 -> x=6 -> x^2=36, kunci salah (49)
F('matematika', 'm58', jawaban=0,
  pembahasan="2x + 5 = 17 → 2x = 12 → x = 6. Maka x² = 6² = 36 (bukan 7² = 49).")
# rata-rata dengan hasil pecahan -> datanya dirapikan supaya hasilnya bilangan bulat
F('matematika', 'm141', pertanyaan="Rata-rata dari 90, 59, 45, 81, 80, 77 adalah...",
  pilihan=["70", "71", "72", "74"], jawaban=2,
  pembahasan="Jumlah data = 90 + 59 + 45 + 81 + 80 + 77 = 432. Rata-rata = 432 ÷ 6 = 72.")
F('matematika', 'm143', pertanyaan="Rata-rata dari 85, 43, 69, 65, 46, 76 adalah...",
  pilihan=["62", "64", "66", "68"], jawaban=1,
  pembahasan="Jumlah data = 85 + 43 + 69 + 65 + 46 + 76 = 384. Rata-rata = 384 ÷ 6 = 64.")
F('matematika', 'm144', pertanyaan="Rata-rata dari 61, 64, 49 adalah...",
  pilihan=["56", "58", "60", "62"], jawaban=1,
  pembahasan="Jumlah data = 61 + 64 + 49 = 174. Rata-rata = 174 ÷ 3 = 58.")
F('matematika', 'm145', pertanyaan="Rata-rata dari 44, 50, 55, 55, 80, 88 adalah...",
  pilihan=["58", "60", "62", "64"], jawaban=2,
  pembahasan="Jumlah data = 44 + 50 + 55 + 55 + 80 + 88 = 372. Rata-rata = 372 ÷ 6 = 62.")
# duplikat identik -> dibuat variasi baru
F('matematika', 'm138', pertanyaan="Persegi panjang dengan panjang 12 cm dan lebar 7 cm. Kelilingnya...",
  pilihan=["34", "36", "38", "40"], jawaban=2,
  pembahasan="Keliling = 2 × (12 + 7) = 2 × 19 = 38 cm.")
F('matematika', 'm151', pertanyaan="Volume kubus dengan rusuk 7 cm adalah...",
  pilihan=["293", "323", "343", "363"], jawaban=2,
  pembahasan="V = r³ = 7³ = 7 × 7 × 7 = 343 cm³.")
F('matematika', 'm153', pertanyaan="Volume kubus dengan rusuk 12 cm adalah...",
  pilihan=["1698", "1708", "1728", "1748"], jawaban=2,
  pembahasan="V = r³ = 12³ = 12 × 12 × 12 = 1728 cm³.")

# --- numerik: kunci pembahasan berisi artefak kode ("//") -------------------
for a, b in [(8, 12), (12, 18), (15, 25), (6, 9), (14, 21), (18, 24), (9, 15),
             (16, 24), (10, 15), (12, 16)]:
    qid = None
    for q in db['numerik']['soal']:
        if q['pertanyaan'].startswith('KPK dari %d dan %d ' % (a, b)):
            qid = q['id']
    if qid:
        pb = ("Faktorisasi prima: %d = %s dan %d = %s. KPK diambil dari SEMUA faktor "
              "dengan pangkat terbesar → KPK = %d. Cara cepat: (a × b) ÷ FPB = (%d × %d) ÷ %d = %d.") % (
            a, fact_str(a), b, fact_str(b), lcm(a, b), a, b, gcd(a, b), lcm(a, b))
        F('numerik', qid, pembahasan=pb)

for a, b in [(36, 48), (24, 36), (18, 27), (30, 45), (42, 56), (48, 60), (12, 20), (28, 42)]:
    qid = None
    for q in db['numerik']['soal']:
        if q['pertanyaan'].startswith('FPB dari %d dan %d ' % (a, b)):
            qid = q['id']
    if qid:
        f = factors(gcd(a, b))
        pb = ("Faktor persekutuan dicari dengan faktorisasi prima: %d = %s dan %d = %s. "
              "FPB = faktor yang SAMA dengan pangkat terkecil → FPB = %d.") % (
            a, fact_str(a), b, fact_str(b), gcd(a, b))
        F('numerik', qid, pembahasan=pb)

# harga buku: pemisah ribuan salah (Rp6,000) + soal sirkular + pembulatan salah
F('numerik', 'n177', pertanyaan="Jika 2 buku harganya Rp6.000, berapa harga 6 buku?",
  pilihan=["Rp12.000", "Rp15.000", "Rp18.000", "Rp24.000"], jawaban=2,
  pembahasan="Harga 1 buku = Rp6.000 ÷ 2 = Rp3.000. Harga 6 buku = 6 × Rp3.000 = Rp18.000.")
F('numerik', 'n178', pertanyaan="Jika 3 buku harganya Rp12.000, berapa harga 5 buku?",
  pilihan=["Rp16.000", "Rp18.000", "Rp20.000", "Rp24.000"], jawaban=2,
  pembahasan="Harga 1 buku = Rp12.000 ÷ 3 = Rp4.000. Harga 5 buku = 5 × Rp4.000 = Rp20.000.")
F('numerik', 'n179', pertanyaan="Jika 3 buku harganya Rp9.000, berapa harga 6 buku?",
  pilihan=["Rp15.000", "Rp16.000", "Rp18.000", "Rp21.000"], jawaban=2,
  pembahasan="Harga 1 buku = Rp9.000 ÷ 3 = Rp3.000. Harga 6 buku = 6 × Rp3.000 = Rp18.000.")
F('numerik', 'n180', pertanyaan="Jika 6 buku harganya Rp30.000, berapa harga 4 buku?",
  pilihan=["Rp15.000", "Rp18.000", "Rp20.000", "Rp24.000"], jawaban=2,
  pembahasan="Harga 1 buku = Rp30.000 ÷ 6 = Rp5.000. Harga 4 buku = 4 × Rp5.000 = Rp20.000.")
F('numerik', 'n181', pertanyaan="Jika 4 buku harganya Rp8.000, berapa harga 5 buku?",
  pilihan=["Rp9.000", "Rp10.000", "Rp12.000", "Rp14.000"], jawaban=1,
  pembahasan="Harga 1 buku = Rp8.000 ÷ 4 = Rp2.000. Harga 5 buku = 5 × Rp2.000 = Rp10.000.")
F('numerik', 'n182', pertanyaan="Jika 4 buku harganya Rp10.000, berapa harga 7 buku?",
  pilihan=["Rp15.000", "Rp16.500", "Rp17.500", "Rp20.000"], jawaban=2,
  pembahasan="Harga 1 buku = Rp10.000 ÷ 4 = Rp2.500. Harga 7 buku = 7 × Rp2.500 = Rp17.500.")

# --- TWK ------------------------------------------------------------------
# w6: UU TNI terkini = UU No. 3 Tahun 2025 (perubahan UU 34/2004), bukan lagi UU 34/2004
F('tkw', 'w6', pertanyaan="Undang-undang TNI yang berlaku saat ini (setelah revisi 2025) adalah...",
  pilihan=["UU No. 34 Tahun 2004", "UU No. 3 Tahun 2025", "UU No. 2 Tahun 2002", "UU No. 23 Tahun 2019"],
  jawaban=1,
  pembahasan="UU No. 34 Tahun 2004 adalah UU TNI sebelumnya. Pada 20 Maret 2025 DPR mengesahkan "
             "UU No. 3 Tahun 2025 tentang Perubahan atas UU 34/2004 (kedudukan TNI, penempatan prajurit "
             "di kementerian/lembaga, dan masa dinas). Jadi UU TNI yang berlaku sekarang: UU 3/2025.")
F('tkw', 'w46', pilihan=["Hanya tentang gaji prajurit",
                         "Tugas, fungsi, kedudukan TNI sebagai alat negara",
                         "Struktur organisasi sipil",
                         "Peradilan militer"], jawaban=1,
  pembahasan="UU No. 34 Tahun 2004 mengatur tugas, fungsi, dan kedudukan TNI sebagai alat negara di bidang "
             "pertahanan, serta komponen pertahanan dan penggunaan kekuatan militer. UU ini diubah oleh "
             "UU No. 3 Tahun 2025.")
# w20: soal "di hadapan siapa" ambigu -> ditanya saat apa (jawabannya jelas)
F('tkw', 'w20', pertanyaan="Menurut peraturan, Sumpah Prajurit TNI wajib diucapkan pada saat...",
  pilihan=["Dilantik menjadi prajurit", "Naik pangkat", "Memasuki masa pensiun", "Ditugaskan ke operasi"],
  jawaban=0,
  pembahasan="Setiap prajurit wajib mengucapkan Sumpah Prajurit pada saat dilantik menjadi prajurit. "
             "Isinya kesetiaan kepada NKRI, Pancasila, dan UUD 1945 serta ketaatan kepada atasan, "
             "dan diawali dengan ucapan 'Demi Allah/Tuhan Yang Maha Esa' sesuai agama masing-masing.")
# w24: penjelasan bulu Garuda dirapikan
F('tkw', 'w24', pembahasan="17 bulu pada setiap sayap = tanggal 17; 8 bulu ekor = bulan 8 (Agustus); "
                          "19 bulu di bawah perisai/pangkal ekor dan 45 bulu leher = tahun 1945. "
                          "Jadi lengkapnya 17-8-1945.")
# w27: opsi "Semua benar" bikin ragu -> diganti pengecoh salah
F('tkw', 'w27', pilihan=["Dasar hukum tertinggi negara",
                         "Pedoman hidup bangsa",
                         "Landasan penyelenggaraan pemerintahan",
                         "Sumber hukum tertulis tertinggi"], jawaban=2,
  pembahasan="Pancasila sebagai DASAR NEGARA = landasan penyelenggaraan pemerintahan dan kehidupan bernegara. "
             "Sebagai PANDANGAN HIDUP, Pancasila jadi pedoman hidup bangsa. Hukum tertinggi tertulis adalah "
             "UUD 1945, dan Pancasila adalah sumber dari segala sumber hukum.")
# w30: distraktor Pasal 27 ayat (3) juga membahas bela negara -> dibuat tidak ambigu
F('tkw', 'w30', pertanyaan="Hak dan kewajiban warga negara ikut serta dalam usaha PERTAHANAN DAN KEAMANAN negara diatur dalam Pasal...",
  pilihan=["Pasal 27 ayat (3)", "Pasal 28", "Pasal 30 ayat (1)", "Pasal 32"], jawaban=2,
  pembahasan="Pasal 30 ayat (1) UUD 1945: 'Tiap-tiap warga negara berhak dan wajib ikut serta dalam usaha "
             "pertahanan dan keamanan negara.' Pembeda dengan Pasal 27 ayat (3) yang berbunyi 'ikut serta "
             "dalam upaya PEMBELAAN negara' — kalau soal menyebut pertahanan dan keamanan, jawabannya Pasal 30.")
# w48: "kekuasaan kehakiman dilakukan oleh MA dan MK" -> jadikan tidak ambigu
F('tkw', 'w48', pertanyaan="Menurut UUD 1945, lembaga peradilan tertinggi di Indonesia adalah...",
  pilihan=["DPR", "Presiden", "Mahkamah Agung", "Kepolisian"], jawaban=2,
  pembahasan="Pasal 24 ayat (2) UUD 1945: kekuasaan kehakiman dilakukan oleh Mahkamah Agung dan badan "
             "peradilan di bawahnya serta oleh Mahkamah Konstitusi. Mahkamah Agung adalah puncak peradilan "
             "bagi semua lingkungan peradilan (badan peradilan tertinggi).")
# w56: Cadek = doktrin induk TNI (bukan khusus TNI AD)
F('tkw', 'w56', pertanyaan="Doktrin induk TNI yang berisi empat kewajiban dan satu tujuan disebut...",
  pilihan=["Sapta Marga", "Catur Dharma Eka Karma", "Tri Ubaya Sakti", "Kartika Eka Paksi"], jawaban=1,
  pembahasan="Catur Dharma Eka Karma (Cadek) = 'empat kewajiban, satu tujuan', doktrin induk TNI. "
             "Doktrin tiap angkatan: TNI AD = Kartika Eka Paksi, TNI AL = Tri Ubaya Sakti "
             "(semboyan Jalesveva Jayamahe), TNI AU = Swa Bhuwana Paksa.")
F('tkw', 'w4', pembahasan="Kata 'catur' berarti empat, jadi Catur Dharma Eka Karma (Cadek) = 'empat kewajiban, "
                          "satu tujuan' — doktrin induk yang dikenal sebagai doktrin TNI/ABRI. Pembeda yang "
                          "sering diuji: Tri Dharma Eka Karma (Tridek) menekankan pengabdian TIGA matra "
                          "(AD, AL, AU) dalam satu jiwa; Sapta Marga = 7 butir kode etik prajurit; "
                          "Kartika Eka Paksi = doktrin TNI AD; Tri Ubaya Sakti = doktrin TNI AL; "
                          "Swa Bhuwana Paksa = semboyan/lambang TNI AU.")
F('tkw', 'w78', pertanyaan="Pesawat tempur buatan Amerika Serikat yang menjadi andalan TNI AU adalah...",
  pilihan=["C-130 Hercules", "F-16 Fighting Falcon", "CN-235", "EC120 Colibri"], jawaban=1,
  pembahasan="F-16 Fighting Falcon (buatan Lockheed Martin, Amerika Serikat) adalah pesawat tempur utama "
             "TNI AU — jumlahnya paling banyak di antara jet tempur yang aktif. C-130 Hercules pesawat "
             "angkut, CN-235 pesawat angkut ringan buatan PT DI, EC120 Colibri helikopter latih.")
# w66: penjelasan nama AURI lebih tegas
F('tkw', 'w66', pembahasan="Angkatan udara Indonesia berkembang dari TKR Jawatan Penerbangan → TRI Angkatan "
                           "Udara (9 April 1946) → AURI (Angkatan Udara Republik Indonesia). Setelah integrasi "
                           "ke dalam ABRI (1962) namanya resmi menjadi TNI Angkatan Udara.")
# w97: Pasal 36A (lambang negara), bukan 36B (lagu kebangsaan)
F('tkw', 'w97', jawaban=2,
  pembahasan="Pasal 36A UUD 1945: 'Lambang Negara ialah Garuda Pancasila dengan semboyan Bhinneka Tunggal Ika.' "
             "Jangan tertukar: Pasal 35 = bendera Sang Merah Putih, Pasal 36 = bahasa Indonesia, "
             "Pasal 36B = lagu kebangsaan Indonesia Raya, Pasal 36C = pengaturan lebih lanjut.")
# w43/w104 sama tapi kunci beda -> w104 diganti soal lain
F('tkw', 'w104', pertanyaan="Manfaat wawasan nusantara bagi Indonesia sebagai negara kepulauan adalah...",
  pilihan=["Wilayah tetap utuh sebagai satu kesatuan", "Setiap pulau berdiri sendiri",
           "Wilayah laut asing ikut dikelola", "Batas negara tidak diperlukan"],
  jawaban=0,
  pembahasan="Wawasan nusantara memandang Indonesia sebagai satu kesatuan wilayah, politik, ekonomi, sosial "
             "budaya, dan pertahanan keamanan. Manfaatnya: wilayah NKRI tetap utuh dan tidak terpecah.")
F('tkw', 'w43', pembahasan="Wawasan nusantara = cara pandang bangsa Indonesia mengenai diri dan lingkungannya "
                           "sebagai satu kesatuan wilayah, politik, ekonomi, sosial budaya, serta pertahanan "
                           "dan keamanan. Tujuannya mewujudkan cita-cita nasional.")
F('tkw', 'w90', pembahasan="Pasal 1 ayat (3) UUD 1945: 'Negara Indonesia adalah negara hukum.' Artinya semua "
                           "penyelenggaraan negara harus berdasarkan hukum, tidak berdasarkan kekuasaan.")
F('tkw', 'w75', pembahasan="Hari jadi Paskhas diperingati 17 Oktober, mengenang penerjunan 13 prajurit pertama "
                           "(Pasukan Khas) di Sambi, Kotawaringin, Kalimantan Tengah pada 17 Oktober 1947. "
                           "Penetapan tanggalnya melalui Keputusan Men/Pangau No. 54 Tahun 1967. "
                           "Catatan: korps ini kini bernama Kopasgat (Komando Pasukan Gerak Cepat) TNI AU.")
F('tkw', 'w56', pembahasan="Kata 'catur' berarti empat, jadi Catur Dharma Eka Karma (Cadek) = 'empat kewajiban, "
                           "satu tujuan' — doktrin induk TNI/ABRI. Doktrin tiap angkatan: TNI AD = Kartika Eka "
                           "Paksi, TNI AL = Tri Ubaya Sakti, TNI AU = Swa Bhuwana Paksa. Adapun Tri Dharma Eka "
                           "Karma (Tridek) menekankan pengabdian tiga matra dalam satu jiwa.")

# opsi pecahan tidak wajar (pembagi 0 / penyebut negatif) -> dibersihkan
F('numerik', 'n107', pilihan=["1/4", "1/3", "1/2", "2/2"], jawaban=2,
  pembahasan="3/4 − 1/4 = 2/4 = 1/2. Penyebutnya sudah sama, jadi cukup kurangkan pembilangnya.")
F('numerik', 'n110', pilihan=["1/2", "2/2", "1/3", "3/2"], jawaban=0,
  pembahasan="Samakan penyebut ke 6: 2/3 = 4/6 dan 1/6 = 1/6. Selisih = 3/6 = 1/2.")
F('numerik', 'n111', pilihan=["7/10", "8/10", "3/5", "7/11"], jawaban=0,
  pembahasan="Samakan penyebut ke 10: 4/5 = 8/10 dan 1/10 = 1/10. Selisih = 7/10.")
F('numerik', 'n113', pilihan=["3/3", "2/3", "2/4", "3/4"], jawaban=1,
  pembahasan="5/6 − 1/6 = 4/6 = 2/3. Penyebutnya sudah sama, cukup kurangkan pembilangnya lalu sederhanakan.")
F('numerik', 'n24', pilihan=["1/12", "1/2", "3/4", "1"], jawaban=2,
  pembahasan="1/4 + 1/4 + 1/4 = 3/4. Penyebutnya sama, jadi cukup jumlahkan pembilangnya: 1 + 1 + 1 = 3.")
F('numerik', 'n104', pilihan=["4/4", "3/4", "2/5", "2/6"], jawaban=1,
  pembahasan="Samakan penyebut ke 4: 1/2 = 2/4 dan 1/4 = 1/4. Jumlah = 3/4.")
F('numerik', 'n105', pilihan=["1/2", "1/3", "4/16", "2/2"], jawaban=0,
  pembahasan="Penyebutnya sudah sama: 3/8 + 1/8 = 4/8 = 1/2 (disederhanakan dengan dibagi 4).")
F('numerik', 'n106', pilihan=["3/3", "6/18", "2/4", "2/3"], jawaban=3,
  pembahasan="4/9 + 2/9 = 6/9 = 2/3 (disederhanakan dengan dibagi 3).")
F('numerik', 'n112', pilihan=["1/5", "2/4", "2/2", "1/4"], jawaban=3,
  pembahasan="Samakan penyebut ke 4: 3/4 = 3/4 dan 1/2 = 2/4. Selisih = 1/4.")
F('numerik', 'n10', pilihan=["0,001", "0,01", "0,1", "1"], jawaban=2,
  pembahasan="0,125 × 0,8 = 0,1. Cara mudah: 0,125 = 1/8, maka 1/8 × 0,8 = 0,1.")

# --- bahasa Inggris -------------------------------------------------------
# e17: kunci lama ("If a / but") tidak gramatikal -> correlative
F('bahasa_inggris', 'e17', pertanyaan="_____ soldier trains hard, _____ he will be prepared.",
  pilihan=["If a / but", "Although a / yet", "The more a / the more", "If a / the more"], jawaban=2,
  pembahasan="Pola 'the more ... the more ...' (comparative correlative) menyatakan makin ... makin .... "
             "Makin giat seorang prajurit berlatih, makin siap ia. Opsi 'If a / but' salah karena 'but' "
             "tidak boleh dipasang setelah klausa 'if'.")
# e29: if/whether juga benar -> opsi diganti supaya hanya 'when' yang tepat
F('bahasa_inggris', 'e29', pilihan=["that", "when", "which", "who"], jawaban=1,
  pembahasan="Indirect question membutuhkan kata tanya, bukan 'that'. Konteks kalimat menanyakan WAKTU "
             "mulai misi, jadi kata tanya yang tepat adalah 'when'.")
# e44: "Had I known, I would have acted" juga benar -> diubah jadi salah
F('bahasa_inggris', 'e44', pilihan=["Had I known, I would act",
                                    "Had I known, I will act",
                                    "If I had known, I would have acted",
                                    "If I knew, I would have acted"], jawaban=2,
  pembahasan="Conditional type 3 (pengandaian masa lalu): If + had + V3, would have + V3. "
             "'If I had known, I would have acted' paling tepat. Opsi 'Had I known, I would act' salah "
             "karena hasilnya harus 'would have + V3'.")

# --- verbal ---------------------------------------------------------------
# v66: palu -> tukang kayu (kunci lama "hakim" lemah)
F('verbal', 'v66', jawaban=0,
  pembahasan="Cangkul adalah alat kerja petani, palu adalah alat kerja tukang kayu. Hubungannya: "
             "alat kerja → profesi pemakainya.")
# v30: opsi memuat kata "Dedikasi" sendiri (jawaban jadi rancu) -> soal diganti
F('verbal', 'v30', pertanyaan="Sinonim kata PERSISTEN adalah...",
  pilihan=["Pantang menyerah", "Mudah menyerah", "Lambat", "Ragu"],
  jawaban=0,
  pembahasan="Persisten berarti terus-menerus dan pantang menyerah dalam mencapai tujuan. "
             "Sinonim terdekat: pantang menyerah.")
# duplikat pertanyaan -> dibuat soal berbeda
F('verbal', 'v44', pertanyaan="Sinonim kata KOMITMEN adalah...",
  pilihan=["Keterikatan pada tujuan", "Keraguan", "Kelalaian", "Paksaan"], jawaban=0,
  pembahasan="Komitmen = keterikatan atau kesungguhan untuk memegang janji dan tujuan. "
             "Sinonim terdekat: keterikatan pada tujuan.")
F('numerik', 'n159', pertanyaan="KPK dari 6 dan 8 adalah...",
  pilihan=["18", "20", "24", "30"], jawaban=2,
  pembahasan="Faktorisasi prima: 6 = 2 × 3 dan 8 = 2^3. KPK diambil dari SEMUA faktor dengan pangkat "
             "terbesar → 2^3 × 3 = 24.")
F('numerik', 'n169', pertanyaan="FPB dari 20 dan 30 adalah...",
  pilihan=["5", "10", "15", "20"], jawaban=1,
  pembahasan="Faktorisasi prima: 20 = 2^2 × 5 dan 30 = 2 × 3 × 5. FPB = faktor yang SAMA dengan pangkat "
             "terkecil → 2 × 5 = 10.")
F('verbal', 'v48', pembahasan="Strategi = rencana besar/induk untuk mencapai tujuan jangka panjang. "
                             "Taktik adalah langkah pelaksanaan jangka pendek, jadi keduanya tidak sama.")

# --- penalaran logika -----------------------------------------------------
# l33: deret A,C,F,J,O -> selisih +2,+3,+4,+5 maka +6 = U (kunci lama T salah)
F('penalaran_logika', 'l33', jawaban=2,
  pembahasan="Ubah ke posisi alfabet: A(1), C(3), F(6), J(10), O(15). Selisihnya +2, +3, +4, +5, "
             "maka berikutnya +6. O(15) + 6 = 21 = huruf U.")
# l15: premis tidak cukup untuk menentukan A vs C
F('penalaran_logika', 'l15',
  pertanyaan="Regu A lebih cepat dari C. C lebih cepat dari B. B lebih cepat dari D. Urutan dari yang TERCEPAT adalah...",
  pilihan=["A, C, B, D", "C, A, B, D", "B, A, C, D", "D, B, C, A"], jawaban=0,
  pembahasan="Urutkan berantai: A > C, C > B, B > D. Jadi A > C > B > D. Selalu susun rantai "
             "perbandingannya lebih dulu, jangan menebak yang tidak disebutkan.")
# l20/l108/l110/l111/l113: dua opsi bernilai sama (pecahan belum disederhanakan)
F('penalaran_logika', 'l20', pilihan=["1/4", "1/3", "3/4", "5/12"], jawaban=0,
  pembahasan="Total bola = 3 + 4 + 5 = 12. Peluang terambil merah = 3/12 = 1/4. "
             "Ingat: selalu sederhanakan pecahan supaya tidak terkecoh opsi yang senilai.")
F('penalaran_logika', 'l108', pilihan=["5/7", "4/10", "10/4", "7/10"], jawaban=0,
  pembahasan="Total bola = 10 + 4 = 14. Peluang merah = 10/14 = 5/7 (disederhanakan dengan dibagi 2).")
F('penalaran_logika', 'l110', pilihan=["4/7", "6/14", "8/6", "6/8"], jawaban=0,
  pembahasan="Total bola = 8 + 6 = 14. Peluang merah = 8/14 = 4/7 (dibagi 2). Opsi 8/14 senilai dengan 4/7, "
             "jadi harus disederhanakan dulu.")
F('penalaran_logika', 'l111', pilihan=["1/3", "1/2", "2/3", "1/6"], jawaban=0,
  pembahasan="Total bola = 6 + 12 = 18. Peluang merah = 6/18 = 1/3 (dibagi 6).")
F('penalaran_logika', 'l113', pilihan=["1/6", "1/5", "5/6", "6/5"], jawaban=0,
  pembahasan="Total bola = 2 + 10 = 12. Peluang merah = 2/12 = 1/6 (dibagi 2).")
# duplikat identik -> divariasikan isinya
for i, (a, b, c, d, key) in enumerate([
        (10, 20, 5, 12, 10), (20, 5, 10, 8, 10), (30, 20, 10, 5, 30)][:0]):
    pass
F('penalaran_logika', 'l103', pertanyaan="Regu P lebih cepat dari Q. R lebih lambat dari Q. S lebih lambat dari R. Urutan dari yang TERCEPAT adalah...",
  pilihan=["P > Q > R > S", "Q > P > R > S", "P > R > Q > S", "S > R > Q > P"], jawaban=0,
  pembahasan="Rantai perbandingan: P > Q, Q > R, R > S. Maka P > Q > R > S.")
F('penalaran_logika', 'l104', pertanyaan="Tinggi A lebih dari B. Tinggi C kurang dari B. Tinggi D kurang dari C. Urutan dari yang TERTINGGI adalah...",
  pilihan=["A > B > C > D", "A > C > B > D", "B > A > C > D", "A > B > D > C"], jawaban=0,
  pembahasan="Rantai perbandingan: A > B, B > C, C > D. Maka A > B > C > D.")
F('penalaran_logika', 'l105', pertanyaan="Nilai ujian K lebih tinggi dari L. M lebih rendah dari L. N lebih rendah dari M. Urutan dari yang TERTINGGI adalah...",
  pilihan=["K > L > M > N", "K > M > L > N", "L > K > M > N", "N > M > L > K"], jawaban=0,
  pembahasan="Rantai perbandingan: K > L, L > M, M > N. Maka K > L > M > N.")
F('penalaran_logika', 'l106', pertanyaan="Pelari E lebih cepat dari F. G lebih lambat dari F. H lebih lambat dari G. Urutan dari yang TERCEPAT adalah...",
  pilihan=["E > F > G > H", "E > G > F > H", "F > E > G > H", "H > G > F > E"], jawaban=0,
  pembahasan="Rantai perbandingan: E > F, F > G, G > H. Maka E > F > G > H.")
F('penalaran_logika', 'l107', pertanyaan="Berat X lebih dari Y. Z lebih ringan dari Y. W lebih ringan dari Z. Urutan dari yang TERBERAT adalah...",
  pilihan=["X > Y > Z > W", "X > Z > Y > W", "Y > X > Z > W", "W > Z > Y > X"], jawaban=0,
  pembahasan="Rantai perbandingan: X > Y, Y > Z, Z > W. Maka X > Y > Z > W.")
F('penalaran_logika', 'l128', pertanyaan="Deret: 5, 10, 20, 40, 80. Angka berikutnya...",
  pilihan=["160", "120", "100", "140"], jawaban=0,
  pembahasan="Setiap suku dikali 2 (rasio ×2): 5 → 10 → 20 → 40 → 80 → 160.")
for qid, kal, kes in [('l130', 'es', 'Salju mulai mencair'), ('l131', 'laut', 'Nelayan tidak melaut'),
                      ('l132', 'sungai', 'Sungai meluap')]:
    pass
F('penalaran_logika', 'l130', pertanyaan="Jika hujan deras maka sungai meluap. Ternyata sungai tidak meluap. Kesimpulan...",
  pilihan=["Tidak hujan deras", "Hujan deras", "Sungai kering", "Tidak bisa disimpulkan"], jawaban=0,
  pembahasan="Modus tollens: jika P → Q dan Q tidak terjadi, maka P tidak terjadi. Sungai tidak meluap "
             "berarti hujan deras tidak terjadi.")
F('penalaran_logika', 'l131', pertanyaan="Jika lampu lalu lintas mati maka jalanan macet. Ternyata jalanan tidak macet. Kesimpulan...",
  pilihan=["Lampu lalu lintas tidak mati", "Lampu lalu lintas mati", "Jalanan sepi", "Tidak bisa disimpulkan"],
  jawaban=0,
  pembahasan="Modus tollens: P → Q dan Q tidak terjadi, maka P tidak terjadi. Jalanan tidak macet berarti "
             "lampu lalu lintas tidak mati.")
F('penalaran_logika', 'l132', pertanyaan="Jika air kolam tercemar maka ikan mati. Ternyata ikan tidak mati. Kesimpulan...",
  pilihan=["Air kolam tidak tercemar", "Air kolam tercemar", "Ikan dipindahkan", "Tidak bisa disimpulkan"],
  jawaban=0,
  pembahasan="Modus tollens: P → Q dan Q tidak terjadi, maka P tidak terjadi. Ikan tidak mati berarti "
             "air kolam tidak tercemar.")

# --- Kraepelin ------------------------------------------------------------
F('kraepelin', 'k1', pertanyaan="Lihat tabel angka berikut. Baris terbawah berisi angka 8 dan 6. "
                                "Berapa hasil penjumlahan KEDUA angka tersebut (sebelum ditulis dalam bentuk satuan)?",
  pilihan=["12", "14", "16", "18"], jawaban=1,
  pembahasan="8 + 6 = 14 (hasil penjumlahan penuhnya). Ingat: di lembar Kraepelin yang DITULIS hanya angka "
             "satuannya, jadi yang ditulis 4 — tetapi hasil penjumlahannya tetap 14.")
F('kraepelin', 'k9', pertanyaan="Berapa hasil: 7+4 (tulis satuan jika ≥10)?", jawaban=1)
F('kraepelin', 'k10', pertanyaan="Berapa hasil: 8+5 (tulis satuan jika ≥10)?", jawaban=1)
F('kraepelin', 'k27', pertanyaan="Berapa hasil: 5+5 (tulis satuan jika ≥10)?", jawaban=0,
  pembahasan="5 + 5 = 10, yang ditulis angka satuannya: 0. Hati-hati: hasil tepat 10 tetap ditulis 0, bukan 10.")
F('kraepelin', 'k2', pertanyaan="Pada tes Kraepelin, kamu harus menjumlahkan 5+7. Berapa angka yang "
                                "harus kamu TULIS di lembar jawaban?",
  pilihan=["12", "2", "7", "5"], jawaban=1,
  pembahasan="5 + 7 = 12. Aturan Kraepelin: kalau hasilnya 10 atau lebih, yang ditulis hanya angka satuannya, "
             "jadi yang ditulis 2 — bukan 12. Aturan ini wajib dihafal sebelum tes.")
F('kraepelin', 'k4', pembahasan="Kraepelin TNI umumnya terdiri dari 40-60 kolom, tiap kolom berisi 40-60 angka. "
                                "Yang dinilai bukan hanya jumlah benar, tetapi KONSISTENSI kecepatan antar kolom.")
F('kraepelin', 'k6', pembahasan="3 + 9 = 12, angka satuannya 2. Trik cepat untuk +9: hasilnya selalu "
                                "(angka - 1). Contoh: 3+9 → 2, 7+9 → 6, 4+9 → 3.")
F('kraepelin', 'k7', pembahasan="6 + 6 = 12, angka satuannya 2. Hafal pasangan angka kembar: 6+6 → 2, "
                                "7+7 → 4, 8+8 → 6, 9+9 → 8.")
F('kraepelin', 'k13', pembahasan="2 + 8 = 10, angka satuannya 0. Kalau hasilnya tepat 10 atau 20, "
                                 "yang ditulis 0 (bukan 10 atau 20).")
F('kraepelin', 'k29', pembahasan="5 + 5 = 10, angka satuannya 0. Hasil tepat 10 tetap ditulis 0.")

# --- Tes gambar (SVG) -----------------------------------------------------
# tg2: pola berulang 3 bentuk -> gambar ke-5 = lingkaran (kunci lama salah)
F('tes_gambar', 'tg2', jawaban=0,
  pembahasan="Pola berulang 3 bentuk: persegi (gambar 1) → lingkaran (2) → segitiga (3) → kembali persegi (4) "
             "→ lingkaran (5). Jadi gambar ke-5 adalah lingkaran.")
# tg1: pembahasan menyebut pola yang salah (angka 6 padahal matriks berisi 8)
F('tes_gambar', 'tg1', pembahasan="Baca per kolom: kolom 1 × 2 = kolom 2, kolom 1 × 4 = kolom 3. "
                                  "Baris 3 berisi 5 dan 10, maka kolom 3 = 5 × 4 = 20. "
                                  "Cek baris lain: 2 → 4 → 8 dan 3 → 6 → 12 (benar).")
F('penalaran_logika', 'lg1', pembahasan="Perhatikan tiap baris: kolom 1 × 2 = kolom 2, kolom 1 × 3 = kolom 3. "
                                        "Baris 1: 2 → 4 → 6. Baris 2: 3 → 6 → 9. Baris 3: 3 × 3 = 9. "
                                        "Jadi angka pengganti '?' adalah 9.")
# tg4: soal bayangan kubus ambigu -> diubah jadi logika rotasi yang pasti
F('tes_gambar', 'tg4',
  pertanyaan="Sebuah kubus diputar 90° ke kanan (searah jarum jam dilihat dari atas). Sisi yang tadinya "
             "menghadap ke DEPAN sekarang menghadap ke...",
  pilihan=["Belakang", "Kanan", "Kiri", "Atas"], jawaban=2,
  pembahasan="Putar 90° searah jarum jam: depan → kiri, kanan → depan, belakang → kanan, kiri → belakang. "
             "Jadi sisi depan berpindah ke sisi kiri. Sisi atas dan bawah tidak berubah.",
  gambar=svg("<svg xmlns='http://www.w3.org/2000/svg' width='300' height='150' style='background:#0c1829'>"
             "<rect width='300' height='150' fill='#0c1829'/>"
             "<text x='150' y='20' fill='#d4a93a' font-size='12' text-anchor='middle' font-weight='bold'>"
             "Kubus dilihat dari atas - diputar 90 derajat ke kanan</text>"
             "<rect x='70' y='45' width='80' height='80' fill='#162540' stroke='#4a90d9' stroke-width='2'/>"
             "<rect x='110' y='45' width='80' height='80' fill='#1a2d47' stroke='#4a90d9' stroke-width='2'/>"
             "<text x='90' y='90' fill='#fff' font-size='13' text-anchor='middle' font-weight='bold'>DEPAN</text>"
             "<text x='150' y='90' fill='#7a96b8' font-size='12' text-anchor='middle'>kanan</text>"
             "<path d='M95,140 A30,30 0 1 1 145,140' fill='none' stroke='#ffd700' stroke-width='2'/>"
             "<text x='185' y='90' fill='#ffd700' font-size='12'>arah putar 90°</text></svg>"))
# tg5: contoh di gambar (lingkaran berisi segitiga) bertentangan dengan kunci -> contoh dirapikan
F('tes_gambar', 'tg5',
  pertanyaan="Perhatikan pola hubungan gambar. Lingkaran besar berisi lingkaran kecil. Persegi besar berisi...",
  pilihan=["Lingkaran kecil", "Segitiga kecil", "Persegi kecil", "Bintang kecil"], jawaban=2,
  pembahasan="Polanya: bentuk besar berisi bentuk kecil yang JENISNYA SAMA. Lingkaran besar → lingkaran kecil, "
             "maka persegi besar → persegi kecil.",
  gambar=svg("<svg xmlns='http://www.w3.org/2000/svg' width='300' height='130' style='background:#0c1829'>"
             "<rect width='300' height='130' fill='#0c1829'/>"
             "<circle cx='55' cy='65' r='40' fill='none' stroke='#4a90d9' stroke-width='2'/>"
             "<circle cx='55' cy='65' r='18' fill='#4a90d9' opacity='0.6'/>"
             "<text x='55' y='118' fill='#7a96b8' font-size='11' text-anchor='middle'>Contoh</text>"
             "<text x='130' y='72' fill='#ffd700' font-size='24' text-anchor='middle'>→</text>"
             "<rect x='165' y='25' width='80' height='80' fill='none' stroke='#4a90d9' stroke-width='2'/>"
             "<text x='205' y='75' fill='#ffd700' font-size='24' text-anchor='middle'>?</text>"
             "<text x='205' y='118' fill='#7a96b8' font-size='11' text-anchor='middle'>Jawaban</text></svg>"))
# tg6: gambar rusak (hanya 2 segitiga terbentuk) -> soal diganti jadi satu diagonal
F('tes_gambar', 'tg6',
  pertanyaan="Sebuah persegi dibagi oleh satu garis diagonal. Berapa banyak segitiga yang terbentuk?",
  pilihan=["1", "2", "3", "4"], jawaban=1,
  pembahasan="Satu garis diagonal membagi persegi menjadi 2 segitiga sama besar. Bandingkan: jika dua diagonal "
             "digambar (bersilangan), terbentuk 4 segitiga.",
  gambar=svg("<svg xmlns='http://www.w3.org/2000/svg' width='220' height='180' style='background:#0c1829'>"
             "<rect width='220' height='180' fill='#0c1829'/>"
             "<rect x='35' y='25' width='150' height='130' fill='none' stroke='#4a90d9' stroke-width='2'/>"
             "<line x1='35' y1='25' x2='185' y2='155' stroke='#4a90d9' stroke-width='2'/>"
             "<text x='110' y='172' fill='#7a96b8' font-size='11' text-anchor='middle'>"
             "Satu garis diagonal</text></svg>"))
# tg16: segitiga dengan 2 garis sejajar alas -> hanya 3 segitiga (kunci lama 5 salah)
F('tes_gambar', 'tg16', jawaban=0,
  pembahasan="Hitung dari puncak: (1) segitiga puncak sampai garis atas, (2) puncak sampai garis bawah, "
             "(3) seluruh segitiga besar. Daerah antara dua garis berbentuk TRAPESIUM, bukan segitiga. "
             "Jadi total 3 segitiga.")
# tg47: 6 di cermin -> diputar 180 derajat supaya jawabannya pasti
F('tes_gambar', 'tg47', pertanyaan="Angka '6' diputar 180° (dibalik atas-bawah sekaligus kiri-kanan). "
                                   "Angka berapakah yang tampak?",
  pilihan=["9", "6", "8", "0"], jawaban=0,
  pembahasan="Putaran 180° membalik arah atas-bawah dan kiri-kanan sekaligus, sehingga angka 6 tampak "
             "seperti angka 9. Ingat: cermin kiri-kanan saja TIDAK menghasilkan angka 9.")
F('matematika', 'mg1', jawaban=1,
  pembahasan="Luas persegi = 8 cm × 8 cm = 64 cm². Perhatikan gambar: dua segitiga tak berarsir di kiri dan "
             "kanan bawah adalah segitiga SIKU-SIKU dengan sisi 8 cm (sisi persegi) dan 4 cm (setengah sisi "
             "mendatar). Luas satu segitiga = ½ × 8 × 4 = 16 cm², dua segitiga = 32 cm². "
             "Daerah berarsir = 64 − 32 = 32 cm².",
  gambar=svg("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' style='background:#0c1829'>"
             "<rect x='20' y='20' width='160' height='160' fill='#4a90d9' stroke='#fff' stroke-width='2'/>"
             "<polygon points='20,20 100,180 20,180' fill='#0c1829'/>"
             "<polygon points='180,20 180,180 100,180' fill='#0c1829'/>"
             "<text x='100' y='15' fill='#fff' font-size='12' text-anchor='middle'>8 cm</text>"
             "<text x='8' y='105' fill='#fff' font-size='12' text-anchor='middle'>8 cm</text></svg>"))

# ============================================================ 2. terapkan koreksi
applied = []
for (cat, qid), kw in FIX.items():
    for q in db[cat]['soal']:
        if q['id'] == qid:
            for k, v in kw.items():
                q[k] = v
            applied.append((cat, qid, sorted(kw.keys())))
            break
    else:
        print('!! tidak ditemukan:', cat, qid)

# verifikasi internal: kunci dalam rentang & opsi tidak ada yang senilai duplikat
def opt_key(s):
    s = s.strip()
    m = re.match(r'^Rp([\d\.]+)$', s)
    if m:
        return float(m.group(1).replace('.', ''))
    m = re.match(r'^(\d+)/(\d+)$', s)
    if m:
        return float(m.group(1)) / float(m.group(2)) if float(m.group(2)) else None
    m = re.match(r'^([\d\.,]+)', s)
    if m and re.match(r'^[\d\.,]+', s):
        t = s.split()[0].replace('.', '').replace(',', '.')
        try:
            return float(t)
        except ValueError:
            return None
    return None

warn = []
for cat, v in db.items():
    for q in v['soal']:
        if not (0 <= q['jawaban'] < len(q['pilihan'])):
            warn.append(('index', cat, q['id']))
        vals = {}
        for p in q['pilihan']:
            k = opt_key(p)
            if k is not None:
                vals.setdefault(k, []).append(p)
        for k, ps in vals.items():
            if len(ps) > 1:
                warn.append(('opsi senilai', cat, q['id'], ps))
print('PERINGATAN setelah koreksi:', len(warn))
for w in warn:
    print('   ', w)

# ============================================================ 3. PEMBAHASAN
SUP_RE = re.compile(r'^(\d)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) = \.\.\.$')

def gen_numerik_pb(q):
    """Pembahasan eksplisit untuk soal hitung yang bisa diurai otomatis."""
    t = q['pertanyaan'].strip()
    key = q['pilihan'][q['jawaban']]
    m = re.match(r'^Akar dari (\d+) = \.\.\.$', t)
    if m:
        n = int(m.group(1)); r = int(math.isqrt(n))
        return "%d × %d = %d, jadi akar dari %d adalah %d." % (r, r, n, n, r)
    m = re.match(r'^√(\d+) = \.\.\.$', t)
    if m:
        n = int(m.group(1)); r = int(math.isqrt(n))
        return "√%d = %d, karena %d × %d = %d." % (n, r, r, r, n)
    m = SUP_RE.match(t)
    if m:
        base = int(m.group(1)); ex = int(m.group(2).translate(SUP))
        return "%d%s = %s = %d." % (base, m.group(2), ' × '.join([str(base)] * ex), base ** ex)
    m = re.match(r'^(\d+)\s*\+\s*(\d+)\s*\+\s*(\d+) = \.\.\.$', t)
    if m:
        a, b, c = map(int, m.groups())
        return "Kerjakan berurutan: %d + %d = %d, lalu %d + %d = %d." % (a, b, a + b, a + b, c, a + b + c)
    m = re.match(r'^(\d+)\s*\+\s*(\d+)\s*[-−]\s*(\d+) = \.\.\.$', t)
    if m:
        a, b, c = map(int, m.groups())
        return "Kerjakan berurutan: %d + %d = %d, lalu %d − %d = %d." % (a, b, a + b, a + b, c, a + b - c)
    m = re.match(r'^(\d+)\s*[-−]\s*(\d+) = \.\.\.$', t)
    if m:
        a, b = map(int, m.groups())
        return "Kurangkan langsung: %d − %d = %d." % (a, b, a - b)
    m = re.match(r'^(\d+)\s*\+\s*(\d+) = \.\.\.$', t)
    if m:
        a, b = map(int, m.groups())
        return "Jumlahkan langsung: %d + %d = %d." % (a, b, a + b)
    m = re.match(r'^([\d]+)\s*[x×]\s*([\d]+) = \.\.\.$', t)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        puluhan, satuan = b // 10 * 10, b % 10
        if puluhan and satuan:
            return "%d × %d = %d × %d + %d × %d = %d + %d = %d." % (
                a, b, a, puluhan, a, satuan, a * puluhan, a * satuan, a * b)
        return "%d × %d = %d." % (a, b, a * b)
    m = re.match(r'^(\d+)\s*[÷/]\s*(\d+) = \.\.\.$', t)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        return "%d ÷ %d = %d (cek: %d × %d = %d)." % (a, b, a // b, b, a // b, a)
    m = re.match(r'^(\d+)% dari (\d+) = \.\.\.$', t)
    if m:
        p, n = int(m.group(1)), int(m.group(2))
        return "%d%% × %d = %d/100 × %d = %d." % (p, n, p, n, p * n // 100)
    return None

def gen_kraepelin_pb(q):
    m = re.match(r'^(?:Berapa hasil:?\s*)?(\d+)\s*\+\s*(\d+)', q['pertanyaan'])
    if not m:
        m = re.search(r'menjumlahkan (\d+)\s*\+\s*(\d+)', q['pertanyaan'])
    if not m:
        return None
    a, b = int(m.group(1)), int(m.group(2)); s = a + b
    if s >= 10:
        return ("%d + %d = %d → yang ditulis hanya angka satuannya: %d.\n"
                "Ingat: hasil 10 atau lebih selalu ditulis satuannya saja (12 → 2, 15 → 5, 18 → 8)."
                ) % (a, b, s, s % 10)
    return "%d + %d = %d (kurang dari 10, jadi ditulis apa adanya: %d)." % (a, b, s, s)

# --- tips per kategori (untuk bagian INGAT) --------------------------------
TIPS = {
 'tkw': [
   (r'pasal|uud', "Hafal pasal kunci UUD 1945: 27 (HAM dan bela negara), 28 (HAM), 29 (agama), 30 (pertahanan), 31 (pendidikan), 33 (ekonomi), 34 (fakir miskin), 36A (lambang negara)."),
   (r'sila|pancasila', "Hafal lambang sila: 1 Bintang, 2 Rantai, 3 Pohon Beringin, 4 Kepala Banteng, 5 Padi dan Kapas."),
   (r'tni au|auri|lanud|skadron|paskhas|pesawat|ksau|swa bhuwana', "Ciri khas TNI AU: lahir 9 April 1946, semboyan Swa Bhuwana Paksa, Hari Bakti 29 Juli, Hari TNI 5 Oktober."),
   (r'\buu\b|undang-undang', "UU terkait TNI: UU 34/2004 (diubah oleh UU 3/2025), UU 23/2019 tentang PSDN, UU 3/2002 tentang Pertahanan Negara."),
   (r'hari|tanggal|diperingati|dibacakan|peringatan|pukul', "Hafal tanggal penting: 20 Mei 1908, 28 Okt 1928, 1 Juni 1945, 17 Agu 1945, 18 Agu 1945, 5 Okt 1945, 10 Nov 1945."),
   (r'ketahanan|wawasan|sishankam', "Ketahanan nasional: trigatra (geografi, kekayaan alam, penduduk) + pancagatra (ideologi, politik, ekonomi, sosial budaya, hankam)."),
   (r'doktrin|sapta marga|sumpah|cadek|tri ubaya|kartika', "Doktrin TNI: Catur Dharma Eka Karma (induk), Sapta Marga (7 butir kode etik), Tri Ubaya Sakti (TNI AL), Swa Bhuwana Paksa (TNI AU), Kartika Eka Paksi (TNI AD)."),
   (None, "Soal TWK sering keluar berulang — baca ulang poin ini sebelum ujian."),
 ],
 'bahasa_inggris': [
   (r'\btenses?\b|yesterday|last |already|had |have ', "Perhatikan penanda waktu: yesterday/last week = past tense, already/since = perfect tense."),
   (r'passive|was submitted|is inspected|must be', "Kalimat pasif: be (is/are/was/were/must be) + V3."),
   (r'conditional|if i|had i|would have', "Conditional type 3: If + had + V3, would have + V3 (pengandaian masa lalu)."),
   (r'suggested|demanded|insisted|essential that', "Subjunctive setelah suggest/demand/insist/essential that: pakai kata kerja dasar (V1) tanpa -s."),
   (r'not only|hardly|seldom|rarely|under no circumstances|not until|only after', "Ada kata negatif di awal kalimat (hardly, seldom, rarely, not only) maka harus inversi: auxiliary + subjek + kata kerja."),
   (r'salah secara grammar|correct sentence|grammatically', "Cari ketidakcocokan subjek–kata kerja: 'each of', 'the number of', 'news', 'equipment', 'police' punya aturan tunggal/jamak khusus."),
   (r'idiom|arti idiom', "Idiom tidak bisa diterjemahkan kata per kata — hafalkan makna keseluruhannya."),
   (r'main idea|what is the|why was|what did|according to the text', "Soal bacaan: jawabannya selalu ada di dalam teks, cari kalimat kuncinya."),
   (None, "Hafalkan kosakata militer: deploy, convoy, perimeter, reconnaissance, intelligence, morale, logistics."),
 ],
 'verbal': [
   (r'^[A-Z ]+:[A-Z ]+|: *\.\.\.|=', "Analogi: tentukan dulu hubungannya (alat–profesi, bagian–keseluruhan, sinonim, antonim, sebab–akibat)."),
   (r'sinonim|makna sama|bersinonim', "Sinonim = persamaan makna. Pilih kata yang paling dekat maknanya, bukan yang hanya searah."),
   (r'antonim|lawan kata', "Antonim = lawan makna, pilih yang benar-benar berlawanan."),
   (r'baku|kbbi|tidak baku', "Bentuk baku KBBI: nasihat, praktik, analisis, risiko, apotek, atlet, izin, jadwal, kuitansi, ambulans, ekspor, fotokopi."),
   (r'efektif|mubazir', "Kalimat efektif tidak mubazir: hindari 'para siswa-siswa' dan 'agar supaya'."),
   (r'ungkapan|idiom', "Ungkapan/idiom bermakna kiasan, bukan arti kata per kata."),
   (None, "Soal verbal TNI paling sering soal sinonim, antonim, dan bentuk baku."),
 ],
 'penalaran_logika': [
   (r'deret huruf|huruf berikutnya', "Deret huruf: ubah huruf menjadi nomor (A=1 sampai Z=26), lalu cari selisihnya."),
   (r'deret|angka berikutnya|suku ke', "Deret angka: tulis selisih antar suku. Selisih tetap = aritmetika, rasio tetap = geometri, selisih naik = pola bertingkat."),
   (r'kode|a=1|dalam angka|digeser', "Sandi: cek pergeseran (+1, +2) atau ubah huruf ke posisi alfabet (A=1, B=2, ... Z=26)."),
   (r'lebih cepat|lebih tinggi|lebih lambat|lebih pendek|lebih berat|terkuat|tercepat|tertinggi', "Soal urutan: susun rantai perbandingannya dulu, jangan menebak yang tidak disebutkan."),
   (r'jika hari ini|hari lagi|hari ke-', "Soal hari: bagi jumlah hari dengan 7, sisanya = jumlah langkah dari hari awal."),
   (r'peluang|bola', "Peluang = jumlah yang diharapkan ÷ seluruh kemungkinan. Sederhanakan pecahannya."),
   (r'semua|beberapa|tidak ada', "Silogisme: 'semua A adalah B' + 'X adalah A' → X pasti B. Kalau hanya tahu X adalah B, X belum tentu A."),
   (r'jika .* maka|kesimpulan', "Modus tollens: jika P → Q lalu Q tidak terjadi, maka P tidak terjadi."),
   (None, "Trik utama logika: gambar diagram Venn atau rantai perbandingan sebelum memilih jawaban."),
 ],
 'kraepelin': [
   (None, "Kraepelin menilai KONSISTENSI kecepatan, bukan puncak kecepatan. Latih ritme tetap dari kolom pertama sampai terakhir."),
 ],
 'tes_gambar': [
   (r'matriks|pola gambar|pola berikut|deret gambar|pola hubungan|pola: ', "Soal gambar: baca pola dari BARIS dan KOLOM (biasanya penambahan, perkalian, atau rotasi tetap)."),
   (r'berapa banyak|berapa banyak segitiga|berapa banyak persegi|berapa banyak kubus', "Soal hitung bangun: hitung sistematis dari bentuk terkecil ke terbesar supaya tidak ada yang terlewat."),
   (r'cermin|bayangan|diputar|rotasi', "Cermin kiri-kanan membalik sisi kiri-kanan; cermin atas-bawah membalik atas-bawah; putar 180° membalik keduanya."),
   (None, "Kerjakan soal gambar dengan menghitung, bukan menebak."),
 ],
 'kepribadian': [
   (None, "Soal kepribadian TNI: pilih opsi yang PROAKTIF, SOPAN, JUJUR, dan lewat prosedur resmi."),
 ],
 'matematika': [
   (r'\d+% ', "Persen = per seratus. Contoh: 35% × 240 = 35/100 × 240."),
   (r'km/jam|kecepatan|jarak', "Rumus: Jarak = Kecepatan × Waktu; Waktu = Jarak ÷ Kecepatan."),
   (r'persegi panjang|luas|keliling', "Luas persegi panjang = panjang × lebar; Keliling = 2 × (panjang + lebar)."),
   (r'kubus|balok|volume', "Volume kubus = r³; volume balok = panjang × lebar × tinggi."),
   (r'\bfpb\b|\bkpk\b', "FPB = faktor persekutuan TERBESAR; KPK = kelipatan persekutuan TERKECIL."),
   (r'deret|suku ke', "Deret: hitung selisih dulu (aritmetika), atau cek rasio (geometri)."),
   (r'rata-rata|median', "Rata-rata = jumlah data ÷ banyak data. Median = nilai tengah setelah data diurutkan."),
   (r'pekerja|hari', "Pekerja dan waktu berbanding TERBALIK: pekerja₁ × hari₁ = pekerja₂ × hari₂."),
   (r'diskon|untung|rugi|harga', "Diskon: bayar = harga × (100% − diskon%). Untung: jual = beli × (100% + untung%)."),
   (r'\d+x ', "Persamaan: kumpulkan variabel di satu ruas dan angka di ruas lainnya."),
   (r'√|faktorial|\^', "Hafal kuadrat 1-25 dan pangkat 2 untuk hitung cepat."),
   (None, "Soal hitungan: tulis langkahnya, jangan mengandalkan perkiraan."),
 ],
 'numerik': [
   (r'%', "Persen: bagi dengan 100 lalu kalikan. Contoh: 30% × 800 = 0,3 × 800."),
   (r'√|⁰|¹|²|³|⁴|⁵|⁶|⁷|⁸|⁹', "Hafal kuadrat 1-25 dan pangkat kecil (2⁵=32, 2⁸=256, 2¹⁰=1024)."),
   (r'menit|jam|hari', "1 hari = 24 jam; 1 jam = 60 menit."),
   (r'\d/\d', "Pecahan: samakan penyebut dulu, baru jumlahkan atau kurangkan pembilangnya."),
   (r'rata-rata|jumlah seluruh', "Rata-rata = jumlah data ÷ banyak data."),
   (r'FPB|KPK', "FPB pakai faktor SAMA dengan pangkat terkecil; KPK pakai SEMUA faktor dengan pangkat terbesar."),
   (r'harga|buku|diskon', "Hitung harga satuan dulu (bagi), baru kalikan dengan jumlah yang diminta."),
   (None, "Numerik: kerjakan dari kiri ke kanan dan tulis hasil antara supaya tidak keliru."),
 ],
}

def tip_for(cat, q):
    text = q['pertanyaan']
    for pat, tip in TIPS.get(cat, [(None, None)]):
        if pat is None:
            return tip
        if re.search(pat, text, re.I):
            return tip
    return None

def clean_pb(pb, cat):
    pb = re.sub(r'\s+', ' ', pb).strip()
    if cat in ('matematika', 'numerik', 'penalaran_logika', 'kraepelin'):
        pb = re.sub(r'(?<=[%\d])\s*x\s*(?=\d)', ' × ', pb)
    if not pb.endswith(('.', '!', '?', '"', "'")):
        pb += '.'
    return pb

changed_pb = 0
for cat, v in db.items():
    for q in v['soal']:
        key = q['pilihan'][q['jawaban']]
        base = None
        if cat == 'numerik':
            base = gen_numerik_pb(q)
        if cat == 'kraepelin':
            base = gen_kraepelin_pb(q)
        if not base:
            base = clean_pb(q['pembahasan'], cat)
        base = clean_pb(base, cat)
        line1 = 'JAWABAN: ' + key
        tip = tip_for(cat, q)
        body = line1 + '\n' + base
        if tip and not re.search(r'trik|tips', base, re.I):
            body += '\nINGAT: ' + tip
        if body != q['pembahasan']:
            changed_pb += 1
        q['pembahasan'] = body

print('pembahasan diperbarui:', changed_pb)

# ============================================================ 3b. normalisasi notasi desimal
# soal hitung murni memakai titik desimal (0.125) -> diubah ke koma sesuai kaidah Indonesia (0,125)
def _is_pure_math(t):
    t = t.replace('×', '*').replace('÷', '/').replace('x', '*').replace(' ', '')
    return bool(re.match(r'^[\d\.\,\(\)\+\-\*/]+=?\.{3}$', t))

norm = 0
for q in db['numerik']['soal']:
    txt = q['pertanyaan']
    core = txt.split('=')[0]
    if not re.search(r'\d\.\d', core):
        continue
    if not _is_pure_math(txt):
        continue
    q['pertanyaan'] = re.sub(r'(?<=\d)\.(?=\d)', ',', txt)
    q['pembahasan'] = re.sub(r'(?<=\d)\.(?=\d)', ',', q['pembahasan'])
    newp = []
    for p in q['pilihan']:
        if re.match(r'^\d+\.\d+$', p.strip()):
            newp.append(p.strip().replace('.', ','))
        else:
            newp.append(p)
    q['pilihan'] = newp
    norm += 1
print('notasi desimal dinormalkan:', norm)

# ============================================================ 4. tulis ulang data/soal.js
raw = open(SRC, encoding='utf-8').read()

def find_objs(text):
    """Kembalikan dict id -> (start, end) untuk setiap objek soal."""
    out = {}
    for m in re.finditer(r'\{"id":\s*"([a-zA-Z]+)(\d+)"', text):
        start = m.start()
        depth = 0
        i = start
        while i < len(text):
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
                if depth == 0:
                    out[m.group(1) + m.group(2)] = (start, i + 1)
                    break
            i += 1
    return out

pos = find_objs(raw)
print('objek ditemukan di data/soal.js:', len(pos))
missing = [q['id'] for v in db.values() for q in v['soal'] if q['id'] not in pos]
print('objek tidak ketemu:', missing)

repl = []
for cat, v in db.items():
    for q in v['soal']:
        s, e = pos[q['id']]
        old = raw[s:e]
        new = json.dumps(q, ensure_ascii=False, separators=(', ', ': '))
        if old != new:
            repl.append((s, e, new))
repl.sort()
out = []
last = 0
for s, e, new in repl:
    out.append(raw[last:s]); out.append(new); last = e
out.append(raw[last:])
new_raw = ''.join(out)
open(SRC, 'w', encoding='utf-8').write(new_raw)
print('soal diubah:', len(repl), '| ukuran file:', len(new_raw))

# sanity: file masih bisa diparse
i = new_raw.index('{', new_raw.index('SOAL_DATABASE'))
depth = 0
for n, ch in enumerate(new_raw[i:]):
    if ch == '{':
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0:
            end = i + n + 1
            break
check = json.loads(new_raw[i:end])
print('parse ulang OK, total soal =', sum(len(v['soal']) for v in check.values()))
json.dump(check, open('.audit/db-new.json', 'w'), ensure_ascii=False)
