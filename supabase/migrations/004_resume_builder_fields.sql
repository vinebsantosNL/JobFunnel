-- Resume Builder fields for cv_versions
-- Sprint 1 — adds structured data columns and lock mechanism

-- New columns
ALTER TABLE cv_versions
  ADD COLUMN IF NOT EXISTS template_id TEXT NOT NULL DEFAULT 'precision',
  ADD COLUMN IF NOT EXISTS resume_data JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_country TEXT,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for lock queries
CREATE INDEX IF NOT EXISTS cv_versions_is_locked_idx ON cv_versions(user_id, is_locked);

-- -----------------------------------------------------------------------
-- Trigger: keep is_locked in sync whenever job_applications.stage
-- or job_applications.cv_version_id changes.
-- GENERATED ALWAYS AS cannot reference other tables, so we use a trigger.
-- -----------------------------------------------------------------------

CREATE OR REPLACE FUNCTION sync_cv_version_lock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the CV version that the NEW row points to
  IF NEW.cv_version_id IS NOT NULL THEN
    UPDATE cv_versions
    SET is_locked = EXISTS (
      SELECT 1 FROM job_applications
      WHERE cv_version_id = NEW.cv_version_id
        AND stage IN ('screening', 'interviewing', 'offer', 'hired')
    )
    WHERE id = NEW.cv_version_id;
  END IF;

  -- If cv_version_id changed, also recompute the OLD version's lock status
  IF TG_OP = 'UPDATE'
     AND OLD.cv_version_id IS NOT NULL
     AND OLD.cv_version_id IS DISTINCT FROM NEW.cv_version_id
  THEN
    UPDATE cv_versions
    SET is_locked = EXISTS (
      SELECT 1 FROM job_applications
      WHERE cv_version_id = OLD.cv_version_id
        AND stage IN ('screening', 'interviewing', 'offer', 'hired')
    )
    WHERE id = OLD.cv_version_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS job_applications_cv_lock_trigger ON job_applications;

CREATE TRIGGER job_applications_cv_lock_trigger
  AFTER INSERT OR UPDATE OF stage, cv_version_id
  ON job_applications
  FOR EACH ROW EXECUTE FUNCTION sync_cv_version_lock();

-- Backfill is_locked for any existing data
UPDATE cv_versions cv
SET is_locked = EXISTS (
  SELECT 1 FROM job_applications ja
  WHERE ja.cv_version_id = cv.id
    AND ja.stage IN ('screening', 'interviewing', 'offer', 'hired')
);
