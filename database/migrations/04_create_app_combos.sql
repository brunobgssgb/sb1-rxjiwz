-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON app_combos;
DROP POLICY IF EXISTS "Enable insert access for all users" ON app_combos;
DROP POLICY IF EXISTS "Enable update access for all users" ON app_combos;
DROP POLICY IF EXISTS "Enable delete access for all users" ON app_combos;

DROP POLICY IF EXISTS "Enable read access for all users" ON app_combo_items;
DROP POLICY IF EXISTS "Enable insert access for all users" ON app_combo_items;
DROP POLICY IF EXISTS "Enable update access for all users" ON app_combo_items;
DROP POLICY IF EXISTS "Enable delete access for all users" ON app_combo_items;

-- Create app_combos table
CREATE TABLE IF NOT EXISTS app_combos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create app_combo_items table for the apps in each combo
CREATE TABLE IF NOT EXISTS app_combo_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  combo_id UUID NOT NULL REFERENCES app_combos(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(combo_id, app_id)
);

-- Enable RLS
ALTER TABLE app_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_combo_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON app_combos FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON app_combos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON app_combos FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON app_combos FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON app_combo_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON app_combo_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON app_combo_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON app_combo_items FOR DELETE USING (true);