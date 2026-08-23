const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('classes').select('*').limit(1);
  if (data && data.length > 0) console.log('classes keys:', Object.keys(data[0]));
  
  const { data: rd, error: re } = await supabase.from('resources').select('*').limit(1);
  if (rd && rd.length > 0) console.log('resources keys:', Object.keys(rd[0]));
  else if (re) console.log('resources error:', re);
  else console.log('resources empty');
}
run();
