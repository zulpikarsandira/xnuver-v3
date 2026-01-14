# Background Service Analysis - Xnuver Target

## 1. Masalah Utama (Root Cause)
Kenapa fitur berhenti saat aplikasi ditutup/HP terkunci:

*   **Logic Pemutaran Musik di UI Layer:** Saat ini, logika pemutaran musik (`expo-av`) berada di `App.js` di dalam fungsi `handleForegroundCommand`. Ketika aplikasi ditutup, UI Layer/Activity dihancurkan, sehingga pemutar musik ikut mati.
*   **Interval Polling Tidak Persistent:** Fungsi `startBackgroundPolling` menggunakan `setInterval` standar Javascript. Di Android, saat aplikasi masuk ke mode background atau ditutup, Javascript Engine akan di-pause atau dihentikan untuk menghemat baterai, kecuali dijalankan di dalam Headless Task yang benar.
*   **Kehilangan Konteks Audio:** Walaupun `notifee` menjalankan Foreground Service, Service tersebut hanya menampilkan notifikasi. Jika tidak ada "Work" yang di-bind secara native untuk menjalankan JS secara terus menerus, sistem akan menghentikan eksekusi script.
*   **Aset Lokal (Require) di Background:** Di dalam `backgroundTask.js`, pemanggilan aset menggunakan `require()` dilarang atau sering gagal karena bundler tidak menyertakan aset tersebut di context Headless JS.

## 2. Analisis Teknis Per Fitur
*   **Flashlight:** Masih sering mati karena permission hardware yang dilepas sistem saat aplikasi dianggap idle.
*   **Music:** Gagal total karena script `backgroundTask.js` hanya melakukan "log" dan berharap UI yang memutar musiknya.
*   **TTS:** Terkadang jalan tapi sering delay karena polling macet saat HP masuk "Doze Mode".

## 3. Rencana Perbaikan (Plan to Fix)

### Tahap 1: Migrasi Audio ke Background Layer
*   Memindahkan logika `Audio.Sound` langsung ke dalam `backgroundTask.js`.
*   Menggunakan URL atau path absolut untuk file audio agar tidak bergantung pada `require()` UI.

### Tahap 2: Implementasi Headless JS yang Benar
*   Menggunakan `expo-task-manager` untuk mendefinisikan task yang benar-benar terpisah dari lifecycle UI.
*   Mastikan Notifee Foreground Service berjalan dengan properti `asForegroundService: true` dan menjalankan task JS secara berkala.

### Tahap 3: Optimasi Power Management
*   Menambahkan instruksi bagi user untuk menonaktifkan "Battery Optimization" secara manual (sudah ada di UI, tapi perlu dipertegas).
*   Menggunakan WAKE_LOCK agar CPU tetap hidup saat memproses perintah.

### Tahap 4: Stabilisasi Polling
*   Mengubah mekanisme polling agar lebih tahan banting (resilient) jika koneksi terputus.
*   Menggunakan `expo-background-fetch` sebagai backup jika `setInterval` mati.

## 4. Perubahan yang Telah Dilakukan (Fix Applied)
*   **Sentralisasi Logika:** Semua perintah (Musik, Flashlight, TTS, Wallpaper) sekarang diproses di `backgroundTask.js`. UI (`App.js`) hanya mendengarkan event untuk update visual.
*   **Background Audio Player:** Pemutar musik menggunakan `expo-av` langsung dari background script dengan konfigurasi `androidImplementation: 'MediaPlayer'` dan `staysActiveInBackground: true`.
*   **Global Audio Session:** Inisialisasi audio session dilakukan di level modul background untuk memastikan sistem memberikan izin suara di background.
*   **Penyatuan Polling:** Menghapus pooling ganda di UI untuk menghemat resource dan mencegah eksekusi perintah duplikat.
