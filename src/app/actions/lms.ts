"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Subjects ---

export async function getSubjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('category')
    .order('level')
    .order('name')

  if (error) {
    console.error('Error fetching subjects:', error)
    return { error: error.message }
  }

  return { data }
}

// --- Enrollments ---

export async function getMyEnrollments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('enrollments')
    .select('*, subjects(*)')
    .eq('student_id', user.id)

  if (error) {
    console.error('Error fetching enrollments:', error)
    return { error: error.message }
  }

  return { data }
}

export async function enrollInSubject(subjectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('enrollments')
    .insert({
      student_id: user.id,
      subject_id: subjectId,
      status: 'pending'
    })

  if (error) {
    console.error('Error enrolling:', error)
    return { error: error.message }
  }

  revalidatePath('/student')
  return { success: true }
}

// --- Admin ---

export async function getPendingEnrollments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Ensure user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const { data, error } = await supabase
    .from('enrollments')
    .select('*, subjects(*), profiles!student_id(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending enrollments:', error)
    return { error: error.message }
  }

  return { data }
}

export async function updateEnrollmentStatus(enrollmentId: string, status: 'approved' | 'rejected', tutorId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Ensure user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const { error } = await supabase
    .from('enrollments')
    .update({ 
      status, 
      tutor_id: tutorId || null,
      updated_at: new Date().toISOString() 
    })
    .eq('id', enrollmentId)

  if (error) {
    console.error('Error updating enrollment:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function toggleUserApproval(userId: string, isApproved: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Ensure caller is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      is_approved: isApproved,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user approval status:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/students')
  revalidatePath('/admin/tutors')
  revalidatePath('/admin/admins')
  return { success: true }
}

export async function getTutorsForSubject(subjectId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tutor_subjects')
    .select('tutor_id, profiles!inner(id, email)')
    .eq('subject_id', subjectId)
    
  if (error) {
    console.error('Error fetching tutors for subject:', error)
    return { error: error.message }
  }
  
  return { data }
}

export async function getEnrolledStudentsForSubjects(subjectIds: string[]) {
  const supabase = await createClient()

  if (!subjectIds || subjectIds.length === 0) return { data: [] }

  const { data, error } = await supabase
    .from('enrollments')
    .select('id, student_id, subject_id, status, tutor_id, profiles!student_id!inner(full_name, email), subjects!inner(name, level)')
    .in('subject_id', subjectIds)
    .eq('status', 'approved')

  if (error) {
    console.error('Error fetching enrolled students:', error)
    return { error: error.message }
  }

  return { data }
}

export async function batchAssignStudentsToTutor(enrollmentIdsToAssign: string[], enrollmentIdsToUnassign: string[], tutorId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Ensure user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  try {
    if (enrollmentIdsToAssign.length > 0) {
      const { error: assignError } = await supabase
        .from('enrollments')
        .update({ tutor_id: tutorId, updated_at: new Date().toISOString() })
        .in('id', enrollmentIdsToAssign)
      if (assignError) throw assignError
    }

    if (enrollmentIdsToUnassign.length > 0) {
      const { error: unassignError } = await supabase
        .from('enrollments')
        .update({ tutor_id: null, updated_at: new Date().toISOString() })
        .in('id', enrollmentIdsToUnassign)
      if (unassignError) throw unassignError
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error batch updating students:', error)
    return { error: error.message }
  }
}
