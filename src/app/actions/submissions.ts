'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function uploadSubmissionAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Unauthorized. Please log in.' };
    }

    const assignmentId = formData.get('assignmentId') as string;
    const file = formData.get('file') as File | null;

    if (!assignmentId) {
      return { error: 'Missing assignment ID.' };
    }
    if (!file || file.size === 0) {
      return { error: 'No file provided.' };
    }

    const fileExt = file.name.split('.').pop() || 'pdf';
    const filePath = `${assignmentId}/${user.id}_${Date.now()}.${fileExt}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    let publicUrl = '';

    if (serviceKey && supabaseUrl) {
      const adminClient = createAdminClient(supabaseUrl, serviceKey);
      
      // Ensure student_submissions bucket exists
      const { data: bucketData } = await adminClient.storage.getBucket('student_submissions');
      if (!bucketData) {
        await adminClient.storage.createBucket('student_submissions', { public: true });
      }

      const { error: uploadError } = await adminClient.storage
        .from('student_submissions')
        .upload(filePath, buffer, {
          contentType: file.type || 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        return { error: uploadError.message };
      }

      const { data: urlData } = adminClient.storage.from('student_submissions').getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    } else {
      const { error: uploadError } = await supabase.storage
        .from('student_submissions')
        .upload(filePath, buffer, {
          contentType: file.type || 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        return { error: uploadError.message };
      }

      const { data: urlData } = supabase.storage.from('student_submissions').getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    }

    // Insert into submissions table
    const { error: dbError } = await supabase
      .from('submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: user.id,
        file_url: publicUrl,
        status: 'submitted',
      });

    if (dbError) {
      return { error: dbError.message };
    }

    revalidatePath(`/student/assignments/${assignmentId}`);
    return { success: true, publicUrl };
  } catch (err: any) {
    console.error('[Upload Submission Error]:', err);
    return { error: err.message || 'Failed to upload submission.' };
  }
}
