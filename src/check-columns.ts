import { createClient } from '@/utils/supabase/client';

async function checkColumns() {
    const supabase = createClient();
    const { data, error } = await supabase.from('classes').select('*').limit(1);
    if (error) {
        console.error('Error fetching classes:', error);
    } else {
        console.log('Columns in classes table:', Object.keys(data[0] || {}));
    }
}

checkColumns();
