# -*- coding: utf-8 -*-
"""Soal baru v23:
  - 30 soal Tes Gambar (tg51-tg80) + gambarnya
  - 15 soal Kraepelin berbentuk kolom angka (k101-k115), jawabannya dihitung dari angka kolom
"""

# (id, pertanyaan, pilihan, index kunci, pembahasan, topik)
SOAL_TES_GAMBAR2 = [
    ('tg51', 'Berapa banyak persegi kecil pada gambar berikut?', ['4', '5', '6', '7'], 2,
     'Hitung baris demi baris: 3 persegi di baris atas dan 3 di baris bawah, jadi 3 + 3 = 6 persegi.', 'hitung-bangun'),
    ('tg52', 'Berapa banyak segitiga yang terbentuk pada gambar berikut?', ['2', '3', '4', '6'], 2,
     'Dua garis diagonal yang bersilangan membagi persegi menjadi 4 segitiga sama besar.', 'hitung-bangun'),
    ('tg53', 'Berapa banyak lingkaran pada gambar berikut?', ['5', '6', '7', '8'], 2,
     'Hitung satu per satu: 3 lingkaran di baris atas dan 4 di baris bawah, total 3 + 4 = 7.', 'hitung-bangun'),
    ('tg54', 'Bangun yang memiliki lima sisi adalah...', ['Persegi', 'Segitiga', 'Segi lima', 'Lingkaran'], 2,
     'Segi lima (pentagon) punya 5 sisi; segitiga 3 sisi, persegi 4 sisi, lingkaran tidak punya sisi lurus.', 'hitung-bangun'),
    ('tg55', 'Deret gambar: 1 titik, 4 titik, 9 titik. Berapa titik pada gambar ke-4?', ['12', '14', '16', '20'], 2,
     'Polanya bilangan kuadrat: 1² = 1, 2² = 4, 3² = 9, maka gambar ke-4 = 4² = 16 titik.', 'deret-pola'),
    ('tg56', "Huruf 'b' dicerminkan kiri-kanan (cermin tegak). Hasilnya adalah huruf...", ['d', 'p', 'q', 'b'], 0,
     "Cermin kiri-kanan menukar sisi kiri dan kanan. Bulatan 'b' yang semula di kanan berpindah ke kiri, sehingga terbaca 'd'.", 'cermin-rotasi'),
    ('tg57', "Huruf 'q' dicerminkan atas-bawah (cermin datar). Hasilnya adalah huruf...", ['b', 'd', 'p', 'q'], 0,
     "Cermin atas-bawah menukar sisi atas dan bawah. Huruf 'q' berubah menjadi 'b'.", 'cermin-rotasi'),
    ('tg58', 'Segitiga dengan ujung menghadap KIRI diputar 90° berlawanan arah jarum jam. Ujungnya kini menghadap...',
     ['Atas', 'Bawah', 'Kanan', 'Kiri'], 1,
     'Putaran 90° berlawanan arah jarum jam memindahkan arah: kiri → bawah (kanan → atas). Jadi ujungnya menghadap bawah.', 'cermin-rotasi'),
    ('tg59', 'Pola ukuran: kecil, sedang, besar, sedang. Gambar berikutnya berukuran...', ['Kecil', 'Sedang', 'Besar', 'Sangat besar'], 0,
     'Pola berulang tiga ukuran (kecil → sedang → besar), lalu kembali ke sedang dan berikutnya kecil. Jadi gambar ke-5 = kecil.', 'deret-pola'),
    ('tg60', 'Berapa banyak kubus yang menyusun gambar berikut (tampak dari depan)?', ['3', '4', '5', '6'], 0,
     'Baris bawah berisi 2 kubus dan baris atas 1 kubus, jadi total 3 kubus. Hitung per baris supaya tidak ada yang terlewat.', 'hitung-bangun'),
    ('tg61', 'Nama bangun pada gambar berikut adalah...', ['Segi lima', 'Segi enam', 'Segi tujuh', 'Segi delapan'], 1,
     'Bangun dengan 6 sisi bernama segi enam (heksagon).', 'hitung-bangun'),
    ('tg62', 'Panah berputar 90° searah jarum jam: atas, kanan, bawah, kiri. Gambar ke-5 mengarah ke...',
     ['Atas', 'Kanan', 'Bawah', 'Kiri'], 0,
     'Satu putaran penuh kembali ke posisi awal: setelah kiri, arah berikutnya kembali ke atas.', 'deret-pola'),
    ('tg63', 'Bangun yang BUKAN segi banyak (poligon) adalah...', ['Segitiga', 'Lingkaran', 'Persegi', 'Segi lima'], 1,
     'Poligon dibatasi garis lurus. Lingkaran hanya punya satu sisi lengkung, jadi bukan poligon.', 'hitung-bangun'),
    ('tg64', 'Bangun pada gambar berikut memiliki berapa sisi?', ['5', '6', '7', '8'], 1,
     'Hitung sisi satu per satu mengikuti arah jarum jam: ada 6 sisi, jadi bangun ini segi enam.', 'hitung-bangun'),
    ('tg65', 'Pola bertambah 4 kotak: 4, 8, 12 kotak. Berapa kotak pada gambar ke-4?', ['14', '16', '18', '20'], 1,
     'Selisihnya tetap 4: 12 + 4 = 16 kotak.', 'deret-pola'),
    ('tg66', 'Satu dari empat bagian lingkaran diwarnai. Jika ditambah satu bagian lagi, berapa bagian yang diwarnai?',
     ['1/4', '1/2', '3/4', 'penuh'], 1,
     '1/4 + 1/4 = 2/4 = 1/2. Dua dari empat bagian sama dengan setengah lingkaran.', 'deret-pola'),
    ('tg67', 'Bangun yang memiliki simetri lipat paling banyak adalah...', ['Persegi', 'Segitiga sama sisi', 'Lingkaran', 'Persegi panjang'], 2,
     'Lingkaran punya simetri lipat tak terhingga (setiap garis melalui pusat). Persegi 4, segitiga sama sisi 3, persegi panjang 2.', 'cermin-rotasi'),
    ('tg68', 'Gambar berikut: segitiga besar di dalamnya terdapat segitiga kecil di tengah. Berapa banyak segitiga kecil yang terbentuk?',
     ['2', '3', '4', '5'], 2,
     'Menghubungkan titik tengah ketiga sisi membentuk 4 segitiga kecil di dalam segitiga besar (3 di sudut + 1 di tengah).', 'hitung-bangun'),
    ('tg69', 'Pola warna berulang: merah, kuning, hijau, putih. Warna kotak ke-12 adalah...',
     ['Merah', 'Kuning', 'Hijau', 'Putih'], 3,
     'Pola berulang setiap 4. Kotak ke-12 = 12 ÷ 4 = 3 siklus penuh, jadi kembali ke warna keempat: putih.', 'deret-pola'),
    ('tg70', 'Deret gambar: 2 titik, 4 titik, 6 titik. Berapa titik pada gambar ke-5?', ['8', '9', '10', '12'], 2,
     'Polanya bertambah 2 setiap gambar: 2, 4, 6, 8, 10. Gambar ke-5 = 10 titik.', 'deret-pola'),
    ('tg71', 'Bangun pada gambar berikut memiliki berapa sisi?', ['6', '7', '8', '9'], 2,
     'Hitung sisi mengikuti arah jarum jam: ada 8 sisi, jadi bangun ini segi delapan (oktagon).', 'hitung-bangun'),
    ('tg72', 'Berapa banyak titik sudut pada bangun berikut?', ['4', '5', '6', '7'], 1,
     'Titik sudut adalah pertemuan dua sisi. Pada segi lima ada 5 titik sudut (sama banyak dengan sisinya).', 'hitung-bangun'),
    ('tg73', 'Deret gambar: lingkaran dalam persegi, persegi dalam segitiga, segitiga dalam lingkaran. Gambar berikutnya adalah...',
     ['Lingkaran dalam persegi', 'Persegi dalam segitiga', 'Segitiga dalam lingkaran', 'Persegi dalam lingkaran'], 0,
     'Pola berulang tiga bentuk, jadi gambar ke-4 kembali ke pola pertama: lingkaran dalam persegi.', 'deret-pola'),
    ('tg74', 'Berapa banyak garis diagonal pada sebuah persegi?', ['1', '2', '3', '4'], 1,
     'Diagonal menghubungkan dua sudut yang berhadapan. Pada persegi hanya ada 2 diagonal (dua pasang sudut berhadapan).', 'hitung-bangun'),
    ('tg75', 'Gambar jam menunjukkan pukul 6:00. Sudut antara kedua jarum jam adalah...', ['90°', '120°', '150°', '180°'], 3,
     'Pukul 6:00 jarum pendek di angka 6 dan jarum panjang di angka 12, tepat berhadapan membentuk garis lurus = 180°.', 'hitung-bangun'),
    ('tg76', 'Gambar jam menunjukkan pukul 9:00. Sudut antara kedua jarum jam adalah...', ['60°', '90°', '120°', '180°'], 1,
     'Pukul 9:00 jarum pendek di angka 9 dan jarum panjang di angka 12. Selisih 3 angka × 30° = 90°.', 'hitung-bangun'),
    ('tg77', 'Berapa banyak rusuk pada bangun kubus?', ['6', '8', '12', '16'], 2,
     'Kubus punya 12 rusuk (4 di alas, 4 di atas, 4 tegak), 6 sisi, dan 8 titik sudut.', 'hitung-bangun'),
    ('tg78', 'Berapa banyak titik sudut pada bangun balok?', ['6', '8', '12', '16'], 1,
     'Balok memiliki 8 titik sudut, 12 rusuk, dan 6 sisi — sama seperti kubus, bedanya panjang rusuk tidak sama.', 'hitung-bangun'),
    ('tg79', 'Deret gambar: 2 titik, 5 titik, 10 titik (pola n² + 1). Berapa titik pada gambar ke-4?', ['15', '16', '17', '20'], 2,
     'Polanya n² + 1: 1² + 1 = 2, 2² + 1 = 5, 3² + 1 = 10, maka gambar ke-4 = 4² + 1 = 17 titik.', 'deret-pola'),
    ('tg80', 'Segitiga dengan ujung menghadap ATAS diputar 180°. Ujungnya kini menghadap...', ['Atas', 'Bawah', 'Kanan', 'Kiri'], 1,
     'Putaran 180° membalik arah sepenuhnya: atas menjadi bawah.', 'cermin-rotasi'),
]

# Kraepelin kolom angka: (id, kolom, pasangan ke-, isi kolom 1/2/3)
KOLOM_KRAEPELIN = [
    ('k101', 1, 1, [8, 6, 4, 9, 3, 7], [5, 2, 8, 1, 6, 4], [7, 3, 9, 5, 2, 8]),
    ('k102', 2, 1, [6, 7, 5, 8, 4, 9], [3, 9, 2, 6, 7, 5], [9, 4, 6, 2, 8, 3]),
    ('k103', 3, 1, [4, 8, 6, 3, 9, 5], [7, 5, 9, 4, 2, 6], [2, 6, 5, 8, 7, 4]),
    ('k104', 1, 3, [9, 3, 7, 5, 8, 2], [4, 8, 6, 9, 3, 7], [6, 2, 4, 7, 5, 9]),
    ('k105', 2, 3, [5, 9, 8, 2, 7, 4], [8, 4, 3, 7, 6, 9], [3, 7, 2, 8, 4, 5]),
    ('k106', 3, 3, [7, 2, 9, 6, 5, 8], [6, 8, 4, 3, 9, 2], [8, 5, 7, 9, 3, 6]),
    ('k107', 1, 5, [3, 5, 7, 9, 2, 6], [9, 6, 5, 2, 8, 4], [4, 8, 6, 5, 7, 3]),
    ('k108', 2, 5, [8, 9, 3, 4, 6, 2], [2, 7, 8, 5, 9, 6], [5, 4, 9, 7, 3, 8]),
    ('k109', 3, 5, [6, 4, 8, 7, 3, 9], [5, 9, 7, 4, 6, 2], [9, 3, 5, 8, 2, 7]),
    ('k110', 1, 1, [2, 7, 5, 9, 4, 8], [8, 3, 9, 6, 5, 7], [6, 9, 4, 3, 8, 5]),
    ('k111', 2, 2, [9, 8, 2, 5, 7, 3], [4, 5, 8, 7, 2, 9], [7, 2, 6, 4, 9, 8]),
    ('k112', 3, 2, [5, 6, 9, 3, 8, 7], [3, 8, 7, 9, 4, 5], [8, 4, 3, 6, 5, 9]),
    ('k113', 1, 4, [7, 5, 4, 8, 9, 6], [6, 9, 3, 5, 7, 8], [2, 8, 9, 4, 6, 3]),
    ('k114', 2, 4, [4, 9, 6, 7, 5, 8], [9, 2, 5, 8, 6, 4], [5, 7, 8, 3, 9, 2]),
    ('k115', 3, 4, [8, 3, 9, 2, 6, 5], [7, 6, 4, 9, 8, 3], [3, 5, 2, 7, 4, 9]),
]


def soal_kraepelin(item):
    """Bentuk soal + kunci dari data kolom (dihitung, bukan diketik manual)."""
    qid, kolom, pasangan, c1, c2, c3 = item
    isi = {1: c1, 2: c2, 3: c3}[kolom]
    i = pasangan - 1
    a, b = isi[i], isi[i + 1]
    jumlah = a + b
    satuan = jumlah % 10
    tanya = ('Perhatikan kolom angka %d pada gambar. Jumlahkan angka ke-%d dan ke-%d (dihitung dari ATAS). '
             'Berapa angka satuan hasilnya?') % (kolom, pasangan, pasangan + 1)
    kunci = str(satuan)
    # pengecoh selalu angka 0-9 (tidak pernah negatif atau dua digit)
    kandidat = []
    if jumlah < 10 and str(jumlah) != kunci:
        kandidat.append(str(jumlah))          # kesalahan menulis hasil penuh (kalau beda dengan satuan)
    for d in (3, 5, 7, 1, 2, 4):
        x = (satuan + d) % 10
        if x != satuan and str(x) not in kandidat:
            kandidat.append(str(x))
    pilihan = [kunci] + kandidat[:3]
    urut = {qid: 0}
    # susun tetap: kunci di posisi ke-2 setelah diacak dengan pola tetap per id
    geser = (int(qid[1:]) % 4)
    pilihan = pilihan[geser:] + pilihan[:geser]
    pb = ('Angka ke-%d dan ke-%d pada kolom %d adalah %d dan %d. %d + %d = %d, '
          'dan aturan Kraepelin hanya menulis angka satuannya: %d.') % (
        pasangan, pasangan + 1, kolom, a, b, a, b, jumlah, satuan)
    return qid, tanya, pilihan, pilihan.index(kunci), pb
