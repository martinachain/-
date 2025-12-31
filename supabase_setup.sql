-- ============================================
-- 小满果园 - Supabase 数据库初始化脚本
-- ============================================

-- 1. 如果表已存在，先删除旧策略和索引
DROP POLICY IF EXISTS "Allow all operations" ON records;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON records;
DROP INDEX IF EXISTS idx_records_date;
DROP INDEX IF EXISTS idx_records_account_name;

-- 2. 删除旧表（如果存在）- 注意：这会删除所有数据！
-- 如果表中有重要数据，请先备份！
-- DROP TABLE IF EXISTS records;

-- 3. 创建 records 表（如果不存在）
CREATE TABLE IF NOT EXISTS records (
  id BIGSERIAL PRIMARY KEY,
  account_name TEXT NOT NULL,
  product TEXT NOT NULL,
  date DATE NOT NULL,
  revenue DECIMAL(10, 2) DEFAULT 0,
  account_color JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_records_date ON records(date DESC);
CREATE INDEX IF NOT EXISTS idx_records_account_name ON records(account_name);

-- 5. 启用 Row Level Security (RLS)
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- 6. 创建策略：允许所有人（包括匿名用户）读取和写入
CREATE POLICY "Allow all operations" ON records
  FOR ALL
  USING (true)
  WITH CHECK (true);
