# -*- coding: utf-8 -*-
"""Soal tambahan v26: 20 soal reading comprehension Bahasa Inggris (4 bacaan x 5 soal)."""

BACAAN = {
    'A': ("The Indonesian Air Force operates airbases across the archipelago, from Aceh to Papua. "
          "Each airbase is responsible for guarding the airspace above its region. Because Indonesia "
          "is an archipelagic state, the air force also cooperates with the navy to protect the sea "
          "lanes. Pilots train every day so that they can respond quickly to any intrusion. The air "
          "force also helps civilians during disasters, such as delivering food to isolated villages "
          "after an earthquake."),
    'B': ("Before every flight, technicians inspect the aircraft carefully. They check the engine, the "
          "landing gear, and the fuel system. A single loose bolt can cause a serious accident, so no "
          "detail is considered too small. After the inspection, the technician signs a document to "
          "confirm that the aircraft is safe to fly. Pilots rely on that signature; without it, they are "
          "not allowed to take off."),
    'C': ("Recruits at the air force academy wake up before sunrise. They run, drill, and study theory "
          "until late afternoon. Instructors say the goal is not only physical strength but also the "
          "ability to make decisions under pressure. Many recruits find the first month the hardest, yet "
          "most of them say the training changed their character. Discipline, they learn, is not "
          "punishment; it is a habit that keeps the team alive."),
    'D': ("Unmanned aerial vehicles, or drones, are now used for more than surveillance. In disaster "
          "areas, drones map the damage and help rescuers find survivors faster. In remote regions, they "
          "deliver medicine to clinics that cannot be reached by road. However, the use of drones also "
          "raises questions about privacy and airspace safety. For that reason, operators must be trained "
          "and licensed, and every flight must follow national regulations."),
}

# (kode bacaan, pertanyaan, pilihan, index kunci, pembahasan)
SOAL = [
    ('A', 'What is the main idea of the text?',
     ['The Air Force guards Indonesia\'s airspace and helps in many ways',
      'The Air Force only works in Java and Sumatra',
      'The navy is responsible for airspace protection',
      'Disaster relief is the only duty of the Air Force'], 0,
     'Teks menjelaskan banyak tugas TNI AU: menjaga wilayah udara, bekerja sama dengan TNI AL, latihan '
     'harian, dan membantu korban bencana. Jadi gagasan utamanya adalah peran TNI AU yang beragam.'),
    ('A', 'Who cooperates with the air force to protect the sea lanes?',
     ['The navy', 'The police', 'Local fishermen', 'The army'], 0,
     'Kalimat ketiga menyebut "the air force also cooperates with the navy to protect the sea lanes" — '
     'jawabannya navy (TNI Angkatan Laut).'),
    ('A', 'Why do the pilots train every day?',
     ['So that they can respond quickly to any intrusion',
      'Because they want higher ranks', 'To deliver food to villages',
      'Because the archipelago is small'], 0,
     'Teks menyebut "Pilots train every day so that they can respond quickly to any intrusion". '
     'Perhatikan kata "so that" yang menandai tujuan.'),
    ('A', 'The word "intrusion" in the text is closest in meaning to...',
     ['Illegal entry', 'Heavy rain', 'Friendly visit', 'Regular training'], 0,
     'Intrusion berarti masuk tanpa izin (pelanggaran wilayah) — padanan terdekatnya illegal entry.'),
    ('A', 'What does the air force do after an earthquake?',
     ['It delivers food to isolated villages', 'It rebuilds the houses',
      'It closes the airspace', 'It trains new pilots'], 0,
     'Kalimat terakhir: "delivering food to isolated villages after an earthquake".'),

    ('B', 'What is the text mainly about?',
     ['The importance of aircraft inspection before flight',
      'How to fly an aircraft safely', 'The duties of pilots in the air',
      'How to build an aircraft engine'], 0,
     'Seluruh teks membahas pemeriksaan pesawat oleh teknisi sebelum terbang dan pentingnya hal itu.'),
    ('B', 'Which parts do the technicians check?',
     ['The engine, the landing gear, and the fuel system',
      'The wings, the seats, and the windows', 'The radar, the radio, and the cabin',
      'The helmet, the boots, and the parachute'], 0,
     'Kalimat kedua menyebut "the engine, the landing gear, and the fuel system".'),
    ('B', 'Why does the technician sign a document after the inspection?',
     ['To confirm that the aircraft is safe to fly',
      'To ask for extra payment', 'To report the pilot to the commander',
      'To record the flight hours'], 0,
     'Teks: "signs a document to confirm that the aircraft is safe to fly" — tanda tangan itu bentuk '
     'pertanggungjawaban atas keamanan pesawat.'),
    ('B', 'The phrase "rely on" in the text means...',
     ['Depend on', 'Argue with', 'Look at', 'Write down'], 0,
     'Rely on berarti bergantung pada (depend on).'),
    ('B', 'What happens if there is no signature?',
     ['The pilot is not allowed to take off', 'The pilot flies a different aircraft',
      'The technician flies the aircraft', 'The flight is delayed for one week'], 0,
     'Kalimat terakhir: "without it, they are not allowed to take off".'),

    ('C', 'What is the main idea of the text?',
     ['The aim and the effect of training at the air force academy',
      'How to wake up early every day', 'The history of the air force academy',
      'Why instructors are strict with recruits'], 0,
     'Teks menjelaskan tujuan latihan (kekuatan fisik dan kemampuan mengambil keputusan) serta '
     'dampaknya pada karakter taruna.'),
    ('C', 'When do the recruits wake up?',
     ['Before sunrise', 'At sunrise', 'After breakfast', 'In the late afternoon'], 0,
     'Kalimat pertama: "Recruits at the air force academy wake up before sunrise".'),
    ('C', 'Why is the training not only about physical strength?',
     ['Because officers must also make decisions under pressure',
      'Because physical training is not important', 'Because the academy has no sport fields',
      'Because instructors are old'], 0,
     'Teks: "the goal is not only physical strength but also the ability to make decisions under '
     'pressure" — di lapangan, keputusan cepat saat tertekan sama pentingnya.'),
    ('C', 'The phrase "under pressure" in the text means...',
     ['In a difficult or stressful situation', 'Under a heavy object',
      'Below the standard', 'With loud music'], 0,
     '"Under pressure" berarti dalam tekanan atau situasi sulit, bukan tekanan fisik.'),
    ('C', 'What do most recruits say about the training?',
     ['It changed their character', 'It was too short', 'It was easy', 'It damaged their health'], 0,
     'Teks: "most of them say the training changed their character".'),

    ('D', 'What is the main idea of the text?',
     ['The growing uses of drones and the need to regulate them',
      'How to build a drone at home', 'Why drones are dangerous for everyone',
      'The history of unmanned aircraft'], 0,
     'Teks membahas manfaat drone (bencana, daerah terpencil) sekaligus alasan penggunaannya harus '
     'diatur: privasi dan keselamatan ruang udara.'),
    ('D', 'What can drones do in disaster areas?',
     ['Map the damage and help find survivors', 'Repair broken roads',
      'Build temporary houses', 'Deliver fuel to the airport'], 0,
     'Teks: "drones map the damage and help rescuers find survivors faster".'),
    ('D', 'What do drones deliver to remote regions?',
     ['Medicine', 'Fuel', 'Weapons', 'Uniforms'], 0,
     'Teks: "In remote regions, they deliver medicine to clinics that cannot be reached by road".'),
    ('D', 'Why must drone operators be trained and licensed?',
     ['Because privacy and airspace safety must be protected',
      'Because drones are expensive', 'Because drones cannot fly in cities',
      'Because the government sells the licenses'], 0,
     'Teks menjelaskan penggunaan drone menimbulkan pertanyaan soal privasi dan keselamatan ruang '
     'udara, sehingga operator harus terlatih dan berlisensi serta setiap penerbangan mengikuti aturan.'),
    ('D', 'The word "surveillance" in the text is closest in meaning to...',
     ['Monitoring an area', 'Repairing a machine', 'Carrying a load', 'Building a map'], 0,
     'Surveillance berarti pengawasan atau pemantauan suatu wilayah.'),
]


def jadi_soal():
    """Bentuk daftar soal lengkap dengan teks bacaan di dalam pertanyaannya."""
    hasil = []
    for (kode, tanya, pilihan, kunci, pb) in SOAL:
        teks = ('Bacaan berikut untuk soal ini:\n"%s"\n\nPertanyaan: %s' % (BACAAN[kode], tanya))
        hasil.append((teks, pilihan, kunci, pb))
    return hasil
