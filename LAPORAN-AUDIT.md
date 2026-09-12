# Laporan Audit, Perbaikan & Pengembangan — build v22

Tanggal: 12 September 2026
Situs: https://arapcihuy.github.io/pk-perwira-tni/
Repo: https://github.com/arapcihuy/pk-perwira-tni (branch `master`, GitHub Pages)
Ruang lingkup: **akurasi 1000 soal** + **pembahasan dibuat lebih mudah dipahami** + **pengecoh & soal berulang dirapikan**

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

## Rapikan pengecoh & soal berulang (lanjutan)

| # | Cakupan | Masalah | Perbaikan |
|---|---------|---------|-----------|
| 31 | Pangkat numerik (16 soal) | Pengecoh acak: `2⁷` punya opsi 121, 69, 187. | Pengecoh diganti kesalahan yang wajar: nilai pangkat sebelum/sesudah dan hasil kali (64, 256, 14). |
| 32 | Volume kubus & balok (10 soal) | Pengecoh seperti 83 dan 65 untuk 125. | Pengecoh = luas sisi (r²), enam sisi (6r²), pangkat tetangga, jumlah sisi, setengah volume. |
| 33 | KPK & FPB (18 soal) | Pengecoh acak: KPK 8 dan 12 punya opsi 17, 25, 26. | Pengecoh = kesalahan lazim: hasil kali a×b (lupa bagi FPB), KPK/FPB tertukar, a+b, min(a,b). |
| 34 | Deret geometri (5 soal) | Pengecoh takjelas (1179 untuk 1215). | Pengecoh = suku sebelum, sesudah, dan dua langkah sesudahnya. |
| 35 | Akar kuadrat (4 soal) | Soal berulang: √169, √196, √225, √256 masing-masing 2x. | Diganti √729, √784, √841, √676 supaya tiap soal unik. |
| 36 | Verbal (5 soal) | Duplikat/nyaris duplikat: v9=v37, v18=v46, v24=v42=v56, v47=v53. | Diganti soal baru (SIGAP, MUSYAWARAH, TELADAN, TANGGUH, analogi GURU:MURID). |
| 37 | Tes gambar & logika | tg25 = tg11, l60 nyaris sama dengan l14. | Diganti: jumlah sisi kubus, dan hitungan hari Rabu + 250 hari. |
| 38 | Kraepelin (95 soal angka) | Pasangan angka berulang (4+9 dua kali, 3+7 dua kali, 8+9 dua kali, 6+6 tiga kali) dan satu kunci salah (5+5 dijawab 12). | Opsi diseragamkan (jumlah, satuan, angka pertama, angka kedua) dan pasangan kembar diubah/dibalik urutannya. |
| 39 | Bug perbaikan sendiri | Soal yang kuncinya sempat salah (k27: "5+5" berkunci 12) akibat penggabungan tabel koreksi. | Fungsi koreksi dibuat MENGGABUNG, bukan menimpa, lalu diverifikasi ulang dengan pemeriksaan aritmetika khusus Kraepelin. |

Sisa yang sengaja dibiarkan (bukan kesalahan): beberapa kalimat perintah soal memang berulang
(misalnya "Pilih kalimat yang SALAH secara grammar" muncul 10x, "Manakah penulisan yang BAKU" 9x) —
isinya berbeda-beda, jadi soal tetap berbeda.

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

## Hasil verifikasi akhir (build v20)

- 1000 soal, 9 kategori, id unik, semua indeks kunci valid, semua soal 4 opsi.
- 126 soal hitung diuji ulang otomatis → semua cocok dengan kuncinya.
- 95 soal Kraepelin angka diuji khusus → kunci = angka satuan hasil penjumlahan, semua cocok.
- Tidak ada dua opsi bernilai sama (anti-ambigu) di seluruh bank soal.
- Tidak ada dua soal yang isinya sama persis (duplikat = 0).
- Pengecoh pada 44 soal yang dirapikan (pangkat, volume, KPK/FPB) terbukti berasal dari kesalahan hitung wajar.
- Semua pembahasan diawali `JAWABAN:` dan memuat kuncinya.
- 41 gambar soal (SVG) valid dan benar-benar ter-render di browser.
- Uji browser: 9 kategori dibuka sampai muncul pembahasan, 0 error JavaScript.
- Fakta terverifikasi ke sumber: UU TNI 3/2025, Pasal 36A UUD 1945, Keppres 137/1952 (lambang Swa
  Bhuwana Paksa), Paskhas 17 Oktober 1947 (13 prajurit, Kotawaringin), insiden Dakota VT-CLA 29 Juli 1947,
  Sumpah Prajurit diucapkan saat pelantikan.


---

# Bagian 2 — Pengembangan fitur (build v21, 12 September 2026)

## Fitur belajar

| # | Fitur | Cara kerja |
|---|-------|-----------|
| 1 | **Bank soal salah + pengulangan berjadwal** | Tiap jawaban salah dicatat per soal (jumlah salah + tanggal jadwal ulang). Jadwal: besok → 3 → 7 → 14 → 30 hari; kalau benar terus, catatannya lulus dan hilang sendiri. Beranda menampilkan jumlah soal yang jatuh tempo + tombol "Ulangi N soal". |
| 2 | **Rincian hasil per kategori** | Layar hasil kini menampilkan bar per kategori (hijau ≥80%, kuning ≥70%, merah <70%) plus rekomendasi otomatis kategori terlemah. |
| 3 | **Pengukuran kecepatan** | Waktu tiap soal dihitung; hasil menampilkan detik/soal, jumlah soal >2 menit, dan target 60 detik/soal. |
| 4 | **Lanjutkan sesi** | Sesi tryout/belajar disimpan otomatis (tiap 8 detik, saat jawab, saat tab disembunyikan). Kalau aplikasi ditutup, beranda menawarkan "Lanjutkan". |
| 5 | **Jalur belajar 28 hari** | Menyalakan jalur → aplikasi membagi materi 4 pekan (fondasi hafalan → hitung → logika → simulasi) dan menampilkan progres hari ke-N. |
| 6 | **Kode sinkron antar perangkat** | Tombol "Buat + salin kode" menghasilkan satu kode (base64) berisi progres, bank soal salah, nilai, log IQ, jalur belajar. Tempel di HP lain → data dipulihkan. Tanpa server, tanpa akun. |
| 7 | **Ekspor soal salah** | Menghasilkan berkas HTML siap cetak/simpan PDF berisi semua soal yang pernah salah + kunci + pembahasan. |
| 8 | **Tema terang/gelap + ukuran huruf** | Sakelar tema dan A-/A+ (90%-130%), tersimpan di perangkat. |

## Materi

| # | Item | Hasil |
|---|------|-------|
| 9 | **Soal baru** | +39 TWK dan +29 Kepribadian Situasional (total kini **1068 soal**). Semua dengan pembahasan format JAWABAN/cara/INGAT. |
| 10 | **20 gambar soal tes gambar** | tg31-tg50 sebelumnya tanpa gambar → sekarang punya ilustrasi SVG sesuai polanya (total **61 gambar**). Gambar tg31 digambar ulang agar tanda '?' berada di urutan ke-7 sesuai pertanyaannya. |
| 11 | **Pintasan Kraepelin** | Kartu "Simulasi Lembar Kraepelin" di halaman pilih kategori, langsung membuka modul Kraepelin (10 kolom × 50 angka, 3 menit, grafik kecepatan). |

## Teknis

| # | Item | Hasil |
|---|------|-------|
| 12 | **Verifikasi otomatis di CI** | `tools/verifikasi-soal.py` (8 kelompok pemeriksaan) jalan otomatis di GitHub Actions tiap push: kunci, opsi senilai, duplikat, aturan Kraepelin, format pembahasan, gambar, dan konsistensi versi aset. Deploy ditolak kalau ada yang gagal. |
| 13 | **Data dipecah per kategori** | `data/soal.js` (sumber tunggal) dipecah otomatis oleh `tools/pecah-data.py` menjadi `data/soal-index.js` (kecil, dimuat pertama) + 9 file kategori + `data/soal-penuh.js` (cadangan). Halaman pertama kini hanya memuat 0,7 KB data kategori; sisanya dimuat di latar belakang. |
| 14 | **Cadangan anti-gagal** | Kalau file kategori gagal dimuat, loader otomatis memakai `soal-penuh.js`; kalau tetap gagal, muncul halaman "Soal gagal dimuat" dengan tombol Coba lagi (percobaan dibatasi 2x agar aplikasi tidak berputar tanpa henti). |
| 15 | **Versi aset otomatis** | Workflow `versi.yml` menandai ulang `?v=` di index.html dan sw.js dengan hash commit tiap deploy, jadi pengguna lama selalu menerima pembaruan tanpa perlu mengingat menaikkan versi manual. |

## Verifikasi build v21

- 1068 soal, 9 kategori, id unik, semua indeks kunci valid, 4 opsi per soal.
- 126 soal hitung diuji ulang otomatis; 95 soal Kraepelin diuji aturan satuannya; 0 salah.
- 0 opsi senilai (anti-ambigu), 0 soal duplikat, 0 relasi pengecoh janggal.
- 61 gambar valid dan dimuat di browser; seluruh 9 kategori dijalankan sampai pembahasan muncul; 0 error JS.
- Uji fitur di browser: pengulangan berjadwal (jawab benar tidak dicatat, jawab salah dijadwalkan besok), tema, ukuran huruf, kode sinkron bolak-balik, ekspor soal salah, lanjut sesi, jalur belajar.
- Uji jalur gagal: file kategori diblokir → aplikasi memakai cadangan; cadangan juga diblokir → halaman error muncul dan aplikasi tetap responsif.


---

# Bagian 3 — Validitas latihan & mutu (build v22, 12 September 2026)

## Temuan yang memicu perbaikan

1. **Posisi kunci jawaban menumpuk di B**: A 20,6% · B 39,3% · C 26,9% · D 13,2%.
   Akibatnya menebak "B" saja bisa memberi ~39% tanpa memahami materi, dan kebiasaan menghafal
   posisi justru merugikan di ujian sebenarnya.
2. **Kunci langsung terbuka saat Tryout**: begitu dijawab, aplikasi menampilkan BENAR/SALAH +
   pembahasan — termasuk di simulasi 60 soal. Ini membuat simulasi tidak realistis.
3. **Komposisi simulasi acak**: 60 soal diambil acak dari 1068 soal, sehingga bobotnya mengikuti
   ukuran bank (Numerik 184 vs Tes Gambar 50), bukan komposisi format seleksi.

## Perbaikan & fitur baru

| # | Item | Hasil |
|---|------|-------|
| 1 | **Acak posisi opsi** | Saat Tryout/Simulasi posisi pilihan diacak tiap sesi (mode Belajar tetap berurutan agar enak dibaca). Celah "tebak B" hilang. |
| 2 | **Kunci terkunci saat ujian** | Tryout/Simulasi menyembunyikan kunci dan pembahasan sampai sesi selesai; ada tombol "Buka kunci sekarang" bila memang ingin belajar sambil mengerjakan. Mode Review menampilkan kunci penuh. |
| 3 | **Simulasi Format Seleksi** | 60 soal dengan komposisi tetap: TWK 15 · Verbal 8 · Numerik 10 · Penalaran 10 · Matematika 7 · Inggris 5 · Kepribadian 5, durasi 90 menit. |
| 4 | **Latihan adaptif** | Setiap jawaban kini dicatat per soal (benar/salah). Latihan adaptif 25 soal memprioritaskan soal dengan tingkat benar 40-75% (zona belajar paling efektif). |
| 5 | **Mode Hafalan Cepat** | Kartu bolak-balik 151 kartu TWK: ketuk untuk melihat jawaban + kiat INGAT, lalu tandai "sudah hafal"/"belum". Kartu yang belum diulang otomatis kembali ke antrean. |
| 6 | **Grafik tren** | Grafik 30 sesi terakhir (warna hijau/kuning/merah menurut ambang 80/70) + rata-rata, terbaik, jumlah sesi, arah tren, dan kategori terlemah dari 5 sesi terakhir. Riwayat nilai kini disimpan 30 sesi (sebelumnya 10) berikut rincian per kategori. |
| 7 | **Siapkan mode offline** | Tombol yang memuat seluruh kategori lalu melaporkan jumlah soal, jumlah berkas ter-cache, dan pemakaian penyimpanan; meminta penyimpanan permanen agar tidak dihapus browser. |
| 8 | **Baris INGAT lengkap** | 1068 pembahasan kini semuanya memiliki baris INGAT (sebelumnya 124 belum). |
| 9 | **Uji runtime otomatis** | `tools/uji-runtime.py` menjalankan Chromium sungguhan lewat Playwright di GitHub Actions: 9 kategori dibuka, 61 gambar dimuat, tryout terkunci diuji, simulasi format diuji, hafalan & bank soal diuji, dan gagal bila ada satu error JavaScript. |
| 10 | **Favicon** | Ditambahkan supaya browser tidak lagi meminta `/favicon.ico` (404). |

## Pengukuran kecepatan (setelah data dipecah per kategori)

| Kondisi | Sebelum (satu berkas) | Sesudah (per kategori) |
|---|---|---|
| Buka pertama | ~160 KB (gzip) | **61-66 KB** (index 0,35 KB + tips 3,8 KB + skrip + CSS) |
| Data soal saat membuka satu kategori | 98,6 KB sekali muat | 10-17 KB per kategori (sesuai yang dibuka) |
| Cadangan `soal-penuh.js` | — | 95 KB, hanya dimuat bila file kategori gagal |

Angka diambil dari situs live dengan `Accept-Encoding: gzip` (GitHub Pages mengirim gzip).

## Verifikasi build v22

- Uji runtime Playwright: **LULUS** — 9 kategori (151+166+110+134+184+100+100+50+73 soal),
  61/61 gambar ter-render, tryout mengunci kunci, simulasi format 60 soal/90 menit, kartu hafalan
  bisa dibalik, bank soal merender, halaman progress menampilkan panel tren/offline, 0 error JS.
- Verifikasi data: LULUS (1068 soal, id unik, 0 opsi senilai, 0 duplikat, pengecoh wajar,
  pembahasan seragam, gambar valid, versi aset konsisten).
- CI: "Verifikasi Bank Soal", "Uji Runtime Aplikasi", dan "Cap Versi Otomatis" berjalan otomatis
  pada setiap push.

## Cara mengulang audit di masa depan

```bash
/usr/bin/python3 .audit/extract.py         # ekstrak data ke .audit/db.json
/usr/bin/python3 .audit/fix.py             # koreksi + format pembahasan + soal baru + pecah data
/usr/bin/python3 .audit/verify.py          # cek akurasi (versi kerja)
/usr/bin/python3 tools/verifikasi-soal.py  # cek data yang dipakai CI (wajib lulus)
/usr/bin/python3 tools/uji-runtime.py      # uji runtime di Chromium (Playwright)
```

Urutan penting: `fix.py` menulis ulang `data/soal.js`, lalu otomatis memecahnya lewat
`tools/pecah-data.py`. Jangan mengedit file `data/soal-<kategori>.js` secara manual —
file itu hasil generate.

Catatan: `.audit/db.json`, `.audit/db-new.json`, dan `.audit/soal.js.bak` tidak dibagikan di repo
(file besar, hanya bahan kerja).
