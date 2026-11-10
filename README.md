# Cerdas Cermat Santri - Real-Time Multi-Session Quiz System

Aplikasi cerdas cermat interaktif real-time dengan arsitektur multi-sesi, buzzer bel cepat, manajemen bank soal Excel, timer server-authoritative, spin wheel acak, dan tampilan proyektor panggung.

## Fitur Utama
1. **Multi-Ruangan (Multi-Session)**: Mendukung banyak ruang lomba independen (`/:roomId`).
2. **Dashboard Utama (Proyektor)**: Tampilan visual panggung proyektor untuk penonton dengan animasi interaktif, visualisasi audio, pemilihan amplop virtual, dan podium juara.
3. **Admin Panel**: Kontrol jalannya lomba, penilaian satu-klik juri (+Poin, 0 pt, -25 pt, Lempar Soal), kontrol timer & bel, soundboard efek, dan manajemen peserta.
4. **Bank Soal & Excel**: Import dan export bank soal via format Excel (.xlsx), filter berdasarkan tipe (Wajib, Lempar, Rebutan, Pilihan Ganda, Clue Bertahap, Audio/Sambung Ayat), amplop (A-D), dan kategori.
5. **Layar Peserta (Buzzer)**: Tombol bel cepat (buzzer) real-time dengan status giliran dan getaran/sound.
6. **Lantunan Audio & Soundboard**: Efek suara sintetis Web Audio API offline (tanpa ketergantungan koneksi internet eksternal).

## Cara Menjalankan Aplikasi di Komputer Lokal

### Prasyarat
- **Node.js**: Versi 18 atau lebih tinggi
- **npm** atau **yarn** / **bun**

### Langkah Instalasi & Menjalankan
1. Ekstrak file zip ini ke sebuah folder.
2. Buka terminal / command prompt di folder tersebut.
3. Jalankan perintah instalasi dependensi:
   ```bash
   npm install
   ```
4. Jalankan aplikasi dalam mode pengembangan:
   ```bash
   npm run dev
   ```
5. Buka browser di alamat:
   ```
   http://localhost:3000
   ```

### Struktur Folder
- `server.ts`: Server backend Express & Socket.io untuk sinkronisasi state real-time
- `src/pages/`:
  - `Landing.tsx`: Halaman utama pemilihan / pembuatan kode ruangan
  - `Home.tsx`: Navigasi ruangan (Dashboard, Admin, Login Peserta)
  - `Dashboard.tsx`: Tampilan panggung proyektor untuk penonton
  - `Admin.tsx`: Panel juri / operator lomba
  - `GroupView.tsx`: Layar buzzer untuk regu peserta
- `src/components/`: Komponen interaktif (EnvelopeSelector, SpinWheel, PodiumView, AudioVisualizer, CelebrationEffects)
- `src/data/`: Data default soal lengkap 20 soal (`defaultQuestions.ts`)
- `src/lib/`: Modul socket client, audio generator (Web Audio API), dan utilitas Tailwind
