#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""pasang-domain.py — memasang domain sendiri untuk aplikasi SiapPsikotes.

JANGAN DIPAKAI LAGI. Ini versi lama (hanya index.html, psikotes/, manifest.json).
Versi yang dipakai dan dipelihara sekarang: tools/pasang-domain.py — ia juga
menangani halaman /beli/, /contoh/, /mutu/, /syarat/, /privasi/, sitemap.xml, dan
robots.txt. Situs sudah pindah ke https://siappsikotes.my.id pada 14 Sep 2026.

Pemakaian:
    python3 domain/pasang-domain.py --uji
    python3 domain/pasang-domain.py siap-psikotes.id

Apa yang dikerjakan:
  1. Menulis berkas CNAME berisi domain Anda.
  2. Mengganti alamat lama https://arapcihuy.github.io/pk-perwira-tni menjadi
     domain baru di index.html, psikotes/index.html, dan manifest.json.
     Berkas yang tidak ada akan dilewati dengan pesan.
     Untuk berkas HTML, tag kanonik (rel="canonical") dan og:url juga
     ditambahkan kalau belum ada.
  3. Menulis sitemap.xml berisi halaman utama dan halaman psikotes.
  4. Menulis robots.txt yang mengizinkan semua dan menunjuk sitemap.

Mode --uji memakai salinan di /tmp dengan domain contoh
siap-psikotes.example.com, dan TIDAK mengubah berkas repositori.
Lihat domain/PANDUAN-DOMAIN.md untuk langkah lengkapnya.
"""

from __future__ import annotations

import argparse
import datetime
import hashlib
import os
import re
import shutil
import subprocess
import sys

# --- Nilai tetap -----------------------------------------------------------

DOMAIN_LAMA = "https://arapcihuy.github.io/pk-perwira-tni"
DOMAIN_CONTOH = "siap-psikotes.example.com"

# Alamat hari ini (alamat GitHub Pages saat panduan ini ditulis).
# Ganti dua nilai ini kalau repositori dipindahkan ke organisasi lain.
PENGGUNA_GH = "arapcihuy"
NAMA_REPO = "pk-perwira-tni"

# Berkas aplikasi yang alamat lamanya perlu diganti.
BERKAS_APP = ["index.html", "psikotes/index.html", "manifest.json"]

# Halaman yang dimasukkan ke sitemap: (path relatif, prioritas).
HALAMAN = [("", "1.0"), ("psikotes/", "0.8")]

# Lokasi salinan uji (dipakai mode --uji).
DIR_UJI = "/tmp/siap-psikotes-uji"

BARIS = "-" * 68


# --- Alat bantu ------------------------------------------------------------

def cetak(teks: str = "") -> None:
    print(teks)


def akar_repo() -> str:
    """Akar repositori = folder induk dari folder skrip ini."""
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def baca(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def tulis(path: str, isi: str) -> None:
    folder = os.path.dirname(path)
    if folder and not os.path.isdir(folder):
        os.makedirs(folder, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(isi)


def sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for potong in iter(lambda: f.read(65536), b""):
            h.update(potong)
    return h.hexdigest()


def bersihkan_domain(masukan: str) -> str:
    """Mengubah masukan pengguna menjadi nama domain polos.

    Menerima 'siap-psikotes.id', 'https://siap-psikotes.id/',
    'www.siap-psikotes.id/' — semuanya menjadi 'siap-psikotes.id' dst.
    Mengembalikan string kosong kalau masukan tidak masuk akal.
    """
    d = (masukan or "").strip().lower()
    d = re.sub(r"^[a-z]+://", "", d)      # buang http:// atau https://
    d = d.split("/")[0]                    # buang path dan garis miring
    d = d.split("?")[0].split("#")[0]
    d = d.strip(".")
    if not d:
        return ""
    if " " in d or "\t" in d:
        return ""
    # hanya huruf, angka, titik, dan tanda hubung
    if not re.fullmatch(r"[a-z0-9.-]+", d):
        return ""
    if "." not in d or d.startswith("-") or d.endswith("-"):
        return ""
    if ".." in d:
        return ""
    if len(d) > 253:
        return ""
    return d


def cadangkan(path: str, root: str, jejak: list) -> str:
    """Menyalin berkas ke <root>/domain/backup/ sebelum diubah.

    Nama cadangan memakai jalur relatif (mis. 'psikotes__index.html.bak')
    supaya berkas berbeda yang namanya sama tidak saling menimpa.
    """
    tujuan_dir = os.path.join(root, "domain", "backup")
    os.makedirs(tujuan_dir, exist_ok=True)
    try:
        rel = os.path.relpath(path, root)
    except ValueError:
        rel = os.path.basename(path)
    nama = rel.replace(os.sep, "__")
    tujuan = os.path.join(tujuan_dir, nama + ".bak")
    n = 1
    while os.path.exists(tujuan):
        tujuan = os.path.join(tujuan_dir, f"{nama}.bak{n}")
        n += 1
    shutil.copy2(path, tujuan)
    jejak.append(f"  cadangan: {os.path.relpath(tujuan, root)}")
    return tujuan


def pastikan_kanonik(teks: str, domain: str, rel: str) -> tuple:
    """Menambahkan tag kanonik dan og:url kalau belum ada.

    Mengembalikan (teks_baru, daftar_keterangan).
    """
    keterangan = []
    halaman = os.path.dirname(rel)  # '' atau 'psikotes'
    if halaman:
        halaman += "/"
    alamat = f"https://{domain}/{halaman}"

    if 'rel="canonical"' not in teks:
        tag = f'<link rel="canonical" href="{alamat}">'
        if "</head>" in teks:
            teks = teks.replace("</head>", f"{tag}\n</head>", 1)
        else:
            teks = tag + "\n" + teks
        keterangan.append(f'  tambah tag kanonik -> {alamat}')

    if 'property="og:url"' not in teks:
        tag = f'<meta property="og:url" content="{alamat}">'
        if "</head>" in teks:
            teks = teks.replace("</head>", f"{tag}\n</head>", 1)
        else:
            teks = tag + "\n" + teks
        keterangan.append(f"  tambah og:url -> {alamat}")

    return teks, keterangan


def periksa_manifest(path: str) -> list:
    """Memberi catatan kalau nama aplikasi di manifest masih perlu diperiksa."""
    catatan = []
    try:
        import json
        data = json.loads(baca(path))
    except Exception as e:  # pragma: no cover
        return [f"  PERHATIAN: manifest.json tidak bisa dibaca sebagai JSON ({e})"]
    for kunci in ("name", "short_name"):
        nilai = str(data.get(kunci, ""))
        if "siappsikotes" not in nilai.lower().replace(" ", ""):
            catatan.append(
                f'  PERHATIAN: "{kunci}" di manifest.json belum memuat '
                f'"SiapPsikotes" (sekarang: "{nilai}")'
            )
    if not data.get("start_url"):
        catatan.append('  PERHATIAN: "start_url" di manifest.json kosong')
    return catatan


# --- Langkah pemasangan ----------------------------------------------------

def tulis_cname(root: str, domain: str, jejak: list) -> None:
    path = os.path.join(root, "CNAME")
    if os.path.exists(path):
        lama = baca(path).strip()
        if lama != domain:
            cadangkan(path, root, jejak)
    tulis(path, domain + "\n")
    jejak.append(f"  tulis: CNAME -> {domain}")


def ganti_domain(root: str, domain: str, jejak: list) -> None:
    for rel in BERKAS_APP:
        path = os.path.join(root, rel)
        if not os.path.isfile(path):
            jejak.append(f"  - {rel}: BERKAS TIDAK ADA, dilewati")
            continue

        teks = baca(path)
        jumlah = teks.count(DOMAIN_LAMA)
        teks_baru = teks.replace(DOMAIN_LAMA, f"https://{domain}")

        tambahan = []
        if rel.endswith(".html"):
            teks_baru, tambahan = pastikan_kanonik(teks_baru, domain, rel)

        if teks_baru == teks:
            jejak.append(f"  - {rel}: tidak ada yang diubah (bersih)")
            continue

        cadangkan(path, root, jejak)
        tulis(path, teks_baru)
        jejak.append(
            f"  - {rel}: {jumlah} alamat lama diganti -> https://{domain}"
        )
        jejak.extend(tambahan)

        if rel.endswith(".json"):
            jejak.extend(periksa_manifest(path))


def tulis_sitemap(root: str, domain: str, jejak: list) -> None:
    hari_ini = datetime.date.today().isoformat()
    baris = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for path, prioritas in HALAMAN:
        baris.append("  <url>")
        baris.append(f"    <loc>https://{domain}/{path}</loc>")
        baris.append(f"    <lastmod>{hari_ini}</lastmod>")
        baris.append(f"    <priority>{prioritas}</priority>")
        baris.append("  </url>")
    baris.append("</urlset>")
    path = os.path.join(root, "sitemap.xml")
    if os.path.exists(path):
        cadangkan(path, root, jejak)
    tulis(path, "\n".join(baris) + "\n")
    halaman = ", ".join(f"https://{domain}/{p}" for p, _ in HALAMAN)
    jejak.append(f"  tulis: sitemap.xml ({halaman})")


def tulis_robots(root: str, domain: str, jejak: list) -> None:
    isi = (
        "# robots.txt — SiapPsikotes\n"
        "# Mengizinkan semua mesin pencari membaca seluruh halaman.\n"
        "\n"
        "User-agent: *\n"
        "Allow: /\n"
        "\n"
        f"Sitemap: https://{domain}/sitemap.xml\n"
    )
    path = os.path.join(root, "robots.txt")
    if os.path.exists(path):
        cadangkan(path, root, jejak)
    tulis(path, isi)
    jejak.append(f"  tulis: robots.txt (Sitemap: https://{domain}/sitemap.xml)")


def pasang(root: str, domain: str) -> list:
    jejak: list = []
    tulis_cname(root, domain, jejak)
    ganti_domain(root, domain, jejak)
    tulis_sitemap(root, domain, jejak)
    tulis_robots(root, domain, jejak)
    return jejak


# --- Mode uji --------------------------------------------------------------

def jalankan_uji() -> int:
    repo = akar_repo()
    cetak(BARIS)
    cetak("MODE UJI — tidak ada berkas repositori yang diubah")
    cetak(f"Repositori : {repo}")
    cetak(f"Domain contoh: {DOMAIN_CONTOH}")
    cetak(BARIS)

    # 1. Catat sidik jari berkas aplikasi sebelum uji.
    sebelum = {}
    for rel in BERKAS_APP:
        path = os.path.join(repo, rel)
        if os.path.isfile(path):
            sebelum[rel] = sha256(path)

    # 2. Siapkan salinan bersih di /tmp.
    if os.path.isdir(DIR_UJI):
        if not DIR_UJI.startswith("/tmp/"):
            cetak(f"GAGAL: {DIR_UJI} tidak berada di /tmp, dibatalkan demi aman")
            return 2
        shutil.rmtree(DIR_UJI)
    os.makedirs(DIR_UJI, exist_ok=True)
    for rel in BERKAS_APP:
        asal = os.path.join(repo, rel)
        if os.path.isfile(asal):
            tujuan = os.path.join(DIR_UJI, rel)
            os.makedirs(os.path.dirname(tujuan), exist_ok=True)
            shutil.copy2(asal, tujuan)
    cetak(f"\nSalinan uji disiapkan di: {DIR_UJI}")

    # 3. Jalankan pemasangan pada salinan.
    cetak("\nRingkasan perubahan (pada salinan /tmp):")
    jejak = pasang(DIR_UJI, DOMAIN_CONTOH)
    for baris in jejak:
        cetak(baris)

    # 4. Tunjukkan berkas yang dihasilkan.
    cetak("\nBerkas baru di salinan uji:")
    for nama in ("CNAME", "sitemap.xml", "robots.txt"):
        p = os.path.join(DIR_UJI, nama)
        ukuran = os.path.getsize(p) if os.path.exists(p) else -1
        cetak(f"  {nama}: {'ADA' if ukuran >= 0 else 'TIDAK ADA'} ({ukuran} byte)")

    # 5. Buktikan berkas repositori tidak berubah.
    cetak("\nPemeriksaan berkas repositori (sidik jari SHA-256):")
    berubah = []
    for rel, hash_lama in sebelum.items():
        hash_baru = sha256(os.path.join(repo, rel))
        status = "SAMA" if hash_lama == hash_baru else "BERUBAH"
        if hash_lama != hash_baru:
            berubah.append(rel)
        cetak(f"  {rel}: {status}")

    # 6. Tampilkan git status repositori.
    cetak("\nHasil 'git status --porcelain' pada repositori:")
    try:
        hasil = subprocess.run(
            ["git", "-C", repo, "status", "--porcelain"],
            capture_output=True, text=True, timeout=30,
        )
        keluaran = hasil.stdout.strip()
        if keluaran:
            for baris in keluaran.splitlines():
                cetak(f"  {baris}")
        else:
            cetak("  (kosong — tidak ada perubahan berkas yang dilacak)")
    except Exception as e:
        cetak(f"  (tidak bisa menjalankan git: {e})")

    cetak("\n" + BARIS)
    if berubah:
        cetak(f"UJI GAGAL: berkas repositori berubah: {', '.join(berubah)}")
        cetak(BARIS)
        return 1
    cetak("UJI BERHASIL: salinan uji terpasang, berkas repositori tidak berubah.")
    cetak(f"Silakan periksa sendiri isi salinan di: {DIR_UJI}")
    cetak(BARIS)
    return 0


# --- Titik masuk -----------------------------------------------------------

def main(argv=None) -> int:
    p = argparse.ArgumentParser(
        description="Memasang domain sendiri untuk aplikasi SiapPsikotes.",
        epilog="Contoh: python3 domain/pasang-domain.py siap-psikotes.id",
    )
    p.add_argument("domain", nargs="?", default=None,
                   help="nama domain, mis. siap-psikotes.id")
    p.add_argument("--uji", action="store_true",
                   help="uji pada salinan di /tmp tanpa mengubah repositori")
    p.add_argument("--root", default=None,
                   help="(internal) akar kerja; hanya dipakai untuk pengujian")
    args = p.parse_args(argv)

    if args.uji:
        return jalankan_uji()

    if args.root:
        root = os.path.abspath(args.root)
    else:
        root = akar_repo()

    if not args.domain or not args.domain.strip():
        cetak(BARIS)
        cetak("GAGAL: nama domain belum diisi.")
        cetak("")
        cetak("Pemakaian:")
        cetak("  python3 domain/pasang-domain.py siap-psikotes.id")
        cetak("  python3 domain/pasang-domain.py --uji   (uji tanpa domain asli)")
        cetak("")
        cetak("Skrip berhenti tanpa mengubah berkas apa pun.")
        cetak(BARIS)
        return 2

    domain = bersihkan_domain(args.domain)
    if not domain:
        cetak(BARIS)
        cetak(f'GAGAL: "{args.domain.strip()}" bukan nama domain yang masuk akal.')
        cetak("Pakai bentuk polos, misalnya: siap-psikotes.id")
        cetak("Skrip berhenti tanpa mengubah berkas apa pun.")
        cetak(BARIS)
        return 2

    cetak(BARIS)
    cetak("PEMASANGAN DOMAIN")
    cetak(f"Repositori  : {root}")
    cetak(f"Domain baru : {domain}")
    cetak(f"Awal lama   : {DOMAIN_LAMA}")
    cetak(BARIS)

    jejak = pasang(root, domain)

    cetak("\nRingkasan perubahan:")
    for baris in jejak:
        cetak(baris)

    cetak("\nSelanjutnya:")
    cetak("  1. Periksa ringkasan di atas dan isi berkas yang dihasilkan.")
    cetak("  2. Pastikan catatan DNS sudah benar (lihat domain/PANDUAN-DOMAIN.md).")
    cetak("  3. Aktifkan 'Enforce HTTPS' di Settings > Pages.")
    cetak("  4. Jalankan: git add -A && git commit -m 'pindah ke domain sendiri'")
    cetak("     lalu: git push")
    cetak("  5. Naikkan versi service worker supaya pengguna tidak memakai cache lama.")
    cetak(BARIS)
    return 0


if __name__ == "__main__":
    sys.exit(main())
