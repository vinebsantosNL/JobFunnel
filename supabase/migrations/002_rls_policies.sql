-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_stories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Job applications policies
CREATE POLICY "Users can view own jobs" ON job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON job_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON job_applications FOR DELETE USING (auth.uid() = user_id);

-- Stage history policies
CREATE POLICY "Users can view own stage history" ON stage_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM job_applications WHERE id = stage_history.job_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert stage history for own jobs" ON stage_history FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM job_applications WHERE id = stage_history.job_id AND user_id = auth.uid()));

-- Interview stories policies
CREATE POLICY "Users can view own stories" ON interview_stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stories" ON interview_stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stories" ON interview_stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON interview_stories FOR DELETE USING (auth.uid() = user_id);
