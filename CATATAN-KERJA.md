# Catatan Kerja — PK Perwira TNI (platform belajar)

Situs: https://arapcihuy.github.io/pk-perwira-tni/  
Repo: https://github.com/arapcihuy/pk-perwira-tni (branch `master`, GitHub Pages)  
Kode kerja lokal: `~/tni-belajar`  
Diperbarui: 2026-09-12

File ini mencatat semua pekerjaan yang dikerjakan otomatis (otonom) pada proyek ini,
supaya mudah ditelusuri kembali: apa yang diubah, kapan, dan hasil verifikasinya.

## Ringkasan isi aplikasi

- 1068 soal, 9 kategori: Wawasan Kebangsaan (151), Matematika (166), Bahasa Inggris (110),
  Penalaran dan Logika (134), Kemampuan Numerik (184), Kemampuan Verbal (100),
  Tes Kraepelin (100), Tes Gambar dan Visual (50, semua bergambar), Tes Kepribadian Situasional (73).
- Fitur: Tryout (60 soal / 90 menit), mode Belajar, Bank Soal + pencarian, Tes Psikologi
  (Kraepelin, Digit Span, Daya Ingat, EPPS), IQ Lab (matriks, deret, rotasi, Dual N-Back),
  Progress, backup/restore data lokal (localStorage), PWA offline (service worker).
- Fitur v21: bank soal salah + pengulangan berjadwal (1-3-7-14-30 hari), rincian hasil per kategori,
  ukuran kecepatan (detik/soal), lanjut sesi, jalur belajar 28 hari, kode sinkron antar perangkat,
  ekspor soal salah (HTML/PDF), tema terang-gelap + ukuran huruf, pintasan simulasi Kraepelin.
- Teknis v21: verifikasi otomatis di CI (`tools/verifikasi-soal.py`), data dipecah per kategori
  (`tools/pecah-data.py` + `static/js/data-loader.js`), versi aset otomatis dari hash commit
  (`.github/workflows/versi.yml`).
- Fitur v22: posisi opsi diacak saat Tryout/Simulasi, kunci dikunci selama ujian, Simulasi Format
  Seleksi (komposisi tetap 60 soal/90 menit), latihan adaptif berbasis tingkat kesulitan nyata,
  mode Hafalan Cepat (kartu bolak-balik 151 kartu TWK), grafik tren nilai 30 sesi + tren per kategori,
  tombol siapkan mode offline, ajakan pasang ke layar utama.
- Teknis v22: uji runtime Chromium otomatis di CI (`tools/uji-runtime.py` + workflow), favicon,
  audit kunci gelombang kedua (pemeriksa independen) yang menemukan 1 kunci salah (w47) dan
  7 soal rapuh lain — semuanya sudah dikoreksi.
- Versi build saat ini: **v22** (penanda aset otomatis dari hash commit lewat CI, mis. `?v=f332b85`).

## Riwayat pekerjaan otonom

| Tanggal | Perubahan | Commit |
|---|---|---|
| 2026-07-31 | PK Perwira TNI - Platform Belajar PWA; remove bak file, add gitignore; icon: military star design; icon: premium layered military star - dark navy bg, gold star | fix: |
| 2026-08-01 | trigger: force GitHub Pages rebuild; fix: bump service worker cache to v3 - force browser cache invalidation | fix: |
| 2026-08-02 | Mulai bangun bank soal: TWK, MTK, Inggris, Logika, Numerik, Verbal, Kraepelin, Tes Gambar, Kepribadian; perbaikan SVG gambar soal (data URI base64) dan service worker. | fix: |
| 2026-08-04 | Aplikasi tes psikologi TNI AU lengkap ditambahkan. | feat: |
| 2026-08-17 | Perbaikan navigasi dan bug tes psikologi; retry deploy GitHub Pages saat gangguan infrastruktur. | chore: |
| 2026-08-19 | Fitur CAT soal palette, tanda ragu-ragu, kurva kinerja Kraepelin, backup/restore, fullscreen; penguatan sanitasi XSS dan validasi skema backup; perbaikan variabel CSS dan kunci jawaban. | feat(psikologi): |
| 2026-08-27 | Bank soal mencapai 1000 soal + redesign Apple glassmorphism + ikon SVG; perbaikan teks tidak terlihat dan sel Kraepelin aktif. | fix: |
| 2026-09-10 | IQ Lab (drill matriks/deret/rotasi/verbal + Dual N-Back + log skor) dan PWA network-first. Audit menyeluruh build v17 (16 bug diperbaiki: timer tryout, kunci jawaban ganda rotasi figural, bank soal lebih ringan, Kraepelin, import backup) dan v18 (pembahasan di hasil Tes Psikologi). Laporan: `~/Downloads/pk-perwira-audit-2026-09-10/LAPORAN-AUDIT.md`. | feat(v18): |
| 2026-09-12 | Audit akurasi 1000 soal, pembahasan dibuat mudah dipahami, pengecoh dan soal berulang dirapikan, lalu dilanjutkan pengembangan fitur: pengulangan berjadwal, rincian per kategori, kecepatan, lanjut sesi, jalur belajar, sinkron kode, ekspor, tema + huruf, +68 soal baru, +20 gambar, CI verifikasi, data dipecah per kategori, versi otomatis (build v19, v20, v21). Rincian di `LAPORAN-AUDIT.md`. | fix(v21): |

## Cara kerja audit (12 September 2026)

1. `data/soal.js` diekstrak ke bentuk terstruktur (`.audit/extract.py`).
2. Pemeriksaan otomatis: kunci di luar rentang, opsi bernilai sama (soal ambigu),
   hitung ulang aritmetika, kunci tidak disebut di pembahasan, duplikat pertanyaan, gambar rusak.
3. Pemeriksaan manual seluruh 1000 soal per kategori + verifikasi fakta ke sumber luar
   (UU TNI 3/2025, Pasal 36A UUD 1945, Keppres 137/1952, Paskhas 17 Oktober 1947,
   Dakota VT-CLA 29 Juli 1947, Sumpah Prajurit).
4. Perbaikan diterapkan lewat `.audit/fix.py` (idempotent), lalu diverifikasi `.audit/verify.py`.
5. Uji runtime di browser: 9 kategori dijalankan sampai pembahasan muncul, 41 gambar soal
   dimuat, `window.onerror` dipantau (0 error), diuji pada server lokal dan situs live.

Perintah menjalankan ulang:

```bash
/usr/bin/python3 .audit/extract.py         # ekstrak data dari data/soal.js
/usr/bin/python3 .audit/fix.py             # koreksi + format pembahasan + pecah data per kategori
/usr/bin/python3 .audit/verify.py          # verifikasi versi kerja
/usr/bin/python3 tools/verifikasi-soal.py  # verifikasi yang dipakai CI (wajib lulus sebelum push)
```

## Hasil verifikasi v22

- 1000 soal, 9 kategori, id unik, semua indeks kunci valid, semua soal 4 opsi.
- 126 soal hitung diuji ulang otomatis: semua cocok dengan kuncinya.
- 95 soal Kraepelin angka: kunci selalu sama dengan angka satuan hasil penjumlahan.
- Tidak ada dua opsi bernilai sama (soal ambigu) dan tidak ada dua soal yang isinya sama persis.
- Pengecoh pada soal pangkat, volume, dan KPK/FPB sudah memakai pola kesalahan hitung yang wajar.
- Semua pembahasan diawali `JAWABAN:` + memuat kunci, format 3 baris: JAWABAN / cara / INGAT.
- 61 gambar soal valid dan ter-render (semua soal Tes Gambar kini bergambar).
- Uji runtime otomatis di Chromium (Playwright) LULUS: 9 kategori, tryout terkunci, simulasi format,
  hafalan, bank soal, 0 error JavaScript.
- Audit kunci gelombang kedua: 568 soal hafalan diperiksa ulang secara independen → 8 koreksi
  (termasuk 1 kunci yang benar-benar salah: w47).
- Ukuran buka pertama turun dari ~160 KB menjadi ~66 KB (gzip) setelah data dipecah per kategori.
- Uji browser di situs live: 1000 soal termuat, pembahasan tampil 3 baris, 41/41 gambar OK, 0 error JS.
