DEFINISI SINGKAT APLIKASI :

MACSUS AI ADVANCE adalah aplikasi web berbasis AI untuk Macsus Company (jasa perbaikan laptop di Surabaya) yang berfungsi sebagai pembuat konten iklan otomatis.

Inti fungsinya: User tinggal masukkan judul + deskripsi singkat, lalu AI (Gemini) akan otomatis membuat konten iklan yang siap pakai untuk 5 platform:



Instagram → Caption + Doc Source + NotebookLM



Google Bisnis → Postingan review pelanggan



WhatsApp → Pesan broadcast promo



Facebook → Postingan analisa kerusakan



TikTok → Caption video pendek

Fitur utama lainnya:



Simpan & kelola riwayat konten (IndexedDB)



Chat/messaging antar user



Mode gelap/terang



Install sebagai PWA (bisa dipasang di HP)



Auto-update versi via Supabase



Import/export data riwayat

Singkatnya: aplikasi ini menghemat waktu buat tim Macsus biar gak perlu nulis iklan manual satu-satuh — tinggal pilih mode, isi form, generate, langsung jadi.



STRUKTUR HALAMAN & TOMBOL :

Aplikasi ini adalah Single Page Application (SPA) — semua halaman ada di dalam index.html dan ditampilkan/disenyembunyikan secara dinamis. Ada 12 halaman/section utama + beberapa modal overlay.

1. login.html — Halaman Login

Tombol/ElemenFungsiLogin buttonMemproses login via Supabase, jika berhasil → redirect ke index.html"Daftar di sini" linkMembuka halaman register.html

2. register.html — Halaman Register

Tombol/ElemenFungsiRegister buttonMembuat akun baru via Supabase, jika berhasil → redirect ke index.html"Login di sini" linkMembuka halaman login.html

3. Beranda / Home (#beranda-view) — Halaman Utama

Ini halaman default setelah login. Menampilkan info mode dan riwayat recent.

Tombol/ElemenFungsiTab InstagramMenampilkan info panel mode InstagramTab G-BisnisMenampilkan info panel mode Google BisnisTab WhatsAppMenampilkan info panel mode WhatsAppTab FacebookMenampilkan info panel mode FacebookTab TikTokMenampilkan info panel mode TikTok"Gunakan mode ini"Membuka form pembuatan konten untuk mode yang dipilihToggle view (list/grid)Mengubah tampilan riwayat antara list dan gridSearch inputMenyaring riwayat berdasarkan teksItem riwayat (klik)Membuka session/output yang tersimpanSwipe: PinMenyematkan/mencabut sematan riwayatSwipe: DeleteMenghapus riwayat (dengan konfirmasi)

4. Form Mode Instagram (#ig-fields)

Tombol/ElemenFungsiInput JudulJudul konten InstagramDropdown TemplateMemilih preset template, otomatis mengisi textareaTextarea ServiceDeskripsi layanan/isu"Generate Konten"Mengirim prompt ke Gemini AI, menampilkan hasil di Output View

5. Form Mode G-Bisnis (#gbisnis-fields)

Tombol/ElemenFungsiInput JudulJudul postinganLink TrelloMembuka papan Trello di tab baruTextarea Report DataPaste data laporan pelanggan"Generate Konten"Mengirim prompt ke Gemini AI

6. Form Mode WhatsApp (#wa-fields)

Tombol/ElemenFungsiInput JudulJudul promoTextarea Promo TypeDeskripsi jenis promo/layanan"Generate Konten"Mengirim prompt ke Gemini AI

7. Form Mode Facebook (#fb-fields)

Tombol/ElemenFungsiInput JudulJudul postinganLink TrelloMembuka papan Trello di tab baruTextarea Report DataPaste data laporan pelanggan"Generate Konten"Mengirim prompt ke Gemini AI

8. Form Mode TikTok (#tt-fields)

Tombol/ElemenFungsiInput JudulJudul videoTextarea Video DescDeskripsi tema video"Generate Konten"Mengirim prompt ke Gemini AI

9. Output View (#output-wrapper) — Hasil Generate

Muncul setelah konten berhasil di-generate atau saat membuka session tersimpan.

TombolFungsiBack arrowKembali ke form input (goBeranda())Copy AllMenyalin semua bagian output ke clipboardTab switching (IG only)Beralih antara tab NotebookLM / Doc Source / Caption IGCopy (per section)Menyalin satu bagian outputEdit (per section)Mengaktifkan mode edit (contentEditable)Regenerate (per section)Mengulang generate satu bagian via AIDownload (per section)Mengunduh satu bagian sebagai file .txt

10. Messages / Pesan (#messages-page)

Tombol/ElemenFungsiSearch inputMencari user lain berdasarkan emailSearch result itemMembuka/membuat percakapan dengan user tersebutConversation itemMembuka percakapan yang sudah ada

11. Chat Page (#chat-page)

Tombol/ElemenFungsiBack buttonKembali ke daftar pesanChat input + EnterMengirim pesan ke SupabaseSend buttonMengirim pesanTap bubbleMenampilkan popup copy/hapus pesan

12. Akun / Account (#akun-page)

TombolFungsiSwitch AccountLogout → redirect ke login.htmlAdd AccountLogout → redirect ke register.html

13. Pengaturan / Settings (#pengaturan-page)

Tombol/ElemenFungsiAPI Key input + Eye toggleMenampilkan/menyembunyikan API key GeminiSave buttonMenyimpan API key ke localStorageTest buttonMenguji API key ke Gemini APIModel selectorMengubah model Gemini yang digunakanTheme toggleBeralih mode gelap/terang (dengan animasi wipe)Animation toggleMengaktifkan/menonaktifkan animasiExport buttonMengunduh riwayat sebagai file .jsonImport buttonMengimpor riwayat dari file .jsonDelete All buttonMenghapus semua riwayat (dengan konfirmasi)Install PWAMemasang aplikasi sebagai PWAUpdate buttonMemeriksa pembaruan versi dari Supabase

14. Settings Modal (#settings-modal)

Modal overlay dengan accordion — alternatif dari halaman Pengaturan. Dibuka dari tombol gear di topbar. Berisi tombol-tombol yang sama dengan halaman Pengaturan, diorganisir dalam 4 bagian accordion: API, Preferensi, Riwayat, Aplikasi.

Navigasi (Sidebar & Dock)

Desktop (≥1024px): Sidebar kiri dengan section MENU, MODE, LAINNYA, dan footer Pengaturan.

Mobile (<1024px): Dock bar di bawah dengan 4 ikon:



Home → Beranda



Mode (expandable) → Pilih salah satu dari 5 mode (IG/G-Bisnis/WA/FB/TikTok)



Messages → Halaman pesan



Akun (expandable) → Switch/Add account



Settings → Membuka modal Pengaturan

Alur Navigasi Singkat

login/register → Beranda
  → Pilih mode → Form → Generate → Output
    → Copy/Edit/Regenerate/Download
  → Klik riwayat → Output (session tersimpan)
  → Pesan → Chat → Kirim pesan
  → Akun → Switch/Add account
  → Pengaturan → API/Theme/Export/Import/Install

Total ada 12 halaman/section utama + 5 komponen modal/overlay (Settings Modal, Dynamic Island, Update Modal, Custom Confirm Dialog, Account Dropdown).
