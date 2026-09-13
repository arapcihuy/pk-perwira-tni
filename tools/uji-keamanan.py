#!/usr/bin/env python3
"""Uji keamanan API SiapPsikotes: mencoba menembus, lalu melaporkan apa yang berhasil.

Dijalankan terhadap API yang SUDAH TAYANG. Yang diuji:
  1. tanpa token tidak boleh membaca data
  2. token palsu/hasil karangan harus ditolak
  3. token yang ditandatangani kunci kita sendiri (peniruan) harus ditolak
  4. asal (Origin) asing harus ditolak
  5. alamat pemilik harus menolak pengunjung biasa
  6. metode terlarang harus ditolak
  7. batas laju harus bekerja
  8. kiriman raksasa harus ditolak
  9. percobaan suntikan SQL tidak boleh tampak berhasil
 10. penelusuran jalur (path traversal) harus gagal

Catatan jujur: uji ini membuktikan jalur-jalur tertentu tertutup. Uji TIDAK membuktikan
sistem bebas celah - hanya bahwa lubang-lubang yang kita ketahui sudah tertutup.
"""
import base64
import json
import time
import urllib.error
import urllib.request

API = 'https://siappsikotes-api.rasyidahmad180.workers.dev'
ASAL = 'https://arapcihuy.github.io'
lulus = gagal = 0


def panggil(jalan, metode='GET', isi=None, token=None, asal=ASAL, tajuk=None):
    url = API + jalan
    data = None
    h = {'Origin': asal, 'Accept': 'application/json',
         # sebagian perlindungan Cloudflare memblokir User-Agent bot; kita meniru peramban
         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'}
    if isi is not None:
        data = isi if isinstance(isi, bytes) else json.dumps(isi).encode()
        h['Content-Type'] = 'application/json'
    if token:
        h['Authorization'] = 'Bearer ' + token
    if tajuk:
        h.update(tajuk)
    req = urllib.request.Request(url, data=data, headers=h, method=metode)
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.status, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace')
    except Exception as e:
        return 0, str(e)


def cek(nama, syarat, bukti=''):
    global lulus, gagal
    if syarat:
        lulus += 1
        print('  OK    | %s' % nama)
    else:
        gagal += 1
        print('  GAGAL | %s  ->  %s' % (nama, str(bukti)[:150]))


def b64u(b):
    return base64.urlsafe_b64encode(b).decode().rstrip('=')


def token_karangan(klaim, kunci='rahasia-yang-salah'):
    kepala = b64u(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode())
    isi = b64u(json.dumps(klaim).encode())
    import hashlib
    import hmac
    tanda = b64u(hmac.new(kunci.encode(), ('%s.%s' % (kepala, isi)).encode(), hashlib.sha256).digest())
    return '%s.%s.%s' % (kepala, isi, tanda)


print('=== Uji keamanan API SiapPsikotes ===')
print('API:', API)

print('\n1. Keadaan dasar')
kode, teks = panggil('/sehat')
cek('API hidup', kode == 200, (kode, teks))

print('\n2. Tanpa token tidak boleh membaca data pribadi')
for jalan in ['/api/saya', '/api/unduh-data-saya', '/api/pemilik/ringkasan']:
    kode, teks = panggil(jalan)
    cek('%s ditolak tanpa token' % jalan, kode == 401, (kode, teks[:80]))

print('\n3. Token palsu ditolak')
for token in ['abc', 'x' * 200, 'a.b.c', token_karangan({'sub': '1', 'email': 'penyusup@contoh.id'}),
              token_karangan({'sub': 'x', 'email': 'rasyidahmad180@gmail.com'})]:
    kode, teks = panggil('/api/saya', token=token)
    cek('token ditolak (%s...)' % token[:14], kode == 401, (kode, teks[:80]))

print('\n4. Asal (Origin) asing ditolak')
for asal in ['https://situs-jahat.example', 'http://localhost:9999', 'null']:
    kode, teks = panggil('/sehat', asal=asal)
    cek('asal %s ditolak' % asal, kode == 403, (kode, teks[:80]))

print('\n5. Penulisan data harus butuh masuk')
for jalan, isi in [('/api/progres', {'kategori': 'tkw', 'benar': 5, 'salah': 0}),
                   ('/api/salah', {'id_soal': 'x1'}),
                   ('/api/bahan', {'jenis': 'catatan', 'kunci': 'a', 'isi': 'x'}),
                   ('/api/pembelian', {'kode': 'SPXXXX'}),
                   ('/api/hapus-data-saya', {})]:
    kode, teks = panggil(jalan, 'POST', isi)
    cek('%s ditolak tanpa token' % jalan, kode == 401, (kode, teks[:80]))

print('\n6. Metode terlarang')
for metode in ['DELETE', 'PUT', 'PATCH']:
    kode, teks = panggil('/api/saya', metode)
    cek('metode %s ditolak' % metode, kode in (401, 405), (kode, teks[:80]))

print('\n7. Batas laju pada pintu masuk')
dapat429 = False
for i in range(16):
    kode, _ = panggil('/api/masuk', 'POST', {'id_token': 'token-ngawur'})
    if kode == 429:
        dapat429 = True
        break
cek('batas laju bekerja (429 setelah beberapa percobaan)', dapat429, kode)

print('\n8. Kiriman raksasa ditolak')
kode, teks = panggil('/api/bahan', 'POST', {'jenis': 'j', 'kunci': 'k', 'isi': 'A' * 300000})
cek('kiriman 300 KB ditolak', kode in (401, 413), (kode, teks[:80]))

print('\n9. Percobaan suntikan SQL (tidak boleh tampak berhasil, tidak boleh 500)')
suntikan = ["' OR 1=1 --", "'; DROP TABLE pengguna; --", "1; SELECT * FROM pengguna"]
for s in suntikan:
    kode, teks = panggil('/api/progres', 'POST', {'kategori': s, 'benar': 1})
    cek('suntikan ditolak tanpa bocor: %s' % s[:24], kode in (401, 400), (kode, teks[:80]))
kode, teks = panggil('/api/masuk', 'POST', {'id_token': "' OR 1=1 --"})
cek('suntikan lewat pintu masuk aman', kode in (400, 429), (kode, teks[:80]))

print('\n10. Penelusuran jalur & alamat aneh (yang penting: tidak ada isi berkas yang bocor)')
JEJAK_BOCOR = ['root:', '/bin/', 'DB_PASSWORD', 'BEGIN PRIVATE KEY', 'daemon:']
for jalan in ['/api/../etc/passwd', '/api/..%2f..%2fetc%2fpasswd', '/api/saya/../../', '/admin', '/.env',
              '/server/wrangler.toml', '/api/%00']:
    kode, teks = panggil(jalan)
    bocor = any(j in teks for j in JEJAK_BOCOR)
    wajar = kode in (400, 401, 403, 404) or ('SiapPsikotes API' in teks)
    cek('%s tidak membocorkan berkas' % jalan[:30], (not bocor) and wajar, (kode, teks[:80]))

print('\n11. CORS pada permintaan sah')
kode, _ = panggil('/sehat', metode='OPTIONS')
cek('pramuat CORS dari situs kita dilayani', kode == 204, kode)

print()
print('HASIL: %d lulus, %d gagal' % (lulus, gagal))
raise SystemExit(1 if gagal else 0)
