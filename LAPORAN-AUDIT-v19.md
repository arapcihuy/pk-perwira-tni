# Laporan Audit & Perbaikan Bank Soal — build v19

Tanggal: 12 September 2026
Situs: https://arapcihuy.github.io/pk-perwira-tni/
Repo: https://github.com/arapcihuy/pk-perwira-tni (branch `master`, GitHub Pages)
Ruang lingkup: **akurasi 1000 soal** + **pembahasan dibuat lebih mudah dipahami**

## Cara audit dilakukan

1. Ekstrak seluruh 1000 soal (9 kategori) dari `data/soal.js` ke bentuk yang bisa dianalisis.
2. Pemeriksaan otomatis (script `.audit/verify.py`):
   - indeks kunci di luar rentang opsi,
   - dua opsi bernilai sama (soal jadi ambigu / ada 2 jawaban benar),
   - hasil hitung diuji ulang secara aritmetika (pecahan, persen, akar, pangkat, FPB/KPK),
   - kunci tidak disebut di dalam pembahasan,
   - pertanyaan duplikat,
   - gambar soal (SVG) rusak / tidak bisa dibuka.
3. Pemeriksaan manual per kategori: seluruh TWK (112), Bahasa Inggris (110), Verbal (100),
   Penalaran (134), Kepribadian (44), Tes Gambar (50), Kraepelin (100), Matematika (166), Numerik (184).
4. Verifikasi fakta ke sumber luar untuk klaim yang berisiko (UU TNI terbaru, pasal UUD, sejarah TNI AU,
   Paskhas, doktrin TNI, Sumpah Prajurit).
5. Uji runtime di browser (headless): semua tab dibuka, 9 kategori dijalankan sampai muncul pembahasan,
   41 gambar soal dicek benar-benar ter-load, `window.onerror` dipantau (0 error).

## Kesalahan yang ditemukan & diperbaiki

| # | Soal | Masalah | Perbaikan |
|---|------|---------|-----------|
| 1 | m58 | Kunci `49` salah. `2x + 5 = 17 → x = 6`, jadi `x² = 36` (49 = 7²). | Kunci → **36**. |
| 2 | w97 | Kunci `Pasal 36B` salah. Pasal **36A** = lambang negara; 36B = lagu kebangsaan. | Kunci → **36A** + penjelasan pasal 35/36/36B/36C. |
| 3 | l33 | Deret A, C, F, J, O → kunci `T` salah, seharusnya `U` (+2,+3,+4,+5,+6). | Kunci → **U** (sesuai pembahasannya sendiri). |
| 4 | tg2 | Kunci `Segitiga` bertentangan dengan gambarnya: pola berulang 3 bentuk → gambar ke-5 = **Lingkaran**. | Kunci → **Lingkaran**. |
| 5 | tg16 | Kunci `5` salah. Segitiga + 2 garis sejajar alas menghasilkan **3** segitiga (daerah antar garis = trapesium). | Kunci → **3**. |
| 6 | tg6 | Gambar tidak konsisten (hanya 2 segitiga terbentuk, opsi 3–6). | Soal & gambar diganti: persegi + 1 diagonal → **2** segitiga. |
| 7 | mg1 | Gambar tidak menghasilkan 36 cm². Setelah gambar dirapikan, luas berarsir = **32 cm²**. | Gambar + kunci → **32 cm²**. |
| 8 | e17 | Kunci `If a / but` tidak gramatikal. Pola yang benar: `the more … the more`. | Kunci → **The more a / the more**. |
| 9 | v66 | `PALU : …` dikunci `Hakim` (lemah). Palu = alat kerja **tukang kayu**. | Kunci → **Tukang Kayu**. |
| 10 | w6 | "UU TNI yang berlaku" masih `UU 34/2004`. Sejak 20 Maret 2025 berlaku **UU No. 3/2025** (perubahan UU 34/2004). | Soal + kunci diperbarui. |
| 11 | w20 | "Sumpah Prajurit diucapkan di hadapan siapa" ambigu. | Diganti: diucapkan **saat dilantik** (jelas, sesuai peraturan). |
| 12 | w30 | `Pasal 27 ayat (3)` dan `Pasal 30 ayat (1)` dua-duanya soal bela negara → ambigu. | Soal dipertegas "pertahanan dan keamanan" → **Pasal 30 ayat (1)**, distraktor diganti. |
| 13 | w48 | "Kekuasaan kehakiman dilakukan oleh…" (MA dan MK dua-duanya benar). | Diganti: "lembaga peradilan tertinggi" → **Mahkamah Agung**. |
| 14 | w27 | Pengecoh "Semua benar" membingungkan. | Diganti pengecoh salah + pembahasan dasar negara vs pandangan hidup. |
| 15 | w43 & w104 | Pertanyaan identik tapi kunci berbeda. | w104 diganti soal lain (manfaat wawasan nusantara). |
| 16 | w56, w4 | Cadek disebut "doktrin TNI AD" (kurang tepat). | Dibuat akurat: Cadek = doktrin induk TNI/ABRI; ditambah pembeda Tridek, Kartika Eka Paksi, Tri Ubaya Sakti. |
| 17 | e29 | `if`/`whether` juga gramatikal → 3 jawaban benar. | Opsi diganti agar hanya **when** yang tepat. |
| 18 | e44 | `Had I known, I would have acted` juga benar. | Opsi diubah jadi bentuk salah → hanya satu jawaban benar. |
| 19 | l15 | Premis tidak cukup untuk menentukan A vs C. | Premis dibuat berantai → **A, C, B, D**. |
| 20 | l20 | Opsi `1/4` dan `3/12` senilai (dua jawaban benar). | Opsi diganti. |
| 21 | l108, l110, l111, l113 | Opsi `10/14` vs `5/7`, `8/14` vs `4/7`, `6/18` vs `1/3`, `2/12` vs `1/6` senilai. | Opsi diganti + tips menyederhanakan pecahan. |
| 22 | n159–n176 | Pembahasan KPK/FPB bocor artefak kode (`KPK = 96//4 = 24`). | Pembahasan diganti: faktorisasi prima benar. |
| 23 | n177–n182 | Format `Rp6,000`, opsi tanpa `Rp`, dua soal sirkular (3 buku → 3 buku), pembulatan salah (2.000÷3 → 1.998). | Semua ditulis ulang dengan angka bulat & format Rupiah yang benar. |
| 24 | n107, n110, n111, n113 | Opsi tidak wajar: `2/0`, `4/0`, `1/-3`, `3/-5`. | Opsi diganti pecahan yang wajar. |
| 25 | m141, m143, m144, m145 | Jawaban berupa pecahan belum disederhanakan (`429/6`) — membingungkan. | Data dirapikan agar hasilnya bilangan bulat (72, 64, 58, 62). |
| 26 | m138, m151, m153 | Duplikat identik dengan soal lain. | Diganti variasi baru (38 cm, 343 cm³, 1728 cm³). |
| 27 | l102–l107, l128–l132 | Soal identik berulang 4–6 kali. | Diberi variasi berbeda (regu/nilai/konteks). |
| 28 | v44, n159, n169 | Duplikat pertanyaan dengan soal lain. | Diganti soal berbeda. |
| 29 | n10, n34, n46, n154–n158 | Notasi desimal campur (`0.125` vs `0,125`). | Diseragamkan ke koma (kaidah Indonesia). |
| 30 | tg47 | "Angka 6 di cermin → 9" secara fisika tidak tepat (6→9 itu putaran 180°). | Soal diubah menjadi **diputar 180°**. |

## Pembahasan dibuat lebih mudah dipahami (1000 soal)

Semua pembahasan kini berformat tetap tiga bagian, jadi mudah dibaca:

```
JAWABAN: <kunci>
<langkah/cara mengerjakan atau penjelasan>
INGAT: <poin hafalan / trik>
```

- **JAWABAN** ditulis paling atas supaya langsung tahu kuncinya.
- Bagian tengah = **cara mengerjakan langkah demi langkah** (mis. `688 + 254 = 942, lalu 942 − 340 = 602`)
  atau penjelasan konsep untuk soal hafalan.
- **INGAT** = kiat menghafal/rumus cepat (mis. rumus persen, pasal kunci UUD, tanggal penting, ciri TNI AU).
- 873 soal memakai baris `INGAT`; sisanya sudah memuat blok `TRIK CEPAT`/`Tips`.
- Panjang pembahasan: min 46, median 179, rata-rata 191 karakter (sebelumnya median 59).
- Tampilan: baris pembahasan dirender per baris (`white-space: pre-line`) di halaman soal dan modal bank soal.

## Hasil verifikasi akhir (build v19)

- 1000 soal, 9 kategori, id unik, semua indeks kunci valid, semua soal 4 opsi.
- 126 soal hitung diuji ulang otomatis → semua cocok dengan kuncinya.
- Tidak ada dua opsi bernilai sama (anti-ambigu) di seluruh bank soal.
- Semua pembahasan diawali `JAWABAN:` dan memuat kuncinya.
- 41 gambar soal (SVG) valid dan benar-benar ter-render di browser.
- Uji browser: 9 kategori dibuka sampai muncul pembahasan, 0 error JavaScript.
- Fakta terverifikasi ke sumber: UU TNI 3/2025, Pasal 36A UUD 1945, Keppres 137/1952 (lambang Swa
  Bhuwana Paksa), Paskhas 17 Oktober 1947 (13 prajurit, Kotawaringin), insiden Dakota VT-CLA 29 Juli 1947,
  Sumpah Prajurit diucapkan saat pelantikan.

## Cara mengulang audit di masa depan

```bash
/usr/bin/python3 .audit/extract.py    # (bila perlu) ekstrak data ke .audit/db.json
/usr/bin/python3 .audit/fix.py        # terapkan koreksi + format pembahasan (idempotent)
/usr/bin/python3 .audit/verify.py     # cek akurasi & hasil
```

Catatan: `.audit/db.json`, `.audit/db-new.json`, dan `.audit/soal.js.bak` tidak dibagikan di repo
(file besar, hanya bahan kerja).
