# Panduan Memasang Domain Sendiri — SiapPsikotes

> **SUDAH DIJALANKAN 14 September 2026.** Domain `siappsikotes.my.id` sudah dibeli
> (DomaiNesia), DNS sudah diarahkan ke GitHub Pages, dan situs sudah pindah.
> Panduan di bawah disimpan sebagai catatan cara melakukannya, bukan tugas yang
> masih menunggu. Keadaan terkini: `CATATAN-KERJA.md` dan `~/pk-bisnis/MULAI-DARI-SINI.md`.

Panduan ini menjelaskan cara memindahkan aplikasi **SiapPsikotes** dari alamat
GitHub Pages (`https://arapcihuy.github.io/pk-perwira-tni/`) ke domain sendiri
yang akan Anda beli. Bahasa sengaja dibuat sederhana, urut, dan bisa dikerjakan
sambil dibaca.

> Catatan penting: nilai DNS dan menu di GitHub bisa berubah dari waktu ke waktu.
> Angka dan nama menu di panduan ini adalah nilai yang dipakai GitHub Pages saat
> panduan ini ditulis. **Selalu cocokkan ulang dengan dokumentasi resmi GitHub**
> (`docs.github.com` → *Configuring a custom domain for your GitHub Pages site*)
> sebelum dipakai.

---

## 0. Daftar periksa sebelum mulai

Siapkan dulu hal-hal ini supaya prosesnya tidak putus di tengah:

- [ ] Nama domain sudah dibeli dan sudah bisa login di panel penyedia domain.
- [ ] Akses ke repositori aplikasi (hak admin, bisa buka **Settings**).
- [ ] Tahu domain mana yang jadi alamat utama, misalnya `siap-psikotes.id`.
- [ ] Tahu apakah akan memakai `www` (mis. `www.siap-psikotes.id`) atau tidak.

Anda harus memilih **satu** alamat utama. GitHub Pages hanya bisa melayani satu
domain utama; alamat lain (misalnya versi `www`) akan diarahkan ke alamat utama.

---

## 1. Menambahkan domain di GitHub Pages

1. Buka halaman repositori aplikasi di GitHub.
2. Klik **Settings** (ikon gerigi di baris atas repositori).
3. Di kolom menu kiri, klik **Pages**.
4. Pada bagian **Custom domain**, isi nama domain Anda, contoh `siap-psikotes.id`.
5. Klik **Save**.
6. GitHub akan menulis berkas bernama `CNAME` di akar repositori, berisi domain
   tadi. Berkas ini menandai bahwa repo tersebut dilayani di domain itu.

Setelah disimpan, GitHub akan menampilkan status **DNS check**. Selama kurang
hijau, artinya catatan DNS (langkah 3) belum terbaca. Itu normal kalau DNS baru
saja diubah — tunggu beberapa menit sampai beberapa jam, lalu klik **Check
again**.

### Menulis berkas CNAME sendiri

Kalau Anda lebih suka menulis berkasnya langsung (atau ingin memakai skrip di
folder ini), cukup buat satu berkas teks bernama `CNAME` di akar repositori
aplikasi, isinya satu baris saja:

```
siap-psikotes.id
```

Tanpa `https://`, tanpa garis miring di akhir, tanpa spasi tambahan di ujung.
Ganti `siap-psikotes.id` dengan domain pilihan Anda. Skrip
`domain/pasang-domain.py` di folder ini sudah melakukan langkah ini secara
otomatis.

---

## 2. Catatan DNS

DNS adalah "buku telepon" internet: ia menghubungkan nama domain Anda ke server
tempat aplikasi dilayani. Anda mengubah catatan DNS di panel penyedia domain
(bukan di GitHub).

### 2a. Catatan A untuk domain utama

Untuk alamat utama (tanpa `www`), buat **empat** catatan `A` yang semuanya
menunjuk ke alamat server GitHub Pages:

| Jenis | Nama (Host) | Nilai (Value) |
|-------|-------------|-------------------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

Keterangan:

- `@` artinya "domain utama itu sendiri" (mis. `siap-psikotes.id`). Di sebagian
  panel, kolom ini bisa dikosongkan atau diisi nama domain polos.
- Keempat catatan A itu dipasang sekaligus. Kalau salah satu server sedang
  bermasalah, yang lain tetap melayani.

### 2b. Catatan CNAME untuk `www`

Kalau Anda ingin `www.siap-psikotes.id` juga berfungsi, buat **satu** catatan
`CNAME`:

| Jenis | Nama (Host) | Nilai (Value) |
|-------|-------------|-------------------------|
| CNAME | `www` | `arapcihuy.github.io` |

Perhatikan: nilainya adalah **nama pengguna GitHub**, bukan nama repositori.
Jadi yang benar `arapcihuy.github.io` — bukan
`arapcihuy.github.io/pk-perwira-tni`.

### 2c. Jangan pakai CNAME di domain utama

Di alamat utama (tanpa `www`), jangan memakai catatan `CNAME`. Pakai catatan `A`
seperti di 2a. `CNAME` hanya untuk subdomain seperti `www`.

### 2d. Verifikasi ulang sebelum dipakai

Alamat IP `185.199.108.153` sampai `185.199.111.153` di atas adalah nilai yang
dipakai GitHub Pages. Karena bisa berubah, **cocokkan ulang di dokumentasi
resmi GitHub** pada saat Anda benar-benar memasang domain. Setelah itu, tes:

- Tunggu penyebaran DNS. Biasanya beberapa menit, paling lama sekitar 24 jam.
- Buka domain di browser dengan mode penyamaran (incognito).
- Kembali ke **Settings → Pages** dan pastikan **DNS check** sudah hijau.

---

## 3. Mengaktifkan HTTPS (Enforce HTTPS)

HTTPS membuat koneksi pengunjung terenkripsi dan membantu kepercayaan pengguna
maupun mesin pencari. Langkahnya:

1. Buka **Settings → Pages**.
2. Tunggu sampai status **DNS check successful** muncul.
3. Centang **Enforce HTTPS**.
4. Simpan (kalau ada tombol **Save**).

Catatan:

- Opsi **Enforce HTTPS** baru bisa dicentang **setelah** DNS benar dan
  sertifikatnya diterbitkan. Kalau opsi masih kelabu (tidak bisa diklik),
  tunggu dan muat ulang halaman — jangan dipaksa.
- Sertifikat dibuat otomatis oleh GitHub Pages. Anda tidak perlu membeli
  sertifikat terpisah untuk kebutuhan dasar ini.
- Kalau sertifikat belum terbit setelah 24 jam, coba lepas domain kustom lalu
  pasang lagi, dan pastikan tidak ada catatan DNS ganda yang menunjuk ke arah
  berbeda.

---

## 4. Yang WAJIB diperbarui di aplikasi setelah domain aktif

Setelah domain aktif, beberapa bagian aplikasi masih menunjuk ke alamat GitHub
Pages lama. Semuanya harus diperbarui, kalau tidak: mesin pencari bisa bingung
(dua alamat dianggap halaman berbeda), dan tautan atau kartu pratinjau saat
dibagikan bisa menunjuk ke tempat yang salah.

### 4a. Tag kanonik (`rel="canonical"`)

Tag kanonik memberi tahu mesin pencari alamat resmi sebuah halaman. Setiap
halaman HTML harus punya satu, menunjuk ke domain baru:

```html
<link rel="canonical" href="https://siap-psikotes.id/psikotes/">
```

Halaman utama memakai `https://siap-psikotes.id/`, halaman psikotes memakai
`https://siap-psikotes.id/psikotes/`.

### 4b. `og:url`

Tag Open Graph dipakai saat tautan dibagikan ke aplikasi pesan atau media
sosial. Perbarui `og:url` ke domain baru:

```html
<meta property="og:url" content="https://siap-psikotes.id/">
```

Sekalian periksa `og:title`, `og:description`, dan `og:image` masih sesuai.
Kalau ada `og:image`, pakai alamat lengkap domain baru, bukan alamat relatif.

### 4c. `sitemap.xml`

Berkas peta situs berisi daftar halaman yang ingin diindeks mesin pencari.
Isinya harus memakai domain baru:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://siap-psikotes.id/</loc></url>
  <url><loc>https://siap-psikotes.id/psikotes/</loc></url>
</urlset>
```

Setelah sitemap jadi, daftarkan alamatnya di Google Search Console.

### 4d. Nama aplikasi di `manifest.json`

`manifest.json` menentukan nama yang tampil saat aplikasi dipasang di layar
utama ponsel. Pastikan:

- `"name"` dan `"short_name"` memakai nama produk yang benar (`SiapPsikotes`),
  bukan nama lama.
- `"start_url"` masih menunjuk ke halaman awal aplikasi.
- Ikon di daftar `icons` masih bisa dibuka di domain baru.

Nama yang masih menyebut nama lama membuat aplikasi terlihat belum
"resmi" di mata pengguna dan mesin pencari.

### 4e. Berkas `robots.txt`

Berkas `robots.txt` di akar domain mengizinkan mesin pencari membaca situs dan
menunjuk ke sitemap:

```
User-agent: *
Allow: /

Sitemap: https://siap-psikotes.id/sitemap.xml
```

Skrip `domain/pasang-domain.py` menulis ketiga hal berikut otomatis: `CNAME`,
`sitemap.xml`, dan `robots.txt`, serta mengganti domain lama di berkas HTML.

---

## 5. Peringatan penting

### 5a. Jangan hapus repositori lama

Jangan menghapus repositori aplikasi ini. Alasannya sederhana:

- Semua tautan lama (`https://arapcihuy.github.io/pk-perwira-tni/...`) akan
  **mati** dan menampilkan halaman tidak ditemukan.
- Orang yang sudah menyimpan tautan, atau yang menemukannya dari sumber lain,
  akan kehilangan akses.
- Situs yang sudah dipasang di ponsel pengguna memakai alamat lama — kalau
  alamat itu mati, aplikasi mereka tidak bisa memperbarui diri.

Cara yang aman: **biarkan repositori lama tetap hidup** dan biarkan domain baru
melayani alamat utama. Kalau nanti ingin menutup alamat lama, lakukan setelah
domain baru terbukti berjalan normal dan setelah lewat beberapa bulan.

### 5b. Service worker dan cache lama

Aplikasi ini memakai service worker (`sw.js`) untuk bisa dipakai offline.
Service worker menyimpan berkas di perangkat pengguna, jadi pengguna bisa
**masih memakai versi lama** walau server sudah diperbarui.

Setelah pindah domain:

1. **Naikkan versi** di service worker supaya nama cache ikut berubah.
2. Halaman sudah menampilkan tombol **Muat Ulang** otomatis kalau ada versi
   baru terdeteksi — pastikan fitur itu masih jalan.
3. Uji sendiri: buka situs di ponsel yang pernah membuka alamat lama, lalu
   pastikan setelah muat ulang aplikasi memakai versi terbaru.
4. Kalau pengguna tampak "macet" di versi lama, minta mereka menutup tab lalu
   membuka domain baru. Service worker di domain baru bersifat terpisah dari
   service worker domain lama, jadi domain baru biasanya otomatis bersih.

Ingat: service worker **per domain**. Pengguna yang membuka domain baru akan
mengunduh cache baru dari nol, tetapi pengguna yang masih memakai alamat lama
tetap menerima versi dari alamat lama.

---

## 6. Menjalankan skrip bantuan

Di folder ini tersedia `pasang-domain.py`. Skrip itu:

1. Menulis berkas `CNAME` berisi domain Anda.
2. Mengganti alamat lama `https://arapcihuy.github.io/pk-perwira-tni` menjadi
   domain baru di `index.html`, `psikotes/index.html`, dan `manifest.json`
   (berkas yang tidak ada akan dilewati dengan pesan).
3. Menulis `sitemap.xml` berisi halaman utama dan halaman psikotes.
4. Menulis `robots.txt` yang mengizinkan semua mesin pencari dan menunjuk
   sitemap.
5. Membuat cadangan setiap berkas yang diubah sebelum diubah, dan mencetak
   ringkasan perubahan.

### Uji dulu tanpa domain asli

Sebelum dipakai sungguhan, jalankan mode uji. Mode ini bekerja pada **salinan**
di `/tmp` dengan domain contoh `siap-psikotes.example.com`, dan **tidak
mengubah** berkas repositori:

```bash
python3 domain/pasang-domain.py --uji
```

### Pasang sungguhan

Kalau hasil uji sudah benar dan domain sudah dibeli:

```bash
python3 domain/pasang-domain.py siap-psikotes.id
```

Setelah skrip jalan: tinjau ringkasan yang dicetak, periksa
`domain/backup/` kalau ada yang ingin dikembalikan, lalu kirim perubahan
(`git add` / `git commit` / `git push`) supaya GitHub Pages memakai berkas baru.
Jangan lupa mengulang langkah 3 (Enforce HTTPS) dan mengecek status DNS check
di GitHub setelah perubahan terkirim.
