'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTM from 'agora-rtm-sdk';

// NOTE: We are using the Agora RTM SDK for peer-to-peer signaling in the classroom.
// This handles hand raises, spotlighting, and screen share sync.

interface UseAgoraRTMProps {
  appId: string;
  channelName: string;
  uid: number;
  userName: string;
  token?: string | null;
}

export function useAgoraRTM({ appId, channelName, uid, userName, token }: UseAgoraRTMProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clientRef = useRef<any>(null);
  const isMounted = useRef(true);
  
  // Asynchronous connection state machine to prevent concurrent login/logout requests (fixes RTM:ERROR -10023)
  const connectionStateRef = useRef<'disconnected' | 'connecting' | 'connected' | 'disconnecting'>('disconnected');

  // Store message handlers so they can be dynamically updated without re-subscribing
  const handlersRef = useRef<{
    onSpotlight?: (payload: any) => void;
    onScreenShare?: (payload: any) => void;
    onHandRaise?: (payload: any) => void;
    onClassEnded?: (payload: any) => void;
  }>({});

  const leaveRTM = useCallback(async () => {
    if (connectionStateRef.current === 'disconnected' || connectionStateRef.current === 'disconnecting') {
      return;
    }
    
    console.log(`[RTM] Leaving channel: ${channelName}`);
    connectionStateRef.current = 'disconnecting';
    
    try {
      if (clientRef.current) {
        try {
          await clientRef.current.unsubscribe(channelName);
        } catch (err) {
          console.warn('[RTM] Unsubscribe warning:', err);
        }
        try {
          await clientRef.current.logout();
        } catch (err) {
          console.warn('[RTM] Logout warning:', err);
        }
        clientRef.current = null;
      }
    } catch (err) {
      console.warn('[RTM] Leave warning:', err);
    } finally {
      connectionStateRef.current = 'disconnected';
      if (isMounted.current) {
        setIsJoined(false);
      }
    }
  }, [channelName]);

  const joinRTM = useCallback(async () => {
    // 1. Guard against missing params or when token is not yet fetched from server
    if (!appId || !channelName || !uid || !token) {
      return;
    }

    // 2. Prevent concurrent / duplicate login requests (prevents RTM cancellation code -10023)
    if (connectionStateRef.current === 'connecting' || connectionStateRef.current === 'connected') {
      return;
    }

    console.log(`[RTM] Initiating join to channel: ${channelName} with UID: ${uid}`);
    connectionStateRef.current = 'connecting';

    try {
      // 1. Initialize RTM Client with logLevel set to 'none' to suppress console.error spam from SDK internals
      const client = new AgoraRTM.RTM(appId, String(uid), {
        logLevel: 'none'
      });
      clientRef.current = client;

      client.addEventListener('status', (event: any) => {
        console.log(`[RTM] Status:`, event);
      });

      // 2. Register Message event listener
      client.addEventListener('message', (event: any) => {
        if (event.channelName === channelName) {
          try {
            const msg = JSON.parse(event.message);
            console.log(`[RTM] Msg from ${event.publisherId}:`, msg);
            
            if (msg.event === 'spotlight' && handlersRef.current.onSpotlight) {
              handlersRef.current.onSpotlight(msg.payload);
            } else if (msg.event === 'screen-share' && handlersRef.current.onScreenShare) {
              handlersRef.current.onScreenShare(msg.payload);
            } else if (msg.event === 'hand-raise' && handlersRef.current.onHandRaise) {
              handlersRef.current.onHandRaise(msg.payload);
            } else if (msg.event === 'CLASS_ENDED' && handlersRef.current.onClassEnded) {
              handlersRef.current.onClassEnded(msg.payload);
            }
          } catch (e) {
            console.warn('[RTM] Failed to parse message', event.message, e);
          }
        }
      });

      // 3. Login with RTM dynamic token
      await client.login({ token: token });

      // 4. Subscribe to the classroom channel
      await client.subscribe(channelName);

      if (isMounted.current) {
        connectionStateRef.current = 'connected';
        setIsJoined(true);
        setError(null);
        console.log(`[RTM] Successfully joined signaling channel: ${channelName}`);
      }
    } catch (err: any) {
      console.warn('[RTM] Join warning (normal during state changes/cancellations):', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to join RTM');
      }
      connectionStateRef.current = 'disconnected';
      await leaveRTM();
    }
  }, [appId, channelName, uid, token, leaveRTM]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      leaveRTM();
    };
  }, [leaveRTM]);

  const sendMessage = useCallback(async (event: string, payload: any) => {
    if (!clientRef.current || connectionStateRef.current !== 'connected') {
      return;
    }
    try {
      const text = JSON.stringify({ event, payload, senderName: userName });
      await clientRef.current.publish(channelName, text);
    } catch (err) {
      console.warn('[RTM] Send warning:', err);
    }
  }, [channelName, userName]);

  // Hook to register listeners dynamically without re-creating RTM instance
  const registerListeners = useCallback((handlers: typeof handlersRef.current) => {
    handlersRef.current = handlers;
  }, []);

  return {
    isJoined,
    error,
    joinRTM,
    leaveRTM,
    sendMessage,
    registerListeners
  };
}
