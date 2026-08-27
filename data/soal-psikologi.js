// ============================================================
// SOAL TES PSIKOLOGI TNI AU - Format Lisan → Tulis
// Database soal lengkap untuk tes psikologi TNI AU/Dispesal
// ============================================================

const SOAL_PSIKOLOGI = {
  
  // ============================================================
  // TES DAYA INGAT (MEMORY SPAN)
  // Format: Dibacakan → Tunggu 30 detik → Tulis yang diingat
  // ============================================================
  memory_span: {
    nama: "Tes Daya Ingat",
    icon: "brain",
    waktu_per_soal: 60, // detik (30 detik ingat + 30 detik tulis)
    instruksi: "Dengarkan daftar kata berikut. Setelah selesai, Anda punya 30 detik untuk mengingat, lalu tulis sebanyak mungkin yang diingat.",
    soal: [
      { id: "ms1", kategori: "Binatang", kata: ["Kucing", "Gajah", "Jerapah", "Kelinci", "Harimau", "Burung", "Ikan", "Kerbau", "Sapi", "Kambing"], skor: 10 },
      { id: "ms2", kategori: "Perkakas", kata: ["Palu", "Sekop", "Gergaji", "Obeng", "Tang", "Kunci Inggris", "Bor", "Pahat", "Kikir", "Paku"], skor: 10 },
      { id: "ms3", kategori: "Buah-buahan", kata: ["Jeruk", "Apel", "Mangga", "Pisang", "Anggur", "Semangka", "Pepaya", "Melon", "Durian", "Rambutan"], skor: 10 },
      { id: "ms4", kategori: "Kendaraan", kata: ["Mobil", "Motor", "Bus", "Truk", "Becak", "Kereta", "Kapal", "Pesawat", "Sepeda", "Helikopter"], skor: 10 },
      { id: "ms5", kategori: "Warna", kata: ["Merah", "Biru", "Hijau", "Kuning", "Hitam", "Putih", "Ungu", "Oranye", "Abu-abu", "Cokelat"], skor: 10 },
      { id: "ms6", kategori: "Profesi", kata: ["Dokter", "Guru", "Polisi", "Tentara", "Petani", "Pilot", "Insinyur", "Akuntan", "Jaksa", "Hakim"], skor: 10 },
      { id: "ms7", kategori: "Pakaian", kata: ["Baju", "Celana", "Jaket", "Sepatu", "Topi", "Kaos Kaki", "Dasi", "Ikat Pinggang", "Kemeja", "Sarung"], skor: 10 },
      { id: "ms8", kategori: "Makanan", kata: ["Nasi", "Mie", "Roti", "Sate", "Soto", "Gado-gado", "Rendang", "Bakso", "Nasi Goreng", "Ayam Goreng"], skor: 10 },
      { id: "ms9", kategori: "Alat Tulis", kata: ["Pensil", "Pulpen", "Penggaris", "Penghapus", "Spidol", "Buku", "Kertas", "Stapler", "Gunting", "Lem"], skor: 10 },
      { id: "ms10", kategori: "Ruangan", kata: ["Kamar Tidur", "Dapur", "Ruang Tamu", "Kamar Mandi", "Garasi", "Teras", "Gudang", "Halaman", "Loteng", "Ruang Makan"], skor: 10 },
      { id: "ms11", kategori: "Olahraga", kata: ["Sepak Bola", "Basket", "Bulu Tangkis", "Voli", "Renang", "Tenis", "Tinju", "Lari", "Angkat Besi", "Panahan"], skor: 10 },
      { id: "ms12", kategori: "Negara", kata: ["Indonesia", "Malaysia", "Singapura", "Thailand", "Jepang", "Korea", "China", "Amerika", "Inggris", "Australia"], skor: 10 },
      { id: "ms13", kategori: "Alat Elektronik", kata: ["TV", "Radio", "HP", "Laptop", "Kulkas", "AC", "Kipas Angin", "Setrika", "Microwave", "Mesin Cuci"], skor: 10 },
      { id: "ms14", kategori: "Bumbu Dapur", kata: ["Garam", "Gula", "Merica", "Bawang Merah", "Bawang Putih", "Cabai", "Kunyit", "Jahe", "Kecap", "Terasi"], skor: 10 },
      { id: "ms15", kategori: "Bagian Tubuh", kata: ["Kepala", "Mata", "Hidung", "Telinga", "Mulut", "Tangan", "Kaki", "Jari", "Dada", "Perut"], skor: 10 },
      { id: "ms16", kategori: "Mix (Sulit)", kata: ["Gajah", "Palu", "Merah", "Tiga", "Mobil", "Apel", "Dokter"], skor: 7 }
    ]
  },

  // ============================================================
  // TES DIGIT SPAN (ANGKA MAJU-MUNDUR)
  // Format: Dibacakan angka → Tulis (maju atau mundur)
  // ============================================================
  digit_span: {
    nama: "Tes Digit Span",
    icon: "hash",
    waktu_per_soal: 30, // detik
    instruksi: "Dengarkan deret angka berikut. Tulis angka sesuai instruksi (maju atau mundur).",
    soal: [
      // Level 1: 3 Digit
      { id: "ds1", level: 1, tipe: "maju", angka: [4, 7, 2], jawaban: "472", skor: 1 },
      { id: "ds2", level: 1, tipe: "maju", angka: [9, 1, 5], jawaban: "915", skor: 1 },
      { id: "ds3", level: 1, tipe: "mundur", angka: [3, 8, 6], jawaban: "683", skor: 1 },
      { id: "ds4", level: 1, tipe: "mundur", angka: [7, 2, 9], jawaban: "927", skor: 1 },
      
      // Level 2: 4 Digit
      { id: "ds5", level: 2, tipe: "maju", angka: [5, 9, 2, 7], jawaban: "5927", skor: 2 },
      { id: "ds6", level: 2, tipe: "maju", angka: [8, 3, 1, 6], jawaban: "8316", skor: 2 },
      { id: "ds7", level: 2, tipe: "mundur", angka: [4, 7, 2, 9], jawaban: "9274", skor: 2 },
      { id: "ds8", level: 2, tipe: "mundur", angka: [6, 1, 8, 3], jawaban: "3816", skor: 2 },
      
      // Level 3: 5 Digit
      { id: "ds9", level: 3, tipe: "maju", angka: [3, 8, 4, 1, 9], jawaban: "38419", skor: 3 },
      { id: "ds10", level: 3, tipe: "maju", angka: [7, 2, 6, 9, 4], jawaban: "72694", skor: 3 },
      { id: "ds11", level: 3, tipe: "mundur", angka: [2, 9, 5, 7, 1], jawaban: "17592", skor: 3 },
      { id: "ds12", level: 3, tipe: "mundur", angka: [6, 3, 8, 1, 4], jawaban: "41836", skor: 3 },
      
      // Level 4: 6 Digit
      { id: "ds13", level: 4, tipe: "maju", angka: [5, 2, 9, 7, 3, 8], jawaban: "529738", skor: 4 },
      { id: "ds14", level: 4, tipe: "maju", angka: [4, 8, 1, 6, 9, 2], jawaban: "481692", skor: 4 },
      { id: "ds15", level: 4, tipe: "mundur", angka: [3, 7, 2, 9, 5, 1], jawaban: "159273", skor: 4 },
      { id: "ds16", level: 4, tipe: "mundur", angka: [8, 4, 6, 1, 3, 7], jawaban: "731648", skor: 4 },
      
      // Level 5: 7 Digit (Sulit)
      { id: "ds17", level: 5, tipe: "maju", angka: [9, 4, 2, 7, 1, 6, 3], jawaban: "9427163", skor: 5 },
      { id: "ds18", level: 5, tipe: "mundur", angka: [5, 8, 3, 1, 9, 6, 2], jawaban: "2691385", skor: 5 }
    ]
  },

  // ============================================================
  // TES ARITMATIKA LISAN
  // Format: Soal dibacakan → Hitung di kepala → Tulis jawaban
  // ============================================================
  aritmatika: {
    nama: "Aritmatika Lisan",
    icon: "calculator",
    waktu_per_soal: 45, // detik
    instruksi: "Dengarkan soal cerita berikut. Hitung di kepala (boleh coret-coret) dan tulis jawaban akhir.",
    soal: [
      { id: "ar1", level: "mudah", soal: "Jika 8 pensil harganya Rp4.000, berapa harga 5 pensil?", jawaban: "2500", cara: "4000÷8=500, 500×5=2500", skor: 1 },
      { id: "ar2", level: "mudah", soal: "Seorang pedagang beli 12 apel. Dia jual setengahnya. Berapa sisa?", jawaban: "6", cara: "12÷2=6", skor: 1 },
      { id: "ar3", level: "mudah", soal: "Jam sekarang 14:30. 45 menit lagi jam berapa?", jawaban: "15:15", cara: "14:30 + 0:45 = 15:15", skor: 1 },
      { id: "ar4", level: "mudah", soal: "Saya punya 3 uang Rp10.000. Saya beli makanan Rp25.000. Berapa sisa?", jawaban: "5000", cara: "30.000 - 25.000 = 5.000", skor: 1 },
      
      { id: "ar5", level: "sedang", soal: "Bus berangkat pukul 08:00 dan sampai pukul 11:30. Berapa jam lama perjalanan?", jawaban: "3.5", cara: "11:30 - 08:00 = 3 jam 30 menit = 3,5 jam", skor: 2 },
      { id: "ar6", level: "sedang", soal: "Kecepatan mobil 60 km/jam. Berapa km dalam 30 menit?", jawaban: "30", cara: "60×0.5=30", skor: 2 },
      { id: "ar7", level: "sedang", soal: "Harga buku turun 20% dari Rp50.000. Berapa harga sekarang?", jawaban: "40000", cara: "50.000 - (20%×50.000) = 40.000", skor: 2 },
      { id: "ar8", level: "sedang", soal: "Jika 3 orang selesai dalam 6 jam, berapa jam jika 6 orang?", jawaban: "3", cara: "3×6=18, 18÷6=3", skor: 2 },
      
      { id: "ar9", level: "sulit", soal: "Keuntungan 15% dari modal Rp200.000. Berapa untung?", jawaban: "30000", cara: "15%×200.000=30.000", skor: 3 },
      { id: "ar10", level: "sulit", soal: "Jarak 150 km, kecepatan 50 km/jam. Berapa jam sampai?", jawaban: "3", cara: "150÷50=3", skor: 3 },
      { id: "ar11", level: "sulit", soal: "Modal Rp500.000, rugi 10%. Berapa sisa?", jawaban: "450000", cara: "500.000 - (10%×500.000) = 450.000", skor: 3 },
      { id: "ar12", level: "sulit", soal: "Rata-rata 80, 90, 70, 100. Berapa rata-ratanya?", jawaban: "85", cara: "(80+90+70+100)÷4=85", skor: 3 }
    ]
  },

  // ============================================================
  // TES DERET ANGKA
  // Format: Dibacakan deret → Tulis angka berikutnya
  // ============================================================
  deret_angka: {
    nama: "Deret Angka",
    icon: "chart",
    waktu_per_soal: 30, // detik
    instruksi: "Dengarkan deret angka berikut. Tentukan angka berikutnya dalam deret tersebut.",
    soal: [
      { id: "da1", tipe: "naik", deret: [2, 4, 6, 8], jawaban: "10", pola: "+2", skor: 1 },
      { id: "da2", tipe: "naik", deret: [5, 10, 15, 20], jawaban: "25", pola: "+5", skor: 1 },
      { id: "da3", tipe: "naik", deret: [1, 3, 5, 7], jawaban: "9", pola: "+2", skor: 1 },
      { id: "da4", tipe: "turun", deret: [100, 95, 90, 85], jawaban: "80", pola: "-5", skor: 1 },
      { id: "da5", tipe: "turun", deret: [50, 45, 40, 35], jawaban: "30", pola: "-5", skor: 1 },
      { id: "da6", tipe: "kali", deret: [2, 4, 8, 16], jawaban: "32", pola: "×2", skor: 2 },
      { id: "da7", tipe: "kali", deret: [3, 6, 12, 24], jawaban: "48", pola: "×2", skor: 2 },
      { id: "da8", tipe: "kali", deret: [5, 10, 20, 40], jawaban: "80", pola: "×2", skor: 2 },
      { id: "da9", tipe: "fibonacci", deret: [1, 1, 2, 3, 5, 8], jawaban: "13", pola: "a+b", skor: 3 },
      { id: "da10", tipe: "fibonacci", deret: [0, 1, 1, 2, 3, 5], jawaban: "8", pola: "a+b", skor: 3 },
      { id: "da11", tipe: "kuadrat", deret: [1, 4, 9, 16], jawaban: "25", pola: "n²", skor: 3 },
      { id: "da12", tipe: "campuran", deret: [2, 6, 12, 20], jawaban: "30", pola: "n×(n+1)", skor: 3 }
    ]
  },

  // ============================================================
  // TES KRAEPELIN / PAULI
  // Format: Penjumlahan angka vertikal secepat mungkin
  // ============================================================
  kraepelin: {
    nama: "Tes Kraepelin",
    icon: "zap",
    waktu_total: 180, // detik (3 menit)
    instruksi: "Jumlahkan dua angka berurutan dari atas ke bawah secepat mungkin. Tulis hasil penjumlahan di sebelah kanan.",
    kolom: 10,
    baris: 50,
    // Generate angka random 0-9
    generateSoal: function() {
      const soal = [];
      for (let k = 0; k < this.kolom; k++) {
        const kolom = [];
        for (let b = 0; b < this.baris; b++) {
          kolom.push(Math.floor(Math.random() * 10));
        }
        soal.push(kolom);
      }
      return soal;
    },
    hitungJawaban: function(soal) {
      const jawaban = [];
      for (let k = 0; k < soal.length; k++) {
        const kolomJawaban = [];
        for (let b = 0; b < soal[k].length - 1; b++) {
          const hasil = (soal[k][b] + soal[k][b + 1]) % 10; // Ambil digit terakhir
          kolomJawaban.push(hasil);
        }
        jawaban.push(kolomJawaban);
      }
      return jawaban;
    }
  },

  // ============================================================
  // TES KEPRIBADIAN EPPS (Edwards Personal Preference Schedule) MILITER
  // Format: Forced-Choice Pernyataan A vs Pernyataan B
  // Mengukur 5 Dimensi Kepribadian Utama Calon Perwira TNI:
  // 1. leadership (Kepemimpinan & Inisiatif Komando)
  // 2. discipline (Kedisiplinan & Ketaatan SOP)
  // 3. endurance (Daya Tahan Mental & Keuletan)
  // 4. solidarity (Jiwa Korsa & Solidaritas Pasukan)
  // 5. adaptability (Daya Adaptasi Taktis & Fleksibilitas)
  // ============================================================
  epps: {
    nama: "Tes Kepribadian (EPPS Militer)",
    icon: "user",
    instruksi: "Pilihlah salah satu dari dua pernyataan (A atau B) yang PALING MENGGAMBARKAN diri Anda secara jujur. Tidak ada jawaban benar atau salah.",
    soal: [
      { id: "ep1", pilihanA: { teks: "Saya terdorong untuk memimpin dan mengambil tanggung jawab atas keberhasilan tim.", trait: "leadership" }, pilihanB: { teks: "Saya selalu mengutamakan kepatuhan terhadap aturan dan instruksi kedinasan.", trait: "discipline" } },
      { id: "ep2", pilihanA: { teks: "Saya tetap tenang dan fokus bekerja meski berada di bawah tekanan waktu yang berat.", trait: "endurance" }, pilihanB: { teks: "Saya senang membantu rekan sejawat agar seluruh tim berhasil bersama.", trait: "solidarity" } },
      { id: "ep3", pilihanA: { teks: "Saya mudah menyesuaikan diri dengan situasi baru dan perubahan rencana yang mendadak.", trait: "adaptability" }, pilihanB: { teks: "Saya berani mengambil keputusan sulit saat terjadi kebuntuan di lapangan.", trait: "leadership" } },
      { id: "ep4", pilihanA: { teks: "Saya memastikan setiap pekerjaan diselesaikan dengan rapi, teliti, dan sesuai SOP.", trait: "discipline" }, pilihanB: { teks: "Saya pantang menyerah sebelum target misi yang diberikan tercapai 100%.", trait: "endurance" } },
      { id: "ep5", pilihanA: { teks: "Saya menempatkan kepentingan bersama dan persaudaraan regu di atas kepentingan pribadi.", trait: "solidarity" }, pilihanB: { teks: "Saya cepat mencari jalan alternatif ketika strategi awal menghadapi kendala.", trait: "adaptability" } },
      { id: "ep6", pilihanA: { teks: "Saya terbiasa berbicara tegas dan memberi arahan yang jelas kepada orang lain.", trait: "leadership" }, pilihanB: { teks: "Saya selalu hadir tepat waktu dan memegang teguh komitmen dinas.", trait: "discipline" } },
      { id: "ep7", pilihanA: { teks: "Saya tahan bekerja dalam kondisi fisik dan lingkungan yang melelahkan.", trait: "endurance" }, pilihanB: { teks: "Saya menjaga kekompakan dan semangat juang sesama rekan prajurit.", trait: "solidarity" } },
      { id: "ep8", pilihanA: { teks: "Saya siap ditempatkan dan bertugas di berbagai medan tanpa banyak mengeluh.", trait: "adaptability" }, pilihanB: { teks: "Saya termotivasi untuk menjadi yang terbaik dan memelopori tindakan.", trait: "leadership" } },
      { id: "ep9", pilihanA: { teks: "Saya menaati hierarki komando dan loyal kepada pimpinan.", trait: "discipline" }, pilihanB: { teks: "Saya gigih menyelesaikan masalah rumit meski membutuhkan waktu lama.", trait: "endurance" } },
      { id: "ep10", pilihanA: { teks: "Saya peka terhadap kesulitan rekan dan siap memberikan bantuan tanpa pamrih.", trait: "solidarity" }, pilihanB: { teks: "Saya fleksibel menerima metode kerja baru demi efektivitas misi.", trait: "adaptability" } },
      { id: "ep11", pilihanA: { teks: "Saya berani menerima risiko atas setiap keputusan yang saya buat.", trait: "leadership" }, pilihanB: { teks: "Saya konsisten menjaga standar kerja tinggi tanpa perlu diawasi ketat.", trait: "discipline" } },
      { id: "ep12", pilihanA: { teks: "Kritik atau teguran keras membuat saya semakin bersemangat memperbaiki diri.", trait: "endurance" }, pilihanB: { teks: "Saya selalu mengedepankan musyawarah dan kekeluargaan dalam kelompok.", trait: "solidarity" } },
      { id: "ep13", pilihanA: { teks: "Saya tidak canggung berinteraksi dengan orang dari berbagai latar belakang budaya.", trait: "adaptability" }, pilihanB: { teks: "Saya memiliki visi yang jelas mengenai apa yang harus dicapai oleh tim.", trait: "leadership" } },
      { id: "ep14", pilihanA: { teks: "Saya menjaga kerahasiaan informasi dan etika dinas dengan ketat.", trait: "discipline" }, pilihanB: { teks: "Saya memiliki stamina mental yang kuat saat menghadapi kegagalan sementara.", trait: "endurance" } },
      { id: "ep15", pilihanA: { teks: "Keberhasilan rekan kerja adalah kebanggaan dan motivasi bagi diri saya.", trait: "solidarity" }, pilihanB: { teks: "Saya mampu mengendalikan emosi dengan baik saat rencana berubah drastis.", trait: "adaptability" } },
      { id: "ep16", pilihanA: { teks: "Saya senang mendelegasikan tugas sesuai keahlian masing-masing anggota tim.", trait: "leadership" }, pilihanB: { teks: "Saya terbiasa memeriksa ulang detail pekerjaan sebelum dilaporkan ke atasan.", trait: "discipline" } },
      { id: "ep17", pilihanA: { teks: "Saya sanggup bekerja lembur berhari-hari demi menuntaskan tugas mendesak.", trait: "endurance" }, pilihanB: { teks: "Saya rela berkorban waktu dan tenaga demi keselamatan rekan satu tim.", trait: "solidarity" } },
      { id: "ep18", pilihanA: { teks: "Saya cepat mempelajari keahlian atau peralatan teknis baru di lapangan.", trait: "adaptability" }, pilihanB: { teks: "Saya berani tampil di depan untuk membela kebenaran dan anak buah.", trait: "leadership" } },
      { id: "ep19", pilihanA: { teks: "Saya menghormati tradisi, norma kesatuan, dan tata krama militer.", trait: "discipline" }, pilihanB: { teks: "Rasa lelah tidak menyurutkan konsentrasi saya dalam menjalankan kewajiban.", trait: "endurance" } },
      { id: "ep20", pilihanA: { teks: "Saya aktif membangun suasana kerja yang harmonis dan penuh rasa percaya.", trait: "solidarity" }, pilihanB: { teks: "Saya mudah beralih ke tugas lain yang lebih mendesak tanpa rasa panik.", trait: "adaptability" } },
      { id: "ep21", pilihanA: { teks: "Saya terbiasa mengorganisir kegiatan dan menetapkan target bagi orang lain.", trait: "leadership" }, pilihanB: { teks: "Saya disiplin mengatur waktu dan jadwal kegiatan sehari-hari.", trait: "discipline" } },
      { id: "ep22", pilihanA: { teks: "Saya tetap optimis dan teguh pendirian saat situasi serba tidak pasti.", trait: "endurance" }, pilihanB: { teks: "Saya setia kawan dan menjaga nama baik korps di manapun berada.", trait: "solidarity" } },
      { id: "ep23", pilihanA: { teks: "Saya mampu bertahan hidup dan berfungsi baik di daerah terpencil / darurat.", trait: "adaptability" }, pilihanB: { teks: "Saya memotivasi orang lain agar tidak ragu-ragu dalam bertindak.", trait: "leadership" } },
      { id: "ep24", pilihanA: { teks: "Saya mematuhi rantai komando secara mutlak tanpa membantah perintah sah.", trait: "discipline" }, pilihanB: { teks: "Saya memiliki daya juang tinggi untuk membalikkan situasi sulit menjadi kemenangan.", trait: "endurance" } },
      { id: "ep25", pilihanA: { teks: "Saya mendahulukan kepentingan prajurit sebelum memikirkan kenyamanan pribadi.", trait: "solidarity" }, pilihanB: { teks: "Saya cepat menangkap maksud tersirat dan situasi taktis di sekitar saya.", trait: "adaptability" } },
      { id: "ep26", pilihanA: { teks: "Saya mampu mengoordinasikan berbagai elemen agar bersinergi secara maksimal.", trait: "leadership" }, pilihanB: { teks: "Saya menjaga kelengkapan dan kebersihan perlengkapan dinas secara teratur.", trait: "discipline" } },
      { id: "ep27", pilihanA: { teks: "Tekanan mental berat justru memicu daya konsentrasi terbaik saya.", trait: "endurance" }, pilihanB: { teks: "Saya selalu siap menjadi pendengar yang baik bagi keluh kesah anggota tim.", trait: "solidarity" } },
      { id: "ep28", pilihanA: { teks: "Saya mudah menyesuaikan gaya komunikasi dengan berbagai tingkatan pangkat.", trait: "adaptability" }, pilihanB: { teks: "Saya siap bertanggung jawab penuh jika tim yang saya pimpin melakukan kesalahan.", trait: "leadership" } },
      { id: "ep29", pilihanA: { teks: "Saya menjalankan setiap tugas dengan integritas tinggi dan kejujuran.", trait: "discipline" }, pilihanB: { teks: "Saya memiliki keteguhan hati untuk tidak mudah putus asa oleh rintangan.", trait: "endurance" } },
      { id: "ep30", pilihanA: { teks: "Saya menjunjung tinggi kehormatan persatuan dan ikatan batin militer.", trait: "solidarity" }, pilihanB: { teks: "Saya bersikap fleksibel menghadapi keterbatasan fasilitas di medan tugas.", trait: "adaptability" } }
    ]
  }
};

// Export untuk digunakan di app.js
if (typeof window !== 'undefined') {
  window.SOAL_PSIKOLOGI = SOAL_PSIKOLOGI;
}
