'use server';

import { createAdminClient } from '@/utils/supabase/admin';

export async function linkParentStudentAction(parentId: string, studentId: string) {
  try {
    const adminClient = createAdminClient();

    // 1. Attempt database table operation first
    try {
      await adminClient.from('parent_student_links').delete().eq('student_id', studentId);

      if (parentId && parentId !== 'unassigned') {
        await adminClient
          .from('parent_student_links')
          .insert({ parent_id: parentId, student_id: studentId });
      }
    } catch (tableErr) {
      console.warn('[linkParentStudentAction] Table operation notice (table might be missing):', tableErr);
    }

    // 2. Always persist to user_metadata as fallback so linking works immediately
    try {
      // Update student's metadata with parent_id
      const { data: studentUser } = await adminClient.auth.admin.getUserById(studentId);
      if (studentUser?.user) {
        await adminClient.auth.admin.updateUserById(studentId, {
          user_metadata: {
            ...studentUser.user.user_metadata,
            parent_id: parentId && parentId !== 'unassigned' ? parentId : null,
          },
        });
      }

      // If linking a parent, update parent's metadata with linked student_ids array
      if (parentId && parentId !== 'unassigned') {
        const { data: parentUser } = await adminClient.auth.admin.getUserById(parentId);
        if (parentUser?.user) {
          const currentStudentIds: string[] = parentUser.user.user_metadata?.student_ids || [];
          if (!currentStudentIds.includes(studentId)) {
            currentStudentIds.push(studentId);
          }
          await adminClient.auth.admin.updateUserById(parentId, {
            user_metadata: {
              ...parentUser.user.user_metadata,
              student_ids: currentStudentIds,
            },
          });
        }
      } else {
        // If unlinking, remove studentId from all parents' metadata
        const { data: allUsers } = await adminClient.auth.admin.listUsers();
        if (allUsers?.users) {
          for (const u of allUsers.users) {
            const studentIds: string[] = u.user_metadata?.student_ids || [];
            if (studentIds.includes(studentId)) {
              await adminClient.auth.admin.updateUserById(u.id, {
                user_metadata: {
                  ...u.user_metadata,
                  student_ids: studentIds.filter(id => id !== studentId),
                },
              });
            }
          }
        }
      }
    } catch (metaErr) {
      console.error('[linkParentStudentAction] Metadata sync error:', metaErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('[linkParentStudentAction] Unexpected error:', err);
    return { error: err.message || 'Failed to link parent.' };
  }
}

export async function getLinkedParentForStudentAction(studentId: string) {
  try {
    const adminClient = createAdminClient();

    // 1. Try table first
    const { data: link, error } = await adminClient
      .from('parent_student_links')
      .select('parent_id')
      .eq('student_id', studentId)
      .maybeSingle();

    if (!error && link?.parent_id) {
      return { parentId: link.parent_id as string };
    }

    // 2. Fallback to student's user_metadata
    const { data: studentUser } = await adminClient.auth.admin.getUserById(studentId);
    const parentId = studentUser?.user?.user_metadata?.parent_id || null;
    return { parentId: parentId as string | null };
  } catch (err: any) {
    console.error('[getLinkedParentForStudentAction] Error:', err);
    return { parentId: null };
  }
}
