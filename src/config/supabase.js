import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://loihbhzjgeiikmonwefg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaWhiaHpqZ2VpaWttb253ZWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzODE5MjksImV4cCI6MjA0Nzk1NzkyOX0.B_edpcR_WuCEFbL3iRbGUCskTLXfmh9rJn_mmuq6Qb8';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
