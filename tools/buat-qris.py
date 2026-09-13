#!/usr/bin/env python3
"""Pembangkit & pemeriksa QRIS (EMVCo Merchant-Presented Mode).

Kegunaan:
  1) PERIKSA  : membaca string QRIS milikmu, menampilkan isinya (NMID, nama, kota) dan
                memastikan kode checksum-nya sah. Pakai ini sebelum memakai QRIS-mu.
  2) DINAMIS  : menambahkan nominal pasti ke QRIS statis milikmu, sehingga pembeli tidak
                perlu mengetik jumlah lagi.
  3) GAMBAR   : menghasilkan berkas QR (PNG/SVG) untuk dipasang di aplikasi.

PENTING (jujur):
  - Alat ini TIDAK menerbitkan QRIS. QRIS hanya diterbitkan bank/e-wallet/PJSP atas akun
    merchant milikmu. Alat ini hanya menyusun ulang data yang SUDAH milikmu.
  - WAJIB uji-scan dulu dengan aplikasi bankmu sendiri (nominal kecil) sebelum dipakai jualan.
  - Sebagian penyedia mengharuskan QR dinamis dibuat oleh sistem mereka. Tanyakan ke
    penyediamu bila ragu.

Contoh:
  /usr/bin/python3 tools/buat-qris.py --periksa "00020101021126..."
  tools/buat-qris.sh --statis "00020101021126..." --jumlah 39000 --keluar psikotes/img/qris-bayar.png
  tools/buat-qris.sh --nmid ID1024xxxxxxxxxx --nama "SiapPsikotes" --kota "Bantul" --jumlah 39000 \
                     --keluar psikotes/img/qris-bayar.png
"""
import argparse
import os
import sys

# ---------- TLV & CRC (EMVCo) ----------
def crc16_ccitt(data: str) -> str:
    """CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) — dipakai QRIS. Nilai uji: '123456789' -> 29B1."""
    crc = 0xFFFF
    for b in data.encode('ascii'):
        crc ^= b << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) if (crc & 0x8000) else (crc << 1)
            crc &= 0xFFFF
    return '%04X' % crc


def urai_tlv(s: str):
    """Urai string TLV menjadi [(tag, value), ...] — nilai bisa bersarang."""
    keluar, i = [], 0
    while i + 4 <= len(s):
        tag = s[i:i + 2]
        try:
            panjang = int(s[i + 2:i + 4])
        except ValueError:
            raise ValueError('struktur TLV tidak sah di posisi %d' % i)
        nilai = s[i + 4:i + 4 + panjang]
        if len(nilai) != panjang:
            raise ValueError('panjang nilai tag %s tidak cocok' % tag)
        keluar.append((tag, nilai))
        i += 4 + panjang
    if i != len(s):
        raise ValueError('sisa data tak terbaca: %r' % s[i:])
    return keluar


def susun_tlv(daftar) -> str:
    return ''.join(tag + ('%02d' % len(nilai)) + nilai for tag, nilai in daftar)


def lengkapi_crc(payload: str) -> str:
    """Pasang ulang checksum: buang tag 63 lama (bila ada), hitung CRC atas sisa + '6304'."""
    daftar = [(t, v) for t, v in urai_tlv(payload) if t != '63']
    tanpa_crc = susun_tlv(daftar) + '6304'
    return tanpa_crc + crc16_ccitt(tanpa_crc)


def periksa(payload: str) -> dict:
    asli = payload.strip()
    daftar = urai_tlv(asli)
    isi = {}
    for tag, nilai in daftar:
        isi[tag] = nilai
    crc_tertulis = isi.get('63', '')
    crc_seharusnya = crc16_ccitt(asli[:-4])
    akun = {}
    for tag in ('26', '51'):
        if tag in isi:
            try:
                anak = dict(urai_tlv(isi[tag]))
                akun.update(anak)
            except ValueError:
                pass
    return {
        'format': isi.get('00', ''),
        'inisiasi': isi.get('01', ''),
        'nmid': akun.get('02', ''),
        'penyedia': akun.get('00', ''),
        'kriteria': akun.get('03', ''),
        'mcc': isi.get('52', ''),
        'mata_uang': isi.get('53', ''),
        'jumlah': isi.get('54', ''),
        'negara': isi.get('58', ''),
        'nama': isi.get('59', ''),
        'kota': isi.get('60', ''),
        'crc_tertulis': crc_tertulis,
        'crc_seharusnya': crc_seharusnya,
        'crc_sah': crc_tertulis.upper() == crc_seharusnya,
    }


def jadi_dinamis(payload: str, jumlah: int) -> str:
    """Tambahkan/ganti nominal + tandai QR dinamis, lalu hitung ulang checksum."""
    daftar = [(t, v) for t, v in urai_tlv(payload) if t not in ('54', '63')]
    keluar = []
    dipasang = False
    for tag, nilai in daftar:
        if tag == '01':
            keluar.append((tag, '12'))          # 12 = dinamis (sekali bayar, nominal pasti)
        else:
            keluar.append((tag, nilai))
        if tag == '53' and not dipasang:         # 53 = mata uang; nominal ditaruh setelahnya
            keluar.append(('54', str(int(jumlah))))
            dipasang = True
    if not dipasang:
        keluar.append(('54', str(int(jumlah))))
    return lengkapi_crc(susun_tlv(keluar))


def jadi_statis(payload: str) -> str:
    """Kembalikan ke QR statis (tanpa nominal) — untuk pembeli yang mengetik jumlah sendiri."""
    daftar = [(t, '11' if t == '01' else v) for t, v in urai_tlv(payload) if t not in ('54', '63')]
    return lengkapi_crc(susun_tlv(daftar))


def bangun_dari_nmid(nmid, nama, kota, mcc, jumlah=None, penyedia='ID.CO.QRIS.WWW', kriteria='UMI'):
    akun = susun_tlv([('00', penyedia), ('02', nmid)] + ([('03', kriteria)] if kriteria else []))
    daftar = [
        ('00', '01'),
        ('01', '12' if jumlah else '11'),
        ('51', akun),
        ('52', mcc),
        ('53', '360'),
    ]
    if jumlah:
        daftar.append(('54', str(int(jumlah))))
    daftar += [('58', 'ID'), ('59', nama[:25]), ('60', kota[:15])]
    return lengkapi_crc(susun_tlv(daftar))


def simpan_gambar(payload, keluar):
    try:
        import segno
    except ImportError:
        print('\nCATATAN: pustaka gambar QR belum ada di Python ini.')
        print('Jalankan lewat: tools/buat-qris.sh ...  (memakai .tools-venv)')
        print('Atau pasang sekali: /usr/bin/python3 -m venv .tools-venv && ./.tools-venv/bin/pip install segno')
        return False
    q = segno.make(payload, error='m')
    os.makedirs(os.path.dirname(os.path.abspath(keluar)), exist_ok=True)
    if keluar.lower().endswith('.svg'):
        q.save(keluar, scale=8, dark='#0e1626', light='#ffffff')
    else:
        q.save(keluar, scale=8, border=3, dark='#0e1626', light='#ffffff')
    return True


def main():
    ap = argparse.ArgumentParser(description='Pembangkit & pemeriksa QRIS (EMVCo)')
    ap.add_argument('--periksa', help='string QRIS milikmu untuk diperiksa')
    ap.add_argument('--statis', help='QRIS statis milikmu (untuk ditambah nominal)')
    ap.add_argument('--nmid', help='NMID merchant milikmu (mis. ID1024xxxxxxxxxx)')
    ap.add_argument('--nama', default='SiapPsikotes')
    ap.add_argument('--kota', default='Bantul')
    ap.add_argument('--mcc', default='8299', help='kategori merchant (8299 = pendidikan)')
    ap.add_argument('--kriteria', default='UMI', help='UMI/UKE/UME/UBE')
    ap.add_argument('--jumlah', type=int, help='nominal rupiah (mis. 39000)')
    ap.add_argument('--tanpa-jumlah', action='store_true', help='bikin QR statis (pembeli mengetik nominal)')
    ap.add_argument('--keluar', help='berkas gambar QR (.png/.svg)')
    ap.add_argument('--uji', action='store_true', help='jalankan pemeriksaan diri lalu keluar')
    a = ap.parse_args()

    if a.uji:
        v = crc16_ccitt('123456789')
        print('uji CRC-16/CCITT-FALSE: %s (seharusnya 29B1) -> %s' % (v, 'LULUS' if v == '29B1' else 'GAGAL'))
        contoh = bangun_dari_nmid('ID1024000000000000000', 'SiapPsikotes', 'Bantul', '8299', 39000)
        b = periksa(contoh)
        print('uji bangun->periksa: nama=%s nmid=%s jumlah=%s crc_sah=%s' % (b['nama'], b['nmid'][:8] + '...', b['jumlah'], b['crc_sah']))
        print('uji bulat (dinamis->statis->dinamis): %s' % ('LULUS' if periksa(jadi_dinamis(jadi_statis(contoh), 39000))['jumlah'] == '39000' else 'GAGAL'))
        return 0

    if a.periksa:
        try:
            b = periksa(a.periksa)
        except ValueError as e:
            print('TIDAK SAH: %s' % e)
            return 1
        print('=== ISI QRIS ===')
        print('  penyedia     :', b['penyedia'] or '-')
        print('  NMID         :', b['nmid'] or '(tidak ditemukan)')
        print('  kriteria     :', b['kriteria'] or '-')
        print('  nama merchant:', b['nama'] or '-')
        print('  kota         :', b['kota'] or '-')
        print('  MCC          :', b['mcc'] or '-')
        print('  jumlah       :', b['jumlah'] or '(statis, nominal diketik pembeli)')
        print('  checksum     :', b['crc_tertulis'], '->', 'SAH' if b['crc_sah'] else 'TIDAK SAH (seharusnya %s)' % b['crc_seharusnya'])
        return 0 if b['crc_sah'] else 1

    if a.nmid:
        payload = bangun_dari_nmid(a.nmid, a.nama, a.kota, a.mcc, None if a.tanpa_jumlah else a.jumlah, kriteria=a.kriteria)
    elif a.statis:
        payload = jadi_statis(a.statis) if a.tanpa_jumlah else jadi_dinamis(a.statis, a.jumlah or 0)
        if not a.jumlah and not a.tanpa_jumlah:
            print('Tentukan --jumlah (mis. 39000) atau --tanpa-jumlah.'); return 2
    else:
        print('Pilih salah satu: --periksa, --statis, atau --nmid. Lihat --help.')
        print('CATATAN: alat ini tidak bisa menerbitkan QRIS baru; hanya menyusun ulang data milikmu.')
        return 2

    b = periksa(payload)
    print('=== QRIS SIAP ===')
    print('  nama   :', b['nama'], '| kota:', b['kota'], '| jumlah:', b['jumlah'] or '(diketik pembeli)')
    print('  NMID   :', b['nmid'] or '(dari data statismu)')
    print('  checksum:', b['crc_tertulis'], 'SAH' if b['crc_sah'] else 'TIDAK SAH')
    print('  payload:', payload)
    if a.keluar:
        if simpan_gambar(payload, a.keluar):
            print('  gambar :', os.path.abspath(a.keluar))
    print('\nWAJIB: uji-scan dengan aplikasi bankmu sendiri (nominal kecil) sebelum dipakai jualan.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
