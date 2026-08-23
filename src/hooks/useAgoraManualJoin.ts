import { useState, useEffect, useCallback, useRef } from 'react';
import { IAgoraRTCClient } from 'agora-rtc-react';

interface UseAgoraManualJoinProps {
  client: IAgoraRTCClient | null;
  appId: string;
  channel: string;
  token: string | null;
  uid: number;
}

export function useAgoraManualJoin({
  client,
  appId,
  channel,
  token,
  uid,
}: UseAgoraManualJoinProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);
  
  const isMounted = useRef(true);
  const joinAttemptRef = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (client && client.connectionState === 'CONNECTED') {
        client.leave().catch(console.error);
      }
    };
  }, [client]);

  const manualJoin = useCallback(async () => {
    if (!client || isJoined || isLoading) return;

    setIsLoading(true);
    setError(null);
    setRecovering(false);
    joinAttemptRef.current++;
    const currentAttempt = joinAttemptRef.current;

    const attemptJoin = async (targetUid: number) => {
      try {
        await client.join(appId, channel, token, targetUid);
        if (isMounted.current && currentAttempt === joinAttemptRef.current) {
          setIsJoined(true);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (!isMounted.current || currentAttempt !== joinAttemptRef.current) return;

        // Intercept Error 104 (UID_CONFLICT)
        if (err.code === 'UID_CONFLICT' || err.message?.includes('104') || err.code === 104) {
          console.warn('[Agora] UID Conflict detected. Retrying with offset...');
          setRecovering(true);
          
          // Wait 2 seconds
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          if (!isMounted.current || currentAttempt !== joinAttemptRef.current) return;

          try {
            // Retry with offset
            const offsetUid = targetUid + 10000;
            await client.join(appId, channel, token, offsetUid);
            if (isMounted.current) {
              setIsJoined(true);
              setIsLoading(false);
              setRecovering(false);
            }
          } catch (retryErr: any) {
            if (isMounted.current) {
              setError(retryErr.message || 'Failed to join after retry');
              setIsLoading(false);
              setRecovering(false);
            }
          }
        } else {
          setError(err.message || 'Failed to join channel');
          setIsLoading(false);
        }
      }
    };

    await attemptJoin(uid);
  }, [client, appId, channel, token, uid, isJoined, isLoading]);

  return {
    isJoined,
    isLoading,
    error,
    recovering,
    manualJoin,
  };
}
