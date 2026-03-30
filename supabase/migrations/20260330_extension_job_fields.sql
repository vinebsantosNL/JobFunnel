-- Sprint 4: Chrome Extension — add job_description and source fields
-- job_description: stores the original posting text scraped by the extension
-- source: tracks whether the application was added manually or via the extension

ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS job_description TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'extension'));

-- Index source for analytics queries (e.g. extension vs manual conversion rates)
CREATE INDEX IF NOT EXISTS idx_job_applications_source
  ON job_applications (user_id, source);

COMMENT ON COLUMN job_applications.job_description IS
  'Original job posting text scraped by the Chrome extension. Max 10,000 chars enforced at API level.';

COMMENT ON COLUMN job_applications.source IS
  'How the application was added: manual (web app) or extension (Chrome extension).';
