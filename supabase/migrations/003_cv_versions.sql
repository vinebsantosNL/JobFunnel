-- CV Versions table
CREATE TABLE cv_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  file_url TEXT,
  file_type TEXT CHECK (file_type IN ('pdf', 'docx', 'external_link')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX cv_versions_user_id_idx ON cv_versions(user_id);
CREATE UNIQUE INDEX cv_versions_user_default_idx ON cv_versions(user_id) WHERE is_default = TRUE;

-- Add cv_version_id to job_applications
ALTER TABLE job_applications ADD COLUMN cv_version_id UUID REFERENCES cv_versions(id) ON DELETE SET NULL;
CREATE INDEX job_applications_cv_version_idx ON job_applications(cv_version_id);

-- Auto-update trigger
CREATE TRIGGER cv_versions_updated_at BEFORE UPDATE ON cv_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE cv_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cv_versions"
  ON cv_versions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
