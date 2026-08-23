import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: users, error: userError } = await supabase.from('profiles').select('*').eq('role', 'student');
  if (userError) {
    console.error('Error fetching users:', userError);
    return;
  }
  const student = users[0];
  console.log('Student:', student?.full_name, student?.id);

  if (!student) return;

  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('id, subject:subjects(id, name)')
    .eq('student_id', student.id);
  
  if (enrollError) {
    console.error('Error fetching enrollments:', enrollError);
    return;
  }
  console.log('Enrollments:', JSON.stringify(enrollments, null, 2));

  // Let's also check if "history, divinity, geography" exist in subjects
  const { data: subjects, error: subjError } = await supabase
    .from('subjects')
    .select('id, name');
  
  console.log('All Subjects:', subjects?.map(s => s.name).join(', '));
}

main().catch(console.error);
