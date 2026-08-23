import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')

  console.log('Error:', error)
  console.log('Data count:', data?.length)
  console.log('Data:', JSON.stringify(data, null, 2))
}

test()
