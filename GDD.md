# MACSUS AI ADVERTISING

## Game Design Document (GDD) — Application Design Document

| Field | Value |
|---|---|
| **Nama Aplikasi** | Macsus AI Advertising |
| **Versi** | 1.7.1 / v0.6.0 |
| **Tipe** | Progressive Web Application (PWA) |
| **Tanggal Pembuatan** | 2026 |
| **Status** | Produksi (Production) |
| **Platform** | Web (Mobile-first, Responsive) |
| **Stack Teknologi** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Supabase (PostgreSQL + REST API + Realtime) |
| **AI Provider** | Google Gemini API |
| **Domain** | macsus-ai-advertising-version.netlify.app |

---

## DAFTAR ISI

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Visi & Misi](#2-visi--misi)
3. [Arsitektur Aplikasi](#3-arsitektur-aplikasi)
4. [File & Struktur Proyek](#4-file--struktur-proyek)
5. [Desain UI/UX](#5-desain-uiux)
6. [Sistem Tema & Token Desain](#6-sistem-tema--token-desain)
7. [Sistem Navigasi](#7-sistem-navigasi)
8. [Modul Autentikasi](#8-modul-autentikasi)
9. [Modul Konten AI — Mode Generasi](#9-modul-konten-ai--mode-generasi)
10. [Sistem Manajemen Sesi & Riwayat](#10-sistem-manajemen-sesi--riwayat)
11. [Sistem Sinkronisasi Cloud](#11-sistem-sinkronisasi-cloud)
12. [Sistem Pesan (Messaging)](#12-sistem-pesan-messaging)
13. [Sistem Pembaruan Versi](#13-sistem-pembaruan-versi)
14. [Sistem API & Model AI](#14-sistem-api--model-ai)
15. [Database Schema](#15-database-schema)
16. [Animasi & Efek Visual](#16-animasi--efek-visual)
17. [PWA & Service Worker](#17-pwa--service-worker)
18. [Keamanan](#18-keamanan)
19. [Responsive Design](#19-responsive-design)
20. [Daftar Fungsi Lengkap](#20-daftar-fungsi-lengkap)
21. [LocalStorage Keys](#21-localstorage-keys)
22. [CDN & Dependensi Eksternal](#22-cdn--dependensi-eksternal)
23. [Roadmap & Pembaruan Mendatang](#23-roadmap--pembaruan-mendatang)

---

## 1. Ringkasan Eksekutif

**Macsus AI Advertising** adalah aplikasi web yang membantu pengguna membuat konten iklan dan promosi untuk berbagai platform media sosial menggunakan kecerdasan buatan Google Gemini. Aplikasi ini mendukung 5 platform utama: Instagram, Google Business, WhatsApp, Facebook, dan TikTok.

### Fitur Utama
- Generasi konten AI dengan 16 model Gemini dan auto-fallback
- 5 mode platform dengan format output berbeda
- Template layanan siap pakai untuk mode Instagram
- Autentikasi pengguna dengan sinkronisasi cloud
- Sistem pesan real-time antar pengguna
- PWA yang dapat diinstal
- Pembaruan otomatis dari server

---

## 2. Visi & Misi

### Visi
Menjadi aplikasi utama bagi UMKM dan bisnis kecil di Indonesia untuk membuat konten iklan digital profesional secara cepat dan mudah.

### Misi
- Menyederhanakan proses pembuatan konten iklan melalui AI
- Mendukung semua platform media sosial utama di Indonesia
- Menyediakan pengalaman pengguna yang cepat dan intuitif
- Mengintegrasikan sinkronisasi cloud untuk akses lintas perangkat

---

## 3. Arsitektur Aplikasi

### 3.1 Arsitektur High-Level

```
┌─────────────────────────────────────────────────┐
│                    CLIENT                        │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ index.html│  │style.css │  │  script.js   │  │
│  │  (SPA)   │  │(3154 baris)│ │ (2773 baris) │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                  │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │ supabaseauth │  │     sessionsync.js      │   │
│  │  (559 baris) │  │      (584 baris)        │   │
│  └──────────────┘  └────────────────────────┘   │
│                                                  │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │ versioncheck │  │     messaging.js        │   │
│  │  (588 baris) │  │      (693 baris)        │   │
│  └──────────────┘  └────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │          localStorage (Client)            │   │
│  │  Theme, API Key, History, Auth, Version   │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ Google Gemini│ │ Supabase │ │   Supabase   │
│  AI API      │ │ REST API │ │   Realtime   │
│              │ │          │ │              │
│ 16 Models    │ │ Auth     │ │ Messages     │
│ with Fallback│ │ Sessions │ │ Version      │
│              │ │ Users    │ │ Updates      │
└──────────────┘ └──────────┘ └──────────────┘
```

### 3.2 Alur Data

```
User Input → Validasi → Prompt Engineering → Gemini API
     ↓                                         ↓
  Form UI                              Response Parsing
     ↓                                         ↓
  Loading State                         Output Display
     ↓                                    (per mode)
  Auto-Save to                              ↓
  localStorage +                    Copy / Edit / Download
  Supabase Cloud                           ↓
                                    WhatsApp Share
```

---

## 4. File & Struktur Proyek

### 4.1 File Root

| File | Baris | Fungsi |
|---|---|---|
| `index.html` | 623 | Halaman utama SPA (Single Page Application) |
| `style.css` | 3154 | Seluruh stylesheet aplikasi |
| `script.js` | 2773 | Logika utama aplikasi (85 fungsi) |
| `login.html` | 248 | Halaman login |
| `register.html` | 267 | Halaman registrasi |
| `sw.js` | 21 | Service Worker (no-cache mode) |
| `manifest.json` | 24 | PWA manifest |
| `database_setup.sql` | 70 | Skema database Supabase |
| `ikon.png` | — | Ikon aplikasi |

### 4.2 Modul JavaScript

| File | Baris | Fungsi |
|---|---|---|
| `js/auth/supabaseauth.js` | 559 | Autentikasi Supabase (12 fungsi) |
| `js/features/sessionsync.js` | 584 | Sinkronisasi sesi cloud (14 fungsi) |
| `js/features/versioncheck.js` | 588 | Pemeriksaan versi otomatis (16 fungsi) |
| `js/features/messaging.js` | 693 | Sistem pesan in-app (25 fungsi) |

### 4.3 Total Kode

| Metrik | Nilai |
|---|---|
| Total baris HTML | ~1.138 |
| Total baris CSS | 3.154 |
| Total baris JavaScript | ~4.615 |
| Total seluruh | ~8.907 |

---

## 5. Desain UI/UX

### 5.1 Prinsip Desain
- **Mobile-first**: Dirancang untuk perangkat mobile, diperluas ke desktop
- **Clean & Minimalis**: Antarmuka tanpa elemen berlebih
- **Platform-aware**: Setiap mode memiliki warna dan identitas visual unik
- **Accessible**: Kontras warna memenuhi standar WCAG

### 5.2 Layout Utama

```
┌──────────────────────────┐
│         TOPBAR           │
│  Logo | Judul | Aksi     │
├──────────────────────────┤
│                          │
│      CONTENT AREA        │
│    (Scrollable)          │
│                          │
│  ┌────────────────────┐  │
│  │  Mode Info Panel   │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │    Form Panel      │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  Generate Button   │  │
│  └────────────────────┘  │
│                          │
├──────────────────────────┤
│      FOOTER NAVBAR       │
│ Beranda | IG | GB | WA   │
│    FB | TikTok           │
└──────────────────────────┘
```

### 5.3 Komponen UI

#### Topbar
- Logo aplikasi (ikon.png)
- Judul dinamis (berubah per mode)
- Indikator sinkronisasi
- Tombol pesan (dengan badge unread)
- Tombol pengaturan

#### Footer Navbar (6 tombol)
| Tombol | Ikon | Waktu Aktif |
|---|---|---|
| Beranda | `fa-house` | Default |
| Instagram | `fab fa-instagram` | Mode IG aktif |
| G-Bisnis | `fas fa-store` | Mode GB aktif |
| WhatsApp | `fab fa-whatsapp` | Mode WA aktif |
| Facebook | `fab fa-facebook` | Mode FB aktif |
| TikTok | `fab fa-tiktok` | Mode TT aktif |

#### Form Panel
- Panel header dengan ikon platform
- Input field berlabel
- Textarea dengan counter karakter
- Tombol Generate dengan gradient animasi

#### Output Area
- Tab switcher (untuk mode IG)
- Card output dengan aksi: Salin, Edit, Regenerate, Download
- Counter karakter visual (progress bar)
- Tombol "Salin Semua"

### 5.4 Sistem Warna per Platform

| Platform | Warna Primer | Warna Light | Gradient |
|---|---|---|---|
| Instagram | `#E1306C` | `rgba(225,48,108,0.08)` | Ungu → Pink → Orange → Kuning |
| Google Business | `#D97706` | `rgba(217,119,6,0.08)` | Merah → Oren → Kuning → Hijau |
| WhatsApp | `#25D366` | `rgba(37,211,102,0.08)` | Hijau Tua → Teal → Hijau |
| Facebook | `#1877F2` | `rgba(24,119,242,0.08)` | Biru Tua → Biru Muda |
| TikTok | `#010101` | `rgba(0,0,0,0.06)` | Hitam → Cyan → Merah |

---

## 6. Sistem Tema & Token Desain

### 6.1 Design Tokens (`:root`)

```css
/* Warna Halaman */
--bg-page: #F8FAFC;
--bg-surface: #FFFFFF;
--bg-elevated: #FFFFFF;
--bg-hover: #F1F5F9;
--bg-active: #E2E8F0;

/* Border */
--border: #E2E8F0;
--border-light: #F1F5F9;
--border-focus: #0D9488;

/* Teks */
--text-primary: #0F172A;
--text-secondary: #475569;
--text-tertiary: #94A3B8;
--text-inverse: #F8FAFC;

/* Aksen */
--accent: #0D9488;
--accent-hover: #0F766E;
--accent-light: #CCFBF1;
--accent-muted: rgba(13,148,136,0.08);

/* Bayangan */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 1px 3px rgba(0,0,0,0.08);
--shadow-lg: 0 4px 12px rgba(0,0,0,0.1);

/* Border Radius */
--r-sm: 6px;
--r-md: 8px;
--r-lg: 12px;
--r-xl: 16px;

/* Font */
--font-sans: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### 6.2 Dark Mode Tokens (`body.dark-mode`)

```css
--bg-page: #0F1117;
--bg-surface: #1A1D27;
--bg-elevated: #1A1D27;
--bg-hover: #252833;
--bg-active: #2E3140;
--border: #2E3140;
--border-light: #252833;
--border-focus: #14B8A6;
--text-primary: #F1F5F9;
--text-secondary: #CBD5E1;
--text-tertiary: #64748B;
--accent: #14B8A6;
--accent-hover: #2DD4BF;
--shadow-sm: 0 1px 2px rgba(0,0,0,0.25);
--shadow-md: 0 1px 3px rgba(0,0,0,0.35);
--shadow-lg: 0 4px 12px rgba(0,0,0,0.45);
```

### 6.3 Transition Tema

Tema menggunakan efek **layer duplication + clip-path wipe**:
1. Clone element body sebagai overlay
2. Terapkan tema baru
3. Animasi `clip-path` dari `inset(0 0 100% 0)` ke `inset(0 0 0% 0)`
4. Tambahkan glow line horizontal
5. Hapus clone setelah animasi selesai

---

## 7. Sistem Navigasi

### 7.1 Struktur Navigasi

Aplikasi menggunakan **Single Page Application (SPA)** pattern tanpa library routing.

```
login.html / register.html
        │
        ▼
    index.html
        │
        ├── #beranda-view (Halaman Beranda)
        │     ├── Mode Info Tabs
        │     ├── Default Panel
        │     ├── Mode Info Panel
        │     └── History List
        │
        ├── #ig-fields (Form Instagram)
        ├── #gbisnis-fields (Form Google Business)
        ├── #wa-fields (Form WhatsApp)
        ├── #fb-fields (Form Facebook)
        ├── #tt-fields (Form TikTok)
        │
        ├── #output-wrapper (Area Output)
        │
        ├── #messages-page (Pesan)
        │     └── #chat-page (Chat)
        │
        └── #settings-modal (Pengaturan)
```

### 7.2 Fungsi Navigasi Utama

| Fungsi | Tujuan |
|---|---|
| `goBeranda()` | Navigasi ke halaman beranda |
| `setMode(mode)` | Membuka form mode tertentu |
| `backToInput()` | Kembali dari output ke form |
| `newSession()` | Membuat sesi baru (ke beranda) |
| `openMessages()` | Membuka halaman pesan |
| `openChat(...)` | Membuka percakapan chat |
| `closeChat()` | Menutup chat, kembali ke daftar pesan |

### 7.3 Animasi Navigasi

Setiap transisi halaman menggunakan animasi:
- **Keluar**: Fade out + translate ke kiri/bawah
- **Masuk**: Fade in + translate dari kanan/atas
- **Durasi**: 200-400ms
- **Easing**: `easeOutCubic` / `easeInQuad`

---

## 8. Modul Autentikasi

### 8.1 Alur Autentikasi

```
┌─────────┐     ┌──────────┐     ┌─────────────┐
│ Register │────▶│ Supabase │────▶│ localStorage │
│ (email + │     │ users    │     │ user_id      │
│ password)│     │ table    │     │ email        │
└─────────┘     └──────────┘     │ session_id   │
                                  │ auth_token   │
┌─────────┐     ┌──────────┐     │ refresh_token│
│  Login  │────▶│ Verifikasi│────▶│ device_id    │
│ (email + │     │ password │     │ cache_ts     │
│ password)│     │ hash     │     └─────────────┘
└─────────┘     └──────────┘
```

### 8.2 Keamanan Password

- **Hashing**: SHA-256 dengan salt (gabungan email + password)
- **Implementasi**: Web Crypto API (utama) + Pure JS fallback
- **Penyimpanan**: Hanya hash yang disimpan, plaintext tidak pernah dikirim

### 8.3 Sistem Token

| Token | Masa Aktif | Fungsi |
|---|---|---|
| Auth Token | 1 jam | Autentikasi API request |
| Refresh Token | 30 hari | Memperpanjang session |
| Device ID | Permanen | Identifikasi perangkat |

### 8.4 Auto-Login

Saat aplikasi dimuat:
1. Cek `macsus_user_id` di localStorage
2. Validasi `macsus_auth_token` (cek expiry)
3. Jika expired, generate token baru menggunakan refresh token
4. Jika refresh token expired, paksa login ulang

### 8.5 Fitur Akun

| Fitur | Deskripsi |
|---|---|
| Tambah Akun | Logout + redirect ke registrasi |
| Ganti Akun | Logout + redirect ke login |
| Info Akun | Menampilkan email & nama di dropdown |

---

## 9. Modul Konten AI — Mode Generasi

### 9.1 Instagram (`ig`)

#### Input Fields
| Field | Tipe | Placeholder |
|---|---|---|
| Judul Konten | text | "Judul konten, misal: Promosi Servis Laptop" |
| Jenis Layanan | text (dengan template) | Pilih atau ketik layanan |
| Detail Produk/Layanan | textarea | "Apa yang perlu diketahui AI tentang layanan ini?" |
| Target Audiens | text | "Siapa target audiens konten ini?" |
| Catatan Tambahan | textarea | "Instruksi tambahan..." |

#### Template Layanan (8 preset)
1. Overheat Treatment
2. Ganti Layar
3. Liquid Spill
4. Ganti HDD/SSD
5. Perbaikan Motherboard
6. Install Ulang OS
7. Remove Virus/Malware
8. Upgrade RAM

#### Output (3 sections)
| Section | Label | Deskripsi |
|---|---|---|
| 1 | Prompt NotebookLM | Prompt untuk NotebookLM |
| 2 | Dok. Sumber | Dokumen sumber referensi |
| 3 | Caption IG | Caption Instagram (maks 2200 karakter) |

#### Karakteristik Prompt
- Format output: 3 bagian terpisah
- Caption harus engaging dan persuasif
- Menggunakan hashtag relevan
- Tone: profesional tapi approachable

---

### 9.2 Google Business (`gbisnis`)

#### Input Fields
| Field | Tipe |
|---|---|
| Judul Postingan | text |
| Jenis Bisnis | text |
| Detail Produk/Layanan | textarea |
| Target Audiens | text |
| Catatan Tambahan | textarea |

#### Output
- 1 section: Google Business Post
- Maks 1500 karakter
- Format storytelling yang menarik pelanggan

---

### 9.3 WhatsApp (`wa`)

#### Input Fields
| Field | Tipe |
|---|---|
| Judul Pesan | text |
| Jenis Promosi | text |
| Detail Produk/Layanan | textarea |
| Target Audiens | text |
| Catatan Tambahan | textarea |

#### Output
- 1 section: Broadcast WhatsApp
- Maks 400 karakter (sweet spot: 200-400)
- Format: pesan broadcast promosi, follow-up, info layanan

---

### 9.4 Facebook (`fb`)

#### Input Fields
| Field | Tipe |
|---|---|
| Judul Post | text |
| Jenis Bisnis | text |
| Detail Produk/Layanan | textarea |
| Target Audiens | text |
| Catatan Tambahan | textarea |

#### Output
- 1 section: Facebook Post
- Maks 5000 karakter (sweet spot: 1000-5000)
- Copywriting yang engaging dan persuasif

---

### 9.5 TikTok (`tt`)

#### Input Fields
| Field | Tipe |
|---|---|
| Judul Video | text |
| Gaya Konten | text |
| Detail Video | textarea |
| Target Audiens | text |
- Catatan Tambahan | textarea |

#### Output
- 1 section: TikTok Caption
- Maks 2200 karakter (sweet spot: 150-300)
- Hook kuat + CTA jelas
- Viral-friendly

---

### 9.6 Counter Karakter

| Platform | Maks | Warna Saat Aman | Warna Saat Dekat Limit |
|---|---|---|---|
| Instagram Caption | 2200 | Hijau | Merah |
| Google Business | 1500 | Hijau | Merah |
| WhatsApp | 400 | Hijau | Merah |
| Facebook | 5000 | Hijau | Merah |
| TikTok | 2200 | Hijau | Merah |

---

## 10. Sistem Manajemen Sesi & Riwayat

### 10.1 Struktur Sesi

```json
{
  "id": "uuid-v4",
  "title": "Judul Konten",
  "mode": "ig|gbisnis|wa|fb|tt",
  "data": {
    "input": { "fields form input" },
    "output": { "hasil generate" }
  },
  "pinned": false,
  "createdAt": "ISO-8601 timestamp"
}
```

### 10.2 Penyimpanan

| Lokasi | Kapasitas | Persistensi |
|---|---|---|
| `localStorage` | Max 50 sesi | Sampai di-clear |
| Supabase `user_sessions` | Unlimited | Permanen (cloud) |

### 10.3 Fitur Riwayat

| Fitur | Deskripsi |
|---|---|
| Auto-save | Sesi otomatis tersimpan setelah generate |
| Search | Filter berdasarkan judul atau konten |
| Pin/Unpin | Tandai sesi penting |
| Delete | Hapus satu atau semua (dengan konfirmasi) |
| Export | Download sebagai file .json |
| Import | Upload file .json (merge dengan yang ada) |

### 10.4 Load Sesi

Saat memuat sesi dari riwayat:
1. Parse data sesi
2. Terapkan mode theme (`applyModeTheme`)
3. Isi form input dengan data tersimpan
4. Tampilkan output yang sudah di-generate
5. Animasi transisi ke output view

---

## 11. Sistem Sinkronisasi Cloud

### 11.1 Arsitektur Sync

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  LocalStorage │────▶│  Sync Engine  │────▶│   Supabase   │
│              │◀────│              │◀────│   user_      │
│  - history   │     │  - Smart     │     │   sessions   │
│  - queue     │     │    Merge     │     │              │
└──────────────┘     │  - Offline   │     └──────────────┘
                     │    Queue     │
                     │  - Periodic  │
                     │    Sync      │
                     └──────────────┘
```

### 11.2 Smart Merge

Prioritas: **Cloud > Local**

1. Muat semua sesi dari Supabase
2. Muat semua sesi dari localStorage
3. Gabungkan berdasarkan `session_id`
4. Jika konflik, Supabase menang
5. Simpan hasil gabungan ke localStorage

### 11.3 Offline Queue

Ketika offline:
1. Perubahan (save/delete/pin) dimasukkan ke queue
2. Queue disimpan di `macsus_sync_queue`
3. Saat online kembali, queue diproses secara berurutan

### 11.4 Periodic Sync

- Interval: **5 menit**
- Sync dilakukan otomatis saat online
- Indikator sinkronisasi di topbar: syncing (putih) → synced (hijau) → error (merah)

---

## 12. Sistem Pesan (Messaging)

### 12.1 Arsitektur

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Chat UI     │────▶│  REST API    │────▶│  Supabase    │
│              │◀────│  (Fetch)     │◀────│              │
│  - Messages  │     │              │     │ conversations│
│  - Input     │     └──────────────┘     │ messages     │
│  - Actions   │                          │              │
└──────────────┘     ┌──────────────┐     └──────────────┘
                     │  Realtime    │
                     │  (WebSocket) │
                     │  + Polling   │
                     │  (fallback)  │
                     └──────────────┘
```

### 12.2 Fitur

| Fitur | Deskripsi |
|---|---|
| Pencarian User | Cari pengguna lain berdasarkan email |
| Mulai Chat | Buat atau buka percakapan yang sudah ada |
| Kirim Pesan | Teks dengan optimistic UI update |
| Badge Unread | Jumlah pesan belum dibaca di topbar |
| Tanda Dibaca | Auto-mark saat membuka percakapan |
| Aksi Pesan | Salin teks, hapus pesan sendiri |
| Real-time | Supabase Realtime subscription |
| Polling Fallback | Polling 3 detik jika realtime gagal |

### 12.3 Tipe Pesan

```json
{
  "id": "uuid",
  "conversation_id": "uuid",
  "sender_id": "uuid",
  "content": "teks pesan",
  "read": false,
  "created_at": "ISO-8601"
}
```

### 12.4 Bubble Chat

| Tipe | Arah | Warna |
|---|---|---|
| `.mine` | Kanan | Warna aksen (hijau/teal) |
| `.theirs` | Kiri | Abu-abu terang/gelap |

### 12.5 Aksi Bubble (Long Press/Tap)
- Salin teks pesan
- Hapus pesan (hanya untuk pesan sendiri)

---

## 13. Sistem Pembaruan Versi

### 13.1 Alur

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  App Start   │────▶│  Version     │────▶│  Supabase    │
│              │     │  Check       │     │ app_versions │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
              Versi Baru      Versi Sama
                    │               │
              ┌─────┴─────┐        │
              │           │        │
          Force Update  Normal    Lanjut
              │         Update
              │           │
         Timer 30s   Reload Page
         + Reload
```

### 13.2 Mekanisme

| Parameter | Nilai |
|---|---|
| Interval pengecekan | 1 detik |
| Penyimpanan versi | `macsus_current_version` |
| Indikator update | Titik merah berkedip di tombol settings |
| Force update | Timer 30 detik + auto-reload |
| Normal update | Modal info + tombol "Update Sekarang" |

### 13.3 Realtime Listener

Menggunakan Supabase Realtime untuk mendeteksi perubahan versi secara instan tanpa harus menunggu interval pengecekan.

---

## 14. Sistem API & Model AI

### 14.1 Google Gemini API

**Endpoint:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}
```

### 14.2 Model yang Didukung (16 model)

| # | Model | Prioritas | Tipe |
|---|---|---|---|
| 1 | gemini-2.5-flash | Default | Flash |
| 2 | gemini-2.5-pro | Pro | Pro |
| 3 | gemini-2.5-flash-lite | Lite | Flash |
| 4 | gemini-2.0-flash | Stable | Flash |
| 5 | gemini-2.0-flash-001 | Stable | Flash |
| 6 | gemini-2.0-flash-lite | Lite | Flash |
| 7 | gemini-2.0-flash-lite-001 | Lite | Flash |
| 8 | gemini-flash-latest | Latest | Flash |
| 9 | gemini-flash-lite-latest | Latest | Flash |
| 10 | gemini-pro-latest | Latest | Pro |
| 11 | gemma-4-26b-a4b-it | Open | Open |
| 12 | gemma-4-31b-it | Open | Open |
| 13 | gemini-3-flash-preview | Preview | Flash |
| 14 | gemini-3-pro-preview | Preview | Pro |
| 15 | gemini-3.1-flash-lite-preview | Preview | Flash |
| 16 | gemini-3.1-pro-preview | Preview | Pro |

### 14.3 Auto-Fallback

Ketika model gagal (HTTP 429, 503, overload), sistem secara otomatis mencoba model berikutnya dalam urutan prioritas. Progress ditampilkan di modal khusus.

```
Model 1 → Gagal → Model 2 → Gagal → Model 3 → ... → Berhasil
                                                    → Semua gagal → Error
```

### 14.4 Prompt Engineering

Setiap mode memiliki system prompt yang dioptimasi:

**Instagram:**
```
Buat konten Instagram profesional berdasarkan informasi berikut:
- Judul: {judul}
- Layanan: {layanan}
- Detail: {detail}
- Target: {target}
- Catatan: {catatan}

Buat 3 output:
1. Prompt untuk NotebookLM
2. Dokumen sumber
3. Caption Instagram (maks 2200 karakter)
```

**WhatsApp:**
```
Buat broadcast WhatsApp promosi:
- Judul: {judul}
- Jenis: {jenis}
- Detail: {detail}
- Target: {target}

Pastikan pesan singkat (200-400 karakter), padat, dan persuasif.
```

---

## 15. Database Schema

### 15.1 Tabel `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);
```

### 15.2 Tabel `user_sessions`

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  session_title TEXT NOT NULL,
  mode TEXT NOT NULL,
  content_data JSONB NOT NULL,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 15.3 Tabel `app_versions`

```sql
CREATE TABLE app_versions (
  id SERIAL PRIMARY KEY,
  version_code TEXT NOT NULL,
  version_name TEXT NOT NULL,
  changelog TEXT,
  force_update BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 15.4 Tabel `login_cache`

```sql
CREATE TABLE login_cache (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 15.5 Tabel `conversations`

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id),
  user2_id UUID REFERENCES users(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 15.6 Tabel `messages`

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 16. Animasi & Efek Visual

### 16.1 CSS Keyframe Animations

| Animasi | Fungsi | Durasi |
|---|---|---|
| `glossySweep` | Efek glossy pada history item | 0.5s |
| `panelRound` | Expand panel mode (border-radius) | 0.4s |
| `panelRoundRev` | Collapse panel mode | 0.3s |
| `shadowIn` | Shadow masuk pada panel expand | 0.4s |
| `shadowOut` | Shadow keluar | 0.3s |
| `gradientSlide` | Animasi gradasi background | Bervariasi |
| `spin` | Rotasi spinner loading | 1s |
| `pulse` | Pulsing dot update indicator | — |

### 16.2 Anime.js Animations

| Konteks | Elemen | Efek |
|---|---|---|
| Theme toggle | Clone layer | clip-path wipe + glow line |
| Account menu | Dropdown | translateY + opacity |
| Settings modal | Modal | scale + opacity + stagger sections |
| Mode info panel | Panel | opacity + translateY + panelRound |
| Mode info text | Name/Desc | Per-character stagger |
| Footer nav | Icon | Rotation (1turn) + label fade |
| Topbar title | Text | Per-character stagger |
| Beranda entry | All elements | Staggered fade-in |
| Mode form entry | Panels | Slide in dari kanan |
| Session output | Wrapper | Fade + translateY |

### 16.3 Gradient Animation

**Pola:**
```css
@keyframes gradientSlide {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
```

**Durasi per mode (panel):**
| Mode | Jumlah Warna | Durasi |
|---|---|---|
| Instagram | 5 | 8 detik |
| Google Business | 4 | 6 detik |
| TikTok | 3 | 5 detik |
| WhatsApp | 3 | 4 detik |
| Facebook | 2 | 3 detik |

**Tombol Generate:** 3 detik (semua mode)

**Direction:** `alternate` (bolak-balik)

### 16.4 Efek Glossy

Pada history item saat diklik:
- Garis highlight bergerak dari kanan ke kiri
- Warna mengikuti mode platform
- Durasi: 0.5 detik

---

## 17. PWA & Service Worker

### 17.1 Manifest (`manifest.json`)

```json
{
  "name": "Macsus AI",
  "short_name": "Macsus AI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8FAFC",
  "theme_color": "#0D9488",
  "icons": [
    {
      "src": "ikon.png",
      "sizes": "any",
      "type": "image/png"
    }
  ]
}
```

### 17.2 Service Worker (`sw.js`)

Saat ini dalam mode **no-cache** untuk testing. Strategi caching akan ditambahkan di versi mendatang.

### 17.3 Install Prompt

- Tombol Install PWA di footer
- Menggunakan `beforeinstallprompt` event
- Menyimpan `deferredPrompt` untuk触发 install

---

## 18. Keamanan

### 18.1 Autentikasi

| Layer | Mekanisme |
|---|---|
| Password | SHA-256 hash dengan salt |
| Token | JWT-like token (1 jam expiry) |
| Refresh | Token refresh (30 hari) |
| Device | Browser fingerprint unik |

### 18.2 Perlindungan Data

| Data | Lokasi | Enkripsi |
|---|---|---|
| Password | Supabase (hash) | SHA-256 |
| API Key | localStorage | Tidak (client-side) |
| Sesi | Supabase + localStorage | TLS (传输) |
| Pesan | Supabase | TLS (传输) |

### 18.3 XSS Prevention

- `escapeHtml()` digunakan di semua output user-generated
- `textContent` digunakan alih-alih `innerHTML` untuk konten teks
- Input di-sanitasi sebelum dikirim ke API

### 18.4 CORS

Semua request ke Supabase menggunakan header CORS yang sesuai.

---

## 19. Responsive Design

### 19.1 Breakpoints

| Breakpoint | Lebar | Target |
|---|---|---|
| Mobile | Default (< 768px) | Smartphone, Tablet kecil |
| Tablet | 768px - 1023px | Tablet |
| Desktop | ≥ 1024px | Laptop, Desktop |

### 19.2 Adaptasi Layout

**Mobile (< 768px):**
- Full-width layout
- Footer navbar tetap di bawah
- Content area scrollable
- Form fields stacked

**Desktop (≥ 1024px):**
- Max-width content: 1100px
- Centered layout
- Lebih banyak ruang horizontal

### 19.3 Komponen Responsif

| Komponen | Mobile | Desktop |
|---|---|---|
| Topbar | Compact | Full |
| Content area | 100% width | Max 1100px |
| Footer nav | 6 ikon | 6 ikon + label |
| History items | Full width | Max width |
| Modals | Fullscreen | Centered |

---

## 20. Daftar Fungsi Lengkap

### 20.1 script.js (85 fungsi)

<details>
<summary>Klik untuk melihat semua fungsi</summary>

**Tema & Animasi:**
- `initTheme()` — Memuat tema dari localStorage
- `toggleTheme()` — Animasi perpindahan tema
- `updateThemeIcon()` — Update ikon moon/sun
- `initAnimationPreference()` — Memuat preferensi animasi
- `toggleAnimations()` — Toggle animasi CSS
- `updateAnimationToggleButton()` — Update tombol animasi

**Akun:**
- `toggleAccountMenu()` — Toggle dropdown akun
- `openAccountMenu(btn)` — Buka dropdown dengan animasi
- `closeAccountMenu()` — Tutup dropdown
- `updateAccountDisplay()` — Update info akun
- `handleSwitchAccount()` — Ganti akun
- `handleAddAccount()` — Tambah akun

**Navigasi:**
- `applyModeTheme(mode)` — Terapkan tema mode
- `updateFooterNav(mode)` — Update navbar aktif
- `animateTitleText(text)` — Animasi judul
- `animateText(el, text, opts)` — Animasi teks generik
- `updateTopbarTitle(mode)` — Update topbar
- `goBeranda()` — Navigasi ke beranda
- `newSession()` — Sesi baru
- `backToInput()` — Kembali ke form
- `setMode(mode)` — Set mode aktif

**Beranda:**
- `filterBerandaHistory(text)` — Filter riwayat
- `renderBerandaHistory()` — Render daftar riwayat
- `resetBerandaElements()` — Reset elemen beranda
- `animateBeranda()` — Animasi masuk beranda
- `animateBerandaOut()` — Animasi keluar beranda

**Mode Form:**
- `useModeFromInfo()` — Buka form dari info panel
- `showDefaultPanel()` — Tampilkan panel default
- `hideDefaultPanel()` — Sembunyikan panel default
- `resetModeElements(mode)` — Reset elemen form
- `animateModeOut(mode)` — Animasi keluar form

**Output:**
- `switchTab(idx)` — Switch tab output IG
- `loadSession(id)` — Muat sesi dari riwayat
- `animateSessionOut()` — Animasi keluar output
- `copySection(id)` — Salin section
- `copyAll()` — Salin semua
- `downloadSection(id, name)` — Download section
- `downloadAllAsText()` — Download semua
- `editSection(id)` — Edit inline
- `regenerateSection(id, idx)` — Regenerate section
- `clearAllOutputSections()` — Bersihkan output

**Riwayat:**
- `saveSession(title, mode, data)` — Simpan sesi
- `deleteSession(id)` — Hapus sesi
- `togglePin(id)` — Toggle pin
- `openHistMenu(id, btn)` — Buka menu riwayat
- `closeHistMenu()` — Tutup menu
- `clearHistory()` — Hapus semua riwayat
- `exportHistoryAsJSON()` — Export JSON
- `triggerImportHistory()` — Trigger import
- `importHistoryFromFile(event)` — Import JSON

**API & Model:**
- `loadApiKeyToInput()` — Load API key
- `saveApiKey()` — Simpan API key
- `updateApiKeyStatus()` — Update status
- `toggleApiKeyVisibility()` — Toggle visibility
- `initModelSelect()` — Init model selector
- `getSelectedModel()` — Get model aktif
- `loadModelToDropdown()` — Load model
- `saveModel()` — Simpan model
- `updateModelBadge(model)` — Update badge
- `testApiKey()` — Test API key
- `initIgTemplateSelect()` — Init template selector

**Generasi AI:**
- `generateAds()` — Fungsi utama generasi
- `parseAndShowIG(text, title)` — Parse output IG
- `parseAndShowGBisnis(text)` — Parse output GB
- `parseAndShowWA(text)` — Parse output WA
- `parseAndShowFB(text)` — Parse output FB
- `parseAndShowTT(text)` — Parse output TT
- `cleanSection(text, headers)` — Bersihkan section

**Counter Karakter:**
- `updateCharCounter(count)` — Counter GB (1500)
- `updateCaptionCharCounter(count)` — Counter IG (2200)
- `updateWACharCounter(count)` — Counter WA (400)
- `updateFBCharCounter(count)` — Counter FB (5000)
- `updateTTCharCounter(count)` — Counter TT (2200)

**UI Utilitas:**
- `showToast(msg)` — Toast notification
- `setError(html)` — Tampilkan error
- `clearError()` — Bersihkan error
- `setLoading(on)` — Toggle loading
- `customConfirm(...)` — Dialog konfirmasi
- `confirmCustomAlert()` — Konfirmasi ya
- `closeCustomAlert()` — Tutup dialog
- `closeModelProgress()` — Tutup progress modal
- `retryGenerate()` — Retry generasi

**WhatsApp:**
- `shareToWhatsApp(id)` — Share ke WA
- `openInWhatsApp(id)` — Buka di WA

**PWA:**
- `updateInstallBtn()` — Update tombol install
- `installPWA()` — Install PWA

**Template:**
- `applyServiceTemplate(value)` — Terapkan template

**Pengaturan:**
- `toggleSettings()` — Toggle settings

</details>

### 20.2 supabaseauth.js (12 fungsi)

| Fungsi | Deskripsi |
|---|---|
| `generateDeviceId()` | Generate/perbarui device fingerprint |
| `hashPassword(pw, email)` | SHA-256 hash dengan salt |
| `sha256PureJS(msg)` | SHA-256 pure JavaScript |
| `generateSessionId()` | Generate session ID unik |
| `generateAuthToken()` | Generate auth token (1 jam) |
| `generateRefreshToken()` | Generate refresh token (30 hari) |
| `registerUser(email, pw)` | Registrasi pengguna |
| `loginUser(email, pw)` | Login pengguna |
| `logoutUser()` | Logout + bersihkan localStorage |
| `isUserLoggedIn()` | Cek status login |
| `getCurrentUser()` | Ambil info pengguna |
| `autoLogin()` | Auto-login saat startup |

### 20.3 sessionsync.js (14 fungsi)

| Fungsi | Deskripsi |
|---|---|
| `getAuthToken()` | Ambil auth token |
| `getUserId()` | Ambil user ID |
| `updateSyncIndicator(status)` | Update indikator sinkron |
| `showSyncToast(msg, type)` | Toast sinkron |
| `saveSessionToSupabase(...)` | Simpan sesi ke cloud |
| `loadSessionsFromSupabase()` | Muat sesi dari cloud |
| `smartLoadAndMerge()` | Merge cerdas cloud + local |
| `deleteSessionFromSupabase(id)` | Hapus sesi dari cloud |
| `deleteAllSessionsFromSupabase()` | Hapus semua dari cloud |
| `updatePinInSupabase(id, pin)` | Update pin di cloud |
| `queueSessionForUpload(data)` | Queue offline |
| `processOfflineQueue()` | Proses queue offline |
| `initSessionSync()` | Init sinkronisasi |
| `startPeriodicSync()` | Mulai sync periodik (5 menit) |

### 20.4 versioncheck.js (16 fungsi)

| Fungsi | Deskripsi |
|---|---|
| `getStoredVersion()` | Ambil versi tersimpan |
| `saveCurrentVersion(v)` | Simpan versi |
| `compareVersions(v1, v2)` | Bandingkan versi semantik |
| `getLastCheckTime()` | Ambil waktu pengecekan terakhir |
| `shouldCheckForUpdate()` | Cek apakah perlu pengecekan |
| `showUpdateIndicator()` | Tampilkan titik merah |
| `hideUpdateIndicator()` | Sembunyikan indikator |
| `fetchLatestVersionFromSupabase()` | Fetch versi terbaru |
| `checkForUpdates(silent)` | Pengecekan update |
| `showUpdateModal(cur, data)` | Tampilkan modal update |
| `closeUpdateModal()` | Tutup modal |
| `performUpdate()` | Eksekusi update |
| `updateCheckButton(state)` | Update tombol cek |
| `showVersionToast(msg, type)` | Toast versi |
| `setupRealtimeVersionListener()` | Subscribe realtime |
| `initVersionCheck()` | Init pengecekan versi |

### 20.5 messaging.js (25 fungsi)

| Fungsi | Deskripsi |
|---|---|
| `getMsgHeaders()` | Ambil header Supabase |
| `getMsgUserId()` | Ambil user ID |
| `getMsgEmail()` | Ambil email |
| `initSupabaseClient()` | Init client Supabase |
| `openMessages()` | Buka halaman pesan |
| `openChat(convId, userId, email)` | Buka chat |
| `closeChat()` | Tutup chat |
| `updateTopbarTitleCustom(title)` | Update topbar custom |
| `searchUsersForChat(query)` | Cari pengguna |
| `startChatWith(userId, email)` | Mulai chat |
| `getOrCreateConversation(u1, u2)` | Ambil/buat percakapan |
| `loadConversations()` | Muat percakapan |
| `getUnreadCounts(myId)` | Hitung belum dibaca |
| `loadMessages(convId)` | Muat pesan |
| `renderMessages(messages)` | Render pesan |
| `sendMessage()` | Kirim pesan |
| `appendSingleMessage(m)` | Tambah 1 pesan |
| `showBubblePopup(e, el)` | Popup aksi bubble |
| `hideBubblePopup()` | Sembunyikan popup |
| `copyBubbleText(msgId)` | Salin teks bubble |
| `deleteBubbleMessage(msgId)` | Hapus pesan bubble |
| `markAsRead(convId)` | Tandai sudah dibaca |
| `updateConversationLastMessage(...)` | Update pesan terakhir |
| `subscribeToMessages(convId)` | Subscribe realtime pesan |
| `startPolling(convId)` | Mulai polling (3 detik) |
| `stopPolling()` | Hentikan polling |
| `unsubscribeMessages()` | Unsubscribe pesan |
| `updateBadgeCount()` | Update badge unread |
| `subscribeGlobalMessages()` | Subscribe global |
| `escapeHtml(text)` | Escape XSS |
| `formatMsgTime(iso)` | Format waktu relatif |
| `formatMsgTimeShort(iso)` | Format waktu HH:MM |
| `scrollChatToBottom()` | Scroll ke bawah |

---

## 21. LocalStorage Keys

| Key | Tipe | Default | Deskripsi |
|---|---|---|---|
| `theme-mode` | `'light'` / `'dark'` | `'light'` | Tema aktif |
| `animations-disabled` | `'true'` / `'false'` | `'false'` | Animasi dinonaktifkan |
| `macsus_gemini_api_key` | string | — | API key Gemini |
| `macsus_gemini_model` | string | `'gemini-2.5-flash'` | Model aktif |
| `macsus_history` | JSON array | `[]` | Riwayat sesi (max 50) |
| `macsus_user_id` | UUID | — | ID pengguna |
| `macsus_email` | string | — | Email pengguna |
| `macsus_session_id` | string | — | Session ID |
| `macsus_auth_token` | string | — | Auth token (1 jam) |
| `macsus_refresh_token` | string | — | Refresh token (30 hari) |
| `macsus_device_id` | string | — | Device fingerprint |
| `macsus_cache_ts` | ISO string | — | Timestamp cache auth |
| `macsus_current_version` | string | — | Versi tersimpan |
| `macsus_version_last_check` | ISO string | — | Waktu pengecekan terakhir |
| `macsus_update_available` | JSON string | — | Info update tersedia |
| `macsus_sync_queue` | JSON array | `[]` | Antrian offline |

---

## 22. CDN & Dependensi Eksternal

| Layanan | URL | Versi | Fungsi |
|---|---|---|---|
| Google Fonts | fonts.googleapis.com | — | Inter (400-700), JetBrains Mono |
| Font Awesome | cdnjs.cloudflare.com | 6.4.0 | Ikon |
| Supabase JS | cdn.jsdelivr.net | v2 | Client SDK |
| Anime.js | cdnjs.cloudflare.com | 3.2.2 | Animasi |
| Google Gemini | generativelanguage.googleapis.com | v1beta | AI API |

---

## 23. Roadmap & Pembaruan Mendatang

### Versi 5.1.0 (Planned)
- [ ] Strategi caching Service Worker
- [ ] Push notifications untuk pesan
- [ ] Mode gelap system-wide (prefers-color-scheme)
- [ ] Export ke PDF

### Versi 5.2.0 (Planned)
- [ ] Grup chat (multi-user)
- [ ] Voice note di pesan
- [ ] Riwayat versi lengkap (changelog viewer)
- [ ] Analitik penggunaan

### Versi 6.0.0 (Future)
- [ ] Mode generasi gambar (DALL-E / Stable Diffusion)
- [ ] Template konten kustom
- [ ] Kolaborasi tim
- [ ] Integrasi media sosial langsung
- [ ] Dashboard analitik

---

## Lampiran

### A. Kode Prompt Gemini

**Instagram Prompt:**
```
Kamu adalah AI ahli copywriting Instagram. Buat konten Instagram profesional berdasarkan data berikut:

Judul: {judul}
Layanan: {layanan}
Detail: {detail}
Target: {target}
Catatan: {catatan}

Buat dalam format:
1. PROMPT NOTEBOOKLM — Prompt detail untuk NotebookLM
2. DOKUMEN SUMBER — Dokumen referensi
3. CAPTION IG — Caption Instagram (maks 2200 karakter, engaging, dengan hashtag)
```

**WhatsApp Prompt:**
```
Kamu adalah AI ahli copywriting WhatsApp. Buat broadcast WhatsApp:

Judul: {judul}
Jenis: {jenis}
Detail: {detail}
Target: {target}

Buat pesan 200-400 karakter, padat, persuasif, dengan CTA jelas.
```

### B. Icon Map

| Platform | Ikon FA | Warna |
|---|---|---|
| Instagram | `fab fa-instagram` | #E1306C |
| Google Business | `fas fa-store` | #D97706 |
| WhatsApp | `fab fa-whatsapp` | #25D366 |
| Facebook | `fab fa-facebook` | #1877F2 |
| TikTok | `fab fa-tiktok` | #010101 |

### C. Info Mode Deskripsi

| Mode | Deskripsi |
|---|---|
| Instagram | Buat konten feed, dokumen, dan caption Instagram yang menarik dengan AI. |
| Google Business | Buat postingan Google Bisnis dengan storytelling yang bikin pelanggan datang. |
| WhatsApp | Siapkan broadcast pesan WhatsApp promosi, follow-up, dan info layanan. |
| Facebook | Buat post Facebook bisnis dengan copywriting yang engaging dan persuasif. |
| TikTok | Buat caption video TikTok yang viral dengan hook kuat dan CTA jelas. |

---

*Dokumen ini dibuat berdasarkan source code aplikasi Macsus AI Advertising v1.7.1 yang sudah dalam tahap produksi.*
