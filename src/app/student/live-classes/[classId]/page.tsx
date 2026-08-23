'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/components/providers/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Video, Play, Calendar, User } from 'lucide-react';
import Link from 'next/link';

interface LiveClassDetail {
  id: string;
  title: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  schedule?: string;
  recording_url?: string;
  imageUrl?: string;
  imageHint?: string;
  agora_channel_name?: string;
  tutor?: {
    full_name: string;
    avatar_url?: string;
  };
}

export default function LiveClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = Array.isArray(params.classId) ? params.classId[0] : params.classId;
  const { profile, loading: userLoading } = useUser();
  const [liveClass, setLiveClass] = useState<LiveClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!classId) return;

    const fetchClassDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select(`
            *,
            tutor:profiles!classes_tutor_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq('id', classId)
          .single();

        if (data && !error) {
          setLiveClass(data as any);
        }
      } catch (err) {
        console.error('Error fetching class details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  if (loading || userLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading class details...</p>
      </div>
    );
  }

  // Protect page for unapproved students
  if (profile && !profile.is_approved) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-burgundy/10 rounded-full flex items-center justify-center mb-6">
          <Video className="w-8 h-8 text-burgundy" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-muted-foreground mb-6">
          Your account is currently pending administrator approval.
        </p>
        <Button className="bg-gold hover:bg-[#800000] text-[#0B0C10] font-bold rounded-xl" asChild>
          <Link href="/student">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold mb-2">Class Not Found</h1>
        <p className="text-muted-foreground mb-6">The requested live class session could not be found.</p>
        <Button className="bg-gold hover:bg-[#800000] text-[#0B0C10] font-bold rounded-xl" asChild>
          <Link href="/student/live-classes">Back to Live Classes</Link>
        </Button>
      </div>
    );
  }

  // Helper to determine if URL is embeddable (YouTube/Vimeo)
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    
    // YouTube
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const ytMatch = url.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${ytMatch[2]}`;
    }
    
    // Vimeo
    const vimeoRegExp = /vimeo\.com\/([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegExp);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return null;
  };

  const embedUrl = getEmbedUrl(liveClass.recording_url);
  const isDirectVideo = liveClass.recording_url && (
    liveClass.recording_url.endsWith('.mp4') || 
    liveClass.recording_url.endsWith('.webm') || 
    liveClass.recording_url.endsWith('.ogg') ||
    liveClass.recording_url.includes('supabase.co/storage')
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-4">
      <Link href="/student/live-classes" className="inline-flex items-center text-sm text-gold hover:text-[#800000] transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Live Classes
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{liveClass.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 border border-border">
              <AvatarImage src={liveClass.tutor?.avatar_url} />
              <AvatarFallback>{liveClass.tutor?.full_name?.[0]}</AvatarFallback>
            </Avatar>
            <span>Tutor: {liveClass.tutor?.full_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gold" />
            <span>Scheduled: {liveClass.schedule ? new Date(liveClass.schedule).toLocaleString() : 'TBD'}</span>
          </div>
          <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted border border-border text-foreground/">
            {liveClass.status}
          </span>
        </div>
      </div>

      {liveClass.status === 'ongoing' ? (
        <Card className="bg-[#07140D] border-border shadow-2xl rounded-[2rem] overflow-hidden p-8 text-center max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-burgundy/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Video className="w-10 h-10 text-burgundy" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">This Class is Live Now!</h2>
            <p className="text-foreground/ text-sm">Join the interactive virtual classroom to interact with your tutor and peers.</p>
          </div>
          <Button className="w-full bg-gold hover:bg-[#800000] text-[#0B0C10] font-bold rounded-xl py-6 max-w-xs" asChild>
            <Link href={`/classroom/${liveClass.agora_channel_name || liveClass.id}?role=participant&name=${profile?.full_name || 'Guest'}`}>
              Join Room Now
            </Link>
          </Button>
        </Card>
      ) : liveClass.status === 'completed' ? (
        <div className="space-y-6">
          {embedUrl ? (
            <div className="relative aspect-video w-full bg-background/40 rounded-3xl overflow-hidden border border-border shadow-2xl">
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Class Recording"
              />
            </div>
          ) : isDirectVideo && liveClass.recording_url ? (
            <div className="relative aspect-video w-full bg-background/40 rounded-3xl overflow-hidden border border-border shadow-2xl">
              <video
                src={liveClass.recording_url}
                controls
                className="w-full h-full"
                poster={liveClass.imageUrl}
              />
            </div>
          ) : liveClass.recording_url ? (
            <Card className="bg-[#07140D] border-border shadow-2xl rounded-[2rem] overflow-hidden p-8 text-center max-w-xl mx-auto space-y-6">
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto">
                <Play className="w-10 h-10 text-gold" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Recording Available</h2>
                <p className="text-foreground/ text-sm">A recording has been uploaded for this completed live class. Click below to watch the session.</p>
              </div>
              <Button className="w-full bg-gold hover:bg-[#800000] text-[#0B0C10] font-bold rounded-xl py-6 max-w-xs" asChild>
                <a href={liveClass.recording_url} target="_blank" rel="noreferrer">
                  Watch Recording
                </a>
              </Button>
            </Card>
          ) : (
            <Card className="bg-[#07140D] border-border shadow-2xl rounded-[2rem] overflow-hidden p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Video className="w-8 h-8 text-foreground/" />
              </div>
              <h2 className="text-xl font-bold text-foreground/">Recording Coming Soon</h2>
              <p className="text-foreground/ text-sm max-w-sm mx-auto">
                This class is marked as completed, but the recording is not yet uploaded. Please check back later.
              </p>
            </Card>
          )}
        </div>
      ) : (
        <Card className="bg-[#07140D] border-border shadow-2xl rounded-[2rem] overflow-hidden p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8 text-foreground/" />
          </div>
          <h2 className="text-xl font-bold text-foreground/">Class has not started</h2>
          <p className="text-foreground/ text-sm max-w-sm mx-auto">
            This class is scheduled for {liveClass.schedule ? new Date(liveClass.schedule).toLocaleString() : 'TBD'}. You can join once the status becomes ongoing.
          </p>
        </Card>
      )}
    </div>
  );
}


