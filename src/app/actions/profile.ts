'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function uploadAvatarAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Unauthorized. Please log in.' };
    }

    const file = formData.get('avatar') as File | null;
    if (!file || file.size === 0) {
      return { error: 'No file provided.' };
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'File size exceeds 5MB limit.' };
    }

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validMimes.includes(file.type)) {
      return { error: 'Invalid file type. Please upload a JPEG, PNG, WEBP, or GIF image.' };
    }

    const fileExt = file.name.split('.').pop() || 'png';
    const cleanFileName = `${Date.now()}_avatar.${fileExt}`;
    const filePath = `${user.id}/${cleanFileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    let publicUrl = '';

    if (serviceKey && supabaseUrl) {
      const adminClient = createAdminClient(supabaseUrl, serviceKey);
      const { error: uploadError } = await adminClient.storage
        .from('avatars')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        return { error: uploadError.message };
      }

      const { data: urlData } = adminClient.storage.from('avatars').getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    } else {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        return { error: uploadError.message };
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    }

    // Update profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      return { error: updateError.message };
    }

    // Also update auth user metadata
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    revalidatePath('/', 'layout');

    return { success: true, avatarUrl: publicUrl };
  } catch (err: any) {
    console.error('[Upload Avatar Error]:', err);
    return { error: err.message || 'Failed to upload avatar.' };
  }
}
