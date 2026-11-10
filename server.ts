import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const httpServer = createServer(app);
  const io = new Server(httpServer, { maxHttpBufferSize: 1e7, 
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const generateDefaultState = () => ({
    groups: [
      { id: 'g1', name: 'Kelompok 1', score: 0 },
      { id: 'g2', name: 'Kelompok 2', score: 0 },
      { id: 'g3', name: 'Kelompok 3', score: 0 },
    ],
    questions: [
      // === AMPLOP A (Soal Wajib) ===
      { 
        id: 'q1', 
        text: 'Apakah arti dari sifat wajib bagi Allah SWT "Wujud" dan "Qidam"?', 
        answer: 'Wujud artinya Ada, Qidam artinya Terdahulu / Tidak Berawal', 
        type: 'wajib', 
        category: 'Aqidah & Tauhid', 
        points: 100,
        packet: 'Amplop A'
      },
      { 
        id: 'q2', 
        text: 'Sebutkan 3 perkara yang membatalkan ibadah puasa menurut fiqih Islam!', 
        answer: '1. Makan/minum dengan sengaja, 2. Muntah dengan sengaja, 3. Keluar darah haid atau nifas', 
        type: 'wajib', 
        category: 'Fiqih & Ibadah', 
        points: 100,
        packet: 'Amplop A'
      },

      // === AMPLOP B (Soal Wajib) ===
      { 
        id: 'q3', 
        text: 'Berapakah jumlah ayat dalam Surah Al-Fatihah dan termasuk golongan surah apa (Makkiyah atau Madaniyah)?', 
        answer: '7 Ayat, tergolong surah Makkiyah', 
        type: 'wajib', 
        category: 'Al-Qur\'an & Hadits', 
        points: 100,
        packet: 'Amplop B'
      },
      { 
        id: 'q4', 
        text: 'Di kota manakah Rasulullah SAW dilahirkan dan pada tahun peristiwa apa?', 
        answer: 'Kota Mekkah, pada Tahun Gajah (571 Masehi)', 
        type: 'wajib', 
        category: 'Tarikh Islam & Sirah Nabawiyah', 
        points: 100,
        packet: 'Amplop B'
      },

      // === AMPLOP C (Soal Wajib) ===
      { 
        id: 'q5', 
        text: 'Sebutkan nama 5 nabi dan rasul yang bergelar Ulul Azmi!', 
        answer: 'Nabi Nuh AS, Nabi Ibrahim AS, Nabi Musa AS, Nabi Isa AS, Nabi Muhammad SAW', 
        type: 'wajib', 
        category: 'Kisah 25 Nabi & Rasul', 
        points: 100,
        packet: 'Amplop C'
      },
      { 
        id: 'q6', 
        text: 'Siapakah nama sahabat Nabi yang bergelar "Dzun Nurain" (Pemilik Dua Cahaya) dan memimpin pembukuan mushaf Al-Qur\'an?', 
        answer: 'Utsman bin Affan R.A.', 
        type: 'wajib', 
        category: 'Khulafaur Rasyidin & Sahabat', 
        points: 100,
        packet: 'Amplop C'
      },

      // === AMPLOP D (Soal Wajib) ===
      { 
        id: 'q7', 
        text: 'Apakah hukum bacaan tajwid apabila Nun Mati atau Tanwin bertemu dengan huruf Ba (ب) dan bagaimana cara membacanya?', 
        answer: 'Iqlab, dibaca dengan mengganti bunyi nun/tanwin menjadi mim (م) disertai dengung/ghunnah', 
        type: 'wajib', 
        category: 'Tajwid & Ulumul Qur\'an', 
        points: 100,
        packet: 'Amplop D'
      },
      { 
        id: 'q8', 
        text: 'Siapakah ilmuwan muslim penemu angka Nol dan peletak dasar ilmu Aljabar modern?', 
        answer: 'Muhammad bin Musa Al-Khawarizmi (Al-Khawarizmi)', 
        type: 'wajib', 
        category: 'Pengetahuan Umum & Sains', 
        points: 100,
        packet: 'Amplop D'
      },

      // === TIPE SOAL: LEMPAR ===
      { 
        id: 'q9', 
        text: 'Apakah nama shalat sunnah muakkad yang dikerjakan pada malam hari setelah shalat Isya khusus pada bulan suci Ramadhan?', 
        answer: 'Shalat Tarawih dan Shalat Witir', 
        type: 'lempar', 
        category: 'Fiqih & Ibadah', 
        points: 100 
      },
      { 
        id: 'q10', 
        text: 'Nabi yang selamat dari kobaran api besar yang dinyalakan oleh Raja Namrud karena api menjadi dingin dan menyelamatkan adalah?', 
        answer: 'Nabi Ibrahim AS', 
        type: 'lempar', 
        category: 'Kisah 25 Nabi & Rasul', 
        points: 100 
      },

      // === TIPE SOAL: REBUTAN ===
      { 
        id: 'q11', 
        text: 'Peristiwa agung perjalanan malam hari Rasulullah SAW dari Masjidil Haram ke Masjidil Aqsha lalu naik ke Sidratul Muntaha disebut peristiwa?', 
        answer: 'Isra\' dan Mi\'raj', 
        type: 'rebutan', 
        category: 'Tarikh Islam & Sirah Nabawiyah', 
        points: 100 
      },
      { 
        id: 'q12', 
        text: 'Sebutkan nama malaikat yang bertugas membagikan rezeki serta mengatur hujan dan tanaman!', 
        answer: 'Malaikat Mikail AS', 
        type: 'rebutan', 
        category: 'Aqidah & Tauhid', 
        points: 100 
      },

      // === TIPE SOAL: PILIHAN GANDA ===
      { 
        id: 'q13', 
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
        id: 'q14', 
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

      // === TIPE SOAL: CLUE (TEBAK CLUE BERTAHAP) ===
      { 
        id: 'q15', 
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
        id: 'q16', 
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

      // === TIPE SOAL: AUDIO / SAMBUNG AYAT ===
      { 
        id: 'q17', 
        text: 'Dengarkan lantunan potongan ayat suci berikut: "Inna a\'thainaakal kautsar...". Sambunglah ayat berikutnya sampai akhir surah!', 
        answer: '"Fa shalli li rabbika wan-har. Inna syaani\'aka huwal abtar" (Surah Al-Kautsar ayat 2-3)', 
        type: 'audio', 
        category: 'Al-Qur\'an & Hadits', 
        points: 100
      },
      { 
        id: 'q18', 
        text: 'Dengarkan penggalan ayat: "Wadh-dhuhaa, wal-laili idzaa sajaa...". Apakah nama surah tersebut dan berapakah total ayatnya?', 
        answer: 'Surah Ad-Dhuha (Total 11 Ayat)', 
        type: 'audio', 
        category: 'Tajwid & Ulumul Qur\'an', 
        points: 100
      },

      // === TIPE SOAL: GAMBAR / OBSERVASI VISUAL ===
      { 
        id: 'q19', 
        text: 'Perhatikan gambar berikut. Bangunan bersejarah berkubah hijau (Green Dome) yang menjadi tempat pemakaman Rasulullah SAW ini berada di kompleks masjid apa?', 
        answer: 'Masjid Nabawi (Madinah Al-Munawwarah)', 
        type: 'gambar', 
        category: 'Tarikh Islam & Sirah Nabawiyah', 
        points: 100,
        questionImage: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80'
      },
      { 
        id: 'q20', 
        text: 'Perhatikan gambar berikut. Bangunan Ka\'bah dan Masjidil Haram yang menjadi kiblat seluruh umat Islam di dunia terletak di kota mana?', 
        answer: 'Kota Mekkah Al-Mukarramah (Arab Saudi)', 
        type: 'gambar', 
        category: 'Pengetahuan Umum & Sains', 
        points: 100,
        questionImage: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80'
      },
    ],
    activeQuestion: null,
    timer: 0,
    isTimerRunning: false,
    buzzerEnabled: false,
    buzzedGroupId: null,
    spinWheelResult: null,
    revealAnswer: false,
    customCategories: [] as string[],
    gamePhase: 'Persiapan',
    activeTurnGroupId: null as string | null,
    passedGroupIds: [] as string[],
    openedEnvelope: null as string | null,
    activeClueIndex: 0,
    groupBets: {} as Record<string, number>,
    soundTrigger: null as { sound: string; timestamp: number } | null,
    usedQuestionIds: [] as string[],
  });

  // Stores gameState per room code
  const rooms = new Map<string, any>();
  const timerIntervals = new Map<string, any>();

  const getGameState = (roomId: string) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, generateDefaultState());
    }
    return rooms.get(roomId);
  };

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    let currentRoom: string | null = null;

    socket.on('joinRoom', (roomId: string) => {
      if (currentRoom) {
        socket.leave(currentRoom);
      }
      currentRoom = roomId;
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      
      const gameState = getGameState(roomId);
      socket.emit('gameState', gameState);
    });
    
    socket.on('requestGameState', () => {
      if (currentRoom) {
        socket.emit('gameState', getGameState(currentRoom));
      }
    });

    // Admin Actions
    socket.on('admin:updateGroups', (groups) => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      gameState.groups = groups;
      io.to(currentRoom).emit('gameState', gameState);
    });

    socket.on('admin:updateQuestions', (questions) => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      gameState.questions = questions;
      io.to(currentRoom).emit('gameState', gameState);
    });

    
    socket.on('admin:setGamePhase', (phase) => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      gameState.gamePhase = phase;
      io.to(currentRoom).emit('gameState', gameState);
    });

    socket.on('admin:setActiveQuestion', (payload) => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      
      let q = payload;
      let dur = 30;
      let autoStart = false;
      if (payload && payload.question !== undefined) {
         q = payload.question;
         dur = typeof payload.duration === 'number' && payload.duration > 0 ? payload.duration : 30;
         autoStart = payload.autoStart === true;
      }
      gameState.activeQuestion = q;
      gameState.buzzedGroupId = null;
      gameState.timer = q ? dur : 0; 
      gameState.buzzerEnabled = false;
      gameState.revealAnswer = false;
      
      if (timerIntervals.has(currentRoom)) {
        clearInterval(timerIntervals.get(currentRoom));
        timerIntervals.delete(currentRoom);
      }

      if (autoStart && q && dur > 0) {
        gameState.isTimerRunning = true;
        io.to(currentRoom).emit('gameState', gameState);
        
        const interval = setInterval(() => {
          if (gameState.timer > 0) {
            gameState.timer -= 1;
            io.to(currentRoom).emit('timerUpdate', gameState.timer);
          } else {
            clearInterval(timerIntervals.get(currentRoom));
            timerIntervals.delete(currentRoom);
            gameState.isTimerRunning = false;
            gameState.buzzerEnabled = false;
            io.to(currentRoom).emit('gameState', gameState);
          }
        }, 1000);
        timerIntervals.set(currentRoom, interval);
      } else {
        gameState.isTimerRunning = false;
        io.to(currentRoom).emit('gameState', gameState);
      }
    });

    socket.on('admin:revealAnswer', (reveal) => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      gameState.revealAnswer = reveal;
      if (reveal && gameState.activeQuestion) {
        if (!gameState.usedQuestionIds) gameState.usedQuestionIds = [];
        if (!gameState.usedQuestionIds.includes(gameState.activeQuestion.id)) {
          gameState.usedQuestionIds.push(gameState.activeQuestion.id);
        }
      }
      io.to(currentRoom).emit('gameState', gameState);
    });

    socket.on('admin:setTimer', (seconds) => {
       if (!currentRoom) return;
       const gameState = getGameState(currentRoom);
       gameState.timer = seconds;
       io.to(currentRoom).emit('gameState', gameState);
    });

    socket.on('admin:startTimer', () => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      if (!gameState.isTimerRunning && gameState.timer > 0) {
        gameState.isTimerRunning = true;
        io.to(currentRoom).emit('gameState', gameState);
        
        const interval = setInterval(() => {
          if (gameState.timer > 0) {
            gameState.timer -= 1;
            io.to(currentRoom).emit('timerUpdate', gameState.timer);
          } else {
            clearInterval(timerIntervals.get(currentRoom));
            timerIntervals.delete(currentRoom);
            gameState.isTimerRunning = false;
            gameState.buzzerEnabled = false;
            io.to(currentRoom).emit('gameState', gameState);
          }
        }, 1000);
        timerIntervals.set(currentRoom, interval);
      }
    });

    socket.on('admin:pauseTimer', () => {
       if (!currentRoom) return;
       const gameState = getGameState(currentRoom);
       if (timerIntervals.has(currentRoom)) {
         clearInterval(timerIntervals.get(currentRoom));
         timerIntervals.delete(currentRoom);
       }
       gameState.isTimerRunning = false;
       io.to(currentRoom).emit('gameState', gameState);
    });

    socket.on('admin:resetBuzzer', () => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      gameState.buzzedGroupId = null;
      gameState.buzzerEnabled = true;
      io.to(currentRoom).emit('gameState', gameState);
    });

    socket.on('admin:enableBuzzer', (enabled) => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      gameState.buzzerEnabled = enabled;
      if (!enabled) gameState.buzzedGroupId = null;
      io.to(currentRoom).emit('gameState', gameState);
    });

    socket.on('admin:updateScore', ({ groupId, delta }) => {
       if (!currentRoom) return;
       const gameState = getGameState(currentRoom);
       const group = gameState.groups.find((g: any) => g.id === groupId);
       if (group) {
         group.score += delta;
         io.to(currentRoom).emit('gameState', gameState);
       }
    });
    
    socket.on('admin:spinWheel', (result) => {
       if (!currentRoom) return;
       const gameState = getGameState(currentRoom);
       gameState.spinWheelResult = result;
       io.to(currentRoom).emit('gameState', gameState);
    });

    socket.on('admin:updateCustomCategories', (categories) => {
       if (!currentRoom) return;
       const gameState = getGameState(currentRoom);
       gameState.customCategories = categories;
       io.to(currentRoom).emit('gameState', gameState);
    });

    socket.on('admin:forceBuzz', (groupId) => {
       if (!currentRoom) return;
       const gameState = getGameState(currentRoom);
       gameState.buzzedGroupId = groupId;
       gameState.buzzerEnabled = false;
       
       if (timerIntervals.has(currentRoom)) {
         clearInterval(timerIntervals.get(currentRoom));
         timerIntervals.delete(currentRoom);
       }
       gameState.isTimerRunning = false;
       io.to(currentRoom).emit('gameState', gameState);
       
       if (groupId) {
         io.to(currentRoom).emit('buzzed', groupId);
         io.to(currentRoom).emit('sound', 'buzzer');
       }
    });

    socket.on('admin:setActiveTurnGroup', (groupId) => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      gameState.activeTurnGroupId = groupId;
      gameState.passedGroupIds = [];
      io.to(currentRoom).emit('gameState', gameState);
    });

    socket.on('admin:passQuestion', (payload) => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      const fromGroupId = payload?.fromGroupId || gameState.buzzedGroupId || gameState.activeTurnGroupId;
      if (fromGroupId) {
        const passed = new Set(gameState.passedGroupIds || []);
        passed.add(fromGroupId);
        gameState.passedGroupIds = Array.from(passed);
      }
      gameState.buzzedGroupId = null;
      gameState.buzzerEnabled = true;
      
      if (payload?.toGroupId) {
        gameState.activeTurnGroupId = payload.toGroupId;
      }
      
      if (typeof payload?.timer === 'number' && payload.timer > 0) {
        gameState.timer = payload.timer;
        gameState.isTimerRunning = true;
        if (timerIntervals.has(currentRoom)) {
          clearInterval(timerIntervals.get(currentRoom));
          timerIntervals.delete(currentRoom);
        }
        const interval = setInterval(() => {
          if (gameState.timer > 0) {
            gameState.timer -= 1;
            io.to(currentRoom).emit('timerUpdate', gameState.timer);
          } else {
            clearInterval(timerIntervals.get(currentRoom));
            timerIntervals.delete(currentRoom);
            gameState.isTimerRunning = false;
            gameState.buzzerEnabled = false;
            io.to(currentRoom).emit('gameState', gameState);
          }
        }, 1000);
        timerIntervals.set(currentRoom, interval);
      }
      
      io.to(currentRoom).emit('gameState', gameState);
      io.to(currentRoom).emit('sound', 'wrong');
    });

    socket.on('admin:openEnvelope', (packetName) => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      gameState.openedEnvelope = packetName;
      io.to(currentRoom).emit('gameState', gameState);
      io.to(currentRoom).emit('sound', 'envelope');
    });

    socket.on('admin:nextClue', () => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      gameState.activeClueIndex = (gameState.activeClueIndex || 0) + 1;
      io.to(currentRoom).emit('gameState', gameState);
      io.to(currentRoom).emit('sound', 'clue');
    });

    socket.on('admin:setGroupBet', ({ groupId, amount, bet }: any) => {
      if (!currentRoom) return;
      const actualAmount = typeof amount === 'number' ? amount : (typeof bet === 'number' ? bet : 0);
      const gameState = getGameState(currentRoom);
      gameState.groupBets = { ...(gameState.groupBets || {}), [groupId]: actualAmount };
      io.to(currentRoom).emit('gameState', gameState);
    });

    socket.on('admin:triggerSound', (soundName) => {
      if (!currentRoom) return;
      io.to(currentRoom).emit('sound', soundName);
    });

    socket.on('admin:judgeAnswer', ({ groupId, isCorrect, points, deductPoints }) => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      const targetGroup = gameState.groups.find((g: any) => g.id === groupId);
      if (targetGroup) {
        if (isCorrect) {
          targetGroup.streak = (targetGroup.streak || 0) + 1;
          const streakBonus = targetGroup.streak >= 3 ? 25 : 0; // +25 bonus for 3+ consecutive correct
          const totalPointsAwarded = points + streakBonus;
          targetGroup.score += totalPointsAwarded;

          gameState.lastJudgment = {
            groupId,
            isCorrect: true,
            points: totalPointsAwarded,
            streak: targetGroup.streak,
            timestamp: Date.now()
          };

          io.to(currentRoom).emit('sound', targetGroup.streak >= 3 ? 'applause' : 'correct');
        } else {
          targetGroup.streak = 0; // reset streak on wrong answer
          if (typeof deductPoints === 'number' && deductPoints > 0) {
            targetGroup.score = Math.max(0, targetGroup.score - deductPoints);
          }
          gameState.lastJudgment = {
            groupId,
            isCorrect: false,
            points: -(deductPoints || 0),
            streak: 0,
            timestamp: Date.now()
          };
          io.to(currentRoom).emit('sound', 'wrong');
        }
      }
      // Automatically record active question as used
      if (gameState.activeQuestion) {
        if (!gameState.usedQuestionIds) gameState.usedQuestionIds = [];
        if (!gameState.usedQuestionIds.includes(gameState.activeQuestion.id)) {
          gameState.usedQuestionIds.push(gameState.activeQuestion.id);
        }
      }
      io.to(currentRoom).emit('gameState', gameState);
    });

    socket.on('admin:toggleQuestionUsed', (questionId) => {
      if (!currentRoom || !questionId) return;
      const gameState = getGameState(currentRoom);
      if (!gameState.usedQuestionIds) gameState.usedQuestionIds = [];
      const index = gameState.usedQuestionIds.indexOf(questionId);
      if (index >= 0) {
        gameState.usedQuestionIds.splice(index, 1);
      } else {
        gameState.usedQuestionIds.push(questionId);
      }
      io.to(currentRoom).emit('gameState', gameState);
    });

    socket.on('admin:resetUsedQuestions', () => {
      if (!currentRoom) return;
      const gameState = getGameState(currentRoom);
      gameState.usedQuestionIds = [];
      io.to(currentRoom).emit('gameState', gameState);
    });

    // Participant Reaction Emojis (Live Cheering / Expression)
    socket.on('participant:reaction', ({ groupId, emoji, text }) => {
      if (!currentRoom || !groupId) return;
      const gameState = getGameState(currentRoom);
      const group = gameState.groups.find((g: any) => g.id === groupId);
      if (group) {
        group.reaction = {
          emoji: emoji || '🔥',
          text: text || '',
          timestamp: Date.now()
        };
        io.to(currentRoom).emit('gameState', gameState);
        io.to(currentRoom).emit('participantReaction', {
          groupId,
          groupName: group.name,
          emoji: emoji || '🔥',
          text: text || ''
        });
      }
    });

    // Participant Actions
    socket.on('participant:buzz', (groupId) => {
       if (!currentRoom) return;
       const gameState = getGameState(currentRoom);
       if (gameState.buzzerEnabled && !gameState.buzzedGroupId) {
          gameState.buzzedGroupId = groupId;
          gameState.buzzerEnabled = false;
          
          if (timerIntervals.has(currentRoom)) {
            clearInterval(timerIntervals.get(currentRoom));
            timerIntervals.delete(currentRoom);
          }
          gameState.isTimerRunning = false;
          io.to(currentRoom).emit('gameState', gameState);
          io.to(currentRoom).emit('buzzed', groupId);
       }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`\n==================================================`);
    console.log(`  CERDAS CERMAT SANTRI - SERVER SIAP DIGUNAKAN`);
    console.log(`==================================================`);
    console.log(`- Akses Lokal Laptop: http://localhost:${PORT}`);
    try {
      const os = require('os');
      const interfaces = os.networkInterfaces();
      for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
          const alias = iface[i];
          if (alias.family === 'IPv4' && !alias.internal) {
            console.log(`- Akses Jaringan Lokal (WiFi/LAN Offline): http://${alias.address}:${PORT}`);
          }
        }
      }
    } catch {}
    console.log(`==================================================\n`);
  });
}

startServer();
