-- Add career goal fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS target_role TEXT,
  ADD COLUMN IF NOT EXISTS target_date DATE,
  ADD COLUMN IF NOT EXISTS target_salary_min INTEGER,
  ADD COLUMN IF NOT EXISTS target_salary_max INTEGER,
  ADD COLUMN IF NOT EXISTS target_salary_currency TEXT DEFAULT 'EUR';
