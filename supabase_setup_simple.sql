-- ============================================
-- 小满果园 - Supabase 数据库初始化脚本（简化版）
-- 请分步执行，每次执行一个部分
-- ============================================

-- 步骤 1: 创建表（如果不存在）
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

-- 步骤 2: 创建索引
CREATE INDEX IF NOT EXISTS idx_records_date ON records(date DESC);
CREATE INDEX IF NOT EXISTS idx_records_account_name ON records(account_name);

-- 步骤 3: 启用 RLS
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- 步骤 4: 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Allow all operations" ON records;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON records;

-- 步骤 5: 创建新策略（允许所有人访问）
CREATE POLICY "Allow all operations" ON records
FOR ALL
USING (true)
WITH CHECK (true);

