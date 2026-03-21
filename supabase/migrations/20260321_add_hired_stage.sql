-- Add 'hired' to the stage enum in job_applications
-- If the column uses a PostgreSQL enum type named job_stage:
ALTER TYPE job_stage ADD VALUE IF NOT EXISTS 'hired' AFTER 'offer';

-- If the column uses a CHECK constraint instead of an enum type,
-- run the following instead (replace the block above with this):
-- ALTER TABLE job_applications
--   DROP CONSTRAINT IF EXISTS job_applications_stage_check;
-- ALTER TABLE job_applications
--   ADD CONSTRAINT job_applications_stage_check
--   CHECK (stage IN ('saved', 'applied', 'screening', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn'));
