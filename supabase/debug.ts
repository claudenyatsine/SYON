import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey!);

async function main() {
  const { data: tutors } = await supabase.from('profiles').select('*').eq('role', 'tutor');
  console.log('Tutors:', tutors?.map(t => ({ id: t.id, name: t.full_name })));

  const { data: students } = await supabase.from('profiles').select('*').eq('role', 'student');
  console.log('Students:', students?.map(s => ({ id: s.id, name: s.full_name })));

  const { data: ts } = await supabase.from('tutor_subjects').select('*');
  console.log('Tutor Subjects:', ts);

  const { data: enrolls } = await supabase.from('enrollments').select('*');
  console.log('Enrollments:', enrolls);
}

main();
