import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.SUPABASE_URL || 'https://loihbhzjgeiikmonwefg.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaWhiaHpqZ2VpaWttb253ZWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzODE5MjksImV4cCI6MjA0Nzk1NzkyOX0.B_edpcR_WuCEFbL3iRbGUCskTLXfmh9rJn_mmuq6Qb8';

export const supabase = createClient(supabaseUrl, supabaseKey);
