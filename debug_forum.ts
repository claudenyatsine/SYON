import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: postsData, error: postsError } = await supabase
    .from('forum_posts')
    .select(`
      id, community_id, user_id, title, content, tag, image_url, votes, created_at,
      profiles:user_id (full_name, avatar_url),
      forum_communities:community_id (name)
    `)
    .order('created_at', { ascending: false });

  if (postsError) {
    console.error('Error fetching posts:', postsError);
    return;
  }
  console.log('Posts:', postsData?.length);
}

main().catch(console.error);
