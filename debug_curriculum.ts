import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('curriculum_modules').select('*').limit(1);
  if (error) {
    console.error('Error fetching curriculum_modules:', error);
  } else {
    console.log('curriculum_modules exists:', data);
  }
}

main().catch(console.error);
