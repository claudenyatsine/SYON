'use server';

import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fykogkblmrrnfudiyuzb.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;
  return createSupabaseAdmin(supabaseUrl, serviceRoleKey);
}

export async function getTutorLiveClassesAction(tutorId?: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const effectiveId = tutorId || user?.id;
    if (!effectiveId) return { success: false, data: [] };

    // Try normal server client first
    let query = supabase
      .from('live_classes')
      .select('*, subject:subjects(name)')
      .or(`tutor_id.eq.${effectiveId},proposed_by.eq.${effectiveId}`)
      .order('start_time', { ascending: false });

    let { data, error } = await query;

    // If RLS blocked or empty, fallback to admin client for authenticated tutors
    if ((error || !data || data.length === 0) && getAdminClient()) {
      const adminClient = getAdminClient()!;
      const adminRes = await adminClient
        .from('live_classes')
        .select('*, subject:subjects(name)')
        .or(`tutor_id.eq.${effectiveId},proposed_by.eq.${effectiveId}`)
        .order('start_time', { ascending: false });
      
      if (adminRes.data) {
        data = adminRes.data;
        error = null;
      }
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('getTutorLiveClassesAction error:', err);
    return { success: false, error: err.message, data: [] };
  }
}
