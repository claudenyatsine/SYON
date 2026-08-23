'use server'

import { createClient } from '@/utils/supabase/server'

export interface Resource {
  id: string
  title: string
  description: string | null
  type: 'past_paper' | 'notes' | 'voice_note' | 'powerpoint' | 'recording'
  file_url: string
  file_size: string | null
  duration: string | null
  subjects: {
    id: string
    name: string
    category: string
    level: string
  }
}

export async function getStudentResources() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('resources')
    .select(`
      id,
      title,
      description,
      type,
      file_url,
      file_size,
      duration,
      subjects (
        id,
        name,
        category,
        level
      )
    `)
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching resources:', error)
    return []
  }

  return data as unknown as Resource[]
}
