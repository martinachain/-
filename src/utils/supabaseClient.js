import { createClient } from '@supabase/supabase-js';

// 使用环境变量，如果没有则使用默认值
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gojrwglzwutyhpunhutm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvanJ3Z2x6d3V0eWhwdW5odXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNTcyOTMsImV4cCI6MjA4MjczMzI5M30.t1hzPRcZZAbTncziGUQYbW-bZSRFkPI7zi92qD2aJh0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

