// ============================================================
// TES PSIKOLOGI TNI AU - Native-like PWA
// Aplikasi lengkap dengan Kraepelin, Memory Span, Digit Span,
// Aritmatika Lisan, dan Deret Angka
// ============================================================

// State management untuk tes psikologi
var PSI = {
  page: 'psi-home',
  testType: null,
  currentTest: null,
  testList: [],      // daftar soal sesi berurutan (digit span / aritmatika / deret)
  testIdx: 0,
  testData: null,
  startTime: 0,
  answers: [],       // jawaban user per soal sesi (null = belum dijawab)
  sessionId: 0,      // token untuk guard async closure (play kata/angka)
  timerInterval: null,

  // Kraepelin specific
  kraepelinData: null,
  kraepelinCol: 0,
  kraepelinRow: 0,
  kraepelinAnswers: [],

  // Memory Span specific
  memoryCatIdx: 0,
  memoryPhase: 'pick', // 'pick' | 'listen' | 'remember' | 'write'

  // Digit Span specific
  digitPhase: 'listen',

  // Progress tracking
  scores: {},
  history: []
};

// Load progress dari localStorage
function loadPsiProgress() {
  try {
    var stored = localStorage.getItem('tni_psi_progress');
    if (stored) {
      PSI.history = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load PSI progress:', e);
  }
}

function savePsiProgress() {
  try {
    localStorage.setItem('tni_psi_progress', JSON.stringify(PSI.history));
  } catch (e) {
    console.error('Failed to save PSI progress:', e);
  }
}

function psiTimerStop() {
  if (PSI.timerInterval) {
    clearInterval(PSI.timerInterval);
    PSI.timerInterval = null;
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeAnswer(str) {
  if (str === null || str === undefined) return '';
  var s = String(str).trim().toLowerCase();
  // Hapus prefix "Rp" atau "Rp."
  s = s.replace(/^rp\.?\s*/i, '');
  // Ganti pemisah waktu jika ada format jam (15.15 -> 15:15)
  if (/^\d{1,2}\.\d{2}$/.test(s)) s = s.replace('.', ':');
  // Hapus titik ribuan (misal: 2.500 -> 2500, 40.000 -> 40000, 450.000 -> 450000)
  s = s.replace(/(\d+)\.(\d{3})\b/g, '$1$2');
  // Normalisasi koma desimal ke titik (misal: 3,5 -> 3.5)
  s = s.replace(',', '.');
  // Hapus satuan di akhir (misal: jam, menit, km, dtk, buah)
  s = s.replace(/\s*(jam|menit|mnt|dtk|detik|km|cm|m|orang|hari|buah|pensil|apel)$/i, '');
  return s.trim();
}

function isAnswerMatch(userAns, correctAns) {
  if (userAns === null || userAns === undefined) return false;
  var u = normalizeAnswer(userAns);
  var c = normalizeAnswer(correctAns);
  if (u === c) return true;
  // Khusus durasi jam/menit (3.5 jam vs 3 jam 30 menit vs 210)
  if ((c === '3.5' || c === '3 jam 30 menit') && (u === '3.5' || u === '3 jam 30 menit' || u === '210' || u === '3:30')) return true;
  return false;
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================

function renderPsiHome() {
  if (typeof SOAL_PSIKOLOGI === 'undefined') {
    return '<div class="empty"><div class="empty-icon">' + icon('alert', 44) + '</div>' +
      '<p>Database soal psikologi belum dimuat.</p>' +
      '<button class="btn btn-primary" onclick="location.reload()">Muat Ulang</button></div>';
  }

  var tests = [
    { key: 'memory_span', icon: 'brain', nama: 'Tes Daya Ingat', desc: '16 kategori, 30 detik per kategori' },
    { key: 'digit_span', icon: 'hash', nama: 'Digit Span', desc: '18 soal, angka maju-mundur' },
    { key: 'aritmatika', icon: 'calculator', nama: 'Aritmatika Lisan', desc: '12 soal cerita' },
    { key: 'deret_angka', icon: 'chart', nama: 'Deret Angka', desc: '12 pola deret' },
    { key: 'kraepelin', icon: 'zap', nama: 'Tes Kraepelin', desc: '3 menit, penjumlahan cepat' },
    { key: 'epps', icon: 'user', nama: 'Tes Kepribadian (EPPS)', desc: '30 pasang pernyataan karakter perwira' }
  ];

  var html = '<div style="margin-bottom:20px">' +
    '<div style="font-size:24px;font-weight:800;color:var(--white);margin-bottom:4px;letter-spacing:-0.4px">' + ic('brain', 22) + ' Tes Psikologi TNI</div>' +
    '<div style="font-size:13px;color:var(--text2)">Simulasi seleksi psikologi militer resmi & kepribadian perwira</div>' +
    '</div>';

  html += '<div style="display:grid;gap:12px">';

  tests.forEach(function(t) {
    var testData = SOAL_PSIKOLOGI[t.key];
    var soalCount = 0;
    if (testData && testData.soal) {
      soalCount = testData.soal.length;
    }

    html += '<div class="card" style="padding:16px;cursor:pointer" onclick="startPsiTest(\''+t.key+'\')">' +
      '<div style="display:flex;gap:12px;align-items:start">' +
        '<div class="kat-icon" style="margin-bottom:0">'+icon(t.icon, 22)+'</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:4px">'+t.nama+'</div>' +
          '<div style="font-size:12px;color:var(--text3);margin-bottom:8px">'+t.desc+'</div>' +
          '<div style="font-size:11px;color:var(--text2)">'+soalCount+' soal tersedia</div>' +
        '</div>' +
        '<div style="color:var(--text3);font-size:20px;align-self:center">'+ic('chevron-right', 18)+'</div>' +
      '</div>' +
    '</div>';
  });

  html += '</div>';

  // Progress History
  if (PSI.history.length > 0) {
    html += '<div style="margin-top:24px">' +
      '<div style="font-size:16px;font-weight:600;color:var(--white);margin-bottom:12px">Riwayat Latihan</div>';

    PSI.history.slice(-5).reverse().forEach(function(h) {
      var date = new Date(h.timestamp);
      html += '<div class="card" style="padding:12px;margin-bottom:8px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div>' +
            '<div style="font-size:13px;font-weight:600;color:var(--white)">'+escapeHtml(h.testName)+'</div>' +
            '<div style="font-size:11px;color:var(--text3)">'+date.toLocaleString('id-ID')+'</div>' +
          '</div>' +
          '<div style="font-size:14px;font-weight:700;color:var(--primary)">'+h.score+'%</div>' +
        '</div>' +
      '</div>';
    });

    html += '</div>';
  }

  return html;
}

// Start tes psikologi
function startPsiTest(testKey) {
  PSI.testType = testKey;
  PSI.currentTest = SOAL_PSIKOLOGI[testKey];
  PSI.startTime = Date.now();
  PSI.answers = [];
  PSI.sessionId = Date.now();
  psiTimerStop();

  if (testKey === 'kraepelin') {
    startKraepelin();
  } else if (testKey === 'memory_span') {
    startMemorySpan();
  } else if (testKey === 'digit_span') {
    startDigitSpan();
  } else if (testKey === 'epps') {
    startEppsTest();
  } else {
    startWrittenTest(); // aritmatika & deret_angka
  }
}

// Tombol kembali ke menu psikologi
function psiBackHome() {
  psiTimerStop();
  PSI.page = 'psi-home';
  render();
}

// ============================================================
// TES TERTULIS: ARITMATIKA LISAN & DERET ANGKA
// ============================================================

function startWrittenTest() {
  PSI.testList = PSI.currentTest.soal.slice();
  PSI.testIdx = 0;
  PSI.answers = [];
  for (var i = 0; i < PSI.testList.length; i++) PSI.answers.push(null);
  PSI.page = 'psi-test';
  render();
}

function renderPsiTest() {
  var q = PSI.testList[PSI.testIdx];
  var n = PSI.testList.length;
  var isAr = PSI.testType === 'aritmatika';
  var qText = isAr ? escapeHtml(q.soal) : (q.deret || []).map(escapeHtml).join(', ') + ', <b>... ?</b>';
  var saved = PSI.answers[PSI.testIdx];
  var answered = saved !== null;

  var html = '<div style="padding:16px;min-height:calc(100vh - 140px);display:flex;flex-direction:column">';

  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
    '<div style="font-size:18px;font-weight:700;color:var(--white)">' +
      (isAr ? ic('calculator', 18) + ' Aritmatika Lisan' : ic('chart', 18) + ' Deret Angka') + '</div>' +
    '<button class="btn btn-ghost btn-sm" onclick="psiBackHome()">← Menu</button>' +
  '</div>';

  // progress bar
  var pct = Math.round((PSI.testIdx / n) * 100);
  html += '<div class="progress-track" style="margin-bottom:16px"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
  html += '<div style="font-size:12px;color:var(--text3);margin-bottom:16px">Soal ' + (PSI.testIdx + 1) + ' / ' + n + '</div>';

  html += '<div class="card" style="padding:20px;margin-bottom:16px">' +
    '<div style="font-size:18px;font-weight:600;color:var(--white);line-height:1.6">' + qText + '</div>' +
    (isAr ? '' : '<div style="font-size:12px;color:var(--text3);margin-top:8px">Tentukan angka berikutnya dalam deret.</div>') +
  '</div>';

  if (!answered) {
    html += '<input type="text" id="writtenAnswer" inputmode="numeric" style="width:100%;padding:16px;background:var(--bg-elevated);' +
      'border:2px solid var(--border);border-radius:8px;color:var(--white);font-size:24px;text-align:center" ' +
      'placeholder="Tulis jawaban..." onkeydown="if(event.key===\'Enter\') submitWrittenAnswer()" />' +
      '<button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="submitWrittenAnswer()">Jawab</button>';
  } else {
    var isCorrect = isAnswerMatch(saved, q.jawaban);
    var cara = isAr ? q.cara : q.pola;
    html += '<div style="padding:14px;border-radius:8px;margin-bottom:12px;font-size:14px;font-weight:600;' +
      'background:' + (isCorrect ? 'rgba(34,204,74,0.12)' : 'rgba(232,64,48,0.12)') + ';' +
      'color:' + (isCorrect ? 'var(--success, #22cc4a)' : 'var(--danger, #e84030)') + '">' +
      (isCorrect ? ic('check-circle', 14) + ' Benar! ' : ic('x-circle', 14) + ' Kurang tepat. ') +
      'Jawaban: <b>' + escapeHtml(q.jawaban) + '</b>' +
      (cara ? '<div style="font-size:12px;font-weight:400;color:var(--text2);margin-top:6px">' + ic('book', 14) + ' ' + escapeHtml(cara) + '</div>' : '') +
    '</div>';
    html += '<button class="btn btn-primary" style="width:100%" onclick="nextWrittenQuestion()">' +
      (PSI.testIdx < n - 1 ? 'Soal Berikutnya ' + ic('arrow-right', 15) : ic('check', 15) + ' Selesai') + '</button>';
  }

  html += '</div>';
  return html;
}

window.submitWrittenAnswer = function() {
  var el = document.getElementById('writtenAnswer');
  if (!el || typeof el.value !== 'string' || !el.value.trim()) return;
  PSI.answers[PSI.testIdx] = el.value.trim();
  render();
};

window.nextWrittenQuestion = function() {
  if (PSI.testIdx < PSI.testList.length - 1) {
    PSI.testIdx++;
    render();
  } else {
    finishPsiTest();
  }
};

// ============================================================
// TES KRAEPELIN
// ============================================================

function startKraepelin() {
  PSI.kraepelinData = PSI.currentTest.generateSoal();
  PSI.kraepelinCol = 0;
  PSI.kraepelinRow = 0;
  PSI.kraepelinAnswers = [];

  for (var i = 0; i < PSI.kraepelinData.length; i++) {
    PSI.kraepelinAnswers[i] = [];
  }

  PSI.page = 'psi-kraepelin';
  render();
  startKraepelinTimer();

  // Fokus ke input pertama
  setTimeout(function() {
    var first = document.getElementById('k_0_0');
    if (first) first.focus();
  }, 100);
}

function startKraepelinTimer() {
  var timeLeft = PSI.currentTest.waktu_total;
  var timerEl = document.getElementById('kraepelinTimer');
  if (timerEl) timerEl.textContent = pad(Math.floor(timeLeft / 60)) + ':' + pad(timeLeft % 60);

  PSI.timerInterval = setInterval(function() {
    timeLeft--;
    var minutes = Math.floor(timeLeft / 60);
    var seconds = timeLeft % 60;

    var timerEl = document.getElementById('kraepelinTimer');
    if (timerEl) {
      timerEl.textContent = pad(minutes) + ':' + pad(seconds);
      timerEl.style.color = timeLeft <= 30 ? 'var(--danger, #e84030)' : 'var(--primary)';
    }

    if (timeLeft <= 0) {
      clearInterval(PSI.timerInterval);
      PSI.timerInterval = null;
      finishKraepelin();
    }
  }, 1000);
}

function renderKraepelin() {
  var html = '<div style="padding:16px;height:calc(100vh - 140px);overflow:hidden;display:flex;flex-direction:column">';

  // Header
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
    '<div style="display:flex;gap:8px;align-items:center">' +
      '<button class="btn btn-ghost btn-sm" onclick="psiBackHome()">←</button>' +
      '<div>' +
        '<div style="font-size:18px;font-weight:700;color:var(--white)">' + ic('zap', 18) + ' Tes Kraepelin</div>' +
        '<div style="font-size:12px;color:var(--text3)">Jumlahkan 2 angka berurutan, tulis digit terakhir</div>' +
      '</div>' +
    '</div>' +
    '<div style="display:flex;gap:8px;align-items:center">' +
      '<button class="btn btn-ghost btn-sm" onclick="toggleFullscreen()" title="Layar Penuh" style="padding:6px 10px">' + ic('maximize', 14) + ' Layar Penuh</button>' +
      '<div style="text-align:right">' +
        '<div style="font-size:22px;font-weight:700;color:var(--primary)" id="kraepelinTimer">03:00</div>' +
        '<button class="btn btn-danger btn-sm" style="margin-top:2px" onclick="finishKraepelin()">Selesai Sekarang</button>' +
      '</div>' +
    '</div>' +
  '</div>';

  // Kraepelin Grid (scroll vertikal & horizontal)
  html += '<div style="flex:1;overflow:auto;background:var(--bg-elevated);border-radius:8px;padding:16px">';
  html += '<div style="display:flex;gap:24px">';

  for (var col = 0; col < PSI.kraepelinData.length; col++) {
    html += '<div style="display:flex;flex-direction:column;gap:4px">';

    // Baris terakhir hanya angka (tidak ada pasangan untuk dijumlahkan)
    var lastRow = PSI.kraepelinData[col].length - 1;
    for (var row = 0; row < PSI.kraepelinData[col].length; row++) {
      var isActive = col === PSI.kraepelinCol && row === PSI.kraepelinRow;
      var answerVal = PSI.kraepelinAnswers[col][row] || '';
      var cell = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;' +
        'background:var(--bg);border-radius:4px;font-size:16px;font-weight:600;color:var(--white)">' +
        PSI.kraepelinData[col][row] + '</div>';

      if (row === lastRow) {
        html += '<div style="display:flex;align-items:center;gap:8px">' + cell + '</div>';
      } else {
        html += '<div style="display:flex;align-items:center;gap:8px">' +
          cell +
          '<input type="text" maxlength="1" inputmode="numeric" ' +
            'style="width:32px;height:32px;text-align:center;font-size:16px;font-weight:600;' +
            'background:'+(isActive?'var(--primary)':'var(--bg)')+';' +
            'border:2px solid '+(isActive?'var(--primary)':'var(--border)')+';' +
            'color:var(--white);border-radius:4px" ' +
            'value="'+answerVal+'" ' +
            'onkeyup="handleKraepelinInput(event, '+col+', '+row+')" ' +
            'id="k_'+col+'_'+row+'">' +
        '</div>';
      }
    }

    html += '</div>';
  }

  html += '</div></div>';

  // Instructions
  html += '<div style="margin-top:16px;padding:12px;background:var(--bg-elevated);border-radius:8px;font-size:12px;color:var(--text2)">' +
    '<strong style="color:var(--white)">Instruksi:</strong> Jumlahkan 2 angka berurutan (atas + bawah), tulis digit terakhir hasilnya. ' +
    'Tekan Enter untuk lanjut ke bawah, Tab untuk lanjut ke kolom berikutnya.' +
  '</div>';

  html += '</div>';

  return html;
}

function handleKraepelinInput(e, col, row) {
  var value = e.target.value;

  // Only allow digits
  if (!/^[0-9]$/.test(value) && value !== '') {
    e.target.value = '';
    return;
  }

  PSI.kraepelinAnswers[col][row] = value;

  // Enter: move down
  if (e.key === 'Enter' && value !== '') {
    if (row < PSI.kraepelinData[col].length - 2) {
      PSI.kraepelinRow = row + 1;
      PSI.kraepelinCol = col;
      setTimeout(function() {
        var nextInput = document.getElementById('k_'+col+'_'+(row+1));
        if (nextInput) nextInput.focus();
      }, 10);
    } else {
      // Move to next column
      if (col < PSI.kraepelinData.length - 1) {
        PSI.kraepelinCol = col + 1;
        PSI.kraepelinRow = 0;
        setTimeout(function() {
          var nextInput = document.getElementById('k_'+(col+1)+'_0');
          if (nextInput) nextInput.focus();
        }, 10);
      }
    }
  }

  // Tab: move to next column
  if (e.key === 'Tab') {
    e.preventDefault();
    if (col < PSI.kraepelinData.length - 1) {
      PSI.kraepelinCol = col + 1;
      PSI.kraepelinRow = 0;
      setTimeout(function() {
        var nextInput = document.getElementById('k_'+(col+1)+'_0');
        if (nextInput) nextInput.focus();
      }, 10);
    }
  }
}

function finishKraepelin() {
  psiTimerStop();

  // Calculate score & column statistics
  var correctAnswers = PSI.currentTest.hitungJawaban(PSI.kraepelinData);
  var totalCorrect = 0;
  var totalAnswered = 0;
  var colStats = [];

  for (var col = 0; col < PSI.kraepelinAnswers.length; col++) {
    var cAns = 0;
    var cCor = 0;
    for (var row = 0; row < PSI.kraepelinAnswers[col].length; row++) {
      if (PSI.kraepelinAnswers[col][row] !== '') {
        cAns++;
        totalAnswered++;
        if (PSI.kraepelinAnswers[col][row] == correctAnswers[col][row]) {
          cCor++;
          totalCorrect++;
        }
      }
    }
    colStats.push({ col: col + 1, answered: cAns, correct: cCor, wrong: cAns - cCor });
  }

  var score = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Analisa ritme grafik
  var rhythm = 'Stabil';
  if (colStats.length >= 3) {
    var firstHalf = 0;
    var secondHalf = 0;
    var half = Math.floor(colStats.length / 2);
    for (var i = 0; i < half; i++) firstHalf += colStats[i].answered;
    for (var j = half; j < colStats.length; j++) secondHalf += colStats[j].answered;
    var avgFirst = firstHalf / half;
    var avgSecond = secondHalf / (colStats.length - half);

    if (avgSecond > avgFirst + 1.5) rhythm = 'Meningkat (Ketahanan Baik)';
    else if (avgFirst > avgSecond + 2) rhythm = 'Menurun (Indikasi Kelelahan)';
    else rhythm = 'Stabil & Konsisten';
  }

  PSI.history.push({
    testName: 'Tes Kraepelin',
    score: score,
    correct: totalCorrect,
    total: totalAnswered,
    timestamp: Date.now()
  });

  savePsiProgress();

  PSI.page = 'psi-result';
  PSI.scores = {
    correct: totalCorrect,
    total: totalAnswered,
    score: score,
    colStats: colStats,
    rhythm: rhythm
  };

  render();
}

// ============================================================
// TES MEMORY SPAN
// ============================================================

function startMemorySpan() {
  PSI.memoryCatIdx = 0;
  PSI.memoryPhase = 'pick';
  PSI.page = 'psi-memory';
  render();
}

function pickMemoryCategory(idx) {
  PSI.memoryCatIdx = idx;
  PSI.testData = PSI.currentTest.soal[idx];
  PSI.memoryPhase = 'listen';
  render();

  setTimeout(function() {
    playMemoryWords();
  }, 1000);
}

function playMemoryWords() {
  var sid = PSI.sessionId;
  var words = PSI.testData.kata;
  var index = 0;

  function playNext() {
    if (sid !== PSI.sessionId) return; // user pindah halaman
    if (index < words.length) {
      var wordEl = document.getElementById('memoryWord');
      if (wordEl) {
        wordEl.textContent = words[index];
        wordEl.style.transform = 'scale(1.1)';
        setTimeout(function() {
          wordEl.style.transform = 'scale(1)';
        }, 300);
      }

      index++;
      setTimeout(playNext, 1200);
    } else {
      // Finished playing, start remember phase
      PSI.memoryPhase = 'remember';
      render();

      // 30 detik mengingat, lalu pindah ke fase menulis
      setTimeout(function() {
        if (sid === PSI.sessionId && PSI.memoryPhase === 'remember') {
          PSI.memoryPhase = 'write';
          render();
        }
      }, 30000);
    }
  }

  playNext();
}

function renderMemorySpan() {
  var html = '<div style="padding:16px;min-height:calc(100vh - 140px);display:flex;flex-direction:column">';

  // Header
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
    '<div style="font-size:18px;font-weight:700;color:var(--white)">' + ic('brain', 18) + ' Tes Daya Ingat</div>' +
    '<button class="btn btn-ghost btn-sm" onclick="psiBackHome()">← Menu</button>' +
  '</div>';

  if (PSI.memoryPhase === 'pick') {
    // Pilih kategori
    html += '<div style="font-size:13px;color:var(--text3);margin-bottom:16px">Pilih kategori kata yang ingin dilatih:</div>';
    html += '<div class="grid-auto">';
    PSI.currentTest.soal.forEach(function(s, i) {
      html += '<div class="kat-card" onclick="pickMemoryCategory(' + i + ')">' +
        '<div class="kat-name">' + s.kategori + '</div>' +
        '<div class="kat-sub">' + s.kata.length + ' kata</div>' +
      '</div>';
    });
    html += '</div>';
  } else if (PSI.memoryPhase === 'listen') {
    html += '<div style="text-align:center;margin-bottom:8px">' +
      '<div style="font-size:13px;color:var(--text3)">Kategori: <b style="color:var(--white)">' + PSI.testData.kategori + '</b></div>' +
    '</div>';
    html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
      '<div style="font-size:48px;font-weight:700;color:var(--primary);margin-bottom:16px" id="memoryWord">...</div>' +
      '<div style="font-size:13px;color:var(--text2)">Perhatikan dan ingat kata-kata berikut</div>' +
    '</div>';
  } else if (PSI.memoryPhase === 'remember') {
    html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
      '<div style="font-size:64px;margin-bottom:16px">⏳</div>' +
      '<div style="font-size:18px;font-weight:600;color:var(--white);margin-bottom:8px">Sedang mengingat...</div>' +
      '<div style="font-size:13px;color:var(--text2);margin-bottom:24px">Anda punya 30 detik untuk mengingat</div>' +
      '<button class="btn btn-primary" onclick="PSI.memoryPhase=\'write\';render()">Lanjut ke Menulis ' + ic('arrow-right', 15) + '</button>' +
    '</div>';
  } else {
    html += '<div style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:4px">Tulis kata yang Anda ingat (pisahkan dengan koma):</div>' +
      '<div style="font-size:12px;color:var(--text3);margin-bottom:12px">Kategori: <b>' + PSI.testData.kategori + '</b></div>';
    html += '<div style="flex:1">' +
      '<textarea id="memoryAnswer" style="width:100%;height:200px;padding:12px;background:var(--bg-elevated);' +
        'border:2px solid var(--border);border-radius:8px;color:var(--white);font-size:14px;resize:none" ' +
        'placeholder="Contoh: Kucing, Gajah, Jerapah"></textarea>' +
      '<button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="submitMemoryAnswer()">Selesai</button>' +
    '</div>';
  }

  html += '</div>';

  return html;
}

function submitMemoryAnswer() {
  var answerEl = document.getElementById('memoryAnswer');
  if (!answerEl || typeof answerEl.value !== 'string') return;

  var correctWords = PSI.testData.kata.map(function(w) { return w.toLowerCase().trim(); });
  var seen = {};
  var correct = 0;

  answerEl.value.split(/[,;\n\r]+/).forEach(function(raw) {
    var w = raw.trim().toLowerCase();
    if (!w || seen[w]) return; // abaikan kosong & duplikat
    seen[w] = true;
    if (correctWords.indexOf(w) !== -1) correct++;
  });

  var score = Math.min(100, Math.round((correct / correctWords.length) * 100));

  PSI.history.push({
    testName: 'Tes Daya Ingat - ' + PSI.testData.kategori,
    score: score,
    correct: correct,
    total: correctWords.length,
    timestamp: Date.now()
  });

  savePsiProgress();

  PSI.page = 'psi-result';
  PSI.scores = {
    correct: correct,
    total: correctWords.length,
    score: score
  };

  render();
}

// ============================================================
// TES DIGIT SPAN
// ============================================================

function startDigitSpan() {
  PSI.testList = PSI.currentTest.soal.slice();
  PSI.testIdx = 0;
  PSI.answers = [];
  for (var i = 0; i < PSI.testList.length; i++) PSI.answers.push(null);
  PSI.testData = PSI.testList[0];
  PSI.digitPhase = 'listen';
  PSI.page = 'psi-digit';
  render();

  setTimeout(function() {
    playDigitNumbers();
  }, 1000);
}

function playDigitNumbers() {
  var sid = PSI.sessionId;
  var numbers = PSI.testData.angka;
  var index = 0;

  function playNext() {
    if (sid !== PSI.sessionId) return;
    if (index < numbers.length) {
      var digitEl = document.getElementById('digitNumber');
      if (digitEl) {
        digitEl.textContent = numbers[index];
        digitEl.style.transform = 'scale(1.2)';
        setTimeout(function() {
          digitEl.style.transform = 'scale(1)';
        }, 400);
      }

      index++;
      setTimeout(playNext, 1000);
    } else {
      PSI.digitPhase = 'write';
      render();
      var inp = document.getElementById('digitAnswer');
      if (inp) inp.focus();
    }
  }

  playNext();
}

function renderDigitSpan() {
  var q = PSI.testList[PSI.testIdx];
  var n = PSI.testList.length;
  var answered = PSI.answers[PSI.testIdx] !== null;

  var html = '<div style="padding:16px;min-height:calc(100vh - 140px);display:flex;flex-direction:column">';

  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
    '<div style="font-size:18px;font-weight:700;color:var(--white)">' + ic('hash', 18) + ' Digit Span</div>' +
    '<button class="btn btn-ghost btn-sm" onclick="psiBackHome()">← Menu</button>' +
  '</div>';

  var pct = Math.round((PSI.testIdx / n) * 100);
  html += '<div class="progress-track" style="margin-bottom:12px"><div class="progress-fill" style="width:' + pct + '%"></div></div>';

  html += '<div style="text-align:center;margin-bottom:16px">' +
    '<div style="font-size:12px;color:var(--text3)">Soal ' + (PSI.testIdx + 1) + ' / ' + n +
    ' &nbsp;·&nbsp; Level ' + q.level + ' &nbsp;·&nbsp; ' + q.angka.length + ' digit &nbsp;·&nbsp; ' +
      (q.tipe === 'maju' ? 'Maju ' + ic('arrow-right', 12) : 'Mundur ' + ic('arrow-left', 12)) + '</div>' +
  '</div>';

  if (PSI.digitPhase === 'listen') {
    html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
      '<div style="font-size:72px;font-weight:700;color:var(--primary);margin-bottom:16px" id="digitNumber">?</div>' +
      '<div style="font-size:13px;color:var(--text2)">Perhatikan angka berikut</div>' +
    '</div>';
  } else if (!answered) {
    var instruction = q.tipe === 'maju' ?
      'Tulis angka sesuai urutan yang dibacakan:' :
      'Tulis angka dengan urutan TERBALIK:';

    html += '<div style="flex:1">' +
      '<div style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:12px">'+instruction+'</div>' +
      '<input type="text" id="digitAnswer" inputmode="numeric" style="width:100%;padding:16px;background:var(--bg-elevated);' +
        'border:2px solid var(--border);border-radius:8px;color:var(--white);font-size:24px;text-align:center;' +
        'letter-spacing:8px" placeholder="Tulis angka..." onkeydown="if(event.key===\'Enter\') submitDigitAnswer()" />' +
      '<button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="submitDigitAnswer()">Jawab</button>' +
    '</div>';
  } else {
    var isCorrect = PSI.answers[PSI.testIdx] === q.jawaban;
    html += '<div style="padding:14px;border-radius:8px;margin-bottom:12px;font-size:14px;font-weight:600;' +
      'background:' + (isCorrect ? 'rgba(34,204,74,0.12)' : 'rgba(232,64,48,0.12)') + ';' +
      'color:' + (isCorrect ? 'var(--success, #22cc4a)' : 'var(--danger, #e84030)') + '">' +
      (isCorrect ? ic('check-circle', 14) + ' Benar!' : ic('x-circle', 14) + ' Kurang tepat.') + ' Jawaban: <b>' + q.jawaban + '</b></div>';
    html += '<button class="btn btn-primary" style="width:100%" onclick="nextDigitQuestion()">' +
      (PSI.testIdx < n - 1 ? 'Soal Berikutnya ' + ic('arrow-right', 15) : ic('check', 15) + ' Selesai') + '</button>';
  }

  html += '</div>';

  return html;
}

window.submitDigitAnswer = function() {
  var answerEl = document.getElementById('digitAnswer');
  if (!answerEl || typeof answerEl.value !== 'string') return;

  var userAnswer = answerEl.value.replace(/[^0-9]/g, '');
  if (!userAnswer) return;

  PSI.answers[PSI.testIdx] = userAnswer;
  render();
};

window.nextDigitQuestion = function() {
  if (PSI.testIdx < PSI.testList.length - 1) {
    PSI.testIdx++;
    PSI.testData = PSI.testList[PSI.testIdx];
    PSI.digitPhase = 'listen';
    render();
    setTimeout(function() { playDigitNumbers(); }, 1000);
  } else {
    finishPsiTest();
  }
};

// ============================================================
// FINISH & RESULT (untuk tes sesi: digit, aritmatika, deret)
// ============================================================

function finishPsiTest() {
  var total = PSI.testList.length;
  var correct = 0;
  for (var i = 0; i < total; i++) {
    var a = PSI.answers[i];
    if (a !== null && isAnswerMatch(a, PSI.testList[i].jawaban)) {
      correct++;
    }
  }

  var score = Math.round((correct / total) * 100);

  var nameMap = {
    digit_span: 'Digit Span',
    aritmatika: 'Aritmatika Lisan',
    deret_angka: 'Deret Angka'
  };

  PSI.history.push({
    testName: nameMap[PSI.testType] || PSI.testType,
    score: score,
    correct: correct,
    total: total,
    timestamp: Date.now()
  });

  savePsiProgress();

  PSI.page = 'psi-result';
  PSI.scores = {
    correct: correct,
    total: total,
    score: score
  };

  render();
}

function renderKraepelinChart(stats, rhythm) {
  if (!stats || !stats.length) return '';
  var w = 480, h = 160, padL = 36, padR = 20, padT = 20, padB = 28;
  var maxVal = 0;
  for (var i = 0; i < stats.length; i++) {
    if (stats[i].answered > maxVal) maxVal = stats[i].answered;
  }
  if (maxVal < 10) maxVal = 10;
  maxVal = Math.ceil(maxVal * 1.2);

  var n = stats.length;
  var stepX = (w - padL - padR) / (n - 1 || 1);
  var scaleY = (h - padT - padB) / maxVal;

  var ptsAnswered = [];
  var ptsCorrect = [];
  var dotsAnswered = [];
  var dotsCorrect = [];
  var xLabels = [];

  for (var i = 0; i < n; i++) {
    var x = Math.round(padL + i * stepX);
    var yAns = Math.round(h - padB - stats[i].answered * scaleY);
    var yCor = Math.round(h - padB - stats[i].correct * scaleY);

    ptsAnswered.push(x + ',' + yAns);
    ptsCorrect.push(x + ',' + yCor);

    dotsAnswered.push('<circle cx="' + x + '" cy="' + yAns + '" r="3.5" fill="#f0c84a" />');
    dotsCorrect.push('<circle cx="' + x + '" cy="' + yCor + '" r="3" fill="#22cc4a" />');
    xLabels.push('<text x="' + x + '" y="' + (h - 8) + '" fill="#7a8c9e" font-size="10" text-anchor="middle">K' + (i+1) + '</text>');
  }

  // Grid lines
  var gridLines = '';
  for (var g = 0; g <= maxVal; g += Math.max(5, Math.floor(maxVal / 4))) {
    var gy = Math.round(h - padB - g * scaleY);
    gridLines += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (w - padR) + '" y2="' + gy + '" stroke="rgba(255,255,255,0.08)" stroke-width="1" />';
    gridLines += '<text x="' + (padL - 6) + '" y="' + (gy + 3) + '" fill="#7a8c9e" font-size="9" text-anchor="end">' + g + '</text>';
  }

  var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" class="kraepelin-svg-chart">' +
    gridLines +
    '<polyline points="' + ptsAnswered.join(' ') + '" fill="none" stroke="#f0c84a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />' +
    '<polyline points="' + ptsCorrect.join(' ') + '" fill="none" stroke="#22cc4a" stroke-width="2" stroke-dasharray="3,3" />' +
    dotsAnswered.join('') +
    dotsCorrect.join('') +
    xLabels.join('') +
    '</svg>';

  var avgSpd = stats.reduce(function(a,b){return a + b.answered;}, 0) / (n || 1);

  return '<div class="kraepelin-chart-card">' +
    '<div class="kraepelin-chart-title">' +
      '<span>' + ic('trend', 16) + ' Kurva Ritme Kerja (Performance Curve)</span>' +
      '<span style="font-size:12px;color:var(--gold3);font-weight:600">' + (rhythm || 'Stabil') + '</span>' +
    '</div>' +
    '<div class="kraepelin-chart-sub">Grafik tempo penjumlahan per kolom selama 3 menit. Kuning: Kecepatan, Hijau: Ketelitian.</div>' +
    '<div class="kraepelin-chart-wrap">' + svg + '</div>' +
    '<div style="display:flex;justify-content:space-around;gap:10px;margin-top:14px;border-top:1px solid var(--border);padding-top:12px;text-align:center">' +
      '<div><div style="font-size:11px;color:var(--text3)">RATA-RATA / KOLOM</div><div style="font-size:16px;font-weight:700;color:var(--gold3)">' + avgSpd.toFixed(1) + ' hitungan</div></div>' +
      '<div><div style="font-size:11px;color:var(--text3)">PROFIL RITME</div><div style="font-size:14px;font-weight:700;color:var(--white)">' + (rhythm || 'Stabil') + '</div></div>' +
    '</div>' +
  '</div>';
}

function startEppsTest() {
  PSI.testList = PSI.currentTest.soal.slice();
  PSI.testIdx = 0;
  PSI.answers = [];
  for (var i = 0; i < PSI.testList.length; i++) PSI.answers.push(null);
  PSI.page = 'psi-epps';
  render();
}

function renderEppsTest() {
  var q = PSI.testList[PSI.testIdx];
  var n = PSI.testList.length;
  var sel = PSI.answers[PSI.testIdx];
  var pct = Math.round(((PSI.testIdx + 1) / n) * 100);

  var html = '<div class="epps-container">';

  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
    '<div>' +
      '<div style="font-size:18px;font-weight:700;color:var(--white)">' + ic('user', 18) + ' Tes Kepribadian (EPPS Militer)</div>' +
      '<div style="font-size:12px;color:var(--text3)">Pilihlah 1 pernyataan yang paling menggambarkan diri Anda</div>' +
    '</div>' +
    '<button class="btn btn-ghost btn-sm" onclick="psiBackHome()">← Menu</button>' +
  '</div>';

  html += '<div class="progress-track" style="margin-bottom:12px"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
  html += '<div style="font-size:12px;color:var(--text3);margin-bottom:18px">Pernyataan ' + (PSI.testIdx + 1) + ' dari ' + n + '</div>';

  html += '<div class="epps-choice-card ' + (sel === 'A' ? 'selected' : '') + '" onclick="pickEppsChoice(\'A\')">' +
    '<div class="epps-choice-letter">A</div>' +
    '<div class="epps-choice-text">' + escapeHtml(q.pilihanA.teks) + '</div>' +
  '</div>';

  html += '<div class="epps-choice-card ' + (sel === 'B' ? 'selected' : '') + '" onclick="pickEppsChoice(\'B\')">' +
    '<div class="epps-choice-letter">B</div>' +
    '<div class="epps-choice-text">' + escapeHtml(q.pilihanB.teks) + '</div>' +
  '</div>';

  var prevBtn = '<button class="btn btn-ghost btn-sm" onclick="prevEppsQuestion()"' + (PSI.testIdx === 0 ? ' disabled' : '') + '>' + ic('arrow-left', 15) + ' Sebelumnya</button>';
  var nextBtn = '';
  if (PSI.testIdx < n - 1) {
    nextBtn = '<button class="btn btn-primary btn-sm" onclick="nextEppsQuestion()"' + (sel === null ? ' disabled' : '') + '>Berikutnya ' + ic('arrow-right', 15) + '</button>';
  } else {
    nextBtn = '<button class="btn btn-primary btn-sm" onclick="finishEppsTest()"' + (sel === null ? ' disabled' : '') + '>' + ic('check', 15) + ' Selesai</button>';
  }

  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px">' +
    prevBtn +
    nextBtn +
  '</div>';

  html += '</div>';
  return html;
}

window.pickEppsChoice = function(choice) {
  PSI.answers[PSI.testIdx] = choice;
  if (PSI.testIdx < PSI.testList.length - 1) {
    PSI.testIdx++;
    render();
  } else {
    render();
  }
};

window.prevEppsQuestion = function() {
  if (PSI.testIdx > 0) {
    PSI.testIdx--;
    render();
  }
};

window.nextEppsQuestion = function() {
  if (PSI.testIdx < PSI.testList.length - 1) {
    PSI.testIdx++;
    render();
  }
};

function finishEppsTest() {
  var traitCounts = {
    leadership: 0,
    discipline: 0,
    endurance: 0,
    solidarity: 0,
    adaptability: 0
  };

  var total = PSI.testList.length;
  for (var i = 0; i < total; i++) {
    var ans = PSI.answers[i];
    var q = PSI.testList[i];
    if (ans === 'A' && q.pilihanA && q.pilihanA.trait) {
      traitCounts[q.pilihanA.trait] = (traitCounts[q.pilihanA.trait] || 0) + 1;
    } else if (ans === 'B' && q.pilihanB && q.pilihanB.trait) {
      traitCounts[q.pilihanB.trait] = (traitCounts[q.pilihanB.trait] || 0) + 1;
    }
  }

  var maxPerTrait = 12;
  var traitPcts = {
    leadership: Math.min(100, Math.round((traitCounts.leadership / maxPerTrait) * 100)),
    discipline: Math.min(100, Math.round((traitCounts.discipline / maxPerTrait) * 100)),
    endurance: Math.min(100, Math.round((traitCounts.endurance / maxPerTrait) * 100)),
    solidarity: Math.min(100, Math.round((traitCounts.solidarity / maxPerTrait) * 100)),
    adaptability: Math.min(100, Math.round((traitCounts.adaptability / maxPerTrait) * 100))
  };

  var primaryArchetype = 'Perwira Komando Lapangan';
  var archetypeDesc = 'Memiliki karakter kepemimpinan yang tegas, inisiatif tinggi, dan daya tahan prima di bawah tekanan.';
  if (traitPcts.discipline >= traitPcts.leadership && traitPcts.discipline >= traitPcts.solidarity) {
    primaryArchetype = 'Perwira Staf, Operasi & Perencana';
    archetypeDesc = 'Sangat taat SOP militer, teliti dalam perencanaan taktis, dan memiliki loyalitas hierarki yang unggul.';
  } else if (traitPcts.solidarity >= traitPcts.leadership && traitPcts.solidarity >= traitPcts.discipline) {
    primaryArchetype = 'Perwira Pembina Pasukan & Jiwa Korsa';
    archetypeDesc = 'Memiliki ikatan batin kuat dengan bawahan, mengutamakan keselamatan regu, dan disegani prajurit.';
  } else if (traitPcts.adaptability >= traitPcts.leadership && traitPcts.adaptability >= traitPcts.endurance) {
    primaryArchetype = 'Perwira Taktis & Intelijen / Lapangan';
    archetypeDesc = 'Cepat beradaptasi terhadap perubahan situasi medan, tenang dalam kondisi darurat, dan fleksibel mencari solusi.';
  }

  var score = Math.round((traitPcts.leadership + traitPcts.discipline + traitPcts.endurance + traitPcts.solidarity + traitPcts.adaptability) / 5);

  PSI.history.push({
    testName: 'Tes Kepribadian (EPPS Militer)',
    score: score,
    correct: score,
    total: 100,
    timestamp: Date.now()
  });

  savePsiProgress();

  PSI.page = 'psi-result';
  PSI.scores = {
    isEpps: true,
    score: score,
    correct: score,
    total: 100,
    traitCounts: traitCounts,
    traitPcts: traitPcts,
    archetype: primaryArchetype,
    archetypeDesc: archetypeDesc
  };

  render();
}

function renderEppsResult(res) {
  var pcts = res.traitPcts || {};
  var traits = [
    { name: 'Kepemimpinan & Inisiatif Komando', key: 'leadership', desc: 'Ketegasan mengambil keputusan & memimpin pasukan' },
    { name: 'Kedisiplinan & Kepatuhan SOP', key: 'discipline', desc: 'Ketaatan hierarki, regulasi, dan prosedur dinas' },
    { name: 'Daya Tahan Mental & Keuletan', key: 'endurance', desc: 'Stabilitas emosi & ketahanan di bawah tekanan berat' },
    { name: 'Jiwa Korsa & Solidaritas Pasukan', key: 'solidarity', desc: 'Kerjasama tim, empati, dan loyalitas prajurit' },
    { name: 'Daya Adaptasi & Fleksibilitas', key: 'adaptability', desc: 'Kecepatan menyesuaikan diri dengan dinamika medan' }
  ];

  var bars = traits.map(function(t) {
    var val = pcts[t.key] || 0;
    return '<div class="epps-trait-bar">' +
      '<div class="epps-trait-head">' +
        '<span class="epps-trait-name">' + t.name + '</span>' +
        '<span class="epps-trait-pct">' + val + '%</span>' +
      '</div>' +
      '<div class="epps-trait-track"><div class="epps-trait-fill" style="width:' + val + '%"></div></div>' +
      '<div class="epps-trait-desc">' + t.desc + '</div>' +
    '</div>';
  }).join('');

  return '<div style="padding:16px;max-width:680px;margin:0 auto;text-align:center">' +
    '<div style="margin-bottom:12px;display:flex;justify-content:center">' + icon('medal', 56) + '</div>' +
    '<div style="font-size:22px;font-weight:700;color:var(--white);margin-bottom:6px">Profil Kepribadian Perwira</div>' +
    '<div style="font-size:18px;font-weight:800;color:var(--gold3);margin-bottom:8px">' + escapeHtml(res.archetype) + '</div>' +
    '<div style="font-size:13px;color:var(--text2);margin-bottom:24px;line-height:1.6">' + escapeHtml(res.archetypeDesc) + '</div>' +
    '<div class="section-title" style="text-align:left;margin-bottom:12px">5 Dimensi Karakter Militer</div>' +
    bars +
    '<div class="tips-box" style="margin-top:20px;text-align:left">' +
      '<div class="tips-title">' + ic('bulb', 16) + ' Panduan Wawancara Psikologi TNI</div>' +
      '<ul style="font-size:12px;color:var(--text2);line-height:1.6">' +
        '<li>Pertahankan konsistensi jawaban saat wawancara tatap muka dengan psikolog militer.</li>' +
        '<li>Tunjukkan rasa percaya diri, postur tegap, dan nada bicara yang mantap & tegas.</li>' +
        '<li>Ceritakan pengalaman nyata di mana Anda berhasil memimpin dan menyelesaikan masalah sulit.</li>' +
      '</ul>' +
    '</div>' +
    '<div style="margin-top:24px">' +
      '<button class="btn btn-primary" onclick="navTo(\'psikologi\')">' + ic('home', 16) + ' Kembali ke Menu Psikologi</button>' +
    '</div>' +
  '</div>';
}

function renderPsiResult() {
  if (PSI.scores && PSI.scores.isEpps) {
    return renderEppsResult(PSI.scores);
  }

  var html = '<div style="padding:16px;max-width:680px;margin:0 auto;text-align:center">';

  var emoji = PSI.scores.score >= 80 ? 'medal' : PSI.scores.score >= 60 ? 'check-circle' : 'zap';

  html += '<div style="margin-bottom:12px;display:flex;justify-content:center">'+icon(emoji, 56)+'</div>' +
    '<div style="font-size:22px;font-weight:700;color:var(--white);margin-bottom:6px">Tes Selesai!</div>' +
    '<div style="font-size:42px;font-weight:900;color:var(--gold3);margin-bottom:12px">'+PSI.scores.score+'%</div>' +
    '<div style="font-size:14px;color:var(--text2);margin-bottom:20px">' +
      'Akurasi: <b>'+PSI.scores.correct+'</b> benar dari <b>'+PSI.scores.total+'</b> total hitungan' +
    '</div>';

  if (PSI.scores.colStats) {
    html += renderKraepelinChart(PSI.scores.colStats, PSI.scores.rhythm);
  }

  html += '<div style="margin-top:24px">' +
    '<button class="btn btn-primary" onclick="navTo(\'psikologi\')">' + ic('home', 16) + ' Kembali ke Menu Psikologi</button>' +
    '</div>';

  html += '</div>';

  return html;
}

// ============================================================
// INTEGRATION WITH MAIN APP
// ============================================================

// Render hanya halaman psikologi; semua halaman lain diserahkan ke app.js
var _psiBaseRender = (typeof window !== 'undefined' && typeof window.render === 'function')
  ? window.render
  : (typeof render === 'function' ? render : function(){});

window.render = function() {
  var m = document.getElementById('main');
  if (!m) return;

  document.querySelectorAll('.nav-btn').forEach(function(b) {
    var p = b.dataset.page;
    var isActive = false;
    if (p === 'cat') {
      isActive = (S.page === 'cat' && S.mode === 'tryout') || (S.page === 'soal' && S.mode === 'tryout');
    } else if (p === 'cat2') {
      isActive = (S.page === 'cat' && S.mode === 'learn') || (S.page === 'soal' && S.mode === 'learn');
    } else {
      isActive = (p === S.page);
    }
    b.classList.toggle('active', isActive);
  });

  if (S.page === 'psikologi') {
    if (PSI.page === 'psi-home') m.innerHTML = renderPsiHome();
    else if (PSI.page === 'psi-test') m.innerHTML = renderPsiTest();
    else if (PSI.page === 'psi-memory') m.innerHTML = renderMemorySpan();
    else if (PSI.page === 'psi-digit') m.innerHTML = renderDigitSpan();
    else if (PSI.page === 'psi-kraepelin') m.innerHTML = renderKraepelin();
    else if (PSI.page === 'psi-epps') m.innerHTML = renderEppsTest();
    else if (PSI.page === 'psi-result') m.innerHTML = renderPsiResult();
    return;
  }

  _psiBaseRender();
};

var _psiBaseNavTo = (typeof window !== 'undefined' && typeof window.navTo === 'function')
  ? window.navTo
  : (typeof navTo === 'function' ? navTo : function(){});

window.navTo = function(page) {
  if (page === 'psikologi') {
    psiTimerStop();
    S.page = 'psikologi';
    PSI.page = 'psi-home';
    loadPsiProgress();
    window.render();
    return;
  }
  psiTimerStop();
  _psiBaseNavTo(page);
};

// Load progress on init
document.addEventListener('DOMContentLoaded', function() {
  loadPsiProgress();
});
