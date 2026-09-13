
window.AKSES = window.AKSES || {
aktifGerbang: true,
harga: 'Rp 39.000',
pemilik: ['rasyidahmad180@gmail.com'],
kodePengembang: 'SPDEVPEMILIK018Y4X',
pesanGratis: false
};
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
try { if (localStorage.getItem('tni_akses_pemilik') === '1') return 'pemilik-lokal'; } catch (e) {}
if (punyaAkses()) return 'pembeli';
return 'terkunci';
};
window.pembelianSaya = function () {
try { return JSON.parse(localStorage.getItem('tni_pembelian') || 'null'); } catch (e) { return null; }
};
function rupiahKomersial(n) {
return 'Rp ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
window.terapkanKodeAkses = function () {
var el = document.getElementById('kodeAksesGerbang');
var st = document.getElementById('statusGerbang');
var kode = (el && el.value || '').trim().toUpperCase();
if (!kode) { if (st) st.textContent = 'Masukkan kode aksesmu dulu.'; return; }
if (AKSES.kodePengembang && kode === String(AKSES.kodePengembang).toUpperCase()) {
try { localStorage.setItem('tni_akses_pemilik', '1'); } catch (e) {}
if (st) st.textContent = 'Kode pengembang diterima. Membuka seluruh aplikasi...';
setTimeout(function () { location.reload(); }, 700);
return;
}
var sah = false;
try { sah = (typeof periksaKode === 'function') && periksaKode(kode).sah; } catch (e) { sah = false; }
if (sah) {
var kb = (typeof kodeBayar === 'function') ? kodeBayar() : { rujukan: '', nominal: 0, dasar: 0 };
try {
localStorage.setItem('tni_kode_akses', kode);
localStorage.setItem('tni_akses', 'TERBUKA');
localStorage.setItem('tni_laporan_bayar', JSON.stringify({ kode: kode, tanggal: new Date().toISOString().slice(0, 10) }));
localStorage.setItem('tni_pembelian', JSON.stringify({
kode: kode, rujukan: kb.rujukan, nominal: kb.nominal, dasar: kb.dasar,
tanggal: new Date().toISOString(), produk: 'Akses penuh SiapPsikotes + Laporan Lengkap'
}));
} catch (e) {}
if (st) st.textContent = 'Kode sah. Membuka seluruh aplikasi...';
setTimeout(function () { location.reload(); }, 700);
} else if (st) {
st.textContent = 'Kode tidak dikenali. Periksa penulisannya, atau kirim bukti pembayaran ke pemilik.';
}
};
window.salinRekening = function () {
var teks = (typeof BAYAR !== 'undefined' && BAYAR.rekening) ? BAYAR.rekening : '';
if (!teks) return;
var st = document.getElementById('statusGerbang');
var beres = function () { if (st) st.textContent = 'Tujuan pembayaran disalin: ' + teks; };
try {
if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(teks).then(beres, beres); return; }
} catch (e) {}
beres();
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
window.unduhKuitansi = function () {
var b = pembelianSaya();
if (!b) { alert('Belum ada catatan pembelian di perangkat ini.'); return; }
var akun = bacaAkunGoogle();
var tgl = String(b.tanggal || '').slice(0, 10);
var html = '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8">' +
'<title>Kuitansi ' + b.kode + '</title><style>' +
'body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:40px auto;padding:0 20px;color:#111}' +
'h1{font-size:20px;margin:0 0 4px}.sub{color:#555;font-size:13px;margin:0 0 24px}' +
'table{width:100%;border-collapse:collapse;font-size:14px}td,th{padding:10px;border-bottom:1px solid #e5e5e5;text-align:left}' +
'th{width:42%;color:#555;font-weight:600}total{display:block;margin-top:18px;font-size:18px;font-weight:700}' +
'.cat{margin-top:22px;font-size:12px;color:#666;border-top:1px solid #e5e5e5;padding-top:12px}' +
'</style></head><body>' +
'<h1>Kuitansi pembelian</h1><p class="sub">SiapPsikotes — bukti pembayaran akses penuh</p>' +
'<table>' +
'<tr><th>Produk</th><td>' + b.produk + '</td></tr>' +
'<tr><th>Kode akses</th><td>' + b.kode + '</td></tr>' +
'<tr><th>Kode rujukan</th><td>' + (b.rujukan || '-') + '</td></tr>' +
'<tr><th>Nominal dibayar</th><td>' + rupiahKomersial(b.nominal || b.dasar || 0) + '</td></tr>' +
'<tr><th>Tanggal</th><td>' + tgl + '</td></tr>' +
'<tr><th>Nama akun</th><td>' + (akun && akun.nama ? akun.nama : '-') + '</td></tr>' +
'<tr><th>Surel akun</th><td>' + (akun && akun.email ? akun.email : '-') + '</td></tr>' +
'</table><total>Lunas</total>' +
'<p class="cat">Kuitansi ini dibuat dari catatan di perangkatmu sendiri, bukan dari server kami. ' +
'Simpan sebagai PDF lewat menu cetak peramban. Pembelian sekali bayar tanpa perpanjangan otomatis.</p>' +
'</body></html>';
var w = window.open('', '_blank');
if (!w) { alert('Peramban memblokir jendela baru. Izinkan jendela baru lalu coba lagi.'); return; }
w.document.write(html);
w.document.close();
setTimeout(function () { try { w.print(); } catch (e) {} }, 400);
};
function kepalaGerbang(peran) {
var akun = bacaAkunGoogle();
if (peran === 'terkunci' && akun && akun.email) {
return { judul: 'Akun ini belum punya akses', sub: 'Kamu sudah masuk sebagai <strong>' + escapeHtml(akun.email) +
'</strong>, tetapi akses penuh belum dibeli di akun ini. Satu pembayaran ' + AKSES.harga +
' membuka semuanya dan berlaku untuk akun ini.' };
}
return { judul: 'Seluruh materi terbuka setelah membeli',
sub: 'Sejak sekarang tidak ada lagi akses gratis. Satu pembayaran <strong>' + AKSES.harga +
'</strong> membuka <strong>semua</strong>: 1.225 soal, seluruh modul tes, pembahasan langkah demi langkah, ' +
'dan Laporan Lengkap. Bukan langganan, tanpa perpanjangan otomatis.' };
}
window.renderGerbang = function () {
var peran = peranAkses();
var k = kepalaGerbang(peran);
var akun = bacaAkunGoogle();
var googleSiap = (typeof window.googleSiap === 'function') && window.googleSiap();
var masuk = '<div class="komer-bagian">' +
'<div class="komer-nomor">1</div>' +
'<div class="komer-isi">' +
'<h3>Masuk (opsional)</h3>' +
(googleSiap
? (akun
? '<p class="komer-sub">Tersambung sebagai <strong>' + escapeHtml(akun.nama || akun.email) + '</strong>. ' +
'Bahan belajarmu bisa disalin ke Google Drive milikmu.</p>' +
'<div class="komer-aksi"><button class="btn btn-secondary btn-sm" onclick="keluarGoogle()">Keluar dari Google</button></div>'
: '<p class="komer-sub">Masuk dengan Google supaya bahan belajarmu bisa dibuka dari perangkat lain ' +
'(salinan disimpan di Google Drive milikmu sendiri, bukan di server kami).</p>' +
'<div class="komer-aksi"><button class="btn btn-secondary btn-sm" onclick="masukkanGoogle()">' +
ic('user', 14) + ' Masuk dengan Google</button></div>')
: '<p class="komer-sub">Belum diaktifkan pemilik. Tanpa masuk pun kamu tetap bisa membeli dan memakai ' +
'aplikasi ini di perangkat ini.</p>') +
'</div></div>';
var bayar = '<div class="komer-bagian">' +
'<div class="komer-nomor">2</div>' +
'<div class="komer-isi">' +
'<h3>Bayar ' + AKSES.harga + ' — sekali bayar</h3>' +
(function () {
if (typeof BAYAR === 'undefined' || !BAYAR.aktif) {
return '<p class="komer-sub"><strong>Kanal pembayaran sedang disiapkan.</strong> Harga sudah kami cantumkan ' +
'supaya tidak ada kejutan. Kalau kamu sudah punya kode akses, langsung pakai bagian 3.</p>' +
'<div class="komer-aksi"><button class="btn btn-ghost btn-sm" onclick="catatMinatLaporan()">' +
ic('check', 14) + ' Beri tahu saya saat pembayaran dibuka</button></div>';
}
var kb = kodeBayar();
var cara = '';
if (BAYAR.gambarQris) {
cara += '<div class="qris-bingkai"><img src="' + BAYAR.gambarQris + '?v=' + (window.VERSI_ASET || '') + '" ' +
'alt="Kode QRIS pembayaran SiapPsikotes" width="220" height="220" loading="lazy" decoding="async" ' +
'onerror="this.parentNode.innerHTML=\'<div class=&quot;qris-kosong&quot;>Gambar QRIS belum terpasang.</div>\'"></div>';
}
if (BAYAR.rekening && BAYAR.tampilkanRekening !== false) {
cara += '<div class="komer-sub" style="margin-top:10px">Atau transfer / e-wallet ke:</div>' +
'<div class="qris-nominal"><strong style="font-size:19px">' + escapeHtml(BAYAR.rekening) + '</strong></div>' +
'<div class="komer-aksi"><button class="btn btn-secondary btn-sm" onclick="salinRekening()">' +
ic('copy', 14) + ' Salin tujuan pembayaran</button></div>';
}
if (!cara) cara = '<p class="komer-sub">Kode QRIS sedang disiapkan pemilik. Coba beberapa saat lagi, atau hubungi pemilik bila kamu sudah membayar.</p>';
return cara +
'<div class="qris-nominal" style="margin-top:12px"><span>Bayar tepat sejumlah</span>' +
'<strong>' + rupiahKomersial(kb.nominal) + '</strong>' +
'<span class="komer-sub">Kode rujukanmu: <strong>' + kb.rujukan + '</strong>. Tulis kode ini saat mengirim bukti ' +
'supaya laporanmu cepat dicocokkan.' + ((BAYAR.rekening && BAYAR.tampilkanRekening !== false) ? ' Nominal unik ini yang memudahkan pemilik mencocokkan pembayaranmu.' : '') + '</span></div>' +
(BAYAR.whatsapp || BAYAR.surel
? '<div class="komer-aksi"><button class="btn btn-primary btn-sm" onclick="kirimBuktiBayar()">' +
ic('send', 14) + ' Kirim bukti pembayaran</button></div>'
: '<p class="komer-sub">Kontak pengiriman bukti belum diisi pemilik.</p>');
})() +
'</div></div>';
var buka = '<div class="komer-bagian">' +
'<div class="komer-nomor">3</div>' +
'<div class="komer-isi">' +
'<h3>Buka dengan kode akses</h3>' +
'<p class="komer-sub">Setelah membayar dan mengirim bukti, kamu menerima kode akses. Tempel di sini.</p>' +
'<input id="kodeAksesGerbang" placeholder="Contoh: SPXXXXXXXXXXXX" autocomplete="off" spellcheck="false">' +
'<div class="komer-aksi"><button class="btn btn-primary" onclick="terapkanKodeAkses()">' +
ic('hash', 14) + ' Buka aplikasi</button></div>' +
'<div id="statusGerbang" class="komer-status"></div>' +
'</div></div>';
return '<div class="komer-kartu">' +
'<div class="komer-kepala">' +
'<div class="komer-ikon">' + ic('shield', 26) + '</div>' +
'<h2>' + k.judul + '</h2>' +
'<p class="komer-sub">' + k.sub + '</p>' +
'</div>' +
'<div class="komer-daftar">' +
'<div>' + ic('check', 13) + ' 1.225 soal dalam 9 modul, dengan pembahasan langkah demi langkah</div>' +
'<div>' + ic('check', 13) + ' Tes IQ, kecepatan kerja, kepribadian, tes gambar, latihan wawancara</div>' +
'<div>' + ic('check', 13) + ' Laporan Lengkap: kesiapan, kecocokan kerja, rencana latihan 14 hari</div>' +
'<div>' + ic('check', 13) + ' Bisa dipakai tanpa internet setelah dibuka, tanpa akun</div>' +
'</div>' +
masuk + bayar + buka +
'<div class="komer-kaki">' +
'<button class="btn btn-ghost btn-sm" onclick="window.open(\'psikotes/\',\'_blank\')">Penjelasan & harga</button>' +
'<button class="btn btn-ghost btn-sm" onclick="window.open(\'syarat/\',\'_blank\')">Syarat</button>' +
'<button class="btn btn-ghost btn-sm" onclick="window.open(\'privasi/\',\'_blank\')">Privasi</button>' +
'</div>' +
'</div>';
};
window.kartuPembelian = function () {
var b = pembelianSaya();
var peran = peranAkses();
if (!b && peran === 'terkunci') return '';
var isi = '';
if (b) {
isi = '<div class="hari-sub">Kode: <strong>' + escapeHtml(b.kode) + '</strong> · ' +
rupiahKomersial(b.nominal || b.dasar || 0) + ' · ' + String(b.tanggal || '').slice(0, 10) + '</div>' +
'<div class="aksi-bar" style="margin-top:10px">' +
'<button class="btn btn-secondary btn-sm" onclick="unduhKuitansi()">' + ic('download', 14) + ' Unduh kuitansi</button>' +
'</div>';
} else {
isi = '<div class="hari-sub">Akses dibuka sebagai <strong>' +
(peran === 'pemilik' ? 'akun pemilik' : 'pemilik perangkat (kode pengembang)') +
'</strong> — tanpa catatan pembelian.</div>';
}
return '<div class="card">' +
'<div class="hari-head">' + ic('star', 16) + ' <strong>Pembelian saya</strong>' +
'<span class="hari-tgl">' + (peran === 'pemilik' ? 'pemilik' : 'terbuka') + '</span></div>' + isi +
'<div class="hari-sub" style="margin-top:10px">Satu pembayaran, tanpa perpanjangan otomatis. ' +
'Simpan kode aksesmu: kode itu juga membuka aplikasi di perangkat lain.</div>' +
'<div class="aksi-bar" style="margin-top:10px">' +
'<button class="btn btn-ghost btn-sm" onclick="tutupGerbangUlang()">Kunci aplikasi di perangkat ini</button>' +
'</div></div>';
};
(function () {
if (document.getElementById('gaya-gerbang')) return;
var st = document.createElement('style');
st.id = 'gaya-gerbang';
st.textContent = [
'.komer-kartu{max-width:640px;margin:4vh auto;background:var(--surface);border:1px solid var(--line2);border-radius:20px;padding:24px 20px}',
'.komer-kepala{text-align:center;margin-bottom:18px}',
'.komer-ikon{width:54px;height:54px;margin:0 auto 10px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(230,197,82,.12);color:var(--gold)}',
'.komer-kepala h2{margin:0 0 8px;font-size:clamp(19px,3.2vw,25px)}',
'.komer-sub{color:var(--muted);font-size:14.5px;line-height:1.6;margin:0}',
'.komer-daftar{display:flex;flex-direction:column;gap:7px;margin:0 0 20px;font-size:14.5px}',
'.komer-daftar svg{color:var(--gold);vertical-align:-2px;margin-right:6px}',
'.komer-bagian{display:flex;gap:14px;padding:16px 0;border-top:1px solid var(--line)}',
'.komer-nomor{flex:0 0 30px;height:30px;border-radius:50%;background:rgba(230,197,82,.14);color:var(--gold);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px}',
'.komer-isi{flex:1;min-width:0}',
'.komer-isi h3{margin:4px 0 8px;font-size:16px}',
'.komer-aksi{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap}',
'.komer-isi input{width:100%;margin-top:10px;padding:12px 14px;border-radius:12px;border:1px solid var(--line2);background:var(--bg2);color:var(--text);font-size:15px;font-family:inherit}',
'.komer-status{min-height:18px;margin-top:8px;font-size:13.5px;color:var(--gold)}',
'.komer-kaki{margin-top:18px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap}'
].join('');
document.head.appendChild(st);
})();
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
if (typeof window.renderAkun === 'function') {
var lamaAkun = window.renderAkun;
window.renderAkun = function () {
var html = lamaAkun.apply(this, arguments);
try {
var kartu = kartuPembelian();
var i = html.lastIndexOf('</div>');
if (i >= 0) html = html.slice(0, i) + kartu + html.slice(i);
} catch (e) {}
return html;
};
}
})();
