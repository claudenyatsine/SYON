import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'curriculum_assignments' });
  if (error) {
    // try a direct query using postgres schema if possible, but JS client can't do that easily unless we just do a select
    const { data: selectData, error: selectErr } = await supabase.from('curriculum_assignments').select('*').limit(1);
    if (selectErr) {
        console.error("Select error:", selectErr);
    } else {
        console.log("Data sample:", selectData);
    }
  } else {
    console.log(data);
  }
}
main().catch(console.error);
