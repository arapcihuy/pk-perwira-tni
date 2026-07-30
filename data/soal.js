const SOAL_DATABASE = {
  tkw: {
    nama: "Wawasan Kebangsaan",
    soal: [
      { id:"w1", pertanyaan:"Pancasila ditetapkan sebagai dasar negara pada tanggal...", pilihan:["17 Agustus 1945","18 Agustus 1945","1 Juni 1945","22 Juni 1945"], jawaban:1, pembahasan:"PPKI mengesahkan Pancasila bersama UUD 1945 pada 18 Agustus 1945. Pidato 1 Juni 1945 adalah hari lahir Pancasila, Piagam Jakarta 22 Juni 1945." },
      { id:"w2", pertanyaan:"Lambang sila ke-4 Pancasila adalah...", pilihan:["Bintang","Rantai","Kepala Banteng","Pohon Beringin"], jawaban:2, pembahasan:"Sila ke-4 (Kerakyatan) dilambangkan Kepala Banteng, simbol musyawarah rakyat." },
      { id:"w3", pertanyaan:"Pasal UUD 1945 yang mengatur TNI adalah...", pilihan:["Pasal 27","Pasal 28","Pasal 29","Pasal 30"], jawaban:3, pembahasan:"Pasal 30 UUD 1945 mengatur pertahanan dan keamanan negara termasuk TNI dan Polri." },
      { id:"w4", pertanyaan:"Doktrin dasar TNI 'empat kewajiban satu tujuan' adalah...", pilihan:["Sapta Marga","Tri Ubaya Sakti","Catur Dharma Eka Karma","Tri Dharma TNI"], jawaban:2, pembahasan:"Catur Dharma Eka Karma (Cadek): catur=empat, dharma=kewajiban, eka=satu, karma=tujuan." },
      { id:"w5", pertanyaan:"Semboyan TNI AL 'Jalesveva Jayamahe' artinya...", pilihan:["Di udara kita jaya","Di darat kita kuat","Di lautan kita jaya","Maju tak gentar"], jawaban:2, pembahasan:"Jalesveva Jayamahe (Sanskrit) = Di lautan kita jaya, kebanggaan TNI AL." },
      { id:"w6", pertanyaan:"UU TNI yang berlaku saat ini adalah...", pilihan:["UU No. 2/2002","UU No. 34/2004","UU No. 3/2002","UU No. 5/2004"], jawaban:1, pembahasan:"UU No. 34 Tahun 2004 tentang Tentara Nasional Indonesia adalah landasan hukum TNI." },
      { id:"w7", pertanyaan:"Sapta Marga TNI terdiri dari berapa poin?", pilihan:["5","6","7","8"], jawaban:2, pembahasan:"Sapta Marga = 7 poin kode etik dan pedoman hidup prajurit TNI." },
      { id:"w8", pertanyaan:"Sistem pertahanan Indonesia yang bersifat semesta disebut...", pilihan:["Sishankamnas","Sishankamrata","Sishanrata","Hanneg"], jawaban:1, pembahasan:"Sishankamrata (Sistem Pertahanan Keamanan Rakyat Semesta) melibatkan seluruh komponen bangsa." },
      { id:"w9", pertanyaan:"Indonesia memiliki berapa provinsi saat ini (2025)?", pilihan:["34","36","37","38"], jawaban:3, pembahasan:"Per 2025 Indonesia memiliki 38 provinsi setelah pemekaran Papua menjadi beberapa provinsi baru." },
      { id:"w10", pertanyaan:"Hari TNI diperingati setiap tanggal...", pilihan:["17 Agustus","5 Oktober","10 November","1 Juni"], jawaban:1, pembahasan:"Hari TNI 5 Oktober merujuk pembentukan TKR pada 5 Oktober 1945." },
      { id:"w11", pertanyaan:"Komponen cadangan pertahanan negara diatur dalam UU...", pilihan:["UU No. 3/2002","UU No. 23/2019","UU No. 34/2004","UU No. 2/2002"], jawaban:1, pembahasan:"UU No. 23 Tahun 2019 tentang PSDN mengatur komponen cadangan dan pendukung pertahanan." },
      { id:"w12", pertanyaan:"Wawasan Nusantara memandang Indonesia sebagai...", pilihan:["Kepulauan terpisah","Satu kesatuan darat laut udara","Hanya wilayah daratan","Hanya wilayah lautan"], jawaban:1, pembahasan:"Wawasan Nusantara: Indonesia satu kesatuan wilayah darat, laut, udara yang tidak terpisahkan." },
      { id:"w13", pertanyaan:"Semboyan TNI AU 'Swa Bhuwana Paksa' artinya...", pilihan:["Di lautan kita jaya","Sayap Tanah Air","Di darat kita kuat","Garuda Pancasila"], jawaban:1, pembahasan:"Swa Bhuwana Paksa = Sayap Tanah Air, semboyan kebanggan TNI AU." },
      { id:"w14", pertanyaan:"Bhineka Tunggal Ika berasal dari kitab...", pilihan:["Mahabharata","Ramayana","Sutasoma","Negarakertagama"], jawaban:2, pembahasan:"Bhineka Tunggal Ika berasal dari Kitab Sutasoma karangan Mpu Tantular masa Majapahit abad ke-14." },
      { id:"w15", pertanyaan:"Kode etik prajurit TNI yang berisi 8 kewajiban disebut...", pilihan:["Sapta Marga","Sumpah Prajurit","8 Wajib TNI","Catur Dharma Eka Karma"], jawaban:2, pembahasan:"8 Wajib TNI adalah kode etik berisi 8 kewajiban prajurit TNI dalam bersikap dan berperilaku di masyarakat." },
      { id:"w16", pertanyaan:"Sidang PPKI pertama yang mengesahkan UUD 1945 berlangsung pada...", pilihan:["17 Agustus 1945","18 Agustus 1945","19 Agustus 1945","22 Agustus 1945"], jawaban:1, pembahasan:"PPKI bersidang pertama kali 18 Agustus 1945, mengesahkan UUD 1945, memilih Presiden dan Wakil Presiden." },
      { id:"w17", pertanyaan:"TNI terdiri dari tiga angkatan. Yang BUKAN angkatan TNI adalah...", pilihan:["TNI AD","TNI AL","TNI AU","TNI AP"], jawaban:3, pembahasan:"TNI terdiri dari Angkatan Darat (AD), Angkatan Laut (AL), dan Angkatan Udara (AU). TNI AP tidak ada." },
      { id:"w18", pertanyaan:"Markas Besar TNI terletak di...", pilihan:["Jakarta Pusat","Cilangkap, Jakarta Timur","Bandung","Bogor"], jawaban:1, pembahasan:"Markas Besar TNI (Mabes TNI) terletak di Cilangkap, Jakarta Timur." },
      { id:"w19", pertanyaan:"Tugas pokok TNI sesuai UU No.34/2004 adalah...", pilihan:["Menjaga ketertiban umum","Menegakkan hukum","Mempertahankan kedaulatan negara","Melindungi hak asasi manusia"], jawaban:2, pembahasan:"Tugas pokok TNI adalah menegakkan kedaulatan negara, mempertahankan keutuhan wilayah NKRI, dan melindungi segenap bangsa." },
      { id:"w20", pertanyaan:"Sumpah Prajurit TNI diucapkan di hadapan...", pilihan:["Panglima TNI","Presiden RI","Al-Quran/Kitab Suci","Bendera Merah Putih"], jawaban:2, pembahasan:"Sumpah Prajurit diucapkan di hadapan Al-Quran atau Kitab Suci sesuai agama masing-masing, sebagai ikrar sakral." }
    ]
  },
  matematika: {
    nama: "Matematika",
    soal: [
      { id:"m1", pertanyaan:"Pasukan 240 prajurit, 35% dikirim misi. Sisa prajurit...", pilihan:["84","156","160","176"], jawaban:1, pembahasan:"Dikirim = 35%x240 = 84. Sisa = 240-84 = 156." },
      { id:"m2", pertanyaan:"Deret geometri: 3, 6, 12, 24, 48. Suku ke-8 adalah...", pilihan:["192","384","768","96"], jawaban:1, pembahasan:"Rasio=2. U8 = 3x2^7 = 3x128 = 384." },
      { id:"m3", pertanyaan:"Jika 4x - 7 = 2x + 9, nilai x adalah...", pilihan:["6","7","8","9"], jawaban:2, pembahasan:"4x-2x = 9+7 → 2x=16 → x=8." },
      { id:"m4", pertanyaan:"Luas persegi panjang 48 cm², panjang 8 cm. Kelilingnya...", pilihan:["22 cm","28 cm","36 cm","40 cm"], jawaban:1, pembahasan:"Lebar=48/8=6. Keliling=2(8+6)=28 cm." },
      { id:"m5", pertanyaan:"Rata-rata 5 prajurit = 78. Prajurit ke-6 = 84. Rata-rata baru...", pilihan:["79","80","81","82"], jawaban:0, pembahasan:"Total lama=5x78=390. Total baru=390+84=474. Rata=474/6=79." },
      { id:"m6", pertanyaan:"Truk menempuh 360 km dalam 4.5 jam. Kecepatan rata-rata...", pilihan:["70 km/jam","75 km/jam","80 km/jam","85 km/jam"], jawaban:2, pembahasan:"v = 360/4.5 = 80 km/jam." },
      { id:"m7", pertanyaan:"FPB dari 84 dan 120 adalah...", pilihan:["6","12","24","36"], jawaban:1, pembahasan:"84=2²x3x7, 120=2³x3x5. FPB=2²x3=12." },
      { id:"m8", pertanyaan:"Volume kubus dengan rusuk 6 cm adalah...", pilihan:["36 cm³","108 cm³","216 cm³","256 cm³"], jawaban:2, pembahasan:"V=rusuk³=6³=216 cm³." },
      { id:"m9", pertanyaan:"Dari 10 prajurit dipilih 3 untuk misi. Berapa cara?", pilihan:["120","210","360","720"], jawaban:0, pembahasan:"C(10,3)=10!/(3!7!)=(10x9x8)/(6)=120." },
      { id:"m10", pertanyaan:"Harga Rp8.000.000 naik 12.5%. Harga baru...", pilihan:["Rp8.800.000","Rp9.000.000","Rp9.200.000","Rp9.500.000"], jawaban:1, pembahasan:"Naik=12.5%x8.000.000=1.000.000. Harga baru=9.000.000." },
      { id:"m11", pertanyaan:"Jika sin30°=0.5, nilai 4sin30° + 2cos60° adalah...", pilihan:["3","4","5","6"], jawaban:0, pembahasan:"cos60°=0.5. Maka 4(0.5)+2(0.5)=2+1=3." },
      { id:"m12", pertanyaan:"Persentase 45 dari 180 adalah...", pilihan:["20%","22%","25%","28%"], jawaban:2, pembahasan:"45/180 x 100% = 25%." },
      { id:"m13", pertanyaan:"Sebuah tangki diisi 2/3 penuh = 48 liter. Kapasitas penuh tangki...", pilihan:["60 liter","64 liter","72 liter","80 liter"], jawaban:2, pembahasan:"2/3 x kapasitas = 48. Kapasitas = 48 x 3/2 = 72 liter." },
      { id:"m14", pertanyaan:"Jika p = 3 dan q = -2, nilai 2p² - 3q adalah...", pilihan:["12","18","24","30"], jawaban:1, pembahasan:"2(3²) - 3(-2) = 2(9) + 6 = 18 + 6 = 24. Jawaban: 24." },
      { id:"m15", pertanyaan:"Kecepatan rata-rata = 60 km/jam. Jarak 150 km ditempuh dalam...", pilihan:["2 jam","2,5 jam","3 jam","3,5 jam"], jawaban:1, pembahasan:"t = jarak/kecepatan = 150/60 = 2,5 jam." },
      { id:"m16", pertanyaan:"Sebuah lingkaran berdiameter 14 cm. Luasnya (π=22/7)...", pilihan:["154 cm²","164 cm²","174 cm²","184 cm²"], jawaban:0, pembahasan:"r=7. L=πr²=22/7 x 49 = 154 cm²." },
      { id:"m17", pertanyaan:"Deret aritmetika: 7, 11, 15, 19. Suku ke-10 adalah...", pilihan:["39","43","47","51"], jawaban:1, pembahasan:"a=7, b=4. U10 = 7 + 9(4) = 7 + 36 = 43." },
      { id:"m18", pertanyaan:"Jika 3x + 2y = 16 dan x - y = 2, nilai x + y adalah...", pilihan:["4","5","6","7"], jawaban:2, pembahasan:"Dari x-y=2: x=y+2. Sub: 3(y+2)+2y=16 → 5y=10 → y=2, x=4. x+y=6." },
      { id:"m19", pertanyaan:"Berapa bilangan prima antara 20 dan 30?", pilihan:["1","2","3","4"], jawaban:1, pembahasan:"Bilangan prima 20-30: 23 dan 29. Ada 2 bilangan prima." },
      { id:"m20", pertanyaan:"Tabel: dari 40 prajurit, 60% lulus fisik, 75% dari yang lulus juga lulus akademik. Berapa lulus keduanya?", pilihan:["16","18","20","22"], jawaban:1, pembahasan:"TRIK CEPAT: Lulus fisik=60%x40=24. Lulus keduanya=75%x24=18. Tips: kerjakan bertahap, jangan langsung 60%x75%x40 tanpa bayangkan dulu." },
      { id:"mg1", pertanyaan:"Perhatikan bangun di bawah ini. Hitung luas daerah yang diarsir.", pilihan:["24 cm²","32 cm²","36 cm²","48 cm²"], jawaban:2, pembahasan:"TRIK CEPAT: Luas persegi besar = 8x8 = 64 cm². Luas 2 segitiga putih = 2 x (1/2 x 4 x 7) = 28 cm². Daerah arsir = 64-28 = 36 cm². Tips: arsiran = total - bagian putih.", gambar:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' style='background:%23111'><rect x='20' y='20' width='160' height='160' fill='%234a90d9' stroke='%23fff' stroke-width='2'/><polygon points='20,20 100,160 20,180' fill='%23111'/><polygon points='180,20 180,180 80,180' fill='%23111'/><text x='100' y='15' fill='%23fff' font-size='12' text-anchor='middle'>8 cm</text><text x='8' y='105' fill='%23fff' font-size='12' text-anchor='middle'>8 cm</text></svg>" },
      { id:"mg2", pertanyaan:"Deret gambar berikut mengikuti pola. Gambar ke-5 adalah...", pilihan:["Segitiga","Lingkaran","Persegi","Bintang"], jawaban:1, pembahasan:"TRIK CEPAT: Pola berulang: Segitiga→Lingkaran→Persegi→Segitiga→Lingkaran. Gambar ke-5 adalah Lingkaran. Tips: cari panjang siklus dulu, lalu posisi = (n-1) mod siklus.", gambar:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='80' style='background:%23111'><polygon points='25,65 45,25 65,65' fill='none' stroke='%234a90d9' stroke-width='2'/><circle cx='105' cy='45' r='20' fill='none' stroke='%234a90d9' stroke-width='2'/><rect x='145' y='25' width='40' height='40' fill='none' stroke='%234a90d9' stroke-width='2'/><polygon points='225,65 245,25 265,65' fill='none' stroke='%234a90d9' stroke-width='2'/><text x='25' y='15' fill='%23aaa' font-size='11'>1</text><text x='95' y='15' fill='%23aaa' font-size='11'>2</text><text x='155' y='15' fill='%23aaa' font-size='11'>3</text><text x='225' y='15' fill='%23aaa' font-size='11'>4</text></svg>" }
    ]
  },
  bahasa_inggris: {
    nama: "Bahasa Inggris",
    soal: [
      { id:"e1", pertanyaan:"The military commander _____ his troops before the mission.", pilihan:["briefed","brief","briefs","was brief"], jawaban:0, pembahasan:"Past tense digunakan karena 'before the mission' menunjukkan kejadian lampau." },
      { id:"e2", pertanyaan:"Word closest in meaning to 'valiant':", pilihan:["cowardly","brave","weak","careless"], jawaban:1, pembahasan:"Valiant = gagah berani. Sinonim: brave (berani)." },
      { id:"e3", pertanyaan:"The soldiers are trained to _____ under any circumstances.", pilihan:["surviving","survived","survive","survives"], jawaban:2, pembahasan:"'to' + bare infinitive. 'to survive' adalah bentuk yang benar." },
      { id:"e4", pertanyaan:"'Swa Bhuwana Paksa' means:", pilihan:["At sea we are glorious","Wings of the Motherland","On the Ground We Stand","Victory at All Cost"], jawaban:1, pembahasan:"Swa Bhuwana Paksa = Wings of the Motherland, semboyan TNI AU." },
      { id:"e5", pertanyaan:"If I _____ the training, I would have qualified.", pilihan:["complete","completed","had completed","have completed"], jawaban:2, pembahasan:"Conditional type 3: If + had + V3, would have + V3." },
      { id:"e6", pertanyaan:"The report _____ by the intelligence officer yesterday.", pilihan:["submitted","was submitted","has submitted","is submitted"], jawaban:1, pembahasan:"Passive voice past tense: was/were + V3. 'yesterday' = lampau." },
      { id:"e7", pertanyaan:"Antonym of 'hostile':", pilihan:["aggressive","friendly","dangerous","military"], jawaban:1, pembahasan:"Hostile = bermusuhan. Antonim: friendly (bersahabat)." },
      { id:"e8", pertanyaan:"_____ the heavy rain, the troops continued their patrol.", pilihan:["Because","Although","Despite","However"], jawaban:2, pembahasan:"'Despite' + noun phrase. 'Although' butuh clause lengkap." },
      { id:"e9", pertanyaan:"'Reconnaissance' in military context means:", pilihan:["A type of weapon","Observation of enemy territory","Military rank","Combat training"], jawaban:1, pembahasan:"Reconnaissance = pengintaian, observasi wilayah musuh." },
      { id:"e10", pertanyaan:"She asked me where _____ stationed.", pilihan:["was I","I was","am I","I am"], jawaban:1, pembahasan:"Dalam indirect speech, susunan normal: subject + verb. 'where I was'." },
      { id:"e11", pertanyaan:"Choose the correct sentence:", pilihan:["The general don't agree","The general doesn't agrees","The general doesn't agree","The general not agree"], jawaban:2, pembahasan:"Subjek tunggal + doesn't + V1. 'doesn't agree' benar." },
      { id:"e12", pertanyaan:"The word 'integrity' means:", pilihan:["Physical strength","Moral wholeness and honesty","Military rank","Speed and agility"], jawaban:1, pembahasan:"Integrity = integritas, kejujuran dan prinsip moral yang kuat." },
      { id:"e13", pertanyaan:"The commander ordered his troops _____ their positions.", pilihan:["hold","to hold","holding","held"], jawaban:1, pembahasan:"'ordered + object + to + V1'. Correct: ordered them to hold." },
      { id:"e14", pertanyaan:"Word opposite in meaning to 'mandatory':", pilihan:["compulsory","required","optional","essential"], jawaban:2, pembahasan:"Mandatory = wajib. Antonim: optional (pilihan/tidak wajib)." },
      { id:"e15", pertanyaan:"The troops _____ in the jungle for three days before rescue arrived.", pilihan:["survive","survived","had survived","have survive"], jawaban:2, pembahasan:"Past perfect: had + V3 untuk kejadian sebelum kejadian lampau lain." },
      { id:"e16", pertanyaan:"'Logistics' in military operations refers to:", pilihan:["Combat strategy","Supply and transport management","Intelligence gathering","Weapons design"], jawaban:1, pembahasan:"Logistics = manajemen pasokan, transportasi, dan distribusi dalam operasi militer." },
      { id:"e17", pertanyaan:"_____ soldier trains hard, _____ he will be prepared.", pilihan:["If a / but","Although a / yet","The more a / the more","If a / the more"], jawaban:0, pembahasan:"'If + present simple, will + V1' adalah struktur conditional type 1 yang benar." },
      { id:"e18", pertanyaan:"The word 'fortify' means:", pilihan:["To weaken","To strengthen a position","To retreat","To surrender"], jawaban:1, pembahasan:"Fortify = memperkuat posisi pertahanan atau struktur militer." },
      { id:"e19", pertanyaan:"Choose the grammatically correct sentence:", pilihan:["Each soldiers must carry their weapon","Each soldier must carry his weapon","Each soldier must carries his weapon","Each soldiers must carries their weapon"], jawaban:1, pembahasan:"'Each' + singular noun + singular verb. 'Each soldier must carry' benar." },
      { id:"e20", pertanyaan:"'The mission was accomplished' is an example of:", pilihan:["Active voice","Passive voice","Direct speech","Indirect speech"], jawaban:1, pembahasan:"Passive voice: be + V3. 'was accomplished' = pasif." }
    ]
  },
  penalaran_logika: {
    nama: "Penalaran & Logika",
    soal: [
      { id:"l1", pertanyaan:"Semua prajurit TNI disiplin. Budi prajurit TNI. Kesimpulan:", pilihan:["Budi mungkin disiplin","Budi tidak disiplin","Budi pasti disiplin","Tidak bisa disimpulkan"], jawaban:2, pembahasan:"Silogisme valid: premis mayor + minor valid → Budi pasti disiplin." },
      { id:"l2", pertanyaan:"Deret: 2, 5, 10, 17, 26, ... Angka berikutnya...", pilihan:["35","36","37","38"], jawaban:2, pembahasan:"Selisih: +3,+5,+7,+9,+11. Maka 26+11=37." },
      { id:"l3", pertanyaan:"Beberapa dokter adalah tentara. Semua tentara sehat. Maka:", pilihan:["Semua dokter sehat","Beberapa dokter sehat","Tidak ada dokter sehat","Semua tentara adalah dokter"], jawaban:1, pembahasan:"Beberapa dokter = tentara, semua tentara sehat → beberapa dokter sehat." },
      { id:"l4", pertanyaan:"Deret huruf: B, D, G, K, P. Huruf berikutnya...", pilihan:["U","V","W","X"], jawaban:1, pembahasan:"Selisih posisi: +2,+3,+4,+5,+6. P(16)+6=V(22)." },
      { id:"l5", pertanyaan:"Regu A lebih kuat dari B. C lebih lemah dari B. Urutan terkuat:", pilihan:["A,B,C","A,C,B","B,A,C","C,B,A"], jawaban:0, pembahasan:"A>B, B>C → urutan: A, B, C." },
      { id:"l6", pertanyaan:"Jika 5 hari pasukan tempuh 200km, 8 hari menempuh...", pilihan:["280km","300km","320km","350km"], jawaban:2, pembahasan:"Per hari=200/5=40km. 8 hari=8x40=320km." },
      { id:"l7", pertanyaan:"Kode: 1=A, 2=B. TENTARA dalam angka...", pilihan:["20-5-14-20-1-18-1","19-5-14-20-1-18-1","20-4-14-20-1-18-1","20-5-13-20-1-18-1"], jawaban:0, pembahasan:"T=20,E=5,N=14,T=20,A=1,R=18,A=1 → 20-5-14-20-1-18-1." },
      { id:"l8", pertanyaan:"Jika tidak lulus fisik maka tidak jadi perwira. Andi lulus fisik. Maka:", pilihan:["Andi pasti jadi perwira","Andi tidak jadi perwira","Andi mungkin jadi perwira","Tidak bisa disimpulkan"], jawaban:3, pembahasan:"Lulus fisik = syarat perlu, bukan cukup. Masih ada syarat lain. Tidak bisa ditentukan." },
      { id:"l9", pertanyaan:"Deret: 100, 90, 81, 73, 66. Angka berikutnya...", pilihan:["58","59","60","61"], jawaban:2, pembahasan:"Selisih: -10,-9,-8,-7,-6. 66-6=60." },
      { id:"l10", pertanyaan:"BESAR:KECIL = BERANI:...", pilihan:["Kuat","Penakut","Cepat","Bijak"], jawaban:1, pembahasan:"Besar-Kecil adalah antonim. Antonim Berani adalah Penakut." },
      { id:"l11", pertanyaan:"Deret: A, C, F, J, O. Huruf berikutnya...", pilihan:["T","U","V","W"], jawaban:1, pembahasan:"Selisih posisi: +2,+3,+4,+5,+6. O(15)+6=U(21)." },
      { id:"l12", pertanyaan:"Semua perwira lulus akademi. Budi lulus akademi. Kesimpulan:", pilihan:["Budi pasti perwira","Budi bukan perwira","Budi mungkin perwira","Tidak bisa disimpulkan"], jawaban:3, pembahasan:"Lulus akademi = syarat perlu, bukan cukup untuk jadi perwira. Kesimpulan tidak bisa ditentukan." },
      { id:"l13", pertanyaan:"Deret: 1, 4, 9, 16, 25, 36. Suku ke-8 adalah...", pilihan:["49","56","64","72"], jawaban:2, pembahasan:"Ini adalah deret kuadrat: 1²,2²,3²,4²,5²,6². Suku ke-8 = 8² = 64." },
      { id:"l14", pertanyaan:"Jika hari ini Senin, 100 hari lagi adalah hari...", pilihan:["Senin","Selasa","Rabu","Kamis"], jawaban:2, pembahasan:"100 = 14x7 + 2. Sisa 2 hari dari Senin = Rabu." },
      { id:"l15", pertanyaan:"Regu A lebih cepat dari B. D lebih lambat dari C. C lebih cepat dari B. Urutan tercepat:", pilihan:["A,C,B,D","A,C,D,B","C,A,B,D","C,A,D,B"], jawaban:0, pembahasan:"A>B, C>B, D<C. Belum bisa bandingkan A dan C secara pasti. Namun D<C dan A>B,C>B. Urutan: A,C,B,D." },
      { id:"l16", pertanyaan:"Kode: PERWIRA = QFSXJSB. Kode TENTARA adalah...", pilihan:["UFOUFSB","UFOUBSB","UFOUBTB","UFOUFSB"], jawaban:0, pembahasan:"Setiap huruf digeser +1. T+1=U, E+1=F, N+1=O, T+1=U, A+1=B, R+1=S, A+1=B → UFOUTSB. Pilihan: UFOUFSB." },
      { id:"l17", pertanyaan:"Tidak ada prajurit yang penakut. Andi penakut. Maka:", pilihan:["Andi mungkin prajurit","Andi bukan prajurit","Andi prajurit terlatih","Tidak bisa disimpulkan"], jawaban:1, pembahasan:"Tidak ada prajurit yang penakut → semua penakut bukan prajurit. Andi penakut → Andi bukan prajurit." },
      { id:"l18", pertanyaan:"Deret: 2, 3, 5, 8, 13, 21. Suku berikutnya...", pilihan:["31","33","34","35"], jawaban:2, pembahasan:"Fibonacci: setiap suku = jumlah dua suku sebelumnya. 13+21=34." },
      { id:"l19", pertanyaan:"Jika semua A adalah B, dan semua B adalah C, maka:", pilihan:["Semua C adalah A","Semua A adalah C","Beberapa C adalah A","Semua B adalah A"], jawaban:1, pembahasan:"Silogisme transitif: A→B, B→C, maka A→C. Semua A adalah C." },
      { id:"l20", pertanyaan:"Dalam kotak ada 3 bola merah, 4 biru, 5 hijau. Ambil 1 acak. Peluang merah:", pilihan:["1/4","3/12","1/3","3/4"], jawaban:1, pembahasan:"Total 12 bola. P(merah) = 3/12 = 1/4. Jawaban 3/12 sama dengan 1/4." },
      { id:"lg1", pertanyaan:"Perhatikan pola matriks 3x3 berikut. Angka yang menggantikan tanda '?' adalah...", pilihan:["6","8","9","12"], jawaban:2, pembahasan:"TRIK CEPAT: Lihat setiap baris — jumlah angka di baris 1: 2+4+6=12, baris 2: 3+6+9=18. Pola: tiap baris kelipatan. Baris 3: 3+6+?=18, jadi ?=9. Tips: cari pola baris DAN kolom sebelum menjawab.", gambar:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' style='background:%23111'><rect x='10' y='10' width='180' height='180' fill='none' stroke='%234a90d9' stroke-width='2'/><line x1='70' y1='10' x2='70' y2='190' stroke='%234a90d9' stroke-width='1'/><line x1='130' y1='10' x2='130' y2='190' stroke='%234a90d9' stroke-width='1'/><line x1='10' y1='70' x2='190' y2='70' stroke='%234a90d9' stroke-width='1'/><line x1='10' y1='130' x2='190' y2='130' stroke='%234a90d9' stroke-width='1'/><text x='40' y='48' fill='%23fff' font-size='20' text-anchor='middle'>2</text><text x='100' y='48' fill='%23fff' font-size='20' text-anchor='middle'>4</text><text x='160' y='48' fill='%23fff' font-size='20' text-anchor='middle'>6</text><text x='40' y='108' fill='%23fff' font-size='20' text-anchor='middle'>3</text><text x='100' y='108' fill='%23fff' font-size='20' text-anchor='middle'>6</text><text x='160' y='108' fill='%23fff' font-size='20' text-anchor='middle'>9</text><text x='40' y='168' fill='%23fff' font-size='20' text-anchor='middle'>3</text><text x='100' y='168' fill='%23fff' font-size='20' text-anchor='middle'>6</text><text x='160' y='168' fill='%23ffd700' font-size='24' text-anchor='middle'>?</text></svg>" },
      { id:"lg2", pertanyaan:"Perhatikan pola gambar berikut. Bentuk ke-4 memiliki berapa kotak hitam?", pilihan:["9","12","16","25"], jawaban:2, pembahasan:"TRIK CEPAT: Pola: bentuk 1=1 kotak, bentuk 2=4 kotak, bentuk 3=9 kotak. Ini pola n². Bentuk ke-4 = 4²=16. Tips: soal pola bangun = cek pola kuadrat/segitiga dulu.", gambar:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='80' style='background:%23111'><rect x='10' y='30' width='20' height='20' fill='%234a90d9'/><text x='20' y='65' fill='%23aaa' font-size='11' text-anchor='middle'>1</text><rect x='55' y='20' width='20' height='20' fill='%234a90d9'/><rect x='75' y='20' width='20' height='20' fill='%234a90d9'/><rect x='55' y='40' width='20' height='20' fill='%234a90d9'/><rect x='75' y='40' width='20' height='20' fill='%234a90d9'/><text x='75' y='70' fill='%23aaa' font-size='11' text-anchor='middle'>2</text><rect x='120' y='15' width='20' height='20' fill='%234a90d9'/><rect x='140' y='15' width='20' height='20' fill='%234a90d9'/><rect x='160' y='15' width='20' height='20' fill='%234a90d9'/><rect x='120' y='35' width='20' height='20' fill='%234a90d9'/><rect x='140' y='35' width='20' height='20' fill='%234a90d9'/><rect x='160' y='35' width='20' height='20' fill='%234a90d9'/><rect x='120' y='55' width='20' height='20' fill='%234a90d9'/><rect x='140' y='55' width='20' height='20' fill='%234a90d9'/><rect x='160' y='55' width='20' height='20' fill='%234a90d9'/><text x='145' y='78' fill='%23aaa' font-size='11' text-anchor='middle'>3</text><text x='230' y='45' fill='%23ffd700' font-size='40' text-anchor='middle'>?</text><text x='230' y='70' fill='%23aaa' font-size='11' text-anchor='middle'>4</text></svg>" }
    ]
  },
  numerik: {
    nama: "Kemampuan Numerik",
    soal: [
      { id:"n1", pertanyaan:"1248 + 763 - 459 = ...", pilihan:["1542","1552","1562","1572"], jawaban:1, pembahasan:"1248+763=2011. 2011-459=1552." },
      { id:"n2", pertanyaan:"78 x 23 = ...", pilihan:["1784","1794","1804","1814"], jawaban:1, pembahasan:"78x23=78x20+78x3=1560+234=1794." },
      { id:"n3", pertanyaan:"4896 / 48 = ...", pilihan:["96","98","100","102"], jawaban:3, pembahasan:"48x100=4800, sisa 96. 96/48=2. Jadi 102." },
      { id:"n4", pertanyaan:"3/8 + 5/6 = ...", pilihan:["8/14","8/24","29/24","31/24"], jawaban:2, pembahasan:"KPK 8,6=24. 3/8=9/24, 5/6=20/24. Total=29/24." },
      { id:"n5", pertanyaan:"Akar dari 2025 = ...", pilihan:["40","42","43","45"], jawaban:3, pembahasan:"45x45=2025. Cek: 45²=2025." },
      { id:"n6", pertanyaan:"25% dari 840 + 40% dari 450 = ...", pilihan:["390","400","410","420"], jawaban:0, pembahasan:"25%x840=210. 40%x450=180. Total=390." },
      { id:"n7", pertanyaan:"2^8 / 2^3 = ...", pilihan:["2^2","2^5","2^11","2^24"], jawaban:1, pembahasan:"a^m/a^n = a^(m-n). 2^8/2^3 = 2^5 = 32." },
      { id:"n8", pertanyaan:"Jika x:y = 3:5 dan x+y = 80, nilai y adalah...", pilihan:["30","40","50","60"], jawaban:2, pembahasan:"x=3k,y=5k. 8k=80,k=10. y=50." },
      { id:"n9", pertanyaan:"Rata-rata 5 angka = 20. Jumlahnya...", pilihan:["90","95","100","105"], jawaban:2, pembahasan:"Jumlah = rata-rata x banyak = 20x5=100." },
      { id:"n10", pertanyaan:"0.125 x 0.8 = ...", pilihan:["0.001","0.01","0.1","1.0"], jawaban:2, pembahasan:"1/8 x 4/5 = 4/40 = 0.1." },
      { id:"n11", pertanyaan:"567 + 893 - 234 = ...", pilihan:["1126","1226","1236","1246"], jawaban:1, pembahasan:"567+893=1460. 1460-234=1226. TRIK CEPAT: Hitung penjumlahan dulu, baru kurangkan." },
      { id:"n12", pertanyaan:"144 / 12 x 3 = ...", pilihan:["24","36","48","54"], jawaban:1, pembahasan:"144/12=12. 12x3=36." },
      { id:"n13", pertanyaan:"2/5 + 3/4 = ...", pilihan:["5/9","23/20","5/20","1/2"], jawaban:1, pembahasan:"KPK 5,4=20. 2/5=8/20, 3/4=15/20. Total=23/20." },
      { id:"n14", pertanyaan:"15% dari 2400 = ...", pilihan:["320","340","360","380"], jawaban:2, pembahasan:"15/100 x 2400 = 360." },
      { id:"n15", pertanyaan:"3^4 - 2^5 = ...", pilihan:["49","50","51","52"], jawaban:0, pembahasan:"3^4=81. 2^5=32. 81-32=49." },
      { id:"n16", pertanyaan:"Jika a = 7 dan b = 3, nilai a² - b² = ...", pilihan:["30","40","50","60"], jawaban:1, pembahasan:"a²=49, b²=9. 49-9=40." },
      { id:"n17", pertanyaan:"0.75 + 1/4 + 25% = ...", pilihan:["1.0","1.25","1.5","1.75"], jawaban:1, pembahasan:"0.75 + 0.25 + 0.25 = 1.25. Konversi: 1/4=0.25, 25%=0.25. Total=0.75+0.25+0.25=1.25." },
      { id:"n18", pertanyaan:"KPK dari 12, 15, dan 20 adalah...", pilihan:["40","50","60","120"], jawaban:2, pembahasan:"12=2²x3, 15=3x5, 20=2²x5. KPK=2²x3x5=60." },
      { id:"n19", pertanyaan:"Berapa persen 75 dari 300?", pilihan:["20%","25%","30%","35%"], jawaban:1, pembahasan:"75/300 x 100% = 25%." },
      { id:"n20", pertanyaan:"1001 x 11 = ...", pilihan:["10011","11001","11011","11111"], jawaban:2, pembahasan:"TRIK CEPAT: 1001 x 11 = 1001 x 10 + 1001 = 10010 + 1001 = 11011. Tips perkalian 11: gandakan angka lalu geser." },
      { id:"ng1", pertanyaan:"Perhatikan tabel data berikut. Nilai rata-rata seluruh data adalah...", pilihan:["6","7","8","9"], jawaban:1, pembahasan:"TRIK CEPAT: Jumlah semua nilai = 4+5+6+7+8+9+10 = 49. Banyak data = 7. Rata-rata = 49/7 = 7. Tips: kalau deret beraturan, rata-rata = nilai tengah.", gambar:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='140' style='background:%23111'><rect x='10' y='10' width='200' height='120' fill='none' stroke='%234a90d9' stroke-width='1'/><line x1='10' y1='40' x2='210' y2='40' stroke='%234a90d9' stroke-width='1'/><line x1='80' y1='10' x2='80' y2='130' stroke='%234a90d9' stroke-width='1'/><text x='40' y='30' fill='%23ffd700' font-size='13' text-anchor='middle' font-weight='bold'>Data</text><text x='150' y='30' fill='%23ffd700' font-size='13' text-anchor='middle' font-weight='bold'>Nilai</text><text x='40' y='58' fill='%23fff' font-size='12' text-anchor='middle'>A</text><text x='150' y='58' fill='%23fff' font-size='12' text-anchor='middle'>4</text><text x='40' y='75' fill='%23fff' font-size='12' text-anchor='middle'>B</text><text x='150' y='75' fill='%23fff' font-size='12' text-anchor='middle'>6</text><text x='40' y='92' fill='%23fff' font-size='12' text-anchor='middle'>C</text><text x='150' y='92' fill='%23fff' font-size='12' text-anchor='middle'>7</text><text x='40' y='109' fill='%23fff' font-size='12' text-anchor='middle'>D</text><text x='150' y='109' fill='%23fff' font-size='12' text-anchor='middle'>9</text><text x='40' y='126' fill='%23fff' font-size='12' text-anchor='middle'>E</text><text x='150' y='126' fill='%23fff' font-size='12' text-anchor='middle'>9</text></svg>" },
      { id:"ng2", pertanyaan:"Grafik batang menunjukkan nilai 5 prajurit. Prajurit dengan nilai tertinggi adalah...", pilihan:["Alfa","Bravo","Charlie","Delta"], jawaban:2, pembahasan:"TRIK CEPAT: Baca grafik batang dari kiri ke kanan. Batang tertinggi = Charlie (90). Tips: soal grafik = scan visual dulu, cari batang/garis tertinggi/terendah.", gambar:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='150' style='background:%23111'><line x1='30' y1='10' x2='30' y2='120' stroke='%234a90d9' stroke-width='1'/><line x1='30' y1='120' x2='250' y2='120' stroke='%234a90d9' stroke-width='1'/><rect x='40' y='80' width='28' height='40' fill='%234a90d9'/><rect x='85' y='60' width='28' height='60' fill='%234a90d9'/><rect x='130' y='30' width='28' height='90' fill='%23ffd700'/><rect x='175' y='50' width='28' height='70' fill='%234a90d9'/><rect x='220' y='70' width='28' height='50' fill='%234a90d9'/><text x='54' y='135' fill='%23aaa' font-size='9' text-anchor='middle'>Alfa</text><text x='99' y='135' fill='%23aaa' font-size='9' text-anchor='middle'>Bravo</text><text x='144' y='135' fill='%23ffd700' font-size='9' text-anchor='middle'>Charlie</text><text x='189' y='135' fill='%23aaa' font-size='9' text-anchor='middle'>Delta</text><text x='234' y='135' fill='%23aaa' font-size='9' text-anchor='middle'>Echo</text><text x='20' y='123' fill='%23aaa' font-size='9'>0</text><text x='16' y='80' fill='%23aaa' font-size='9'>50</text><text x='16' y='35' fill='%23aaa' font-size='9'>90</text></svg>" }
    ]
  },
  verbal: {
    nama: "Kemampuan Verbal",
    soal: [
      { id:"v1", pertanyaan:"PERWIRA:TNI = KOMISIONER:...", pilihan:["KPK","DPR","POLRI","BPK"], jawaban:2, pembahasan:"Perwira = pangkat di TNI. Komisioner = pangkat di Polri." },
      { id:"v2", pertanyaan:"Sinonim kata INTEGRITAS adalah...", pilihan:["Korupsi","Kejujuran","Kelemahan","Ketidakpastian"], jawaban:1, pembahasan:"Integritas = sifat jujur dan berprinsip moral. Sinonim: kejujuran." },
      { id:"v3", pertanyaan:"SENJATA:PRAJURIT = SKALPEL:...", pilihan:["Rumah Sakit","Obat","Dokter","Perawat"], jawaban:2, pembahasan:"Senjata alat kerja prajurit. Skalpel alat kerja dokter." },
      { id:"v4", pertanyaan:"Antonim kata OFENSIF adalah...", pilihan:["Agresif","Aktif","Defensif","Kooperatif"], jawaban:2, pembahasan:"Ofensif = menyerang. Antonim: defensif = bertahan." },
      { id:"v5", pertanyaan:"Penulisan BAKU menurut KBBI...", pilihan:["Nasehat","Praktek","Analisa","Metode"], jawaban:3, pembahasan:"Baku: Nasihat, Praktik, Analisis, Metode (sudah baku)." },
      { id:"v6", pertanyaan:"MILITER:BARAK = TAHANAN:...", pilihan:["Polisi","Pengadilan","Penjara","Jaksa"], jawaban:2, pembahasan:"Militer tinggal di barak. Tahanan di penjara." },
      { id:"v7", pertanyaan:"Kata GERILYA berarti...", pilihan:["Penyerangan besar-besaran","Perang terbuka","Perang sembunyi-sembunyi","Perang di laut"], jawaban:2, pembahasan:"Gerilya = teknik perang tidak konvensional, sembunyi-sembunyi, menyergap." },
      { id:"v8", pertanyaan:"BERANI:PENAKUT = DISIPLIN:...", pilihan:["Tertib","Ceroboh","Teratur","Rapi"], jawaban:1, pembahasan:"Berani-Penakut = antonim. Antonim Disiplin = Ceroboh." },
      { id:"v9", pertanyaan:"Kalimat BENAR secara tata bahasa...", pilihan:["Para prajurit-prajurit berlatih","Para prajurit berlatih setiap hari","Semua para prajurit hadir","Prajurit-prajurit semuanya ada"], jawaban:1, pembahasan:"Para sudah jamak, tidak perlu -prajurit. Benar: Para prajurit berlatih setiap hari." },
      { id:"v10", pertanyaan:"STRATEGI:TAKTIK = KEBIJAKAN:...", pilihan:["Peraturan","Hukum","Prosedur","Undang-undang"], jawaban:2, pembahasan:"Strategi=rencana besar, taktik=langkah pelaksanaan. Kebijakan=arahan, prosedur=langkah pelaksanaan." },
      { id:"v11", pertanyaan:"Sinonim kata PATRIOTISME adalah...", pilihan:["Pengkhianatan","Cinta tanah air","Kelemahan","Ketakutan"], jawaban:1, pembahasan:"Patriotisme = semangat cinta tanah air dan bangsa. Sinonim: cinta tanah air." },
      { id:"v12", pertanyaan:"KOMANDAN:PASUKAN = GURU:...", pilihan:["Sekolah","Buku","Murid","Ilmu"], jawaban:2, pembahasan:"Komandan memimpin pasukan. Guru memimpin/mengajar murid." },
      { id:"v13", pertanyaan:"Antonim kata STATIS adalah...", pilihan:["Tetap","Diam","Dinamis","Pasif"], jawaban:2, pembahasan:"Statis = tidak berubah, diam. Antonim: dinamis = bergerak, berubah." },
      { id:"v14", pertanyaan:"AKADEMI MILITER:PERWIRA = UNIVERSITAS:...", pilihan:["Profesor","Sarjana","Rektor","Mahasiswa"], jawaban:1, pembahasan:"Akademi Militer menghasilkan perwira. Universitas menghasilkan sarjana." },
      { id:"v15", pertanyaan:"Kata yang TIDAK baku menurut KBBI adalah...", pilihan:["Metode","Sistem","Nasehat","Teknik"], jawaban:2, pembahasan:"Penulisan baku: Nasihat (bukan Nasehat), Praktik (bukan Praktek), Analisis (bukan Analisa)." },
      { id:"v16", pertanyaan:"PRAJURIT:SENJATA = DOKTER:...", pilihan:["Rumah Sakit","Obat","Stetoskop","Pasien"], jawaban:2, pembahasan:"Senjata adalah alat kerja utama prajurit. Stetoskop adalah alat kerja utama dokter." },
      { id:"v17", pertanyaan:"Sinonim kata DEDIKASI adalah...", pilihan:["Kemalasan","Pengabdian","Ketidakpedulian","Penghindaran"], jawaban:1, pembahasan:"Dedikasi = pengabdian penuh, loyalitas terhadap tugas atau tujuan." },
      { id:"v18", pertanyaan:"Kalimat manakah yang menggunakan kata penghubung dengan TEPAT?", pilihan:["Dia datang karena meskipun hujan","Dia datang meskipun hujan deras","Dia datang tetapi karena hujan","Dia datang walaupun dan hujan"], jawaban:1, pembahasan:"'Meskipun' diikuti klausa subordinat. 'Meskipun hujan deras' benar secara tata bahasa." },
      { id:"v19", pertanyaan:"INISIATIF:PASIF = DISIPLIN:...", pilihan:["Tertib","Semangat","Ceroboh","Teratur"], jawaban:2, pembahasan:"Inisiatif-Pasif adalah antonim. Antonim Disiplin adalah Ceroboh (tidak disiplin)." },
      { id:"v20", pertanyaan:"Antonim kata PROMOSI adalah...", pilihan:["Kenaikan","Jabatan","Demosi","Reward"], jawaban:2, pembahasan:"Promosi = naik pangkat/jabatan. Antonim: demosi = turun pangkat/jabatan." }
    ]
  }
};

function getAllSoal() {
  var all = [];
  Object.keys(SOAL_DATABASE).forEach(function(k) {
    SOAL_DATABASE[k].soal.forEach(function(s) {
      all.push(Object.assign({}, s, { kategori: SOAL_DATABASE[k].nama }));
    });
  });
  return all;
}

// Tips dan Trik per kategori
const TIPS_DATA = {
  umum: {
    judul: "Strategi Umum Nilai Tinggi",
    tips: [
      { judul: "Eliminasi 2 Jawaban Salah", isi: "Di setiap soal, langsung eliminasi 2 pilihan yang jelas salah. Ini meningkatkan peluang dari 25% menjadi 50%." },
      { judul: "Kerjakan Yang Mudah Dulu", isi: "Saat tryout, skip soal sulit dan kerjakan yang mudah dulu. Kembali ke soal sulit di akhir dengan sisa waktu." },
      { judul: "Target Minimal 70%", isi: "Nilai lulus rata-rata 70. Target kamu minimal 80 untuk aman. Artinya dari 60 soal, minimal benar 48 soal." },
      { judul: "Manajemen Waktu 1.5 Menit/Soal", isi: "Rata-rata 90 detik per soal. Jika soal membingungkan lebih dari 60 detik, skip dan lanjut." },
      { judul: "Baca Soal Cermat", isi: "Kata 'KECUALI', 'BUKAN', 'TIDAK' sering jadi jebakan. Garis bawahi kata-kata kunci sebelum menjawab." }
    ]
  },
  tkw: {
    judul: "Tips Wawasan Kebangsaan (TWK)",
    tips: [
      { judul: "Hafal Tanggal Penting TNI", isi: "5 Oktober = Hari TNI, 17 Agustus = HUT RI, 18 Agustus = Pancasila disahkan, 28 Oktober = Sumpah Pemuda." },
      { judul: "Pahami Struktur TNI", isi: "TNI terdiri dari AD, AL, AU di bawah Panglima TNI. Polri terpisah di bawah Presiden langsung." },
      { judul: "Kuasai Doktrin TNI", isi: "Sapta Marga = 7 poin etika prajurit. Catur Dharma Eka Karma = doktrin dasar TNI. Ingat keduanya." },
      { judul: "Lambang Sila Pancasila", isi: "Sila 1=Bintang, Sila 2=Rantai, Sila 3=Pohon Beringin, Sila 4=Kepala Banteng, Sila 5=Padi+Kapas." },
      { judul: "Semboyan Matra TNI", isi: "TNI AD: Kartika Eka Paksi. TNI AL: Jalesveva Jayamahe. TNI AU: Swa Bhuwana Paksa." }
    ]
  },
  matematika: {
    judul: "Trik Cepat Matematika",
    tips: [
      { judul: "Persentase Cepat", isi: "10% = geser koma 1 digit kiri. 5% = setengah dari 10%. 25% = bagi 4. 50% = bagi 2. Kombinasikan untuk % lain." },
      { judul: "Perkalian 11", isi: "11 x AB = A(A+B)B. Contoh: 11 x 34 = 3(3+4)4 = 374. Berlaku jika A+B < 10." },
      { judul: "FPB dan KPK Cepat", isi: "Faktorkan keduanya. FPB = ambil faktor yang ADA DI KEDUANYA dengan pangkat terkecil. KPK = ambil SEMUA faktor dengan pangkat terbesar." },
      { judul: "Akar Kuadrat Estimasi", isi: "Cari angka kuadrat terdekat. Akar 50 antara akar 49=7 dan akar 64=8. Lebih dekat ke 7, jadi ~7.07." },
      { judul: "Soal Campuran/Konsinyasi", isi: "Buat tabel: harga beli, harga jual, untung/rugi. Visualisasi mencegah kesalahan hitung." }
    ]
  },
  bahasa_inggris: {
    judul: "Tips Bahasa Inggris",
    tips: [
      { judul: "Tenses Kunci", isi: "Past: 'yesterday, last, ago, when'. Present: 'now, always, every'. Future: 'tomorrow, will, going to'. Perfect: 'since, for, already, just'." },
      { judul: "Passive Voice Formula", isi: "S + is/am/are/was/were + V3 + by + agent. Kunci: lihat apakah subjek melakukan atau dikenai tindakan." },
      { judul: "Soal Sinonim/Antonim", isi: "Jika tidak tahu artinya, cari root word (asal kata). 'dis-' = tidak, 'un-' = tidak, '-ful' = penuh, '-less' = tanpa." },
      { judul: "Conditional Sentences", isi: "Type 1 (nyata): If+present, will+V1. Type 2 (tidak nyata sekarang): If+past, would+V1. Type 3 (tidak nyata lampau): If+had+V3, would+have+V3." },
      { judul: "Kosakata Militer Wajib", isi: "Reconnaissance=pengintaian, Integrity=integritas, Valor=keberanian, Deploy=mengerahkan, Mission=misi, Discipline=disiplin." }
    ]
  },
  penalaran_logika: {
    judul: "Trik Penalaran Logika",
    tips: [
      { judul: "Silogisme 3 Langkah", isi: "1) Identifikasi premis mayor (semua A adalah B). 2) Identifikasi premis minor (C adalah A). 3) Simpulan HARUS logis (C adalah B)." },
      { judul: "Deret Angka - Cari Pola", isi: "Cek selisih antar angka dulu. Jika selisih sama = aritmetika. Jika rasio sama = geometri. Jika selisih selisih sama = kuadratik." },
      { judul: "Analogi HURUF = POSISI", isi: "A=1, B=2, Z=26. Deret huruf biasanya mengikuti pola lompatan +1, +2, +3 atau kombinasi konsonan/vokal." },
      { judul: "Jangan Tambah Informasi", isi: "Soal logika hanya berdasarkan premis yang diberikan. Jangan gunakan pengetahuan umum di luar soal." },
      { judul: "Perbandingan Bertingkat", isi: "Jika A>B dan B>C, maka A>C (transitif). Buat garis urutan dari terbesar ke terkecil untuk memperjelas." }
    ]
  },
  numerik: {
    judul: "Teknik Numerik Cepat",
    tips: [
      { judul: "Penjumlahan Cepat", isi: "Bulatkan dulu ke angka mudah, lalu koreksi. 348+567 = 350+570 = 920, koreksi -2-3 = 915." },
      { judul: "Perkalian Dua Digit", isi: "AB x CD = (A x C)xx + (A x D + B x C)x + (B x D). Atau pakai FOIL seperti aljabar." },
      { judul: "Pembagian Cepat", isi: "Coba perkalian terbalik. 4896/48 = berapa x 48 = 4896? 48x100=4800, sisa 96. 96/48=2. Jadi 102." },
      { judul: "Pecahan ke Desimal", isi: "1/4=0.25, 1/3=0.33, 1/2=0.5, 2/3=0.67, 3/4=0.75. Hafal pecahan umum ini." },
      { judul: "Deteksi Pola Cepat", isi: "Dalam soal tes numerik, jangan hitung semua detail. Cek apakah hasilnya ganjil/genap, besar/kecil untuk eliminasi pilihan." }
    ]
  },
  verbal: {
    judul: "Tips Kemampuan Verbal",
    tips: [
      { judul: "Sinonim - Cari Akar Kata", isi: "Kata serapan Latin/Yunani punya pola. 'Patri-' = bapak/tanah air, 'mil-' = tentara, 'def-' = bertahan." },
      { judul: "Analogi - Tentukan Hubungan", isi: "Sebelum jawab, ucapkan dalam kalimat: 'A adalah [hubungan] dari B'. Contoh: Senjata adalah alat kerja Prajurit." },
      { judul: "KBBI Wajib Dihapal", isi: "Nasihat, Praktik, Analisis, Teknik, Jadwal, Metode, Sistem - ejaan bakunya beda dari yang umum dipakai." },
      { judul: "Para = Jamak Sudah", isi: "'Para' sudah berarti jamak. Jadi 'para prajurit-prajurit' salah. Yang benar 'para prajurit' atau 'prajurit-prajurit'." },
      { judul: "Antonim Taktis", isi: "Selalu cari pasangan antonim yang PALING berlawanan. Berani-Penakut lebih tepat dari Berani-Lemah." }
    ]
  }
};
