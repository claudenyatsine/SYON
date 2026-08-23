require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: subjects } = await supabase.from('subjects').select('id, name').ilike('name', '%Geography%');
  
  if (!subjects || subjects.length === 0) { console.log('No Geo subject'); return; }
  
  for (const subject of subjects) {
    const { data: modules } = await supabase.from('curriculum_modules').select('*').eq('subject_id', subject.id);
    if (modules && modules.length > 0) {
      console.log(`Found modules for ${subject.name} (${subject.id}):`);
      modules.forEach(m => console.log(`  - ${m.title} (seq: ${m.sequence_order}, id: ${m.id})`));
      
      const idsToDelete = modules.map(m => m.id);
      const { data: del, error: delErr } = await supabase.from('curriculum_modules').delete().in('id', idsToDelete).select();
      console.log('Deleted:', del ? del.length : 0, delErr);
    } else {
      console.log(`No modules for ${subject.name} (${subject.id})`);
    }
  }
}
run();
