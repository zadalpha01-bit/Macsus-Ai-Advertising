-- Jalankan ini di Supabase SQL Editor untuk menambahkan mode 'tt' ke CHECK constraint
-- Tanpa ini, mode TikTok akan selalu gagal disimpan (400 Bad Request)

-- 1. Drop constraint lama
ALTER TABLE public.user_sessions
  DROP CONSTRAINT IF EXISTS user_sessions_mode_check;

-- 2. Buat constraint baru dengan mode 'tt' ditambahkan
ALTER TABLE public.user_sessions
  ADD CONSTRAINT user_sessions_mode_check
  CHECK (mode = ANY (ARRAY['ig'::text, 'gbisnis'::text, 'wa'::text, 'fb'::text, 'tt'::text]));
