'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useConvoAI(channelName: string, uid: number) {
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const { toast } = useToast();

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // We do NOT auto-stop the agent on unmount because the tutor might just be refreshing,
      // and we want the agent to stay in the room. The agent will auto-terminate after 5 mins of idle.
    };
  }, []);

  const startAgent = useCallback(async () => {
    if (isAgentActive || isStarting) return;

    setIsStarting(true);

    try {
      const res = await fetch('/api/agora/convo-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, uid }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start AI Agent');
      }

      if (isMounted.current) {
        setIsAgentActive(true);
        setActiveAgentId(data.agentId);
        toast({
          title: 'AI Tutor Joined',
          description: 'The AI assistant is now in the voice channel.',
        });
      }
    } catch (err: any) {
      console.error('[Convo AI] Start error:', err);
      if (isMounted.current) {
        toast({
          title: 'Failed to start AI',
          description: err.message,
          variant: 'destructive',
        });
      }
    } finally {
      if (isMounted.current) setIsStarting(false);
    }
  }, [channelName, uid, isAgentActive, isStarting, toast]);

  const stopAgent = useCallback(async () => {
    if (!activeAgentId) return;

    setIsStarting(true); // Re-use starting state for the loading spinner
    try {
      const res = await fetch(`/api/agora/convo-ai?agentId=${activeAgentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to stop AI Agent');
      }

      if (isMounted.current) {
        setIsAgentActive(false);
        setActiveAgentId(null);
        toast({
          title: 'AI Tutor Left',
          description: 'The AI assistant has been removed from the channel.',
        });
      }
    } catch (err: any) {
      console.error('[Convo AI] Stop error:', err);
      if (isMounted.current) {
         toast({
          title: 'Failed to stop AI',
          description: err.message,
          variant: 'destructive',
        });
      }
    } finally {
      if (isMounted.current) setIsStarting(false);
    }
  }, [activeAgentId, toast]);

  return {
    isAgentActive,
    isStarting,
    startAgent,
    stopAgent,
  };
}
