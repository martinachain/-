import { createClient } from '@supabase/supabase-js';

// --- 双保险逻辑 ---
// 1. 优先尝试读取环境变量（部署上线时使用）
// 2. 如果环境变量读取不到（比如 Vercel/Zeabur 配置没生效），则直接使用后面的硬编码字符串（兜底使用）

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gojrwglzwutyhpunhutm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvanJ3Z2x6d3V0eWhwdW5odXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNTcyOTMsImV4cCI6MjA4MjczMzI5M30.t1hzPRcZZAbTncziGUQYbW-bZSRFkPI7zi92qD2aJh0';

// 在控制台打印一下，方便我们排查（上线稳定后可以删掉这行）
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn("注意：正在使用硬编码的备用地址连接数据库");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);