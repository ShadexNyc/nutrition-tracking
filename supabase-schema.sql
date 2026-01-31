-- Таблица продуктов
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  calories_per_100g DECIMAL(10,2) NOT NULL,
  protein_per_100g DECIMAL(10,2) NOT NULL,
  carbs_per_100g DECIMAL(10,2) NOT NULL,
  fat_per_100g DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица записей питания (для текущей версии без авторизации)
CREATE TABLE IF NOT EXISTS nutrition_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity_grams DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_date ON nutrition_entries(date);
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_product ON nutrition_entries(product_id);

-- RLS политики (пока отключены, так как нет авторизации)
-- ALTER TABLE nutrition_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can view own entries" ON nutrition_entries
--   FOR SELECT USING (auth.uid() = user_id);
-- 
-- CREATE POLICY "Users can insert own entries" ON nutrition_entries
--   FOR INSERT WITH CHECK (auth.uid() = user_id);
