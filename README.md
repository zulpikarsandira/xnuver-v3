# Xnuver - Sistem Manajemen Perangkat Android Jarak Jauh

Xnuver adalah platform manajemen perangkat Android jarak jauh yang terdiri dari aplikasi Target (Agent) dan aplikasi Controller. Proyek ini dirancang untuk memberikan kendali penuh atas perangkat Android melalui perintah-perintah khusus yang dikirimkan secara real-time.

## Fitur Utama

- Wallpaper Management: Mengubah wallpaper perangkat target secara langsung melalui URL.
- Background Persistence: Layanan latar belakang yang tetap berjalan meskipun aplikasi ditutup.
- Audio Control: Memutar musik latar dan teks-ke-suara (Text-to-Speech).
- Flashlight Control: Mengontrol lampu senter perangkat daftar jarak jauh.
- System Monitoring: Memantau status koneksi perangkat secara real-time.

## Alur Kerja Aplikasi

Sistem Xnuver bekerja dengan mengintegrasikan tiga komponen utama:

1. Perangkat Target (Agent):
   Aplikasi yang diinstal pada perangkat yang ingin dikendalikan. Aplikasi ini berjalan sebagai layanan latar belakang dan terus memantau perintah baru dari server database.

2. Perangkat Controller:
   Aplikasi yang digunakan oleh administrator untuk mengirimkan perintah, memicu aksi, dan memantau status perangkat target.

3. Panel Admin (Web):
   Digunakan oleh administrator utama untuk mengelola akun controller, memantau seluruh perangkat yang terdaftar, dan melakukan manajemen data pengguna secara terpusat.

3. Komunikasi Data:
   Perintah dan data dikirimkan melalui sistem database real-time. Controller atau Admin memperbarui status di database, dan Agent (Target) akan segera merespons perubahan tersebut secara otomatis.

## Panduan Pengguna

### Langkah 1: Persiapan Controller
1. Instal file APK `xnuver_rn_controller.apk` pada perangkat Anda (HP Pengendali).
2. Buka aplikasi, masuk ke halaman **Setting**, lalu copy/salin **Controller ID** unik Anda.

### Langkah 2: Persiapan Perangkat Target
1. Instal file APK `xnuver_target_agent.apk` pada perangkat yang ingin dikendalikan (HP Target).
2. Buka aplikasi di perangkat tersebut.
3. Masukkan **Nama Alias** untuk menandai perangkat target.
4. Masukkan **Controller ID** yang telah Anda salin sebelumnya dari aplikasi Controller.
5. Tekan tombol **Connect**.
6. Jika berhasil, akan muncul notifikasi sistem telah online. Aplikasi akan secara otomatis berjalan di latar belakang.

### Langkah 3: Pengujian Kontrol
1. Anda dapat menutup aplikasi pada perangkat target.
2. Buka aplikasi Controller Anda, cari perangkat berdasarkan Nama Alias yang tadi dibuat.
3. Cobalah menyalakan fitur **Flashlight** (Senter).
4. Jika lampu senter pada HP Target menyala, maka koneksi berhasil dan fitur-fitur lainnya juga akan berfungsi.

## Disclaimer

Fitur dalam aplikasi ini tidak dijamin akan berjalan seratus persen pada semua jenis perangkat. Kinerja aplikasi sangat bergantung pada versi Android yang digunakan. Semakin baru versi Android pada perangkat target, maka aplikasi Xnuver Target akan lebih sulit dijalankan karena adanya batasan sistem keamanan yang lebih ketat dari versi sebelumnya.

## Mitigasi Masalah Instalasi

Jika aplikasi gagal diinstal atau muncul peringatan Blocked by Play Protect, ikuti langkah-langkah berikut:

1. Buka aplikasi Google Play Store pada perangkat Anda.
2. Ketuk ikon profil di pojok kanan atas.
3. Pilih menu Play Protect.
4. Ketuk ikon Settings atau roda gigi di pojok kanan atas.
5. Matikan opsi Scan apps with Play Protect.
6. Matikan opsi Improve harmful app detection.
7. Coba instal kembali file APK yang diinginkan.

Peringatan: Pastikan untuk mengaktifkan kembali fitur keamanan setelah proses instalasi jika diperlukan demi keamanan perangkat Anda.
