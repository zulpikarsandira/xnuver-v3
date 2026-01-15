# Rencana Implementasi Perbaikan Xnuver Target

## Analisis Permasalahan
Berdasarkan pengujian dan analisis kode, ditemukan beberapa penyebab utama kegagalan fitur background dan icon:

1.  **Process Termination (Aplikasi Mati Total)**:
    - Code lama menggunakan `BackHandler.exitApp()` setelah koneksi berhasil.
    - Fungsi ini memanggil `MainActivity.finish()`, yang menghancurkan React Activity.
    - Karena logika polling (`setInterval` di `backgroundTask.js`) berjalan di dalam Context JavaScript yang terikat dengan Activity tersebut, maka ketika Activity hancur, loop polling ikut mati.
    - Inilah sebabnya status "System Online" terlihat sebentar, namun setelah aplikasi "keluar", tidak ada perintah yang bisa diterima.

2.  **Kegagalan Menyembunyikan Icon (`hideAppIcon`)**:
    - Metode `PackageManager.setComponentEnabledSetting(..., DISABLED)` digunakan untuk menyembunyikan icon.
    - Pada Android modern, menonaktifkan komponen Activity Utama saat aplikasi sedang berjalan seringkali memicu "Force Kill" oleh OS karena dianggap ada perubahan struktur paket yang fatal.
    - Jika proses ini gagal di tengah jalan (crash), state tidak tersimpan, sehingga icon tetap muncul, namun aplikasi sudah dalam keadaan tidak stabil/crash.

## Solusi yang Diterapkan
Kami telah mengubah pendekatan dari "Mematikan Aplikasi" menjadi "Meminimalisir Aplikasi" (Minimize to Background).

### 1. Modifikasi Native Module (`StealthModule.java`)
**Status**: SELESAI
Kami menambahkan fungsi baru `minimizeApp()` yang menggunakan perintah native Android `moveTaskToBack(true)`.
- **Fungsi**: Memindahkan aplikasi ke belakang (seperti menekan tombol Home) tanpa mematikan prosesnya.
- **Keuntungan**: Context JavaScript (Thread) tetap hidup, sehingga `setInterval` polling perintah dari Controller tetap berjalan lancar.

### 2. Update Logika Frontend (`App.js`)
**Status**: SELESAI
Kami mengubah alur setelah koneksi sukses:
- **Sebelumnya**: `hideAppIcon()` -> `exitApp()` (Aplikasi Mati).
- **Sekarang**: `minimizeApp()` (Aplikasi Jalan di Background).
- Kami sementara menonaktifkan fitur `hideAppIcon` otomatis untuk menjaga stabilitas proses. Menyembunyikan icon sebaiknya dilakukan via Launcher khusus atau fitur "Hide App" bawaan HP target agar lebih aman.

## Cara Testing Ulang (Verifikasi)
1. **Rebuild Aplikasi**: Jalankan `eas build --platform android --profile preview` atau run local jika memungkinkan.
2. **Install & Buka**: Buka aplikasi target yang baru.
3. **Koneksi**: Masukkan ID dan Nama, klik Connect.
4. **Verifikasi**:
   - Muncul Alert "System Online".
   - Klik OK. Aplikasi akan **tertutup (minimize) secara otomatis** kembali ke Home Screen.
   - **PENTING**: Cek notifikasi bar, harus ada notifikasi "Xnuver Agent Active" (ini menandakan service jalan).
   - **Tes Fitur**: Dari Controller, coba nyalakan Senter atau kirim Alert. Sekarang fitur ini harusnya berfungsi karena aplikasi masih hidup di background.

## Catatan Teknis
Jika Anda MUTLAK membutuhkan fitur menyembunyikan icon:
- Ini memerlukan arsitektur **Headless JS Service** yang terpisah sepenuhnya dari UI Component.
- Saat ini arsitektur aplikasi masih menyatu (UI + Logic), sehingga pendekatan "Minimize" adalah yang paling stabil dan fungsional untuk saat ini.
