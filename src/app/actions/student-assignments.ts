"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSubjectAssignments(subjectId: string, studentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_assignments')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('student_id', studentId)

  if (error) {
    console.error('Error fetching subject assignments:', error)
    return { error: error.message }
  }
  return { data }
}

export async function submitAssignment(data: {
  studentId: string
  subjectId: string
  moduleItemId: string
  assignmentNum: number
  submission: string
  tutorId?: string
}) {
  const supabase = await createClient()
  
  const { data: res, error } = await supabase
    .from('student_assignments')
    .upsert({
      student_id: data.studentId,
      subject_id: data.subjectId,
      module_item_id: data.moduleItemId,
      assignment_number: data.assignmentNum,
      status: 'unmarked',
      student_submission: data.submission,
      tutor_id: data.tutorId || null,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'student_id,module_item_id,assignment_number'
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting assignment:', error)
    return { error: error.message }
  }

  revalidatePath('/student/courses')
  revalidatePath('/tutor/assignments')
  revalidatePath('/tutor/students')
  return { data: res }
}

export async function gradeAssignment(assignmentId: string, feedback: string) {
  const supabase = await createClient()
  
  const { data: res, error } = await supabase
    .from('student_assignments')
    .update({
      status: 'completed',
      tutor_feedback: feedback,
      marked_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', assignmentId)
    .select()
    .single()

  if (error) {
    console.error('Error grading assignment:', error)
    return { error: error.message }
  }

  revalidatePath('/tutor/assignments')
  revalidatePath('/tutor/students')
  revalidatePath('/student/courses')
  return { data: res }
}

export async function getTutorUnmarkedAssignments(tutorId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_assignments')
    .select('*, profiles!student_id(full_name, email, avatar_url), subjects(name, level), module_items(title)')
    .eq('tutor_id', tutorId)
    .eq('status', 'unmarked')
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching unmarked assignments:', error)
    return { error: error.message }
  }
  return { data }
}

export async function getSubjectTopics(subjectId: string) {
  const supabase = await createClient()
  
  const { data: modules, error: modError } = await supabase
    .from('modules')
    .select('id')
    .eq('subject_id', subjectId)
    
  if (modError) {
    console.error('Error fetching modules for topics:', modError)
    return { error: modError.message }
  }
  
  if (!modules || modules.length === 0) {
    return { data: [] }
  }
  
  const moduleIds = modules.map(m => m.id)
  
  const { data: topics, error: itemError } = await supabase
    .from('module_items')
    .select('id, title, sequence_order, module_id')
    .in('module_id', moduleIds)
    .eq('item_type', 'topic')
    .order('sequence_order', { ascending: true })
    
  if (itemError) {
    console.error('Error fetching topics:', itemError)
    return { error: itemError.message }
  }
  
  return { data: topics || [] }
}

