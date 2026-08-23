'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Video, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';

interface JoinClassButtonProps {
  meetingId: string;
  participantName: string;
  role?: 'host' | 'participant';
  buttonText: string;
  courseTitle?: string;
  className?: string;
}

export function JoinClassButton({
  meetingId,
  participantName,
  role = 'participant',
  buttonText,
  courseTitle = 'Live Class',
  className,
}: JoinClassButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!meetingId) {
      toast({
        title: 'Error',
        description: 'Meeting ID is missing for this class.',
        variant: 'destructive',
      });
      return;
    }

    // If host, notify students via Supabase Realtime Broadcast
    if (role === 'host') {
      const supabase = createClient();
      await supabase.channel('notifications').send({
        type: 'broadcast',
        event: 'class_started',
        payload: { 
          title: courseTitle,
          meetingId,
          tutorName: participantName 
        },
      });
    }

    // Navigate to the Agora classroom page
    const roleParam = role === 'host' ? 'tutor' : 'student';
    router.push(`/classroom/${meetingId}?name=${encodeURIComponent(participantName)}&role=${roleParam}`);
  };

  return (
    <Button
      className={className}
      onClick={handleJoin}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Video className="mr-2 h-4 w-4" />
      )}
      {isLoading ? 'Joining...' : buttonText}
    </Button>
  );
}
