-- ============================================
-- 小满果园 - Supabase 数据库初始化脚本（修复版）
-- 先清理旧表，再重新创建
-- ============================================

-- 步骤 1: 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Allow all operations" ON records;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON records;

-- 步骤 2: 删除旧索引（如果存在）
DROP INDEX IF EXISTS idx_records_date;
DROP INDEX IF EXISTS idx_records_account_name;

-- 步骤 3: 删除旧表（如果存在）- 这会删除所有数据！
DROP TABLE IF EXISTS records CASCADE;

-- 步骤 4: 创建新表
CREATE TABLE records (
  id BIGSERIAL PRIMARY KEY,
  account_name TEXT NOT NULL,
  product TEXT NOT NULL,
  date DATE NOT NULL,
  revenue DECIMAL(10, 2) DEFAULT 0,
  account_color JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 步骤 5: 创建索引
CREATE INDEX idx_records_date ON records(date DESC);
CREATE INDEX idx_records_account_name ON records(account_name);

-- 步骤 6: 启用 RLS
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- 步骤 7: 创建策略（允许所有人访问）
CREATE POLICY "Allow all operations" ON records
FOR ALL
USING (true)
WITH CHECK (true);

