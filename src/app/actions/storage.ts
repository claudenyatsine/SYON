'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function uploadCourseBannerAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Unauthorized. Please log in.' };
    }

    const file = formData.get('file') as File | null;
    if (!file || file.size === 0) {
      return { error: 'No file provided.' };
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    let publicUrl = '';

    if (serviceKey && supabaseUrl) {
      const adminClient = createAdminClient(supabaseUrl, serviceKey);
      
      // Ensure course-banners bucket exists
      const { data: bucketData } = await adminClient.storage.getBucket('course-banners');
      if (!bucketData) {
        await adminClient.storage.createBucket('course-banners', { public: true });
      }

      const { error: uploadError } = await adminClient.storage
        .from('course-banners')
        .upload(filePath, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        return { error: uploadError.message };
      }

      const { data: urlData } = adminClient.storage.from('course-banners').getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    } else {
      const { error: uploadError } = await supabase.storage
        .from('course-banners')
        .upload(filePath, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        return { error: uploadError.message };
      }

      const { data: urlData } = supabase.storage.from('course-banners').getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    }

    return { success: true, publicUrl };
  } catch (err: any) {
    console.error('[Upload Course Banner Error]:', err);
    return { error: err.message || 'Failed to upload course banner.' };
  }
}
