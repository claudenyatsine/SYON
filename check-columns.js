const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env.local'});
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('classes').select('*').limit(1).then(res => {
    console.log(res.data ? Object.keys(res.data[0] || {}) : res.error);
});
