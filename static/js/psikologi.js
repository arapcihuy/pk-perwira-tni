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
    return '<div class="empty"><div class="empty-icon">⚠️</div>' +
      '<p>Database soal psikologi belum dimuat.</p>' +
      '<button class="btn btn-primary" onclick="location.reload()">Muat Ulang</button></div>';
  }

  var tests = [
    { key: 'memory_span', icon: '🧠', nama: 'Tes Daya Ingat', desc: '16 kategori, 30 detik per kategori' },
    { key: 'digit_span', icon: '🔢', nama: 'Digit Span', desc: '18 soal, angka maju-mundur' },
    { key: 'aritmatika', icon: '➕', nama: 'Aritmatika Lisan', desc: '12 soal cerita' },
    { key: 'deret_angka', icon: '📊', nama: 'Deret Angka', desc: '12 pola deret' },
    { key: 'kraepelin', icon: '⚡', nama: 'Tes Kraepelin', desc: '3 menit, penjumlahan cepat' }
  ];

  var html = '<div style="margin-bottom:20px">' +
    '<div style="font-size:20px;font-weight:700;color:var(--white);margin-bottom:4px">Tes Psikologi TNI AU 🧠</div>' +
    '<div style="font-size:13px;color:var(--text2)">Format: Soal dibacakan → Jawab tertulis</div>' +
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
        '<div style="font-size:32px">'+t.icon+'</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:4px">'+t.nama+'</div>' +
          '<div style="font-size:12px;color:var(--text3);margin-bottom:8px">'+t.desc+'</div>' +
          '<div style="font-size:11px;color:var(--text2)">'+soalCount+' soal tersedia</div>' +
        '</div>' +
        '<div style="color:var(--primary);font-size:20px">→</div>' +
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
            '<div style="font-size:13px;font-weight:600;color:var(--white)">'+h.testName+'</div>' +
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
  var qText = isAr ? q.soal : q.deret.join(', ') + ', <b>... ?</b>';
  var saved = PSI.answers[PSI.testIdx];
  var answered = saved !== null;

  var html = '<div style="padding:16px;min-height:calc(100vh - 140px);display:flex;flex-direction:column">';

  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
    '<div style="font-size:18px;font-weight:700;color:var(--white)">' +
      (isAr ? '➕ Aritmatika Lisan' : '📊 Deret Angka') + '</div>' +
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
      (isCorrect ? '✅ Benar! ' : '❌ Kurang tepat. ') +
      'Jawaban: <b>' + q.jawaban + '</b>' +
      (cara ? '<div style="font-size:12px;font-weight:400;color:var(--text2);margin-top:6px">📖 ' + cara + '</div>' : '') +
    '</div>';
    html += '<button class="btn btn-primary" style="width:100%" onclick="nextWrittenQuestion()">' +
      (PSI.testIdx < n - 1 ? 'Soal Berikutnya →' : '✅ Selesai') + '</button>';
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
        '<div style="font-size:18px;font-weight:700;color:var(--white)">⚡ Tes Kraepelin</div>' +
        '<div style="font-size:12px;color:var(--text3)">Jumlahkan 2 angka berurutan, tulis digit terakhir</div>' +
      '</div>' +
    '</div>' +
    '<div style="text-align:right">' +
      '<div style="font-size:24px;font-weight:700;color:var(--primary)" id="kraepelinTimer">03:00</div>' +
      '<button class="btn btn-danger btn-sm" style="margin-top:4px" onclick="finishKraepelin()">Selesai Sekarang</button>' +
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

  // Calculate score
  var correctAnswers = PSI.currentTest.hitungJawaban(PSI.kraepelinData);
  var totalCorrect = 0;
  var totalAnswered = 0;

  for (var col = 0; col < PSI.kraepelinAnswers.length; col++) {
    for (var row = 0; row < PSI.kraepelinAnswers[col].length; row++) {
      if (PSI.kraepelinAnswers[col][row] !== '') {
        totalAnswered++;
        if (PSI.kraepelinAnswers[col][row] == correctAnswers[col][row]) {
          totalCorrect++;
        }
      }
    }
  }

  var score = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

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
    score: score
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
    '<div style="font-size:18px;font-weight:700;color:var(--white)">🧠 Tes Daya Ingat</div>' +
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
      '<button class="btn btn-primary" onclick="PSI.memoryPhase=\'write\';render()">Lanjut ke Menulis →</button>' +
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
    '<div style="font-size:18px;font-weight:700;color:var(--white)">🔢 Digit Span</div>' +
    '<button class="btn btn-ghost btn-sm" onclick="psiBackHome()">← Menu</button>' +
  '</div>';

  var pct = Math.round((PSI.testIdx / n) * 100);
  html += '<div class="progress-track" style="margin-bottom:12px"><div class="progress-fill" style="width:' + pct + '%"></div></div>';

  html += '<div style="text-align:center;margin-bottom:16px">' +
    '<div style="font-size:12px;color:var(--text3)">Soal ' + (PSI.testIdx + 1) + ' / ' + n +
    ' &nbsp;·&nbsp; Level ' + q.level + ' &nbsp;·&nbsp; ' + q.angka.length + ' digit &nbsp;·&nbsp; ' +
      (q.tipe === 'maju' ? 'Maju ➡️' : 'Mundur ⬅️') + '</div>' +
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
      (isCorrect ? '✅ Benar!' : '❌ Kurang tepat.') + ' Jawaban: <b>' + q.jawaban + '</b></div>';
    html += '<button class="btn btn-primary" style="width:100%" onclick="nextDigitQuestion()">' +
      (PSI.testIdx < n - 1 ? 'Soal Berikutnya →' : '✅ Selesai') + '</button>';
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

function renderPsiResult() {
  var html = '<div style="padding:16px;min-height:calc(100vh - 140px);display:flex;flex-direction:column;align-items:center;justify-content:center">';

  var emoji = PSI.scores.score >= 80 ? '🎉' : PSI.scores.score >= 60 ? '👍' : '💪';

  html += '<div style="font-size:64px;margin-bottom:16px">'+emoji+'</div>' +
    '<div style="font-size:24px;font-weight:700;color:var(--white);margin-bottom:8px">Tes Selesai!</div>' +
    '<div style="font-size:48px;font-weight:700;color:var(--primary);margin-bottom:24px">'+PSI.scores.score+'%</div>' +
    '<div style="font-size:14px;color:var(--text2);margin-bottom:32px">' +
      'Benar: '+PSI.scores.correct+' dari '+PSI.scores.total+' soal' +
    '</div>' +
    '<button class="btn btn-primary" onclick="navTo(\'psikologi\')">Kembali ke Menu</button>';

  html += '</div>';

  return html;
}

// ============================================================
// INTEGRATION WITH MAIN APP
// ============================================================

// Render hanya halaman psikologi; semua halaman lain diserahkan ke app.js
// CATATAN: nama variabel cadangan dibuat unik (_psi*) karena app.js juga
// memakai _baseNavTo/_baseRender sebagai global — tabrakan nama menyebabkan
// rekursi tak berujung (Maximum call stack size exceeded) di semua navigasi.
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
