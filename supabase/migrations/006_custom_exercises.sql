-- ============================================
-- ADD CUSTOM EXERCISE SUPPORT
-- ============================================

-- Add missing columns to exercises table
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment TEXT;

-- Allow authenticated users to insert their own custom exercises
DROP POLICY IF EXISTS "Users can insert own exercises" ON exercises;
CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_custom = true);

-- Allow users to update their own custom exercises
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = created_by AND is_custom = true);

-- Allow users to delete their own custom exercises
DROP POLICY IF EXISTS "Users can delete own exercises" ON exercises;
CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (auth.uid() = created_by AND is_custom = true);
