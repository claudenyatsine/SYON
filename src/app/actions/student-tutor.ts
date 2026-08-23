"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTutorStudents(tutorId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('enrollments')
    .select('id, student_id, subject_id, status, tutor_id, profiles!student_id!inner(id, full_name, email, avatar_url, curriculum_board, student_level), subjects!inner(id, name, level, category)')
    .eq('tutor_id', tutorId)
    .eq('status', 'approved')

  if (error) {
    console.error('Error fetching tutor students:', error)
    return { error: error.message }
  }

  return { data }
}

export async function getChatMessages(userId: string, partnerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_tutor_messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching chat messages:', error)
    return { error: error.message }
  }

  return { data }
}

export async function sendChatMessage(senderId: string, receiverId: string, message: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_tutor_messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { error: error.message }
  }

  return { data }
}

export async function getStudentDeadlines(tutorId: string, studentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_deadlines')
    .select('*, subjects!inner(name, level)')
    .eq('tutor_id', tutorId)
    .eq('student_id', studentId)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching student deadlines:', error)
    return { error: error.message }
  }

  return { data }
}

export async function createStudentDeadline(
  tutorId: string,
  studentId: string,
  subjectId: string,
  title: string,
  description: string,
  dueDate: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_deadlines')
    .insert({
      tutor_id: tutorId,
      student_id: studentId,
      subject_id: subjectId,
      title,
      description,
      due_date: dueDate,
      status: 'pending'
    })
    .select('*, subjects(name, level)')
    .single()

  if (error) {
    console.error('Error creating student deadline:', error)
    return { error: error.message }
  }

  revalidatePath('/tutor/students')
  return { data }
}

export async function toggleDeadlineStatus(deadlineId: string, status: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_deadlines')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', deadlineId)
    .select()
    .single()

  if (error) {
    console.error('Error updating deadline status:', error)
    return { error: error.message }
  }

  revalidatePath('/tutor/students')
  return { data }
}

export async function deleteDeadline(deadlineId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('student_deadlines')
    .delete()
    .eq('id', deadlineId)

  if (error) {
    console.error('Error deleting deadline:', error)
    return { error: error.message }
  }

  revalidatePath('/tutor/students')
  return { success: true }
}

export async function getStudentProgress(tutorId: string, studentId: string) {
  const supabase = await createClient()
  
  // Get all deadlines for this student from this tutor
  const { data: allDeadlines, error: dlError } = await supabase
    .from('student_deadlines')
    .select('id, status, created_at, updated_at, subject_id, subjects(name)')
    .eq('tutor_id', tutorId)
    .eq('student_id', studentId)

  if (dlError) {
    console.error('Error fetching student progress:', dlError)
    return { error: dlError.message }
  }

  const total = allDeadlines?.length || 0
  const completedDeadlines = allDeadlines?.filter(d => d.status === 'completed') || []
  const completed = completedDeadlines.length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  // Generate real-time SVG sparkline path
  // SVG box is 100x30. Y goes from 28 (0%) to 5 (100%).
  let trendPath = "M0,28 L100,28"; 
  if (total > 0 && completed > 0) {
    // Sort completed by date
    const sortedCompleted = completedDeadlines
      .map(d => new Date(d.updated_at || d.created_at).getTime())
      .sort((a, b) => a - b);
    
    // Create points
    const points: {x: number, y: number}[] = [{ x: 0, y: 28 }]; // Start at 0%
    
    sortedCompleted.forEach((_, idx) => {
      const currentPercent = ((idx + 1) / total);
      const x = Math.round(((idx + 1) / completed) * 100);
      const y = Math.round(28 - (currentPercent * 23));
      points.push({ x, y });
    });
    
    // Build path (using simple lines for now to accurately reflect discrete steps)
    trendPath = `M${points.map(p => `${p.x},${p.y}`).join(' L')}`;
  } else if (total > 0 && completed === 0) {
    trendPath = "M0,28 L100,28";
  }

  // Subject Progress Breakdown
  const subjectMap: Record<string, { total: number; completed: number; name: string }> = {}
  allDeadlines?.forEach(d => {
    if (!d.subject_id) return;
    // Cast any to bypass TypeScript if subjects typing is strict
    const subName = (d.subjects as any)?.name || 'Unknown Subject';
    if (!subjectMap[d.subject_id]) {
      subjectMap[d.subject_id] = { total: 0, completed: 0, name: subName };
    }
    subjectMap[d.subject_id].total++;
    if (d.status === 'completed') {
      subjectMap[d.subject_id].completed++;
    }
  });

  const subjectProgress = Object.values(subjectMap).map(sub => ({
    name: sub.name,
    percent: sub.total > 0 ? Math.round((sub.completed / sub.total) * 100) : 0
  }));

  return { data: { total, completed, percent, trendPath, subjectProgress } }
}

export async function getAllStudentsProgress(tutorId: string) {
  const supabase = await createClient()
  
  const { data: deadlines, error } = await supabase
    .from('student_deadlines')
    .select('id, student_id, status, created_at, updated_at')
    .eq('tutor_id', tutorId)

  if (error) {
    console.error('Error fetching all students progress:', error)
    return { error: error.message }
  }

  // Group by student_id
  const studentMap: Record<string, any[]> = {}
  deadlines?.forEach(d => {
    if (!studentMap[d.student_id]) studentMap[d.student_id] = []
    studentMap[d.student_id].push(d)
  })

  const results: Record<string, { percent: number, trendPath: string }> = {}

  for (const [studentId, studentDeadlines] of Object.entries(studentMap)) {
    const total = studentDeadlines.length
    const completedDeadlines = studentDeadlines.filter(d => d.status === 'completed')
    const completed = completedDeadlines.length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0

    let trendPath = "M0,28 L100,28"
    if (total > 0 && completed > 0) {
      const sortedCompleted = completedDeadlines
        .map(d => new Date(d.updated_at || d.created_at).getTime())
        .sort((a, b) => a - b)
      
      const points: {x: number, y: number}[] = [{ x: 0, y: 28 }]
      sortedCompleted.forEach((_, idx) => {
        const currentPercent = ((idx + 1) / total)
        const x = Math.round(((idx + 1) / completed) * 100)
        const y = Math.round(28 - (currentPercent * 23))
        points.push({ x, y })
      })
      trendPath = `M${points.map(p => `${p.x},${p.y}`).join(' L')}`
    }

    results[studentId] = { percent, trendPath }
  }

  return { data: results }
}
