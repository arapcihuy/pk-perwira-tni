
window.WAWANCARA_SOAL = [
{ k: 'Perkenalkan diri Anda dalam dua menit.',
nilai: 'Kejelasan urutan: identitas, pendidikan, pengalaman yang paling relevan, alasan melamar, dan penutup singkat. Jangan menceritakan riwayat hidup dari kecil.',
salah: 'Bercerita terlalu panjang, mengulang isi berkas, atau hanya menyebut nama dan sekolah tanpa alasan melamar.' },
{ k: 'Mengapa Anda memilih instansi/posisi ini?',
nilai: 'Ada alasan spesifik yang menunjukkan Anda sudah mencari tahu (tugas, wilayah kerja, atau nilai instansi), dihubungkan dengan kesiapan Anda.',
salah: 'Jawaban umum seperti "ingin mengabdi" atau "cari pengalaman" tanpa alasan konkret.' },
{ k: 'Apa kelebihan Anda yang paling berguna untuk pekerjaan ini?',
nilai: 'Satu kelebihan, disertai bukti kejadian nyata (kapan, apa yang Anda kerjakan, hasilnya).',
salah: 'Menyebut banyak kelebihan tanpa bukti, atau hanya kata sifat seperti "pekerja keras".' },
{ k: 'Apa kekurangan Anda dan bagaimana Anda mengatasinya?',
nilai: 'Satu kekurangan nyata yang tidak bertentangan dengan inti pekerjaan, disertai langkah perbaikan yang sedang berjalan.',
salah: 'Menjawab "tidak ada kekurangan", atau memakai kekurangan yang sebenarnya pujian ("saya terlalu perfeksionis").' },
{ k: 'Ceritakan saat Anda bekerja sama dalam tim dan terjadi perbedaan pendapat.',
nilai: 'Pola situasi - tugas - tindakan - hasil. Tunjukkan Anda mendengarkan lebih dulu, lalu menyimpulkan bersama.',
salah: 'Cerita yang menempatkan diri selalu benar, atau menyalahkan rekan.' },
{ k: 'Bagaimana Anda menghadapi tenggat yang sangat ketat?',
nilai: 'Cara menyusun prioritas, komunikasi risiko ke atasan, dan hasil yang tetap terjaga.',
salah: 'Mengaku sanggup segalanya tanpa cara jelas.' },
{ k: 'Apa yang Anda lakukan jika atasan meminta hal yang bertentangan dengan prosedur?',
nilai: 'Menjelaskan aturan dengan sopan, tidak menuruti permintaan yang melanggar, dan menawarkan alternatif yang tetap sesuai prosedur.',
salah: 'Menuruti saja, atau menolak tanpa penjelasan.' },
{ k: 'Anda tahu rekan menerima imbalan untuk mempermudah urusan. Apa tindakan Anda?',
nilai: 'Menolak ikut, mengingatkan dengan sopan, dan melaporkan lewat jalur resmi.',
salah: 'Diam saja, atau justru meminta bagian.' },
{ k: 'Mengapa kami harus memilih Anda dibanding peserta lain?',
nilai: 'Kesiapan yang bisa dibuktikan: latihan yang sudah dilakukan, kemampuan yang cocok, dan alasan yang jujur.',
salah: 'Menyebut diri paling baik tanpa bukti, atau merendahkan peserta lain.' },
{ k: 'Apa rencana Anda lima tahun ke depan?',
nilai: 'Rencana yang sejalan dengan jalur karier instansi/posisi, bukan rencana yang menunjukkan Anda akan cepat keluar.',
salah: 'Menjawab ingin membuka usaha sendiri atau pindah ke tempat lain.' },
{ k: 'Kalau Anda tidak lulus seleksi ini, apa yang akan Anda lakukan?',
nilai: 'Sikap pantang menyerah yang realistis: memperbaiki kelemahan, mencoba jalur lain, tetap menjaga sikap baik.',
salah: 'Menjawab akan berhenti berusaha, atau menyalahkan sistem.' },
{ k: 'Apakah Anda bersedia ditempatkan di wilayah mana pun?',
nilai: 'Kesiapan yang jujur beserta alasan, dan cara Anda akan menyiapkan diri.',
salah: 'Menjawab "bersedia" tetapi bahasa tubuh dan penjelasan menunjukkan sebaliknya.' }
];
window.WAWANCARA_KRITERIA = [
'Menjawab langsung ke pertanyaannya (tidak berputar-putar).',
'Ada satu contoh nyata yang bisa diceritakan dengan urut.',
'Panjangnya wajar (sekitar 1-2 menit, tidak bertele-tele).',
'Menunjukkan sikap sesuai aturan: jujur, sopan, mengikuti prosedur.',
'Menutup dengan kesimpulan atau sikap yang jelas.'
];
window.WAWANCARA_CHECKLIST = [
'Berkas lengkap dan sesuai urutan yang diminta panitia.',
'Hafal urutan langkah seleksi dan jadwal tiap tahap.',
'Latihan jasmani rutin bila tahap kesamaptaan ada (lari, push up, sit up) — sesuaikan kemampuan, jangan memaksakan diri.',
'Tidur cukup dua malam sebelum hari seleksi; datang lebih awal.',
'Pakaian sopan dan rapi sesuai ketentuan yang diminta.',
'Siapkan air minum dan berkas cadangan (fotokopi) untuk berjaga-jaga.'
];
window.WAW = { soal: null, sisa: 0, timer: null, catatan: '' };
window.bukaWawancara = function () { navTo('wawancara'); };
window.pilihSoalKhusus = function (n) {
WAW.soal = n;
WAW.catatan = '';
if (WAW.timer) { clearInterval(WAW.timer); WAW.timer = null; }
render();
};
window.pilihSoalWawancara = function (acak) {
var i = acak ? Math.floor(Math.random() * WAWANCARA_SOAL.length) : 0;
WAW.soal = i;
WAW.sisa = 120;                     // 2 menit untuk menyusun jawaban
WAW.catatan = '';
if (WAW.timer) { clearInterval(WAW.timer); WAW.timer = null; }
render();
};
window.mulaiLatihanWawancara = function () {
var i = (WAW.soal === null) ? 0 : WAW.soal;
if (WAW.timer) clearInterval(WAW.timer);
WAW.sisa = 120;
WAW.timer = setInterval(function () {
WAW.sisa--;
var el = document.getElementById('wawTimer');
if (!el) { clearInterval(WAW.timer); WAW.timer = null; return; }
el.textContent = 'sisa waktu menyusun: ' + Math.floor(WAW.sisa / 60) + ':' + (WAW.sisa % 60 < 10 ? '0' : '') + (WAW.sisa % 60);
if (WAW.sisa <= 0) { clearInterval(WAW.timer); WAW.timer = null; el.textContent = 'waktu habis — sekarang jawab dengan suara sendiri.'; }
}, 1000);
};
window.simpanCatatanWawancara = function () {
var el = document.getElementById('wawCatatan');
WAW.catatan = el ? el.value : '';
try {
var semua = JSON.parse(localStorage.getItem('tni_wawancara') || '{}');
semua['soal' + WAW.soal] = { catatan: WAW.catatan, tanggal: new Date().toISOString().slice(0, 10) };
localStorage.setItem('tni_wawancara', JSON.stringify(semua));
} catch (e) {}
render();
};
window.catatanWawancara = function (i) {
try {
var semua = JSON.parse(localStorage.getItem('tni_wawancara') || '{}');
return semua['soal' + i] || null;
} catch (e) { return null; }
};
window.renderWawancara = function () {
var i = (WAW.soal === null) ? 0 : WAW.soal;
var s = WAWANCARA_SOAL[i];
var cacat = catatanWawancara(i);
var daftarSoal = WAWANCARA_SOAL.map(function (x, n) {
var sudah = catatanWawancara(n);
return '<div class="ulang-row"><div class="ulang-teks"><strong>' + (n + 1) + '.</strong> ' + escapeHtml(x.k) + '</div>' +
'<div class="ulang-aksi"><button class="btn btn-ghost btn-sm" onclick="pilihSoalKhusus(' + n + ')">' +
(sudah ? 'lihat' : 'latih') + '</button></div></div>';
}).join('');
return '<div class="card">' +
'<div class="hari-head">' + ic('user', 16) + ' <strong>Persiapan wawancara</strong>' +
'<span class="hari-tgl">' + WAWANCARA_SOAL.length + ' pertanyaan</span></div>' +
'<div class="hari-sub">Wawancara bukan ujian hafalan. Yang dinilai: apakah jawabanmu jelas, punya contoh nyata, ' +
'dan menunjukkan sikap yang sesuai aturan. Latihan di bawah ini melatih tiga hal itu.</div>' +
'<button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="pilihSoalWawancara(true)">' +
ic('refresh', 14) + ' Ambil pertanyaan acak</button>' +
'</div>' +
'<div class="card">' +
'<div class="hari-head">' + ic('list', 16) + ' <strong>Pertanyaan ' + (i + 1) + ' dari ' + WAWANCARA_SOAL.length + '</strong></div>' +
'<div class="b5-tanya">' + escapeHtml(s.k) + '</div>' +
'<div class="tutor-blok"><div class="tutor-judul">Yang dinilai penguji</div>' +
'<div class="tutor-isi">' + escapeHtml(s.nilai) + '</div></div>' +
'<div class="tutor-blok"><div class="tutor-judul">Jawaban yang lemah</div>' +
'<div class="tutor-isi">' + escapeHtml(s.salah) + '</div></div>' +
'<div class="hari-sub" id="wawTimer">sisa waktu menyusun: 2:00</div>' +
'<button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="mulaiLatihanWawancara()">' +
ic('clock', 14) + ' Mulai hitung waktu (2 menit)</button>' +
'<div class="hari-sub" style="margin-top:12px">Tulis kerangka jawabanmu di sini, lalu ucapkan dengan suara sendiri ' +
'sambil melihat kerangkanya. Catatan ini hanya tersimpan di perangkatmu.</div>' +
'<textarea class="profil-input" id="wawCatatan" rows="5" style="width:100%;margin-top:6px" ' +
'placeholder="Contoh: 1) situasi singkat  2) tugas saya  3) tiga langkah yang saya lakukan  4) hasilnya">' +
escapeHtml(cacat ? cacat.catatan : WAW.catatan) + '</textarea>' +
'<button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="simpanCatatanWawancara()">' +
ic('check', 14) + ' Simpan kerangka jawaban</button>' +
(cacat ? '<div class="hari-sub" style="margin-top:8px">Terakhir disimpan: ' + cacat.tanggal + '</div>' : '') +
'</div>' +
'<div class="card">' +
'<div class="hari-head">' + ic('check', 16) + ' <strong>Periksa jawabanmu sendiri</strong></div>' +
'<div class="hari-sub">Setelah kamu menjawab dengan suara, tandai yang benar-benar kamu lakukan. ' +
'Ini penilaian diri, bukan penilaian otomatis.</div>' +
WAWANCARA_KRITERIA.map(function (t, n) {
return '<div class="fokus-item"><span class="fokus-num">' + (n + 1) + '</span>' + escapeHtml(t) + '</div>';
}).join('') +
'<div class="hari-sub" style="margin-top:8px">Kalau dua butir atau lebih belum terpenuhi, ulangi pertanyaan ini ' +
'setelah menyusun ulang kerangkanya.</div>' +
'</div>' +
'<div class="card">' +
'<div class="hari-head">' + ic('clipboard', 16) + ' <strong>Daftar periksa sebelum hari seleksi</strong></div>' +
WAWANCARA_CHECKLIST.map(function (t) {
return '<div class="fokus-item"><span class="fokus-num">' + ic('check', 11) + '</span>' + escapeHtml(t) + '</div>';
}).join('') +
'<div class="hari-sub" style="margin-top:10px">Catatan: aplikasi ini tidak memberi nasihat kesehatan. ' +
'Untuk tahap jasmani dan kesehatan, ikuti ketentuan resmi panitia dan kondisi tubuhmu sendiri.</div>' +
'</div>' +
'<div class="card">' +
'<div class="hari-head">' + ic('list', 16) + ' <strong>Latih pertanyaan lain</strong></div>' +
daftarSoal +
'</div>' +
'<div class="card">' +
'<div class="hari-head">' + ic('shield', 16) + ' <strong>Batas jujur</strong></div>' +
'<div class="hari-sub">Tidak ada janji kelulusan. Kerangka jawaban di sini adalah alat latihan; ' +
'yang paling menentukan tetap kejujuran jawabanmu dan kesesuaian dengan ketentuan panitia. ' +
'Semua catatanmu tersimpan di perangkat dan tidak dikirim ke mana pun.</div>' +
'</div>';
};
var _renderSebelumFitur12 = window.render;
window.render = function () {
if (_renderSebelumFitur12) _renderSebelumFitur12.apply(this, arguments);
try { sisipPanel12(); } catch (e) {}
};
function sisipPanel12() {
var m = document.getElementById('main');
if (!m) return;
if (S.page === 'wawancara') { m.innerHTML = renderWawancara(); return; }
if (S.page === 'baterai' && !m.querySelector('.modul-wawancara')) {
var kotak = m.querySelector('.card');
if (kotak) {
var w = document.createElement('div');
w.className = 'modul-wawancara';
w.innerHTML = '<div class="card"><div class="hari-head">' + ic('user', 16) +
' <strong>Persiapan wawancara</strong><span class="hari-tgl">12 pertanyaan</span></div>' +
'<div class="hari-sub">Kerangka jawaban, yang dinilai penguji, jawaban yang lemah, dan daftar periksa ' +
'sebelum hari seleksi. Tidak ada janji kelulusan — yang dilatih cara menyusun jawaban.</div>' +
'<button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="bukaWawancara()">' +
ic('arrow-right', 14) + ' Buka latihan wawancara</button></div>';
kotak.insertAdjacentElement('afterend', w);
}
}
}
