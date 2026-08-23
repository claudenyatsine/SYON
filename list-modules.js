require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: modules } = await supabase.from('curriculum_modules').select('id, title, sequence_order, subject_id');
  const { data: subjects } = await supabase.from('subjects').select('id, name');
  
  modules.forEach(m => {
    const sub = subjects.find(s => s.id === m.subject_id);
    console.log(`Module: '${m.title}', Seq: ${m.sequence_order}, Subject: ${sub ? sub.name : m.subject_id}, ID: ${m.id}`);
  });
}
run();
