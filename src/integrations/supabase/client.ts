// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qfckbnwygbeijghubfxp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmY2tibnd5Z2JlaWpnaHViZnhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDQwNzIsImV4cCI6MjA2NDI4MDA3Mn0.EIX4L0JJ8xq5WixnZIm6OQbZi1ZksoSXxauYu4eNORg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);