// FITUR 16 — v57: GERBANG AKSES (semua harus bayar) + PENGECUALIAN PEMILIK
//
// Keputusan pemilik (13 Sep 2026): tidak ada lagi fitur gratis. Seluruh aplikasi
// (semua soal + pembahasan + laporan) hanya terbuka bagi yang sudah membayar.
// Pengecualian: akun pemilik rasyidahmad180@gmail.com.
//
// Aturan yang dipakai:
//  - Satu pembayaran Rp 39.000 membuka SEMUA (aplikasi + Laporan Lengkap).
//    Kode akses yang sama dipakai dan diperiksa dengan cara yang sama seperti sebelumnya.
//  - Pemilik dibuka otomatis lewat dua jalan: (a) masuk Google dengan surel pemilik,
//    (b) kode pengembang (untuk bekerja di perangkat mana pun sebelum Google aktif).
//  - Seluruh keputusan terkunci di berkas ini; mengembalikan ke model gratis cukup
//    dengan mengubah 'aktifGerbang' menjadi false.

window.AKSES = {
  aktifGerbang: true,                      // false = kembali seperti semula (ada yang gratis)
  harga: 'Rp 39.000',
  pemilik: ['rasyidahmad180@gmail.com'],   // akun yang dibuka otomatis
  kodePengembang: 'SPDEVPEMILIK018Y4X',                      // diisi oleh tools/buat-kode.py (lihat tools/buat-kode.py --dev)
  pesanGratis: false                       // true = beri contoh soal gratis (mis. 10 soal pertama)
};

// ---------- keadaan akses ----------
window.bacaAkunGoogle = function () {
  try { return JSON.parse(localStorage.getItem('tni_google_akun') || 'null'); } catch (e) { return null; }
};

window.adalahPemilik = function () {
  var a = bacaAkunGoogle();
  if (!a || !a.email) return false;
  return AKSES.pemilik.map(function (x) { return x.toLowerCase(); })
    .indexOf(String(a.email).toLowerCase()) !== -1;
};

window.punyaAkses = function () {
  if (!AKSES.aktifGerbang) return true;
  if (adalahPemilik()) return true;
  try {
    if (localStorage.getItem('tni_akses_pemilik') === '1') return true;
    if (localStorage.getItem('tni_akses') === 'TERBUKA') return true;
  } catch (e) {}
  var kode = '';
  try { kode = localStorage.getItem('tni_kode_akses') || ''; } catch (e) {}
  if (kode && typeof periksaKode === 'function') {
    try { return !!periksaKode(kode).sah; } catch (e) {}
  }
  return false;
};

window.peranAkses = function () {
  if (!AKSES.aktifGerbang) return 'bebas';
  if (adalahPemilik()) return 'pemilik';
  try {
    if (localStorage.getItem('tni_akses_pemilik') === '1') return 'pemilik-lokal';
  } catch (e) {}
  if (punyaAkses()) return 'pembeli';
  return 'terkunci';
};

// ---------- tindakan ----------
window.terapkanKodeAkses = function () {
  var el = document.getElementById('kodeAksesGerbang');
  var st = document.getElementById('statusGerbang');
  var kode = (el && el.value || '').trim().toUpperCase();
  if (!kode) { if (st) st.textContent = 'Masukkan kode aksesmu dulu.'; return; }

  // kode pengembang (khusus pemilik)
  if (AKSES.kodePengembang && kode === String(AKSES.kodePengembang).toUpperCase()) {
    try { localStorage.setItem('tni_akses_pemilik', '1'); } catch (e) {}
    if (st) st.textContent = 'Kode pengembang diterima. Membuka seluruh aplikasi...';
    setTimeout(function () { location.reload(); }, 700);
    return;
  }

  var sah = false;
  try { sah = (typeof periksaKode === 'function') && periksaKode(kode).sah; } catch (e) { sah = false; }
  if (sah) {
    try {
      localStorage.setItem('tni_kode_akses', kode);
      localStorage.setItem('tni_akses', 'TERBUKA');
      // satu pembayaran membuka semuanya, termasuk Laporan Lengkap
      localStorage.setItem('tni_laporan_bayar', JSON.stringify({ kode: kode, tanggal: new Date().toISOString().slice(0, 10) }));
    } catch (e) {}
    if (st) st.textContent = 'Kode sah. Membuka seluruh aplikasi...';
    setTimeout(function () { location.reload(); }, 700);
  } else if (st) {
    st.textContent = 'Kode tidak dikenali. Periksa penulisannya, atau kirim bukti pembayaran ke pemilik.';
  }
};

window.tutupGerbangUlang = function () {
  if (!confirm('Kunci kembali aplikasinya di perangkat ini? Kamu perlu kode akses lagi untuk masuk.')) return;
  try {
    localStorage.removeItem('tni_akses');
    localStorage.removeItem('tni_kode_akses');
    localStorage.removeItem('tni_akses_pemilik');
  } catch (e) {}
  location.reload();
};

// ---------- tampilan gerbang ----------
window.renderGerbang = function () {
  var pesan = '';
  try { pesan = localStorage.getItem('tni_gerbang_pesan') || ''; } catch (e) {}
  var qris = (typeof BAYAR !== 'undefined' && BAYAR && BAYAR.aktif) ? '' : '';

  var isi = '<div class="gerbang-kartu">' +
    '<div class="gerbang-ikon">' + ic('shield', 30) + '</div>' +
    '<h2>Seluruh materi terbuka setelah membeli</h2>' +
    '<p class="gerbang-sub">Sejak sekarang tidak ada lagi akses gratis. Satu pembayaran ' +
      '<strong>' + AKSES.harga + '</strong> membuka <strong>semua</strong>: 1.225 soal, seluruh modul tes, ' +
      'pembahasan langkah demi langkah, dan Laporan Lengkap. Bukan langganan, tanpa perpanjangan.</p>' +

    '<div class="gerbang-isi">' +
      '<div>' + ic('check', 13) + ' 1.225 soal dalam 9 modul, dengan pembahasan</div>' +
      '<div>' + ic('check', 13) + ' Tes IQ, kecepatan kerja, kepribadian, tes gambar, latihan wawancara</div>' +
      '<div>' + ic('check', 13) + ' Laporan Lengkap: kesiapan, kecocokan kerja, rencana 14 hari</div>' +
      '<div>' + ic('check', 13) + ' Bisa dipakai tanpa internet setelah dibuka</div>' +
    '</div>' +

    '<div class="gerbang-bayar">' +
      '<div class="hari-sub"><strong>Cara membuka:</strong></div>' +
      '<div class="fokus-item"><span class="fokus-num">1</span>Bayar ' + AKSES.harga + ' lewat QRIS (menu Laporan menampilkan kode QR & nominal tepat).</div>' +
      '<div class="fokus-item"><span class="fokus-num">2</span>Kirim bukti pembayaran beserta kode rujukanmu ke pemilik.</div>' +
      '<div class="fokus-item"><span class="fokus-num">3</span>Kamu menerima kode akses.</div>' +
      '<div class="fokus-item"><span class="fokus-num">4</span>Tempel kode itu di bawah, dan seluruh aplikasi terbuka.</div>' +
    '</div>' +

    '<div class="gerbang-masuk">' +
      '<label for="kodeAksesGerbang">Sudah punya kode akses?</label>' +
      '<input id="kodeAksesGerbang" placeholder="Contoh: SPXXXXXXXXXXXX" autocomplete="off" spellcheck="false">' +
      '<button class="btn btn-primary" onclick="terapkanKodeAkses()">' + ic('hash', 14) + ' Buka aplikasi</button>' +
      '<div id="statusGerbang" class="gerbang-status">' + escapeHtml(pesan) + '</div>' +
    '</div>' +

    '<div class="gerbang-kaki">' +
      '<button class="btn btn-ghost btn-sm" onclick="window.open(\'psikotes/\',\'_blank\')">Lihat penjelasan & harga</button>' +
      '<button class="btn btn-ghost btn-sm" onclick="window.open(\'syarat/\',\'_blank\')">Syarat</button>' +
    '</div>' +
  '</div>';

  return isi;
};

// ---------- gaya ----------
(function () {
  if (document.getElementById('gaya-gerbang')) return;
  var st = document.createElement('style');
  st.id = 'gaya-gerbang';
  st.textContent = [
    '.gerbang-kartu{max-width:620px;margin:6vh auto;background:var(--surface);border:1px solid var(--line2);',
    'border-radius:20px;padding:26px 22px;text-align:center}',
    '.gerbang-ikon{width:60px;height:60px;margin:0 auto 12px;border-radius:50%;display:flex;align-items:center;',
    'justify-content:center;background:rgba(230,197,82,.12);color:var(--gold)}',
    '.gerbang-kartu h2{margin:0 0 10px;font-size:clamp(20px,3.4vw,26px)}',
    '.gerbang-sub{color:var(--muted);font-size:15px;line-height:1.6;margin:0 0 16px}',
    '.gerbang-isi{text-align:left;display:flex;flex-direction:column;gap:8px;margin:0 auto 18px;max-width:440px;',
    'color:var(--text);font-size:14.5px}',
    '.gerbang-isi svg{color:var(--gold);vertical-align:-2px;margin-right:6px}',
    '.gerbang-bayar{text-align:left;max-width:440px;margin:0 auto 18px}',
    '.gerbang-masuk{max-width:440px;margin:0 auto;text-align:left;display:flex;flex-direction:column;gap:8px}',
    '.gerbang-masuk label{font-size:14px;font-weight:600}',
    '.gerbang-masuk input{padding:12px 14px;border-radius:12px;border:1px solid var(--line2);background:var(--bg2);',
    'color:var(--text);font-size:15px;font-family:inherit}',
    '.gerbang-status{min-height:20px;font-size:13.5px;color:var(--gold)}',
    '.gerbang-kaki{margin-top:18px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap}'
  ].join('');
  document.head.appendChild(st);
})();

// ---------- pemasangan: kunci seluruh halaman aplikasi ----------
(function () {
  var lamaRender = window.render;
  if (typeof lamaRender === 'function') {
    window.render = function () {
      if (!punyaAkses()) {
        var m = document.getElementById('main');
        if (m) { m.innerHTML = renderGerbang(); return; }
      }
      return lamaRender.apply(this, arguments);
    };
  }
  var lamaNav = window.navTo;
  if (typeof lamaNav === 'function') {
    window.navTo = function (hal) {
      if (!punyaAkses() && hal !== 'tentang') return;
      return lamaNav.apply(this, arguments);
    };
  }
  var lamaStart = window.startCat;
  if (typeof lamaStart === 'function') {
    window.startCat = function () {
      if (!punyaAkses()) { render(); return; }
      return lamaStart.apply(this, arguments);
    };
  }
})();
