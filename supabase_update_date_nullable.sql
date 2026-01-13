-- ============================================
-- 小满果园 - 修改 date 字段为可空（允许待办功能）
-- 请在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 步骤 1: 修改 date 字段，允许 NULL 值
ALTER TABLE records 
ALTER COLUMN date DROP NOT NULL;

-- 步骤 2: 更新索引（如果 date 为 NULL，索引仍然可以工作）
-- 注意：PostgreSQL 的 B-tree 索引可以处理 NULL 值，所以不需要修改索引

-- 验证：检查表结构
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'records' AND column_name = 'date';
