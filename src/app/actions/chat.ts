"use server"

import { createClient } from '@/utils/supabase/server'

export async function getGlobalChatMessages(userId: string, partnerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('global_messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching chat messages:', error)
    return { error: error.message }
  }

  return { data }
}

export async function sendGlobalChatMessage(senderId: string, receiverId: string, message: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('global_messages')
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

export async function getRecentChatContacts(userId: string) {
  const supabase = await createClient()
  
  // This gets all messages where user is sender or receiver
  const { data, error } = await supabase
    .from('global_messages')
    .select('sender_id, receiver_id, message, created_at, is_read')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching chat contacts:', error)
    return { error: error.message }
  }

  // We need to group by partner to find unique recent conversations
  const partnerMap = new Map<string, any>();
  
  for (const msg of data || []) {
    const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
    if (!partnerMap.has(partnerId)) {
      partnerMap.set(partnerId, {
        partnerId,
        lastMessage: msg.message,
        lastMessageTime: msg.created_at,
        unread: msg.receiver_id === userId && !msg.is_read
      });
    }
  }

  const partners = Array.from(partnerMap.values());
  
  if (partners.length === 0) return { data: [] };

  // Fetch partner profiles
  const partnerIds = partners.map(p => p.partnerId);
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .in('id', partnerIds)

  if (profileError) {
    console.error('Error fetching partner profiles:', profileError)
    return { error: profileError.message }
  }

  // Merge profile data
  const merged = partners.map(p => {
    const profile = profiles.find(prof => prof.id === p.partnerId)
    return {
      ...p,
      profile
    }
  })

  return { data: merged }
}

export async function markMessagesAsRead(userId: string, partnerId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('global_messages')
    .update({ is_read: true })
    .eq('receiver_id', userId)
    .eq('sender_id', partnerId)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking messages as read:', error)
    return { error: error.message }
  }
  return { success: true }
}

export async function searchProfilesForChat(query: string) {
  const supabase = await createClient()
  if (!query.trim()) return { data: [] }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .ilike('full_name', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching profiles:', error)
    return { error: error.message }
  }
  return { data }
}
