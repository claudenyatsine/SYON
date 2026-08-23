const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('classes').select('*').limit(1);
  if (error) console.error('classes error:', error.message);
  else console.log('classes rows:', data?.length);
  
  const { data: d2, error: e2 } = await supabase.from('live_classes').select('*').limit(1);
  if (e2) console.error('live_classes error:', e2.message);
  else console.log('live_classes rows:', d2?.length);
}
run();
