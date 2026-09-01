"use server"

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createSelfStudentDeadline(
  studentId: string,
  title: string,
  dueDate: string,
  subjectId?: string,
  priority?: string
) {
  try {
    const adminClient = createAdminClient()

    // 1. Resolve valid subject_id to satisfy foreign key constraint
    let resolvedSubjectId = subjectId && subjectId !== 'none' ? subjectId : null
    if (!resolvedSubjectId) {
      const { data: enrollment } = await adminClient
        .from('enrollments')
        .select('subject_id')
        .eq('student_id', studentId)
        .limit(1)
        .maybeSingle()
      
      if (enrollment?.subject_id) {
        resolvedSubjectId = enrollment.subject_id
      } else {
        const { data: firstSub } = await adminClient.from('subjects').select('id').limit(1).single()
        resolvedSubjectId = firstSub?.id || null
      }
    }

    // 2. Resolve valid tutor_id to satisfy NOT NULL constraint
    const { data: tutorAssignment } = await adminClient
      .from('enrollments')
      .select('tutor_id')
      .eq('student_id', studentId)
      .not('tutor_id', 'is', null)
      .limit(1)
      .maybeSingle()

    let resolvedTutorId = tutorAssignment?.tutor_id
    if (!resolvedTutorId) {
      const { data: defaultTutor } = await adminClient
        .from('profiles')
        .select('id')
        .eq('role', 'tutor')
        .limit(1)
        .maybeSingle()
      resolvedTutorId = defaultTutor?.id
    }

    const { data, error } = await adminClient
      .from('student_deadlines')
      .insert({
        student_id: studentId,
        tutor_id: resolvedTutorId,
        subject_id: resolvedSubjectId,
        title,
        description: priority ? `Priority: ${priority}` : null,
        due_date: dueDate,
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .select('*, subject:subjects(name)')
      .single()

    if (error) {
      console.error('Error creating self student deadline:', error)
      return { error: error.message }
    }

    revalidatePath('/student/progress')
    return { data }
  } catch (err: any) {
    console.error('Unexpected error creating self student deadline:', err)
    return { error: err.message || 'Failed to create task' }
  }
}

export async function toggleSelfDeadlineStatus(deadlineId: string, status: string) {
  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('student_deadlines')
      .update({ 
        status: status.toLowerCase(), 
        updated_at: new Date().toISOString() 
      })
      .eq('id', deadlineId)
      .select()
      .single()

    if (error) {
      console.error('Error toggling self deadline status:', error)
      return { error: error.message }
    }

    revalidatePath('/student/progress')
    return { data }
  } catch (err: any) {
    console.error('Unexpected error toggling self deadline status:', err)
    return { error: err.message || 'Failed to update task status' }
  }
}

export async function getTutorStudents(tutorId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('enrollments')
    .select('id, student_id, subject_id, status, tutor_id, profiles!student_id!inner(id, full_name, email, avatar_url, curriculum_board, student_level, role), subjects!inner(id, name, level, category)')
    .eq('tutor_id', tutorId)
    .eq('status', 'approved')

  if (error) {
    console.error('Error fetching tutor students:', error)
    return { error: error.message }
  }

  // Filter out the tutor themselves and any non-student accounts (tutors/admins)
  const actualStudents = (data || []).filter((item: any) => {
    const s = item.profiles;
    if (!s) return false;
    if (s.id === tutorId) return false;
    if (s.role && s.role !== 'student') return false;
    return true;
  });

  return { data: actualStudents }
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

export async function getStudentSubjectDashboardData(studentId: string, subjectId: string) {
  const supabase = await createClient()

  try {
    // 1. Fetch current subject enrollment and assigned tutor
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .select(`
        id, 
        student_id, 
        subject_id, 
        status, 
        tutor_id, 
        subjects!inner(id, name, level, category),
        tutor:profiles!tutor_id(id, full_name, email, avatar_url, role, curriculum_board, student_level)
      `)
      .eq('student_id', studentId)
      .eq('subject_id', subjectId)
      .eq('status', 'approved')
      .maybeSingle()

    if (enrollError) {
      console.error('Error fetching enrollment:', enrollError)
    }

    // 2. Fetch all student's approved enrollments for the left switcher panel
    const { data: allEnrollments } = await supabase
      .from('enrollments')
      .select(`
        id,
        subject_id,
        status,
        tutor_id,
        subjects!inner(id, name, level, category),
        tutor:profiles!tutor_id(id, full_name, avatar_url)
      `)
      .eq('student_id', studentId)
      .eq('status', 'approved')

    // 3. Fetch Live Classes for this subject
    const { data: liveClasses } = await supabase
      .from('live_classes')
      .select(`
        *,
        tutor:profiles!live_classes_tutor_id_fkey(id, full_name, avatar_url)
      `)
      .eq('subject_id', subjectId)
      .order('start_time', { ascending: true })

    const subjectLiveClasses = (liveClasses || []).filter((c: any) => {
      if (c.meeting_link) {
        try {
          const parsed = JSON.parse(c.meeting_link);
          if (parsed.type === 'one_on_one') {
            return parsed.student_id === studentId;
          }
        } catch {}
      }
      return true;
    });

    // 4. Fetch Deadlines / Tasks for this subject
    const { data: deadlines } = await supabase
      .from('student_deadlines')
      .select('*')
      .eq('student_id', studentId)
      .eq('subject_id', subjectId)
      .order('due_date', { ascending: true })

    // 5. Fetch Curriculum Modules, Items and Assignments for this subject
    const { data: curriculumModules } = await supabase
      .from('curriculum_modules')
      .select(`
        id,
        title,
        sequence_order,
        items:curriculum_items(
          id,
          title,
          item_type,
          sequence_order,
          duration_minutes,
          start_date,
          metadata,
          assignments:curriculum_assignments(*)
        )
      `)
      .eq('subject_id', subjectId)
      .eq('approval_status', 'approved')
      .order('sequence_order', { ascending: true })

    // 6. Fetch Submissions & Graded assignments for this student
    const { data: submissions } = await supabase
      .from('submissions')
      .select('*')
      .eq('student_id', studentId)

    // Also check student_assignments table
    const { data: directAssignments } = await supabase
      .from('student_assignments')
      .select('*')
      .eq('student_id', studentId)
      .eq('subject_id', subjectId)

    // Calculate progress & metrics
    const deadlineList = deadlines || []
    const totalDeadlines = deadlineList.length
    const completedDeadlines = deadlineList.filter(d => d.status === 'completed').length

    // Extract all assignments from curriculum
    const allAssignments: any[] = []
    curriculumModules?.forEach(m => {
      m.items?.forEach((item: any) => {
        item.assignments?.forEach((a: any) => {
          const sub = submissions?.find(s => s.assignment_id === a.id)
          const dir = directAssignments?.find(d => d.module_item_id === item.id && d.assignment_number === a.assignment_number)
          
          let status: 'pending' | 'submitted' | 'completed' = 'pending'
          let grade: string | null = null
          let feedback: string | null = null

          if (sub) {
            if (sub.status === 'graded' || sub.overall_grade) {
              status = 'completed'
              grade = sub.overall_grade || 'Graded'
              feedback = sub.feedback || null
            } else {
              status = 'submitted'
            }
          } else if (dir) {
            if (dir.status === 'completed') {
              status = 'completed'
              feedback = dir.tutor_feedback || null
            } else if (dir.status === 'unmarked') {
              status = 'submitted'
            }
          }

          allAssignments.push({
            id: a.id,
            moduleItemId: item.id,
            moduleTitle: m.title,
            topicTitle: item.title,
            assignmentNumber: a.assignment_number || 1,
            title: a.title || `Assignment ${a.assignment_number || 1}`,
            description: a.description || item.title,
            dueDate: a.due_date || item.start_date || null,
            status,
            grade,
            feedback,
            submissionText: sub?.content || dir?.student_submission || null,
            updatedAt: sub?.updated_at || dir?.updated_at || null
          })
        })
      })
    })

    const totalTasks = totalDeadlines + allAssignments.length
    const completedTasks = completedDeadlines + allAssignments.filter(a => a.status === 'completed').length
    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Dynamic Sparkline
    let trendPath = "M0,28 L100,28"
    if (totalTasks > 0 && completedTasks > 0) {
      const points: {x: number, y: number}[] = [{ x: 0, y: 28 }]
      for (let i = 1; i <= completedTasks; i++) {
        const x = Math.round((i / completedTasks) * 100)
        const currentPercent = i / totalTasks
        const y = Math.round(28 - (currentPercent * 23))
        points.push({ x, y })
      }
      trendPath = `M${points.map(p => `${p.x},${p.y}`).join(' L')}`
    }

    return {
      data: {
        enrollment,
        allEnrollments: allEnrollments || [],
        liveClasses: subjectLiveClasses,
        deadlines: deadlineList,
        assignments: allAssignments,
        modules: curriculumModules || [],
        progress: {
          total: totalTasks,
          completed: completedTasks,
          percent,
          trendPath
        }
      }
    }
  } catch (err: any) {
    console.error('getStudentSubjectDashboardData error:', err)
    return { error: err.message }
  }
}

export async function createStudentPersonalTask(
  studentId: string,
  subjectId: string,
  tutorId: string,
  title: string,
  dueDate: string,
  description?: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_deadlines')
    .insert({
      student_id: studentId,
      subject_id: subjectId,
      tutor_id: tutorId || studentId,
      title,
      description: description || 'Self-study task',
      due_date: dueDate,
      status: 'pending'
    })
    .select('*, subjects(name, level)')
    .single()

  if (error) {
    console.error('Error creating personal task:', error)
    return { error: error.message }
  }

  revalidatePath(`/student/study-panel/${subjectId}`)
  return { data }
}

export async function requestStudentLiveClass(
  studentId: string,
  tutorId: string,
  subjectId: string,
  topic: string,
  preferredTime: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. Send chat message to tutor as direct notification
    const messageText = `📅 1-on-1 Live Class Request\nTopic: ${topic}\nPreferred Time: ${new Date(preferredTime).toLocaleString()}\nNotes: ${notes || 'No extra notes'}`
    
    const { error } = await supabase
      .from('student_tutor_messages')
      .insert({
        sender_id: studentId,
        receiver_id: tutorId,
        message: messageText
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/student/study-panel/${subjectId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send request' }
  }
}

