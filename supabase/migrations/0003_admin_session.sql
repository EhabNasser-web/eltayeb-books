-- تتبع آخر نشاط للأدمن (لمهلة الخمول).
ALTER TABLE public.admin_profiles
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz NOT NULL DEFAULT now();
