
window.PROFIL = { nama: '', jalur: '', target: '', catatan: '' };
window.bacaProfil = function () {
try {
var p = JSON.parse(localStorage.getItem('tni_profil') || '{}');
PROFIL = { nama: p.nama || '', jalur: p.jalur || '', target: p.target || '', catatan: p.catatan || '' };
} catch (e) {
PROFIL = { nama: '', jalur: '', target: '', catatan: '' };
}
return PROFIL;
};
window.simpanProfil = function (nama, target, catatan) {
var p = bacaProfil();
p.nama = (nama || '').trim().slice(0, 24);
p.target = (target || '').trim();
p.catatan = (catatan || '').trim();
p.jalur = jalurAktif();
try { localStorage.setItem('tni_profil', JSON.stringify(p)); } catch (e) {}
render();
};
window.simpanProfilDariForm = function () {
var n = document.getElementById('pfNama');
var t = document.getElementById('pfTarget');
var c = document.getElementById('pfCatatan');
simpanProfil(n ? n.value : '', t ? t.value : '', c ? c.value : '');
};
window.hapusProfil = function () {
try { localStorage.removeItem('tni_profil'); } catch (e) {}
PROFIL = { nama: '', jalur: '', target: '', catatan: '' };
render();
};
window.sisaHari = function () {
var t = bacaProfil().target;
if (!t) return null;
var kini = new Date(); kini.setHours(0, 0, 0, 0);
var ujian = new Date(t + 'T00:00:00');
if (isNaN(ujian.getTime())) return null;
return Math.round((ujian - kini) / 86400000);
};
window.panelProfil = function () {
bacaProfil();
var jalur = jalurAktif();
var hari = sisaHari();
var isi;
if (!PROFIL.nama) {
isi = '<div class="hari-sub">Isi sebentar supaya aplikasi ini jadi <strong>tempat belajarmu sendiri</strong>: ' +
'namamu, tujuanmu, dan tanggal ujianmu. Tidak perlu akun, dan tidak ada data yang dikirim ke mana pun — ' +
'semua hanya tersimpan di perangkat ini.</div>' +
'<div class="profil-form">' +
'<input class="profil-input" id="pfNama" placeholder="Nama panggilan (mis. Rasyid)" maxlength="24">' +
'<input class="profil-input" id="pfTarget" type="date" aria-label="Tanggal ujian atau seleksi">' +
'<input class="profil-input" id="pfCatatan" placeholder="Fokus utama (mis. TIU & psikotes)" maxlength="60">' +
'<button class="btn btn-primary btn-sm" onclick="simpanProfilDariForm()">' +
ic('check', 14) + ' Simpan profil</button>' +
'</div>';
} else {
var sapa = 'Halo, ' + escapeHtml(PROFIL.nama) + '.';
var pesanHari = '';
if (hari !== null) {
if (hari > 0) pesanHari = '<div class="profil-hitung">' + hari + ' hari lagi menuju ' +
'<strong>' + escapeHtml(PROFIL.target) + '</strong></div>';
else if (hari === 0) pesanHari = '<div class="profil-hitung"><strong>Hari ini jadwalnya.</strong> Tenang, kerjakan seperti latihan biasa.</div>';
else pesanHari = '<div class="profil-hitung">Tanggalnya sudah lewat. Perbarui tanggal untuk musim berikutnya.</div>';
}
isi = '<div class="hari-sub">' + sapa + ' Ini ruang belajarmu sendiri.' +
(PROFIL.catatan ? ' Fokus: <strong>' + escapeHtml(PROFIL.catatan) + '</strong>.' : '') +
(jalur && JALUR[jalur] ? ' Jalur: <strong>' + escapeHtml(JALUR[jalur].nama) + '</strong>.' : '') + '</div>' +
pesanHari +
'<div class="profil-aksi">' +
'<button class="btn btn-secondary btn-sm" onclick="ubahProfil()">' + ic('edit', 14) + ' Ubah profil</button>' +
'<button class="btn btn-ghost btn-sm" onclick="hapusProfil()">Hapus</button>' +
'</div>';
}
return '<div class="card profil">' +
'<div class="hari-head">' + ic('user', 16) + ' <strong>Profil belajar</strong>' +
'<span class="hari-tgl">tanpa akun</span></div>' +
isi +
'</div>';
};
window.ubahProfil = function () {
var p = bacaProfil();
try { localStorage.removeItem('tni_profil'); } catch (e) {}
PROFIL = { nama: '', jalur: p.jalur, target: '', catatan: '' };
render();
};
window.rencanaFokus = function () {
bacaProfil();
var jalur = jalurAktif();
var j = jalur && JALUR[jalur] ? JALUR[jalur] : null;
var hari = sisaHari();
var langkah = [];
if (j) {
langkah.push('Kerjakan simulasi ' + j.sim.judul + ' (' + j.sim.menit + ' menit) untuk mengukur posisi sekarang.');
if (j.modul && j.modul.indexOf('b5') >= 0) langkah.push('Isi tes kepribadian Big Five (4 menit) — ini yang paling sering ditanya di wawancara.');
if (j.modul && j.modul.indexOf('kraepelin') >= 0) langkah.push('Latih Kraepelin/Pauli 2 kolom — kecepatan kerja tidak bisa dipalsukan.');
} else {
langkah.push('Pilih jalur seleksimu dulu di halaman Psikotes, supaya latihannya terarah.');
}
if (hari !== null && hari <= 14 && hari >= 0) {
langkah.push('Kurang dari 2 minggu: utamakan ulangan soal yang pernah salah, jangan menambah materi baru.');
} else {
langkah.push('Ulangi soal yang pernah salah (bank soal salah) — pengulangan berjadwal lebih efektif daripada soal baru.');
}
langkah.push('Kalau ada soal yang terasa keliru atau pembahasannya membingungkan, tekan Laporkan soal — akan diperiksa.');
return '<div class="card"><div class="hari-head">' + ic('target', 16) + ' <strong>Fokus hari ini</strong></div>' +
langkah.map(function (t, i) { return '<div class="fokus-item"><span class="fokus-num">' + (i + 1) + '</span>' + escapeHtml(t) + '</div>'; }).join('') +
'</div>';
};
var _renderSebelumFitur9 = window.render;
window.render = function () {
if (_renderSebelumFitur9) _renderSebelumFitur9.apply(this, arguments);
try { sisipPanel9(); } catch (e) {}
};
function sisipPanel9() {
if (S.page !== 'home') return;
var m = document.getElementById('main');
if (!m) return;
var acuan = m.querySelector('.ajak-umum') || m.querySelector('.grid-3');
if (!acuan) return;
if (!m.querySelector('.profil')) {
var w = document.createElement('div');
w.innerHTML = panelProfil();
acuan.insertAdjacentElement('afterend', w.firstElementChild);
}
if (!m.querySelector('.card .fokus-item')) {
var w2 = document.createElement('div');
w2.innerHTML = rencanaFokus();
var profil = m.querySelector('.profil');
(profil || acuan).insertAdjacentElement('afterend', w2.firstElementChild);
}
}
