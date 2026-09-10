// ============================================================
// IQ LAB — UI (static/js/iq.js)
// Halaman latihan IQ berbasis item terstandar internasional:
// - Drill 5 domain (LN/MR/R3D/VR) digenerate data/soal-iq.js
// - Dual N-Back (working memory)
// - Pencatat skor retest (baseline -> target 110) + tautan alat
//   ukur tervalidasi (ICAR, Mensa, BrainHQ, CBS, CogniFit, TIKI)
// ============================================================

var IQS = {
  tab: 'lab',      // 'lab' | 'log'
  nb: null         // state dual n-back
};

// ---- STORAGE ----
function loadIqLog() {
  try { return JSON.parse(localStorage.getItem('tni_iq_log') || '[]'); } catch (e) { return []; }
}
function saveIqLog(a) { localStorage.setItem('tni_iq_log', JSON.stringify(a.slice(-60))); }

function loadIqMeta() {
  try {
    var m = JSON.parse(localStorage.getItem('tni_iq_meta') || '{}');
    if (!m.baseline) m.baseline = (typeof IQ_REF !== 'undefined' ? IQ_REF.baseline : 100);
    if (!m.target) m.target = (typeof IQ_REF !== 'undefined' ? IQ_REF.target : 110);
    return m;
  } catch (e) { return { baseline: 100, target: 110 }; }
}
function saveIqMeta(m) { localStorage.setItem('tni_iq_meta', JSON.stringify(m)); }

function loadIqNb() {
  try { return JSON.parse(localStorage.getItem('tni_iq_nb') || '{}'); } catch (e) { return {}; }
}
function saveIqNb(o) { localStorage.setItem('tni_iq_nb', JSON.stringify(o)); }

function loadIqSesi() {
  try { return JSON.parse(localStorage.getItem('tni_iq_sesi') || '[]'); } catch (e) { return []; }
}
function saveIqSesi(a) { localStorage.setItem('tni_iq_sesi', JSON.stringify(a.slice(-30))); }

// ---- SKOR BERJALAN ----
function iqTerakhir() {
  var log = loadIqLog();
  if (!log.length) return null;
  return log[log.length - 1];
}

// ============================================================
// HALAMAN IQ LAB
// ============================================================
function renderIQ() {
  var meta = loadIqMeta();
  var log = loadIqLog();
  var last = iqTerakhir();
  var nilai = last ? Number(last.skor) : meta.baseline;
  var pct = 0;
  if (meta.target > meta.baseline) {
    pct = Math.max(0, Math.min(100, Math.round(((nilai - meta.baseline) / (meta.target - meta.baseline)) * 100)));
  }
  var nb = loadIqNb();

  var head = '<div style="font-size:24px;font-weight:800;color:var(--white);margin-bottom:4px;letter-spacing:-0.4px">' +
    ic('brain', 20) + ' IQ Lab — Potensi Kognitif <span style="font-size:11px;font-weight:600;color:var(--text3);vertical-align:middle">build v16</span></div>' +
    '<div style="font-size:13px;color:var(--text2);margin-bottom:18px">Item latihan mengikuti format tes terstandar internasional (ICAR / Raven-style): ' +
    'matriks figural, deret angka &amp; huruf, rotasi figural, verbal-aritmetika. Semua digenerate di HP kamu, tanpa akun.</div>';

  // --- tracker target ---
  var tracker = '<div class="iq-tracker">' +
    '<div class="iq-track-head">' +
      '<div><div class="iq-track-label">Skor terakhir</div><div class="iq-track-num">' + nilai + '</div></div>' +
      '<div style="text-align:right"><div class="iq-track-label">Target</div><div class="iq-track-target">' + meta.target + '</div></div>' +
    '</div>' +
    '<div class="prog-track" style="margin:10px 0 6px"><div class="prog-bar" style="width:' + pct + '%"></div></div>' +
    '<div style="font-size:12px;color:var(--text2)">Baseline ' + meta.baseline + ' → sekarang ' + nilai + ' → target ' + meta.target +
      ' · progres ' + pct + '%' + (last ? ' · retest ' + escapeHtml(last.tgl) : ' · belum ada retest tercatat') + '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
      '<button class="btn btn-secondary btn-sm" onclick="iqSetBaseline()">' + ic('target', 15) + ' Set Baseline</button>' +
      '<button class="btn btn-secondary btn-sm" onclick="iqSetTarget()">' + ic('flag', 15) + ' Set Target</button>' +
      '<button class="btn btn-primary btn-sm" onclick="iqTab(\'log\')">' + ic('plus', 15) + ' Catat Hasil Retest</button>' +
    '</div>' +
  '</div>';

  // --- drill domain ---
  var domCards = (typeof IQ_REF !== 'undefined' ? IQ_REF.domain : []).map(function (d) {
    var prog = loadProgress();
    var p = null;
    for (var k in prog) {
      if (k.indexOf('IQ — ' + d.nama) === 0 || k === 'IQ — ' + d.nama) { p = prog[k]; break; }
    }
    var akurasi = (p && p.total) ? Math.round((p.benar / p.total) * 100) + '% akurasi (' + p.benar + '/' + p.total + ')' : 'belum dilatih';
    return '<div class="iq-dom" onclick="startIQDrill(\'' + d.key + '\')">' +
      '<div class="iq-dom-top"><span class="iq-kode">' + d.kode + '</span><span class="iq-dom-nama">' + escapeHtml(d.nama) + '</span></div>' +
      '<div class="iq-dom-desc">' + escapeHtml(d.desc) + '</div>' +
      '<div class="iq-dom-foot">' + ic('chart', 13) + ' ' + akurasi + '</div>' +
    '</div>';
  }).join('');

  var drill = '<div class="section-title">' + ic('brain', 16) + ' Drill 4 Domain (10 soal / set, pembahasan tiap soal)</div>' +
    '<div class="iq-grid">' + domCards + '</div>' +
    '<div style="display:flex;gap:10px;margin:14px 0 22px;flex-wrap:wrap">' +
      '<button class="btn btn-danger btn-lg" style="flex:1;min-width:220px" onclick="startIQSimulasi()">' + ic('target', 17) + ' Simulasi IQ — 25 Soal · 20 Menit</button>' +
      '<button class="btn btn-secondary btn-lg" style="flex:1;min-width:200px" onclick="startIQDrill(\'campuran\')">' + ic('layers', 17) + ' Drill Campuran 10 Soal</button>' +
    '</div>';

  // --- dual n-back ---
  var n = nb.n || 2;
  var nback = '<div class="section-title">' + ic('zap', 16) + ' Dual N-Back — Working Memory</div>' +
    '<div class="iq-nb-box">' +
      '<div style="font-size:12px;color:var(--text2);margin-bottom:10px">Posisi kotak menyala berurutan. Tekan <strong>COCOK</strong> hanya bila posisi sekarang sama dengan ' +
        '<strong>N langkah sebelumnya</strong>. Target: akurasi ≥ 80% pada N=3.</div>' +
      '<div class="iq-nb-top">' +
        '<span style="font-size:12px;color:var(--text2)">Level N:</span>' +
        [2, 3, 4].map(function (v) {
          return '<button class="btn ' + (v === n ? 'btn-primary' : 'btn-secondary') + ' btn-sm" onclick="iqNbSetN(' + v + ')">N=' + v + '</button>';
        }).join('') +
        '<span style="font-size:12px;color:var(--text2);margin-left:auto">Rekor akurasi: ' +
          (nb.best ? nb.best + '% (N=' + (nb.bestN || '-') + ')' : '-') + '</span>' +
      '</div>' +
      '<div id="nbArea" class="iq-nb-area">' + iqNbIdleHtml() + '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' +
        '<button class="btn btn-primary" id="nbMatchBtn" onclick="iqNbMatch()" disabled style="flex:2">' + ic('check', 16) + ' COCOK</button>' +
        '<button class="btn btn-secondary" id="nbStartBtn" onclick="iqNbToggle()" style="flex:1">' + ic('zap', 16) + ' Mulai</button>' +
      '</div>' +
    '</div>';

  // --- alat ukur tervalidasi ---
  var links = (typeof IQ_REF !== 'undefined' ? IQ_REF.links : []).map(function (l) {
    return '<a class="iq-link" href="' + l.url + '" target="_blank" rel="noopener noreferrer">' +
      '<div class="iq-link-nama">' + escapeHtml(l.nama) + '</div>' +
      '<div class="iq-link-ukur">' + escapeHtml(l.ukur) + '</div>' +
      '<div class="iq-link-dasar">' + ic('check-circle', 12) + ' ' + escapeHtml(l.dasar) + '</div>' +
      '<div class="iq-link-url">' + escapeHtml(l.url) + '</div>' +
    '</a>';
  }).join('');

  var refs = '<div class="section-title">' + ic('globe', 16) + ' Ambil Skor di Alat Ukur Tervalidasi (untuk retest)</div>' +
    '<div style="font-size:12px;color:var(--text2);margin-bottom:12px">Drill di bawah ini untuk latihan. Untuk mengukur angka IQ, pakai alat berikut — semuanya punya norma &amp; dasar ilmiah, bukan kuis asal.</div>' +
    '<div class="iq-links">' + links + '</div>';

  // --- log retest ---
  var logHtml = iqRenderLog(log, meta);

  return head + tracker + (IQS.tab === 'log' ? logHtml : (drill + nback + refs + iqTipsBox()));
}
window.renderIQ = renderIQ;

function iqTipsBox() {
  return '<div class="tips-box" style="margin-top:6px">' +
    '<div class="tips-title">' + ic('bulb', 16) + ' Aturan Pengerjaan yang Paling Menaikkan Skor</div>' +
    '<ul>' +
      '<li><strong>Jawab semua soal.</strong> Tes seleksi umumnya tanpa penalti salah — kosong = kehilangan poin pasti.</li>' +
      '<li><strong>Time-boxing:</strong> soal &gt; 90 detik dilewati, kembali di akhir. Kecepatan (speed of processing) adalah komponen yang paling bisa dilatih.</li>' +
      '<li><strong>Matriks figural:</strong> cek aturan dari dua arah (baris DAN kolom): jumlah elemen, rotasi, isi bentuk.</li>' +
      '<li><strong>Rotasi vs cermin:</strong> hitung arah putaran sirip, jangan hanya menilai kemiripan bentuk.</li>' +
      '<li><strong>Deret:</strong> hitung selisih antar suku dulu; kalau selisihnya naik, itu pola beda-naik.</li>' +
      '<li><strong>Lever non-latihan:</strong> tidur 7-8 jam, aerobik 30 menit 3-5x/minggu, creatine 5 g/hari (ada bukti RCT untuk performa kognitif saat lelah).</li>' +
      '<li><strong>Latihan bertimer</strong> minimal 2x seminggu supaya stamina tes ikut terlatih.</li>' +
    '</ul>' +
  '</div>';
}

// ============================================================
// LOG & RETEST
// ============================================================
function iqRenderLog(log, meta) {
  var rows = log.slice().reverse().map(function (e, i) {
    return '<div class="iq-log-row">' +
      '<div class="iq-log-skor">' + Number(e.skor) + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:13px;color:var(--white);font-weight:600">' + escapeHtml(e.tes) + '</div>' +
        '<div style="font-size:11px;color:var(--text3)">' + escapeHtml(e.tgl) + (e.catatan ? ' · ' + escapeHtml(e.catatan) : '') + '</div>' +
      '</div>' +
      '<button class="btn btn-ghost btn-sm" onclick="iqDelLog(' + (log.length - 1 - i) + ')">' + ic('trash', 14) + '</button>' +
    '</div>';
  }).join('');

  var max = 1;
  log.forEach(function (e) { max = Math.max(max, Number(e.skor) || 0); });
  var chart = log.length < 2 ? '' :
    '<div class="iq-chart">' + log.slice(-12).map(function (e) {
      var h = Math.max(6, Math.round((Number(e.skor) / (max || 1)) * 90));
      return '<div class="iq-bar-wrap" title="' + escapeHtml(e.tgl) + ' — ' + Number(e.skor) + '">' +
        '<div class="iq-bar" style="height:' + h + 'px"></div>' +
        '<div class="iq-bar-lbl">' + Number(e.skor) + '</div></div>';
    }).join('') + '</div>';

  var opsi = (typeof IQ_REF !== 'undefined' ? IQ_REF.links : []).map(function (l) {
    return '<option value="' + escapeHtml(l.nama) + '">' + escapeHtml(l.nama) + '</option>';
  }).join('') + '<option value="Lainnya">Lainnya</option>';

  return '<div style="font-size:20px;font-weight:800;color:var(--white);margin-bottom:6px">' + ic('trend', 18) + ' Log Skor &amp; Retest</div>' +
    '<div style="font-size:12px;color:var(--text2);margin-bottom:14px">Catat hasil tiap retest. Yang diukur hanya alat tervalidasi: ICAR (16 item), Mensa Norway, CogniFit, TIKI, atau tes resmi dari lembaga psikologi.</div>' +
    '<div class="iq-form">' +
      '<div class="iq-form-row">' +
        '<input type="date" id="iqTgl" class="iq-input" value="' + new Date().toISOString().slice(0, 10) + '">' +
        '<input type="number" id="iqSkor" class="iq-input" placeholder="Skor IQ" min="40" max="160">' +
      '</div>' +
      '<div class="iq-form-row">' +
        '<select id="iqTes" class="iq-input">' + opsi + '</select>' +
        '<input type="text" id="iqCatatan" class="iq-input" placeholder="Catatan (opsional)" maxlength="60">' +
      '</div>' +
      '<button class="btn btn-primary btn-lg" style="width:100%" onclick="iqAddLog()">' + ic('plus', 16) + ' Simpan Hasil</button>' +
    '</div>' +
    chart +
    (rows ? '<div style="margin-top:14px">' + rows + '</div>' : '<div class="empty"><div class="empty-icon">' + icon('list', 40) + '</div><p>Belum ada hasil tercatat.</p></div>') +
    '<div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap">' +
      '<button class="btn btn-secondary btn-sm" onclick="iqTab(\'lab\')">' + ic('arrow-left', 15) + ' Kembali ke Latihan</button>' +
      '<button class="btn btn-danger btn-sm" onclick="iqClearLog()">' + ic('trash', 15) + ' Hapus Semua Log</button>' +
    '</div>';
}

window.iqTab = function (t) { IQS.tab = t; S.page = 'iq'; S.mode = null; render(); };

window.iqSetBaseline = function () {
  var v = prompt('Skor baseline kamu (hasil tes tervalidasi, mis. 100):', loadIqMeta().baseline);
  if (v === null) return;
  var n = parseInt(v, 10);
  if (isNaN(n) || n < 40 || n > 160) { alert('Masukkan angka 40-160.'); return; }
  var m = loadIqMeta(); m.baseline = n; saveIqMeta(m); render();
};

window.iqSetTarget = function () {
  var v = prompt('Target skor IQ:', loadIqMeta().target);
  if (v === null) return;
  var n = parseInt(v, 10);
  if (isNaN(n) || n < 40 || n > 160) { alert('Masukkan angka 40-160.'); return; }
  var m = loadIqMeta(); m.target = n; saveIqMeta(m); render();
};

window.iqAddLog = function () {
  var tgl = (document.getElementById('iqTgl') || {}).value || '';
  var tes = (document.getElementById('iqTes') || {}).value || 'Lainnya';
  var cat = (document.getElementById('iqCatatan') || {}).value || '';
  var skor = parseInt((document.getElementById('iqSkor') || {}).value, 10);
  if (isNaN(skor) || skor < 40 || skor > 160) { alert('Skor harus angka 40-160.'); return; }
  var log = loadIqLog();
  log.push({ tgl: tgl, tes: tes, skor: skor, catatan: cat.slice(0, 60) });
  saveIqLog(log);
  if (skor > loadIqMeta().target - 1) { /* capaian target tetap dicatat di progres */ }
  render();
};

window.iqDelLog = function (i) {
  var log = loadIqLog();
  if (i < 0 || i >= log.length) return;
  log.splice(i, 1);
  saveIqLog(log);
  render();
};

window.iqClearLog = function () {
  if (!confirm('Hapus semua catatan skor retest?')) return;
  localStorage.removeItem('tni_iq_log');
  render();
};

// ============================================================
// DRILL — memakai mesin soal app.js (S.questions + S.page='soal')
// ============================================================
function iqMulai(items, timerDetik) {
  S.cat = 'iq';
  S.mode = 'iq';
  S.isSimulasi = false;
  S.questions = items;
  S.idx = 0;
  S.answers = {};
  S.flagged = {};
  S.totalTime = timerDetik;
  S.timeLeft = timerDetik;
  if (S.timer) { clearInterval(S.timer); S.timer = null; }
  S.page = 'soal';
  render();
}

window.startIQDrill = function (domain) {
  var items = IQ_GEN.buat(domain, 10);
  if (!items.length) { alert('Gagal membuat soal, coba lagi.'); return; }
  iqMulai(items, 0);
};

window.startIQSimulasi = function () {
  var items = IQ_GEN.buat('campuran', 25);
  if (!items.length) { alert('Gagal membuat soal, coba lagi.'); return; }
  iqMulai(items, 1200); // 20 menit
};

// ============================================================
// DUAL N-BACK
// ============================================================
function iqNbIdleHtml() {
  var cells = '';
  for (var i = 0; i < 9; i++) cells += '<div class="nb-cell" id="nbC' + i + '"></div>';
  return '<div class="nb-grid">' + cells + '</div>' +
    '<div class="nb-status" id="nbStatus">Siap. Pilih level N lalu tekan Mulai.</div>';
}

window.iqNbSetN = function (v) {
  if (IQS.nb && IQS.nb.running) return;
  IQS.nb = { n: v, running: false };
  render();
};

window.iqNbToggle = function () {
  if (IQS.nb && IQS.nb.running) { iqNbStop('Dihentikan.'); return; }
  iqNbStart();
};

function iqNbStart() {
  var st = IQS.nb || {};
  var n = st.n || 2;
  var st2 = {
    n: n, running: true, trial: 0, seq: [], hits: 0, miss: 0, fa: 0, cr: 0,
    awaiting: false, token: (st.token || 0) + 1, maxTrial: 30
  };
  IQS.nb = st2;
  var btn = document.getElementById('nbStartBtn');
  if (btn) btn.innerHTML = ic('x', 16) + ' Stop';
  var mb = document.getElementById('nbMatchBtn');
  if (mb) mb.disabled = false;
  iqNbTrial();
}
window.iqNbStart = iqNbStart;

function iqNbTrial() {
  var st = IQS.nb;
  if (!st || !st.running) return;
  var tok = st.token;
  if (st.trial >= st.maxTrial) { iqNbStop('Selesai.'); return; }

  var pos = Math.floor(Math.random() * 9);
  st.seq.push(pos);
  st.trial++;
  st.awaiting = true;
  st.answered = false;

  for (var i = 0; i < 9; i++) {
    var c = document.getElementById('nbC' + i);
    if (c) c.className = 'nb-cell' + (i === pos ? ' on' : '');
  }
  var isMatch = st.trial > st.n && st.seq[st.trial - 1 - st.n] === pos;

  setTimeout(function () {
    if (!IQS.nb || IQS.nb.token !== tok || !IQS.nb.running) return;
    for (var j = 0; j < 9; j++) {
      var cc = document.getElementById('nbC' + j);
      if (cc) cc.className = 'nb-cell';
    }
    // evaluasi jawaban trial ini
    if (isMatch && !st.answered) st.miss++;
    if (!isMatch && st.answered) st.fa++;
    if (isMatch && st.answered) st.hits++;
    if (!isMatch && !st.answered) st.cr++;
    st.awaiting = false;
    iqNbStatus();
    setTimeout(function () {
      if (!IQS.nb || IQS.nb.token !== tok || !IQS.nb.running) return;
      iqNbTrial();
    }, 900);
  }, 1500);
}

function iqNbStatus() {
  var st = IQS.nb;
  if (!st) return;
  var el = document.getElementById('nbStatus');
  if (!el) return;
  var resp = st.hits + st.fa;
  var benar = st.hits + st.cr;
  var total = st.hits + st.miss + st.fa + st.cr;
  var acc = total ? Math.round((benar / total) * 100) : 100;
  el.innerHTML = 'Trial ' + st.trial + '/' + st.maxTrial + ' · jawaban benar ' + benar + '/' + total +
    ' · akurasi <strong>' + acc + '%</strong> · salah-tekan ' + st.fa + ' · kelewatan ' + st.miss;
}

window.iqNbMatch = function () {
  var st = IQS.nb;
  if (!st || !st.running || !st.awaiting || st.answered) return;
  st.answered = true;
  var mb = document.getElementById('nbMatchBtn');
  if (mb) { mb.classList.add('flash'); setTimeout(function () { mb.classList.remove('flash'); }, 200); }
};

function iqNbStop(msg) {
  var st = IQS.nb || {};
  st.running = false;
  st.token = (st.token || 0) + 1;
  for (var i = 0; i < 9; i++) {
    var c = document.getElementById('nbC' + i);
    if (c) c.className = 'nb-cell';
  }
  var total = st.hits + st.miss + st.fa + st.cr;
  var acc = total ? Math.round(((st.hits + st.cr) / total) * 100) : 0;
  var nb = loadIqNb();
  if (total >= 5 && acc > (nb.best || 0)) { nb.best = acc; nb.bestN = st.n; saveIqNb(nb); }
  var el = document.getElementById('nbStatus');
  if (el) el.innerHTML = escapeHtml(msg) + ' Trial ' + (st.trial || 0) + ' · akurasi sesi ini <strong>' + acc + '%</strong>' +
    (total ? ' (benar ' + (st.hits + st.cr) + '/' + total + ')' : '') + '. Rekor: ' + ((loadIqNb().best) || '-') + '%';
  var btn = document.getElementById('nbStartBtn');
  if (btn) btn.innerHTML = ic('zap', 16) + ' Mulai';
  var mb = document.getElementById('nbMatchBtn');
  if (mb) mb.disabled = true;
  IQS.nb = { n: st.n || 2, running: false, token: st.token };
}
window.iqNbStop = iqNbStop;
