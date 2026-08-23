'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AgoraChat from 'agora-chat';

interface UseAgoraChatProps {
  appKey: string;
  userId: string;
  token?: string; // Agora Chat token
  channelName: string;
}

export function useAgoraChat({ appKey, userId, token, channelName }: UseAgoraChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const connRef = useRef<any>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (connRef.current) {
        connRef.current.close();
      }
    };
  }, []);

  const initChat = useCallback(async () => {
    if (!appKey || !userId || isJoined) return;

    try {
      const conn = new AgoraChat.connection({
        appKey: appKey,
      });
      connRef.current = conn;

      conn.addEventHandler('connection&message', {
        onConnected: () => {
          console.log('[Agora Chat] Connected');
          if (isMounted.current) setIsJoined(true);
          // Join the channel (in Agora Chat, we treat the classroom as a Chat Group or Chatroom)
          // For simplicity in this demo, we'll assume the channelName maps to a Group ID
          // that was pre-created. Real implementation requires server-side group creation.
          fetchHistory();
        },
        onDisconnected: () => {
          console.log('[Agora Chat] Disconnected');
          if (isMounted.current) setIsJoined(false);
        },
        onTextMessage: (message: any) => {
          console.log('[Agora Chat] New message:', message);
          if (message.to === channelName) {
            setMessages(prev => [...prev, message]);
          }
        },
        onError: (error: any) => {
          console.error('[Agora Chat] Error:', error);
        }
      });

      await conn.open({
        user: userId,
        agoraToken: token || 'temp_token' // In production, require a real token
      });

    } catch (err) {
      console.error('[Agora Chat] Initialization failed:', err);
    }
  }, [appKey, userId, token, channelName, isJoined]);

  const fetchHistory = async () => {
    if (!connRef.current) return;
    try {
        // Fetch group message history (requires Agora Chat Pro/Enterprise)
        const options = {
            targetId: channelName,
            chatType: 'groupChat' as const,
            searchDirection: 'up' as const,
        };
        const res = await connRef.current.getHistoryMessages(options);
        if (isMounted.current && res.messages) {
            setMessages(res.messages);
        }
    } catch (err) {
        console.error('[Agora Chat] Failed to fetch history:', err);
    }
  };

  const sendTextMessage = async (text: string) => {
    if (!connRef.current || !isJoined) return;

    const msg = AgoraChat.message.create({
      type: 'txt',
      msg: text,
      to: channelName,
      chatType: 'groupChat',
    });

    try {
      await connRef.current.send(msg);
      // Optimistically add to local state
      setMessages(prev => [...prev, msg]);
    } catch (err) {
      console.error('[Agora Chat] Failed to send message:', err);
    }
  };

  return {
    messages,
    isJoined,
    initChat,
    sendTextMessage
  };
}
