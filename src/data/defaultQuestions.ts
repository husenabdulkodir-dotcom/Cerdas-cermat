import { Question } from '../types';

export const DEFAULT_QUESTIONS: Question[] = [
  // ==========================================
  // 1. AMPLOP A (Soal Wajib) - 2 Soal
  // ==========================================
  { 
    id: 'q_wajib_amplop_a_1', 
    text: 'Apakah arti dari sifat wajib bagi Allah SWT "Wujud" dan "Qidam"?', 
    answer: 'Wujud artinya Ada, Qidam artinya Terdahulu / Tidak Berawal', 
    type: 'wajib', 
    category: 'Aqidah & Tauhid', 
    points: 100,
    packet: 'Amplop A'
  },
  { 
    id: 'q_wajib_amplop_a_2', 
    text: 'Sebutkan 3 perkara yang membatalkan ibadah puasa menurut fiqih Islam!', 
    answer: '1. Makan/minum dengan sengaja, 2. Muntah dengan sengaja, 3. Keluar darah haid atau nifas', 
    type: 'wajib', 
    category: 'Fiqih & Ibadah', 
    points: 100,
    packet: 'Amplop A'
  },

  // ==========================================
  // 2. AMPLOP B (Soal Wajib) - 2 Soal
  // ==========================================
  { 
    id: 'q_wajib_amplop_b_1', 
    text: 'Berapakah jumlah ayat dalam Surah Al-Fatihah dan termasuk golongan surah apa (Makkiyah atau Madaniyah)?', 
    answer: '7 Ayat, tergolong surah Makkiyah', 
    type: 'wajib', 
    category: 'Al-Qur\'an & Hadits', 
    points: 100,
    packet: 'Amplop B'
  },
  { 
    id: 'q_wajib_amplop_b_2', 
    text: 'Di kota manakah Rasulullah SAW dilahirkan dan pada tahun peristiwa apa?', 
    answer: 'Kota Mekkah, pada Tahun Gajah (571 Masehi)', 
    type: 'wajib', 
    category: 'Tarikh Islam & Sirah Nabawiyah', 
    points: 100,
    packet: 'Amplop B'
  },

  // ==========================================
  // 3. AMPLOP C (Soal Wajib) - 2 Soal
  // ==========================================
  { 
    id: 'q_wajib_amplop_c_1', 
    text: 'Sebutkan nama 5 nabi dan rasul yang bergelar Ulul Azmi!', 
    answer: 'Nabi Nuh AS, Nabi Ibrahim AS, Nabi Musa AS, Nabi Isa AS, Nabi Muhammad SAW', 
    type: 'wajib', 
    category: 'Kisah 25 Nabi & Rasul', 
    points: 100,
    packet: 'Amplop C'
  },
  { 
    id: 'q_wajib_amplop_c_2', 
    text: 'Siapakah nama sahabat Nabi yang bergelar "Dzun Nurain" (Pemilik Dua Cahaya) dan memimpin pembukuan mushaf Al-Qur\'an?', 
    answer: 'Utsman bin Affan R.A.', 
    type: 'wajib', 
    category: 'Khulafaur Rasyidin & Sahabat', 
    points: 100,
    packet: 'Amplop C'
  },

  // ==========================================
  // 4. AMPLOP D (Soal Wajib) - 2 Soal
  // ==========================================
  { 
    id: 'q_wajib_amplop_d_1', 
    text: 'Apakah hukum bacaan tajwid apabila Nun Mati atau Tanwin bertemu dengan huruf Ba (ب) dan bagaimana cara membacanya?', 
    answer: 'Iqlab, dibaca dengan mengganti bunyi nun/tanwin menjadi mim (م) disertai dengung/ghunnah', 
    type: 'wajib', 
    category: 'Tajwid & Ulumul Qur\'an', 
    points: 100,
    packet: 'Amplop D'
  },
  { 
    id: 'q_wajib_amplop_d_2', 
    text: 'Siapakah ilmuwan muslim penemu angka Nol dan peletak dasar ilmu Aljabar modern?', 
    answer: 'Muhammad bin Musa Al-Khawarizmi (Al-Khawarizmi)', 
    type: 'wajib', 
    category: 'Pengetahuan Umum & Sains', 
    points: 100,
    packet: 'Amplop D'
  },

  // ==========================================
  // 5. TIPE SOAL: LEMPAR - 2 Soal
  // ==========================================
  { 
    id: 'q_lempar_1', 
    text: 'Apakah nama shalat sunnah muakkad yang dikerjakan pada malam hari setelah shalat Isya khusus pada bulan suci Ramadhan?', 
    answer: 'Shalat Tarawih dan Shalat Witir', 
    type: 'lempar', 
    category: 'Fiqih & Ibadah', 
    points: 100 
  },
  { 
    id: 'q_lempar_2', 
    text: 'Nabi yang selamat dari kobaran api besar yang dinyalakan oleh Raja Namrud karena api menjadi dingin dan menyelamatkan adalah?', 
    answer: 'Nabi Ibrahim AS', 
    type: 'lempar', 
    category: 'Kisah 25 Nabi & Rasul', 
    points: 100 
  },

  // ==========================================
  // 6. TIPE SOAL: REBUTAN - 2 Soal
  // ==========================================
  { 
    id: 'q_rebutan_1', 
    text: 'Peristiwa agung perjalanan malam hari Rasulullah SAW dari Masjidil Haram ke Masjidil Aqsha lalu naik ke Sidratul Muntaha disebut peristiwa?', 
    answer: 'Isra\' dan Mi\'raj', 
    type: 'rebutan', 
    category: 'Tarikh Islam & Sirah Nabawiyah', 
    points: 100 
  },
  { 
    id: 'q_rebutan_2', 
    text: 'Sebutkan nama malaikat yang bertugas membagikan rezeki serta mengatur hujan dan tanaman!', 
    answer: 'Malaikat Mikail AS', 
    type: 'rebutan', 
    category: 'Aqidah & Tauhid', 
    points: 100 
  },

  // ==========================================
  // 7. TIPE SOAL: PILIHAN GANDA - 2 Soal
  // ==========================================
  { 
    id: 'q_pg_1', 
    text: 'Surah dalam Al-Qur\'an yang tidak diawali dengan bacaan Basmalah (Bismillahirrahmanirrahim) adalah?', 
    answer: 'A. Surah At-Taubah', 
    type: 'pilihan_ganda', 
    category: 'Al-Qur\'an & Hadits', 
    points: 100,
    options: [
      'A. Surah At-Taubah',
      'B. Surah Al-Anfal',
      'C. Surah Yunus',
      'D. Surah Al-Kahfi'
    ],
    correctOption: 'A'
  },
  { 
    id: 'q_pg_2', 
    text: 'Ibnu Sina dalam peradaban dunia barat dikenal dengan sebutan bapak kedokteran modern yaitu?', 
    answer: 'B. Avicenna', 
    type: 'pilihan_ganda', 
    category: 'Pengetahuan Umum & Sains', 
    points: 100,
    options: [
      'A. Averroes',
      'B. Avicenna',
      'C. Alhazen',
      'D. Rhazes'
    ],
    correctOption: 'B'
  },

  // ==========================================
  // 8. TIPE SOAL: CLUE (TEBAK CLUE) - 2 Soal
  // ==========================================
  { 
    id: 'q_clue_1', 
    text: 'Siapakah sosok sahabat Nabi agung berikut ini berdasarkan petunjuk bertahap?', 
    answer: 'Umar bin Khattab R.A.', 
    type: 'clue', 
    category: 'Khulafaur Rasyidin & Sahabat', 
    points: 100,
    clues: [
      'Clue 1: Aku adalah sahabat Nabi yang masuk Islam di masa awal dan bergelar Al-Faruq (Pembeda kebenaran dan kebatilan).',
      'Clue 2: Di masa kepemimpinanku, penanggalan kalender Hijriyah pertama kali diresmikan dan diberlakukan.',
      'Clue 3: Aku menjadi Khalifah kedua menggantikan Abu Bakar Ash-Shiddiq R.A.',
      'Clue 4: Makamku berada di samping makam Rasulullah SAW dan Abu Bakar di Masjid Nabawi Madinah.'
    ]
  },
  { 
    id: 'q_clue_2', 
    text: 'Siapakah nama nabi yang dimaksud berdasarkan 4 petunjuk bertahap berikut?', 
    answer: 'Nabi Yusuf AS', 
    type: 'clue', 
    category: 'Kisah 25 Nabi & Rasul', 
    points: 100,
    clues: [
      'Clue 1: Aku pernah dimasukkan ke dalam sumur oleh saudara-saudaraku karena rasa cemburu.',
      'Clue 2: Allah SWT menganugerahiku ketampanan luar biasa dan mukjizat menakwilkan (menafsirkan) mimpi.',
      'Clue 3: Aku diangkat menjadi bendahara dan menteri urusan pangan/ekonomi di negeri Mesir.',
      'Clue 4: Ayahku adalah Nabi Ya\'qub AS dan kakek buyutku adalah Nabi Ibrahim AS.'
    ]
  },

  // ==========================================
  // 9. TIPE SOAL: AUDIO / SAMBUNG AYAT - 2 Soal
  // ==========================================
  { 
    id: 'q_audio_1', 
    text: 'Dengarkan lantunan potongan ayat suci berikut: "Inna a\'thainaakal kautsar...". Sambunglah ayat berikutnya sampai akhir surah!', 
    answer: '"Fa shalli li rabbika wan-har. Inna syaani\'aka huwal abtar" (Surah Al-Kautsar ayat 2-3)', 
    type: 'audio', 
    category: 'Al-Qur\'an & Hadits', 
    points: 100
  },
  { 
    id: 'q_audio_2', 
    text: 'Dengarkan penggalan ayat: "Wadh-dhuhaa, wal-laili idzaa sajaa...". Apakah nama surah tersebut dan berapakah total ayatnya?', 
    answer: 'Surah Ad-Dhuha (Total 11 Ayat)', 
    type: 'audio', 
    category: 'Tajwid & Ulumul Qur\'an', 
    points: 100
  },

  // ==========================================
  // 10. TIPE SOAL: GAMBAR / OBSERVASI VISUAL - 2 Soal
  // ==========================================
  { 
    id: 'q_gambar_1', 
    text: 'Perhatikan gambar berikut. Bangunan bersejarah berkubah hijau (Green Dome) yang menjadi tempat pemakaman Rasulullah SAW ini berada di kompleks masjid apa?', 
    answer: 'Masjid Nabawi (Madinah Al-Munawwarah)', 
    type: 'gambar', 
    category: 'Tarikh Islam & Sirah Nabawiyah', 
    points: 100,
    questionImage: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80'
  },
  { 
    id: 'q_gambar_2', 
    text: 'Perhatikan gambar berikut. Bangunan Ka\'bah dan Masjidil Haram yang menjadi kiblat seluruh umat Islam di dunia terletak di kota mana?', 
    answer: 'Kota Mekkah Al-Mukarramah (Arab Saudi)', 
    type: 'gambar', 
    category: 'Pengetahuan Umum & Sains', 
    points: 100,
    questionImage: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80'
  }
];
