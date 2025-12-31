import { createClient } from '@supabase/supabase-js';

// 彻底放弃环境变量读取，直接硬编码，排除一切干扰
const supabaseUrl = 'https://gojrwglzwutyhpunhutm.supabase.co'; // 确保这里开头是 https://
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvanJ3Z2x6d3V0eWhwdW5odXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNTcyOTMsImV4cCI6MjA4MjczMzI5M30.t1hzPRcZZAbTncziGUQYbW-bZSRFkPI7zi92qD2aJh0';

console.log("正在尝试连接数据库，URL 长度:", supabaseUrl.length);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);