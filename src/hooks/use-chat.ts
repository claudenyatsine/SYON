'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  channel_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

/**
 * useChat hook manages real-time classroom chat functionality using Supabase Broadcast.
 * This implementation doesn't require a database table and works instantly.
 */
export function useChat(channelId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const supabase = createClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!channelId) return;

    // Set up real-time broadcast channel
    const channel = supabase.channel(`chat-room:${channelId}`)
      .on('broadcast', { event: 'message' }, (payload) => {
        const newMessage = payload.payload as ChatMessage;
        setMessages((prev) => {
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, supabase]);

  /**
   * Sends a new message via broadcast.
   */
  const sendMessage = async (content: string, senderId: string, profile?: { full_name: string; avatar_url: string }) => {
    if (!content.trim() || !senderId || !channelId || !channelRef.current) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      content: content.trim(),
      sender_id: senderId,
      channel_id: channelId,
      created_at: new Date().toISOString(),
      profiles: profile,
    };

    // Add locally immediately for the sender
    setMessages((prev) => [...prev, newMessage]);

    // Broadcast to everyone else
    await channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: newMessage,
    });
  };

  return { messages, sendMessage };
}
