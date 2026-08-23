'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
// Import AgoraRTC default from agora-rtc-react, NOT from agora-rtc-sdk-ng.
// agora-rtc-react re-exports the same SDK but through its own module context.
// Using a separate agora-rtc-sdk-ng import creates a different module instance,
// which means client events never reach the React hooks (no video/audio renders).
import AgoraRTC, {
  AgoraRTCProvider,
  useRTCClient,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  usePublish,
  LocalVideoTrack,
  RemoteUser,
} from 'agora-rtc-react';
import { useAgoraManualJoin } from '@/hooks/useAgoraManualJoin';
import { useChat } from '@/hooks/use-chat';
import { useAgoraRTM } from '@/hooks/useAgoraRTM';
import { useConvoAI } from '@/hooks/useConvoAI';
import { useAgoraChat } from '@/hooks/useAgoraChat';
import { lazy, Suspense } from 'react';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  LogOut, 
  Users,
  Maximize2,
  Minimize2,
  Settings,
  Search,
  Bell,
  Home,
  Headphones,
  FileText,
  Calendar,
  LayoutGrid,
  MoreVertical,
  Volume2,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Hand,
  Monitor,
  MonitorOff,
  Presentation,
  AlertTriangle,
  Loader2,
  Upload,
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { useUser } from '@/components/providers/user-context';

const AgoraWhiteboard = lazy(() => import('./AgoraWhiteboard'));

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

// Set Agora log level to Warning to suppress non-critical internal traffic_stats errors
if (typeof window !== 'undefined') {
  AgoraRTC.setLogLevel(2);
}

interface AgoraClassroomProps {
  appId: string;
  channelName: string;
  token: string;
  rtmToken?: string;
  uid: number;
  userName: string;
  role?: string;
  teacherUid?: number;
  subjectId?: string;
  onLeave?: () => void;
  sessionMode?: 'rtc' | 'live';
  voiceOnly?: boolean;
}

export function AgoraClassroom(props: AgoraClassroomProps) {
  const { sessionMode = 'rtc' } = props;
  // Stable client instance for the lifetime of this component.
  // Do NOT manually call agoraClient.leave() here — useJoin inside
  // ClassroomInner is the sole owner of the join/leave lifecycle.
  // A competing leave() causes UID_CONFLICT on the next join attempt.
  const [agoraClient] = useState(() => AgoraRTC.createClient({ mode: sessionMode, codec: 'vp8' }));

  return (
    <AgoraRTCProvider client={agoraClient}>
      <ClassroomInner {...props} />
    </AgoraRTCProvider>
  );
}

function ClassroomInner({
  appId,
  channelName,
  token,
  rtmToken,
  uid,
  userName,
  role,
  teacherUid,
  onLeave,
  subjectId,
  sessionMode = 'rtc',
  voiceOnly = false,
}: AgoraClassroomProps) {
  const [micOn, setMic] = useState(false);
  const [videoOn, setVideo] = useState(false);
  const { profile, loading: loadingProfile } = useUser();
  const { messages, sendMessage } = useChat(channelName);
  const [msgInput, setMsgInput] = useState('');
  const [spotlightedUid, setSpotlightedUid] = useState<number | null>(null);
  const [screenTrack, setScreenTrack] = useState<any>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenPermissionRevoked, setScreenPermissionRevoked] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  // UID of the remote participant currently sharing screen
  const [remoteScreenUid, setRemoteScreenUid] = useState<number | null>(null);
  const [classData, setClassData] = useState<any>(null);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  // Map of uid -> { name, role } for showing real names on tiles
  const [participantMap, setParticipantMap] = useState<Record<number, { name: string; role: string }>>({});  
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'docs' | 'assignments' | 'whiteboard'>('chat');
  const [notes, setNotes] = useState('');
  const [classResources, setClassResources] = useState<any[]>([]);
  const [uploadedResources, setUploadedResources] = useState<Array<{ title: string, format: string, file_url: string, size_mb: string }>>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isVoiceOnly, setIsVoiceOnly] = useState(voiceOnly);
  const [raisedHands, setRaisedHands] = useState<{ uid: number; name: string }[]>([]);

  // Determine if the CURRENT user is the tutor/host using ALL available signals
  const iAmTutor = useMemo(() => {
    const fromProp = role === 'tutor';
    const fromProfile = profile?.role === 'tutor';
    const fromUid = uid >= 1000 && uid <= 2000;
    return fromProp || fromProfile || fromUid;
  }, [role, profile?.role, uid]);

  // Keep a ref of notes for stale-closure-free saves when class ends abruptly
  const notesRef = useRef(notes);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Autosave notes to local storage
  useEffect(() => {
    if (!iAmTutor && channelName && profile?.id && notes) {
      localStorage.setItem(`notes_${channelName}_${profile.id}`, notes);
    }
  }, [notes, channelName, iAmTutor, profile?.id]);

  // Load notes from local storage on mount
  useEffect(() => {
    if (!iAmTutor && channelName && profile?.id) {
      const saved = localStorage.getItem(`notes_${channelName}_${profile.id}`);
      if (saved) setNotes(saved);
    }
  }, [channelName, iAmTutor, profile?.id]);

  const saveStudentNotes = async () => {
    const currentNotes = notesRef.current;
    if (!currentNotes.trim() || iAmTutor) return;
    try {
      await supabase.from('resources').insert({
        title: `My Notes: ${classData?.title || channelName}`,
        format: 'pdf',
        type: 'pdf',
        file_url: 'data:text/plain;base64,' + btoa(currentNotes), 
        subject_id: subjectId || null,
        live_class_id: channelName,
        source: 'student_upload',
        uploaded_by: profile?.id,
        tutor_id: null
      });
      // Optionally clear after saving
      localStorage.removeItem(`notes_${channelName}_${profile?.id}`);
    } catch (err) {
      console.error('[Student Notes] Error saving notes:', err);
    }
  };

  const chatScrollRef = useRef<HTMLDivElement>(null);

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  
  // Phase 4: Conversational AI
  const { isAgentActive, isStarting: isAiStarting, startAgent, stopAgent } = useConvoAI(channelName, uid);

  // Phase 5: Agora Chat
  const { messages: agoraChatMessages, sendTextMessage: sendAgoraChat, initChat } = useAgoraChat({
    appKey: process.env.NEXT_PUBLIC_AGORA_CHAT_APP_KEY || '', 
    userId: String(uid),
    channelName,
  });

  // Phase 1: RTM for Signaling (Replacing Supabase Broadcast)
  const { joinRTM, leaveRTM, sendMessage: sendRTM, registerListeners } = useAgoraRTM({
    appId,
    channelName,
    uid,
    userName: profile?.full_name || userName,
    token: rtmToken,
  });

  useEffect(() => {
    initChat();
    joinRTM();
    return () => { leaveRTM(); };
  }, [initChat, joinRTM, leaveRTM]);

  useEffect(() => {
    registerListeners({
      onClassEnded: () => { 
        if (!iAmTutor) {
          saveStudentNotes().finally(() => onLeave?.());
        }
      },
      onSpotlight: (payload) => setSpotlightedUid(payload.uid),
      onScreenShare: (payload) => {
        if (payload.sharing) setRemoteScreenUid(Number(payload.uid));
        else if (Number(payload.uid) === remoteScreenUid) setRemoteScreenUid(null);
      },
      onHandRaise: (payload) => {
        const { uid: raiserUid, name, raised } = payload;
        setRaisedHands(prev => raised 
          ? [...prev.filter(h => h.uid !== raiserUid), { uid: raiserUid, name }]
          : prev.filter(h => h.uid !== raiserUid));
      }
    });
  }, [registerListeners, iAmTutor, onLeave, remoteScreenUid]);

  // Keep for backwards compatibility if needed, but RTM takes over
  const broadcastChannelRef = useRef<any>(null);
  // Stable ref to the Supabase Presence channel (participant roster).
  const presenceChannelRef = useRef<any>(null);

  // Combine local/Supabase and Agora Chat message feeds into a unified chronological feed
  const combinedMessages = useMemo(() => {
    const all: any[] = [];
    const ids = new Set<string>();

    // Add Supabase broadcast messages
    messages.forEach((msg) => {
      if (msg.id && !ids.has(msg.id)) {
        ids.add(msg.id);
        all.push({
          ...msg,
          source: 'supabase'
        });
      }
    });

    // Add Agora Chat messages
    agoraChatMessages.forEach((msg: any) => {
      const senderUid = msg.from || msg.sender_id;
      if (!senderUid) return;

      const isMe = String(senderUid) === String(uid);
      const info = participantMap[Number(senderUid)];
      const name = isMe ? (profile?.full_name || userName) : (info?.name || `User ${senderUid}`);
      const content = msg.msg || msg.content || '';
      const createdTime = msg.time 
        ? new Date(msg.time).toISOString() 
        : (msg.created_at || new Date().toISOString());
      
      const msgId = msg.id || `${senderUid}-${createdTime}-${content.substring(0, 10)}`;

      if (!ids.has(msgId)) {
        ids.add(msgId);
        all.push({
          id: msgId,
          content: content,
          sender_id: String(senderUid),
          created_at: createdTime,
          profiles: {
            full_name: name,
            avatar_url: isMe ? profile?.avatar_url : `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
          },
          source: 'agora'
        });
      }
    });

    // Sort chronologically
    return all.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages, agoraChatMessages, uid, profile, userName, participantMap]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [combinedMessages]);

  const handleTabChange = (val: string) => {
    setActiveTab(val as any);
    if (val === 'whiteboard') {
      setShowWhiteboard(true);
    }
  };

  // Agora Hooks — explicit encoder config for low latency
  const { localMicrophoneTrack, error: micError } = useLocalMicrophoneTrack(micOn, {
    AEC: true, ANS: true, AGC: true,
  });
  const { localCameraTrack, error: camError } = useLocalCameraTrack(videoOn, {
    encoderConfig: { width: 640, height: 360, frameRate: 24, bitrateMin: 200, bitrateMax: 600 },
    optimizationMode: 'motion',
  });
  const remoteUsers = useRemoteUsers();
  const client = useRTCClient();

  const isPermissionDeniedError = useCallback((err: any): boolean => {
    if (!err) return false;
    const errMsg = String(err.message || err).toLowerCase();
    const errCode = String(err.code || '').toLowerCase();
    return (
      errMsg.includes('notallowederror') ||
      errMsg.includes('permission denied') ||
      errMsg.includes('permission_denied') ||
      errCode.includes('permission_denied') ||
      errCode.includes('notallowederror')
    );
  }, []);

  const micPermissionRevoked = useMemo(() => isPermissionDeniedError(micError), [micError, isPermissionDeniedError]);
  const camPermissionRevoked = useMemo(() => isPermissionDeniedError(camError), [camError, isPermissionDeniedError]);

  // Handle permission errors
  useEffect(() => {
    if (micError) {
      if (isPermissionDeniedError(micError)) {
        console.warn('[Classroom] Microphone permission revoked by user.');
      } else {
        console.error('Mic:', micError);
      }
      setMic(false);
    }
  }, [micError, isPermissionDeniedError]);

  useEffect(() => {
    if (camError) {
      if (isPermissionDeniedError(camError)) {
        console.warn('[Classroom] Camera permission revoked by user.');
      } else {
        console.error('Cam:', camError);
      }
      setVideo(false);
    }
  }, [camError, isPermissionDeniedError]);

  // --- MANUAL JOIN WITH UID_CONFLICT RECOVERY ---
  useEffect(() => {
    if (client) {
      if (sessionMode === 'live') {
        client.setClientRole(iAmTutor ? 'host' : 'audience').catch(console.error);
      }
    }
  }, [client, sessionMode, iAmTutor]);

  const { isJoined, isLoading: isJoinLoading, error: joinError, recovering, manualJoin } = useAgoraManualJoin({
    client, appId, channel: channelName, token: token || null, uid,
  });

  // Fetch Class Data
  useEffect(() => {
    if (!channelName) return;
    supabase.from('classes').select('*').eq('id', channelName).single()
      .then(({ data }) => { if (data) setClassData(data); });
  }, [channelName, supabase]);

  // Update class status to ongoing when tutor joins
  useEffect(() => {
    if (isJoined && iAmTutor && channelName) {
      supabase.from('classes').update({ status: 'ongoing' }).eq('id', channelName)
        .then(({ error }) => {
          if (error) console.error('[Classroom] Failed to set status to ongoing:', error);
          else console.log('[Classroom] Class status set to ongoing');
        });
    }
  }, [isJoined, iAmTutor, channelName, supabase]);

  // ─── SINGLE unified Supabase broadcast channel ─────────────────────────────
  // All real-time events (class end, spotlight, screen share, hand raise,
  // participant identity) go through one channel to minimise WS connections.
  useEffect(() => {
    if (!channelName) return;
    const ch = supabase.channel(`classroom:${channelName}`, {
      config: { broadcast: { self: false } },
    })
      // Class ended — kick students out
      .on('broadcast', { event: 'CLASS_ENDED' }, () => {
        if (!iAmTutor) onLeave?.();
      })
      // Spotlight sync
      .on('broadcast', { event: 'spotlight' }, ({ payload }) => {
        setSpotlightedUid(payload.uid);
      })
      // Screen share: track which remote UID is sharing
      .on('broadcast', { event: 'screen-share' }, ({ payload }) => {
        if (payload.sharing) {
          setRemoteScreenUid(Number(payload.uid));
        } else if (Number(payload.uid) === remoteScreenUid) {
          setRemoteScreenUid(null);
        }
      })
      // Hand raise
      .on('broadcast', { event: 'hand-raise' }, ({ payload }) => {
        const { uid: raiserUid, name, raised } = payload;
        setRaisedHands(prev =>
          raised
            ? [...prev.filter(h => h.uid !== raiserUid), { uid: raiserUid, name }]
            : prev.filter(h => h.uid !== raiserUid)
        );
      })
      .subscribe();

    broadcastChannelRef.current = ch;

    return () => {
      broadcastChannelRef.current = null;
      supabase.removeChannel(ch);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);

  // ─── SUPABASE PRESENCE — real-time participant roster ───────────────────────
  useEffect(() => {
    if (!channelName || !profile) return;

    // Use a unique key for presence (our UID) to avoid duplicates and simplify lookup
    const ch = supabase.channel(`presence:${channelName}`, {
      config: {
        presence: {
          key: uid.toString(),
        },
      },
    });

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState<{ uid: number; name: string; role: string }>();
      const map: Record<number, { name: string; role: string }> = {};
      
      Object.entries(state).forEach(([key, presences]) => {
        const p = presences[0]; // Take the latest presence for this key
        if (p) {
          map[Number(key)] = { name: p.name, role: p.role };
        }
      });
      
      setParticipantMap(map);
    });

    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Presence] Subscribed. Tracking UID: ${uid} as ${profile.full_name}`);
        await ch.track({
          uid,
          name: profile.full_name || userName,
          role: iAmTutor ? 'tutor' : 'student',
        });
      }
    });

    presenceChannelRef.current = ch;

    return () => {
      presenceChannelRef.current = null;
      supabase.removeChannel(ch);
    };
  }, [channelName, profile, uid, userName, iAmTutor, supabase]);

  // Clear hand-raise and screen-share state when a remote user disconnects
  useEffect(() => {
    if (!client) return;
    const onUserLeft = (user: any) => {
      setRaisedHands(prev => prev.filter(h => h.uid !== Number(user.uid)));
      setRemoteScreenUid(prev => (prev === Number(user.uid) ? null : prev));
    };
    client.on('user-left', onUserLeft);
    return () => { client.off('user-left', onUserLeft); };
  }, [client]);

  const handleFinalize = async () => {
    setIsEnding(true);
    try {
      console.log('[Finalize] Starting. subjectId:', subjectId, 'channelName:', channelName, 'profile:', profile?.id);

      // 1. Update Class Status
      const { error: classError } = await supabase.from('classes').update({ status: 'completed' }).eq('id', channelName);
      if (classError) console.warn('[Finalize] Class status update failed:', classError);
      
      // 2. Export Notes as a Resource
      if (notes.trim()) {
        const { error: notesError } = await supabase.from('resources').insert({
          title: `Class Notes: ${classData?.title || channelName}`,
          format: 'pdf',
          type: 'pdf',
          file_url: 'data:text/plain;base64,' + btoa(notes), 
          subject_id: subjectId || null,
          live_class_id: channelName,
          source: 'tutor_upload',
          uploaded_by: profile?.id,
          tutor_id: profile?.id
        });
        if (notesError) {
          console.error('[Finalize] Notes insert error details:', JSON.stringify(notesError, null, 2));
        }
      }

      // 3. Export Uploaded Documents
      if (uploadedResources.length > 0) {
        const resourcesToInsert = uploadedResources.map(res => ({
          title: res.title,
          format: res.format,
          type: res.format === 'video' ? 'video' : 'document',
          file_url: res.file_url,
          subject_id: subjectId || null,
          live_class_id: channelName,
          source: 'tutor_upload',
          uploaded_by: profile?.id,
          tutor_id: profile?.id
        }));
        const { error: docsError } = await supabase.from('resources').insert(resourcesToInsert);
        if (docsError) {
          console.error('[Finalize] Docs insert error details:', JSON.stringify(docsError, null, 2));
        } else {
          console.log('[Finalize] Inserted', resourcesToInsert.length, 'resources.');
        }
      } else {
        console.log('[Finalize] No uploaded documents to save.');
      }

      // 4. Signal Class End to all participants
      await sendRTM('CLASS_ENDED', { endedAt: new Date().toISOString() });
      await broadcastChannelRef.current?.send({
        type: 'broadcast', event: 'CLASS_ENDED',
        payload: { endedAt: new Date().toISOString() },
      });
      
      onLeave?.();
    } catch (err) {
      console.error('[Finalize] Unexpected error:', err);
    } finally {
      setIsEnding(false);
      setShowFinalizeDialog(false);
    }
  };

  const handleLeaveClick = () => {
    if (iAmTutor) {
      setShowFinalizeDialog(true);
    } else {
      saveStudentNotes().finally(() => onLeave?.());
    }
  };

  // During screen share, exclude camera from usePublish so it doesn't
  // conflict with the manually-published screen track (Agora only allows
  // one video track per client in RTC mode). Mic stays published always.
  const tracksToPublish = useMemo(() => {
    if (isVoiceOnly) return [localMicrophoneTrack].filter(Boolean) as any[];
    if (isScreenSharing) return [localMicrophoneTrack].filter(Boolean) as any[];
    return [localMicrophoneTrack, localCameraTrack].filter(Boolean) as any[];
  }, [localMicrophoneTrack, localCameraTrack, isScreenSharing, isVoiceOnly]);
  
  usePublish(isJoined ? tracksToPublish : []);

  // Track if dual stream has been enabled to avoid redundant calls
  const dualStreamEnabledRef = useRef(false);

  // Enable Dual Stream Mode for adaptive bitrate (reduces latency under poor network)
  useEffect(() => {
    if (!client || dualStreamEnabledRef.current) return;
    dualStreamEnabledRef.current = true;
    client.enableDualStream().catch((err: any) => {
      if (!err?.message?.includes('already enabled')) console.error('Dual stream:', err);
    });
  }, [client]);

  const toggleSpotlight = (targetUid: number | null) => {
    if (!iAmTutor) return;
    setSpotlightedUid(targetUid);
    sendRTM('spotlight', { uid: targetUid });
  };

  const teacherUser = useMemo(() => {
    if (iAmTutor) return 'local';
    return remoteUsers.find(u => Number(u.uid) >= 1000 && Number(u.uid) <= 2000);
  }, [remoteUsers, iAmTutor]);

  const studentUsers = useMemo(() => {
    return remoteUsers.filter(u => !(Number(u.uid) >= 1000 && Number(u.uid) <= 2000));
  }, [remoteUsers]);

  // --- SCREEN SHARING & UI STATE ---
  const [handRaised, setHandRaised] = useState(false);
  const screenVideoRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!stageRef.current) return;
    if (!document.fullscreenElement) {
      stageRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const startScreenShare = async () => {
    setScreenPermissionRevoked(false);
    try {
      const track = await AgoraRTC.createScreenVideoTrack(
        { encoderConfig: { width: 1280, height: 720, frameRate: 15, bitrateMax: 2000 } },
        'disable'
      );
      const videoTrack = Array.isArray(track) ? track[0] : track;

      // Agora RTC mode only supports one video track per client.
      // Manually unpublish the camera before publishing screen.
      // (usePublish will stop managing camera once isScreenSharing=true)
      if (localCameraTrack && client && isJoined) {
        try { await client.unpublish(localCameraTrack); } catch {}
      }

      if (client && isJoined) await client.publish(videoTrack);

      // Set state BEFORE sending broadcast so React flushes
      // isScreenSharing=true → tracksToPublish excludes camera
      setScreenTrack(videoTrack);
      setIsScreenSharing(true);

      sendRTM('screen-share', { uid, sharing: true });

      videoTrack.on('track-ended', () => stopScreenShare(videoTrack));
    } catch (err: any) {
      // User cancelled screen picker — not a real error
      if (isPermissionDeniedError(err)) {
        console.warn('[Classroom] Screen sharing casting permission denied or cancelled by user.');
        setScreenPermissionRevoked(true);
      } else {
        console.error('Screen share failed:', err);
      }
    }
  };

  const stopScreenShare = async (track?: any) => {
    const t = track || screenTrack;
    if (t) {
      try {
        if (client && client.connectionState === 'CONNECTED') {
          await client.unpublish(t);
        }
        t.close();
      } catch (e) { 
        console.warn('[stopScreenShare] Failed to unpublish:', e); 
      }
    }
    setScreenTrack(null);
    // Setting isScreenSharing=false restores camera to tracksToPublish,
    // so usePublish automatically re-publishes the camera track.
    setIsScreenSharing(false);
    sendRTM('screen-share', { uid, sharing: false });
  };

  // Play LOCAL screen track into the ref div
  useEffect(() => {
    if (screenTrack && screenVideoRef.current) screenTrack.play(screenVideoRef.current);
  }, [screenTrack]);

  // --- HAND RAISE ---
  const toggleHandRaise = () => {
    const newState = !handRaised;
    setHandRaised(newState);
    sendRTM('hand-raise', { uid, name: profile?.full_name || userName, raised: newState });
  };

  // --- LOADING STATE ---
  if (loadingProfile) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-foreground/ text-lg animate-pulse font-medium">Verifying identity...</p>
      </div>
    );
  }

  // --- PRE-JOIN LOBBY ---
  if (!isJoined) {
    return (
      <LobbyScreen
        userName={userName}
        channelName={channelName}
        micOn={micOn}
        videoOn={videoOn}
        micError={micError}
        camError={camError}
        micPermissionRevoked={micPermissionRevoked}
        camPermissionRevoked={camPermissionRevoked}
        localCameraTrack={localCameraTrack}
        onToggleMic={() => setMic(m => !m)}
        onToggleVideo={() => setVideo(v => !v)}
        onJoin={manualJoin}
        onLeave={onLeave}
        isLoading={isJoinLoading}
        recovering={recovering}
        error={joinError}
        profile={profile}
        classBanner={classData?.image_url}
        classTitle={classData?.title}
      />
    );
  }


  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-4 md:px-8 py-4 md:py-6 flex flex-wrap items-center justify-between gap-4 z-20">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-serif text-foreground/">Hello, {profile?.full_name || userName}!</h1>
            <p className="text-xs text-foreground/ font-sans mt-1">Team Collaboration Meeting | Live Now</p>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative w-full max-w-[20rem] hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/" />
                <input 
                  className="flex h-10 w-full border border-input px-3 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm file:ml-auto file:pl-4 bg-muted border-none rounded-full pl-11 py-5 text-sm focus-visible:ring-1 focus-visible:ring-white/20 transition-all placeholder:text-foreground/" 
                  placeholder="Search meetings..." 
                />
             </div>
             <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground rounded-full bg-[#D9ED92] hover:bg-[#E8C85E] text-[#0B0C10] w-10 h-10 shadow-lg shadow-[#D9ED92]/20 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell w-5 h-5 text-[#0B0C10]">
                  <path d="M10.268 21a2 2 0 0 0 3.464 0"></path>
                  <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>
                </svg>
             </button>
          </div>
        </header>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 md:pb-8 custom-scrollbar">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
            
            {/* LEFT COLUMN: Video & Insights */}
            <div className="flex-1 flex flex-col gap-4 md:gap-8">
              
              {/* PRESENTATION STAGE — whiteboard has priority, then screen share, then tutor camera */}
              <div ref={stageRef} className={cn("relative rounded-[2.5rem] overflow-hidden border border-border bg-[#07120C] shadow-2xl group group/stage", isFullscreen ? 'rounded-none' : 'aspect-video')}>
                {showWhiteboard ? (
                  /* Priority 1: Interactive Whiteboard */
                  <div className="absolute inset-0 w-full h-full p-2 bg-[#07120C] z-10">
                    <AgoraWhiteboard
                      appIdentifier={process.env.NEXT_PUBLIC_AGORA_WHITEBOARD_APP_ID || ''}
                      sdkToken={process.env.NEXT_PUBLIC_AGORA_WHITEBOARD_SDK_TOKEN || ''}
                      roomToken="temp_room_token" 
                      uuid={channelName}
                      uid={String(uid)}
                      isTutor={iAmTutor}
                    />
                    
                    {/* Floating Close Button inside Stage */}
                    <button 
                      onClick={() => setShowWhiteboard(false)}
                      className="absolute top-6 right-20 inline-flex items-center justify-center rounded-full bg-background/60 backdrop-blur-md hover:bg-background/80 px-4 py-2 border border-border text-[10px] font-bold uppercase tracking-widest text-foreground transition-all hover:scale-105 active:scale-95 z-20"
                    >
                      Close Board
                    </button>
                  </div>
                ) : isScreenSharing && screenTrack ? (
                  /* Priority 2: LOCAL screen share (tutor sharing their screen) */
                  <div ref={screenVideoRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
                ) : remoteScreenUid ? (
                  /* Priority 3: REMOTE screen share (someone else sharing) */
                  (() => {
                    const sharingUser = remoteUsers.find(u => Number(u.uid) === remoteScreenUid);
                    return sharingUser ? (
                      <div className="absolute inset-0">
                        <RemoteUser user={sharingUser} playVideo playAudio style={{ width: '100%', height: '100%' }} />
                      </div>
                    ) : null;
                  })()
                ) : iAmTutor && videoOn && localCameraTrack ? (
                  /* Priority 4: TUTOR's own camera (they see themselves in stage) */
                  <div className="absolute inset-0">
                    <LocalVideoTrack track={localCameraTrack} play style={{ width: '100%', height: '100%' }} />
                  </div>
                ) : !iAmTutor && teacherUser && teacherUser !== 'local' ? (
                  /* Priority 4 (student view): Show REMOTE tutor's camera in the stage */
                  <div className="absolute inset-0">
                    <RemoteUser user={teacherUser as any} playVideo playAudio style={{ width: '100%', height: '100%' }} />
                  </div>
                ) : (
                  /* Fallback: idle state */
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0B0C10] to-[#132E1B]">
                    <div className="w-28 h-28 rounded-full bg-muted border border-border flex items-center justify-center mb-6 group-hover/stage:scale-110 transition-transform duration-500">
                      <Presentation className="w-14 h-14 text-foreground/" />
                    </div>
                    <p className="text-foreground/ font-bold tracking-widest uppercase text-xs mb-2">
                      {iAmTutor ? 'You are Live' : 'Waiting for Tutor'}
                    </p>
                    <p className="text-foreground/ text-[10px] tracking-wide max-w-xs text-center">
                      {iAmTutor
                        ? 'Turn on your camera or share your screen to begin'
                        : 'The tutor will appear here when they turn on their camera'}
                    </p>
                    {iAmTutor && (
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setVideo(true)}
                          className="px-5 py-2.5 bg-gold/20 hover:bg-gold/30 border border-gold/30 rounded-full text-gold text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <VideoIcon className="w-4 h-4" />
                          Camera
                        </button>
                        <button
                          onClick={startScreenShare}
                          className="px-5 py-2.5 bg-muted hover:bg-muted border border-border rounded-full text-foreground/ text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <Monitor className="w-4 h-4" />
                          Present
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Stage Overlays */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-md rounded-full border border-border">
                    <div className="w-2 h-2 rounded-full bg-burgundy animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Live</span>
                  </div>
                  {isScreenSharing && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gold/20 backdrop-blur-md rounded-full border border-gold/30">
                      <Monitor className="w-3 h-3 text-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Presenting</span>
                      {iAmTutor && (
                        <button
                          onClick={() => stopScreenShare()}
                          className="ml-2 text-foreground/ hover:text-foreground transition-colors"
                        >
                          <MonitorOff className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Hand Raise Notifications (Tutor only) */}
                {iAmTutor && raisedHands.length > 0 && (
                  <div className="absolute top-6 right-6 flex flex-col gap-2">
                    {raisedHands.map(h => (
                      <div key={h.uid} className="flex items-center gap-2 px-4 py-2 bg-gold/20 backdrop-blur-md rounded-full border border-gold/30 animate-pulse">
                        <Hand className="w-3 h-3 text-gold" />
                        <span className="text-[10px] font-bold text-gold/80">{h.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="absolute top-6 right-6">
                  <button className="inline-flex items-center justify-center rounded-full bg-background/60 backdrop-blur-md hover:bg-background/80 w-10 h-10 border border-border transition-all hover:scale-105 active:scale-95" onClick={toggleFullscreen}>
                     <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-foreground/">
                        <path d="M15 3H21V9M9 21H3V15M21 3L14 10M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                  </button>
                </div>

                {/* Right Edge: Vertical Volume Slider */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 bg-background/60 backdrop-blur-md px-2.5 py-5 rounded-full border border-border z-20">
                  <div className="h-24 w-1 bg-muted rounded-full relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gold rounded-full shadow-[0_0_8px_rgba(167,201,87,0.5)]" />
                  </div>
                  <Volume2 className="w-4 h-4 text-foreground/ animate-pulse" />
                </div>

                {/* MAIN CONTROLS */}
                <div className={cn(
                    "absolute left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 bg-background/60 backdrop-blur-xl rounded-[2rem] border border-border shadow-2xl transition-all duration-500 z-20 group/controls",
                    (showWhiteboard || isScreenSharing || remoteScreenUid) 
                        ? "bottom-4 scale-75 opacity-40 hover:opacity-100 hover:scale-100 hover:bottom-6" 
                        : "bottom-10 scale-100 opacity-100 hover:scale-105"
                )}>
                    <ControlButton
                      active={micOn}
                      isError={!!micError}
                      isWarning={micPermissionRevoked}
                      icon={micOn ? Mic : MicOff}
                      onClick={() => setMic(!micOn)}
                    />
                    <ControlButton
                      active={videoOn}
                      isError={!!camError}
                      isWarning={camPermissionRevoked}
                      icon={videoOn ? VideoIcon : VideoOff}
                      onClick={() => setVideo(!videoOn)}
                    />
                    <ControlButton
                      active={isScreenSharing}
                      isWarning={screenPermissionRevoked}
                      icon={isScreenSharing ? MonitorOff : Monitor}
                      onClick={isScreenSharing ? () => stopScreenShare() : startScreenShare}
                    />
                    <ControlButton
                      active={showWhiteboard}
                      icon={Presentation}
                      onClick={() => setShowWhiteboard(!showWhiteboard)}
                    />
                    <ControlButton
                      active={handRaised}
                      icon={Hand}
                      onClick={toggleHandRaise}
                    />
                    {iAmTutor && (
                      <>
                        <ControlButton
                          active={isVoiceOnly}
                          icon={Headphones}
                          onClick={() => setIsVoiceOnly(!isVoiceOnly)}
                        />
                        <Button
                          variant={isAgentActive ? "default" : "ghost"}
                          className={cn(
                            "w-14 h-14 rounded-full transition-all border border-border backdrop-blur-md",
                            isAgentActive ? "bg-gold text-[#0B0C10] hover:bg-gold/90" : "bg-background/20 text-foreground/ hover:bg-muted hover:text-foreground"
                          )}
                          onClick={isAgentActive ? stopAgent : startAgent}
                          disabled={isAiStarting}
                        >
                          {isAiStarting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="destructive"
                      className="w-14 h-14 rounded-full bg-burgundy/80 hover:bg-burgundy transition-all flex items-center justify-center border border-border"
                      onClick={handleLeaveClick}
                    >
                      <LogOut className="w-6 h-6" />
                    </Button>
                </div>

                {/* Programmatic Finalize Dialog — opened by handleLeaveClick for tutors */}
                <AlertDialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
                  <AlertDialogContent className="bg-background border-border text-foreground rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-bold">Ready to wrap up?</AlertDialogTitle>
                      <AlertDialogDescription className="text-foreground/">
                        This will end the class for everyone and publish all uploaded documents and notes as resources for students.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                      <AlertDialogCancel className="bg-muted border-border rounded-xl hover:bg-muted hover:text-foreground">Stay Live</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleFinalize}
                        disabled={isEnding}
                        className="bg-burgundy hover:bg-burgundy rounded-xl font-bold px-8"
                      >
                        {isEnding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        End & Export Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* PARTICIPANT GRID — ALL users including tutor */}
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                 {/* Local user (always visible) */}
                 <div className="w-44 shrink-0 aspect-[4/3] rounded-3xl overflow-hidden border border-border bg-muted relative group cursor-pointer">
                   {videoOn && localCameraTrack ? (
                     <div className="absolute inset-0 transition-transform group-hover:scale-110">
                       <LocalVideoTrack
                         track={localCameraTrack}
                         play
                         style={{ width: '100%', height: '100%' }}
                       />
                     </div>
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/30">
                       <Avatar className="w-16 h-16 border-2 border-border mb-2">
                         <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || userName}`} />
                         <AvatarFallback className="text-lg">{(profile?.full_name || userName)[0]}</AvatarFallback>
                       </Avatar>
                       <span className="text-[9px] text-foreground/ uppercase tracking-widest">Camera off</span>
                     </div>
                   )}
                   <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-background/60 backdrop-blur-md rounded-lg border border-border">
                     <div className={cn("w-1.5 h-1.5 rounded-full", micOn ? "bg-gold" : "bg-muted")} />
                     <span className="text-[10px] font-medium tracking-tight">{profile?.full_name || userName}</span>
                   </div>
                   {iAmTutor && (
                     <div className="absolute top-2 right-2 px-2 py-0.5 bg-gold/20 rounded-full border border-gold/30">
                       <span className="text-[8px] font-bold text-gold uppercase tracking-widest">Host</span>
                     </div>
                   )}
                 </div>

                 {/* All Remote Participants */}
                 {remoteUsers.map(user => {
                   const info = participantMap[Number(user.uid)];
                   const isUserTutor = info?.role === 'tutor' ||
                     (Number(user.uid) >= 1000 && Number(user.uid) <= 2000);
                   const displayName = info?.name || `User ${user.uid}`;
                   const hasHandRaised = !!raisedHands.find(h => h.uid === Number(user.uid));
                   return (
                    <div key={user.uid} className="w-44 shrink-0 aspect-[4/3] rounded-3xl overflow-hidden border border-border bg-muted relative group cursor-pointer">
                      <div className="absolute inset-0 transition-transform group-hover:scale-110">
                        <RemoteUser user={user} playVideo playAudio style={{ width: '100%', height: '100%' }} />
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-background/60 backdrop-blur-md rounded-lg border border-border">
                        <div className={cn("w-1.5 h-1.5 rounded-full", user.hasAudio ? 'bg-gold animate-pulse' : 'bg-muted')} />
                        <span className="text-[10px] font-medium tracking-tight">{displayName}</span>
                      </div>
                      {isUserTutor && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-gold/20 rounded-full border border-gold/30">
                          <span className="text-[8px] font-bold text-gold uppercase tracking-widest">Host</span>
                        </div>
                      )}
                      {hasHandRaised && (
                        <div className="absolute top-2 right-2 w-7 h-7 bg-gold/30 rounded-full flex items-center justify-center border border-gold/40 animate-bounce">
                          <Hand className="w-3.5 h-3.5 text-gold" />
                        </div>
                      )}
                    </div>
                   );
                 })}
              </div>

              {/* CLASSROOM INSIGHTS & KPIs */}
              <div className="flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground/">Classroom KPIs</h2>
                    <Button variant="link" className="text-gold text-sm font-medium p-0 h-auto">Goal Progress</Button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InsightCard 
                      title="Assignment Submissions" 
                      time="Due today" 
                      tasks="12 Pending" 
                      accomplished="28/40" 
                      progress={70}
                      icon={FileText}
                    />
                    <InsightCard 
                      title="Course Objectives" 
                      time="Current Module" 
                      tasks="3 Remaining" 
                      accomplished="7/10" 
                      progress={70}
                      icon={Sparkles}
                    />
                  </div>
               </div>
            </div>

            {/* RIGHT COLUMN: Chat/Tabs — full-height, at the far right */}
            <div className="w-full lg:w-[420px] flex flex-col gap-6 self-stretch">
               <div className="flex flex-col flex-1 min-h-[500px] bg-[#07140D] rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden group/chat">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#800000] to-[#D4AF37] opacity-0 group-hover/chat:opacity-100 transition-opacity" />
                  
                  <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1 min-h-0">
                  <div className="px-8 pt-8 pb-4 border-b border-border">
                    <TabsList className="bg-muted border-border rounded-xl w-full p-1 h-12">
                      <TabsTrigger value="chat" className="flex-1 rounded-lg text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-gold data-[state=active]:text-[#0B0C10]">Chat</TabsTrigger>
                      <TabsTrigger value="notes" className="flex-1 rounded-lg text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-gold data-[state=active]:text-[#0B0C10]">Notes</TabsTrigger>
                      <TabsTrigger value="docs" className="flex-1 rounded-lg text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-gold data-[state=active]:text-[#0B0C10]">Submit</TabsTrigger>
                      <TabsTrigger value="assignments" className="flex-1 rounded-lg text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-gold data-[state=active]:text-[#0B0C10]">Tasks</TabsTrigger>
                      <TabsTrigger value="whiteboard" className="flex-1 rounded-lg text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-gold data-[state=active]:text-[#0B0C10]">Board</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="chat" className="flex-1 data-[state=active]:!flex flex-col min-h-0 m-0 relative">
                    <div 
                      ref={chatScrollRef}
                      className="h-[70%] overflow-y-auto px-8 pt-4 pb-[70px] flex flex-col gap-4 custom-scrollbar"
                    >
                      {combinedMessages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-20 h-full min-h-[200px]">
                          <Sparkles className="w-12 h-12 mb-4" />
                          <p className="text-sm font-medium">No messages yet. Be the first to say hi!</p>
                        </div>
                      ) : (
                        combinedMessages.map((msg) => (
                          <ChatMessage 
                            key={msg.id}
                            user={msg.profiles?.full_name || 'Unknown'} 
                            time={new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                            msg={msg.content} 
                            isMe={msg.sender_id === profile?.id}
                            avatar={msg.profiles?.avatar_url}
                          />
                        ))
                      )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-10 bg-gradient-to-t from-[#07140D] from-70% to-transparent pointer-events-none">
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (msgInput.trim() && profile?.id) {
                              sendMessage(msgInput, profile.id, { 
                                full_name: profile.full_name, 
                                avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`
                              });
                              sendAgoraChat(msgInput);
                              setMsgInput('');
                            }
                          }}
                          className="relative pointer-events-auto"
                        >
                          <Input 
                            value={msgInput}
                            onChange={(e) => setMsgInput(e.target.value)}
                            placeholder="Type your message..." 
                            className="bg-muted border-none rounded-2xl py-7 pl-6 pr-14 text-sm focus-visible:ring-1 focus-visible:ring-white/20 transition-all placeholder:text-foreground/"
                          />
                          <Button 
                            type="submit"
                            size="icon" 
                            disabled={!msgInput.trim()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-gold hover:bg-[#800000] rounded-xl w-10 h-10 transition-transform active:scale-95 disabled:opacity-50"
                          >
                              <Send className="w-4 h-4 text-[#0B0C10]" />
                          </Button>
                        </form>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="flex-1 data-[state=active]:!flex flex-col min-h-0 m-0 p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/">Collaborative Notes</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                        <span className="text-[10px] text-foreground/">Syncing...</span>
                      </div>
                    </div>
                    <Textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Start capturing key insights from the session..."
                      className="flex-1 bg-muted border-border rounded-2xl p-6 text-sm focus-visible:ring-1 focus-visible:ring-[#D4AF37]/20 transition-all placeholder:text-foreground/ resize-none leading-relaxed"
                    />
                    <p className="text-[10px] text-foreground/ mt-4 leading-relaxed italic">
                      * These notes will be automatically exported to the Resource Library when the class ends.
                    </p>
                  </TabsContent>

                  <TabsContent value="docs" className="flex-1 data-[state=active]:!flex flex-col min-h-0 m-0 p-8">
                     <div className="flex flex-col gap-6">
                        <div className="bg-muted border border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center gap-4 group/upload cursor-pointer hover:bg-white/[0.07] transition-all relative overflow-hidden">
                           <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center group-hover/upload:scale-110 transition-transform duration-500">
                             <Upload className="w-7 h-7 text-gold" />
                           </div>
                           <div className="text-center">
                              <p className="text-sm font-bold text-foreground/">{iAmTutor ? 'Upload Class Resource' : 'Submit Document'}</p>
                              <p className="text-[10px] text-foreground/ uppercase tracking-widest mt-1">PDF, DOCX, PPT (Max 10MB)</p>
                           </div>
                           <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploading(true);
                              
                              const fileExt = file.name.split('.').pop() || 'pdf';
                              const fileName = `${Math.random()}.${fileExt}`;
                              const filePath = `${channelName}/${fileName}`;
                              
                              const { error: uploadError } = await supabase.storage.from('class_resources').upload(filePath, file);
                              
                              if (!uploadError) {
                                const { data: { publicUrl } } = supabase.storage.from('class_resources').getPublicUrl(filePath);
                                
                                setUploadedResources(prev => [...prev, {
                                  title: file.name,
                                  format: fileExt.toLowerCase(),
                                  file_url: publicUrl,
                                  size_mb: (file.size / 1024 / 1024).toFixed(1)
                                }]);
                                setClassResources(prev => [...prev, { name: file.name, type: fileExt.toLowerCase(), size: (file.size / 1024 / 1024).toFixed(1) + 'MB' }]);
                              } else {
                                console.error('Upload Error', uploadError);
                              }
                              
                              setIsUploading(false);
                            }}
                           />
                        </div>

                        {isUploading && (
                          <div className="space-y-2">
                             <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-foreground/">
                                <span>Uploading document...</span>
                                <span>{uploadProgress}%</span>
                             </div>
                             <Progress value={uploadProgress} className="h-1 bg-muted" indicatorClassName="bg-gold" />
                          </div>
                        )}

                        <div className="flex flex-col gap-3">
                           <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/ mb-1">Session Documents</h4>
                           {classResources.length === 0 ? (
                             <p className="text-xs text-foreground/ italic">No documents shared in this session yet.</p>
                           ) : (
                             classResources.map((res, i) => (
                               <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border hover:border-border transition-all">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-foreground/" />
                                     </div>
                                     <div>
                                        <p className="text-xs font-bold text-foreground/ truncate max-w-[120px]">{res.name}</p>
                                        <p className="text-[10px] text-foreground/">{res.size} · {res.type.toUpperCase()}</p>
                                     </div>
                                  </div>
                                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-muted">
                                     <ArrowUpRight className="w-4 h-4 text-gold" />
                                  </Button>
                               </div>
                             ))
                           )}
                        </div>
                     </div>
                  </TabsContent>

                  <TabsContent value="assignments" className="flex-1 data-[state=active]:!flex flex-col min-h-0 m-0 p-8">
                     <div className="flex flex-col gap-6">
                        <div className="p-6 bg-gradient-to-br from-[#1A1A1A] to-[#0B0C10] rounded-3xl border border-gold/10 relative overflow-hidden">
                           <div className="absolute -top-6 -right-6 w-24 h-24 bg-gold/10 rounded-full blur-2xl" />
                           <h3 className="text-lg font-bold mb-2">Assignment Portal</h3>
                           <p className="text-xs text-foreground/ leading-relaxed">Students can submit their tasks here during the live session for immediate feedback.</p>
                        </div>

                        {!iAmTutor ? (
                          <div className="bg-muted border border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center gap-4 group/assign cursor-pointer hover:bg-gold/5 transition-all relative overflow-hidden">
                            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center group-hover/assign:scale-110 transition-transform duration-500">
                              <Sparkles className="w-7 h-7 text-gold" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-foreground/">Submit Your Assignment</p>
                                <p className="text-[10px] text-foreground/ uppercase tracking-widest mt-1">Upload work to teacher</p>
                            </div>
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={async (e) => {
                                alert("Assignment submitted successfully to your tutor!");
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/">Awaiting Submission</h4>
                             <div className="flex flex-col items-center justify-center py-12 opacity-20">
                                <Users className="w-12 h-12 mb-4" />
                                <p className="text-xs font-medium">No student submissions yet</p>
                             </div>
                          </div>
                        )}
                     </div>
                  </TabsContent>

                  <TabsContent value="whiteboard" className="flex-1 data-[state=active]:!flex flex-col min-h-0 m-0 p-8">
                     <div className="flex flex-col gap-6 h-full justify-between">
                        <div className="space-y-6">
                           <div className="p-6 bg-gradient-to-br from-[#1A1A1A] to-[#0B0C10] rounded-3xl border border-gold/10 relative overflow-hidden">
                              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gold/10 rounded-full blur-2xl" />
                              <h3 className="text-lg font-bold mb-2">Whiteboard Stage</h3>
                              <p className="text-xs text-foreground/ leading-relaxed">
                                 The interactive board has been relocated to the widescreen **Main Presentation Stage** for maximum drawing space and utility.
                              </p>
                           </div>

                           <div className="space-y-4">
                              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/">Board Status & Controls</h4>
                              
                              <div className="p-5 bg-muted rounded-2xl border border-border flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className={cn(
                                       "w-3 h-3 rounded-full animate-pulse",
                                       showWhiteboard ? "bg-gold shadow-[0_0_8px_rgba(167,201,87,0.5)]" : "bg-muted"
                                    )} />
                                    <div>
                                       <p className="text-xs font-bold text-foreground/">Interactive Stage Mode</p>
                                       <p className="text-[10px] text-foreground/ uppercase tracking-widest mt-0.5">
                                          {showWhiteboard ? "Active on Main Screen" : "Currently Hidden"}
                                       </p>
                                    </div>
                                 </div>
                                 <Button
                                    onClick={() => setShowWhiteboard(!showWhiteboard)}
                                    className={cn(
                                       "rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all",
                                       showWhiteboard 
                                          ? "bg-muted hover:bg-muted text-foreground" 
                                          : "bg-gold hover:bg-[#800000] text-[#0B0C10]"
                                    )}
                                 >
                                    {showWhiteboard ? "Hide Board" : "Show Board"}
                                 </Button>
                              </div>

                              <div className="p-5 bg-muted rounded-2xl border border-border space-y-3.5">
                                 <h5 className="text-[10px] font-bold uppercase tracking-wider text-gold">Board Guide & Features</h5>
                                 <ul className="text-xs space-y-2.5 text-foreground/">
                                    <li className="flex items-start gap-2">
                                       <span className="text-gold font-bold">•</span>
                                       <span>**Tutor Privileges**: Only the tutor can draw or clear the board, ensuring structured classes.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                       <span className="text-gold font-bold">•</span>
                                       <span>**Smooth Fallback**: Automatically switches to local canvas if cloud sync is unavailable.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                       <span className="text-gold font-bold">•</span>
                                       <span>**Drawing Toolbar**: Located at the bottom of the main stage screen when the whiteboard is active.</span>
                                    </li>
                                 </ul>
                              </div>
                           </div>
                        </div>

                        <p className="text-[10px] text-foreground/ leading-relaxed italic">
                           * All participants see drawing updates in near-zero latency.
                        </p>
                     </div>
                  </TabsContent>
                 </Tabs>
              </div>

              {/* Upgrade Banner — right column, below Chat */}
              <div className="bg-[#07140D] p-6 rounded-[2.5rem] border border-border relative overflow-hidden flex items-center justify-between group/upgrade shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover/upgrade:bg-gold/10 transition-colors" />
                  <div className="flex flex-col gap-2 z-10">
                     <h3 className="text-xl font-bold font-serif text-foreground/">
                       Upgrade <span className="font-serif italic text-gold">to Pro</span>
                     </h3>
                     <p className="text-[11px] text-foreground/ max-w-[180px] leading-relaxed">
                       Unlock the full potential of AI Assistant!
                     </p>
                     <Button className="mt-2 bg-[#D9ED92] hover:bg-[#E8C85E] text-[#0B0C10] font-semibold rounded-full px-5 py-1.5 text-xs transition-all w-fit shadow-md shadow-[#D9ED92]/15">
                       Explore Pro Plan
                     </Button>
                  </div>
                  <div className="relative w-24 h-24 flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse [animation-duration:3000ms]">
                    <svg viewBox="0 0 100 100" className="w-20 h-20">
                      <defs>
                        <radialGradient id="coinRadial" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                          <stop offset="0%" stopColor="#ffb3c1" />
                          <stop offset="40%" stopColor="#ff758f" />
                          <stop offset="85%" stopColor="#c9184a" />
                          <stop offset="100%" stopColor="#590d22" />
                        </radialGradient>
                      </defs>
                      <circle cx="50" cy="50" r="42" fill="url(#coinRadial)" stroke="#ffb3c1" strokeWidth="2" />
                      <circle cx="50" cy="50" r="36" fill="none" stroke="#ff85a1" strokeWidth="1" strokeDasharray="3 2" />
                      <path
                        d="M12 4.419C12.448 3.852 14.105 2.25 16.223 2.012C18.665 1.739 20.252 3.421 21 4.58C21.748 3.421 23.335 1.739 25.777 2.012C27.895 2.25 29.552 3.852 30 4.419C30.985 5.67 31.066 9.479 28.536 12.569C26.177 15.451 21.666 19.333 21 20C20.334 19.333 15.823 15.451 13.464 12.569C10.934 9.479 11.015 5.67 12 4.419Z"
                        fill="#ff0f47"
                        stroke="#ffb3c1"
                        strokeWidth="1"
                        transform="translate(29, 28) scale(2.0)"
                      />
                    </svg>
                  </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function LobbyScreen(props: {
  userName: string;
  channelName: string;
  micOn: boolean;
  videoOn: boolean;
  micError: any;
  camError: any;
  micPermissionRevoked?: boolean;
  camPermissionRevoked?: boolean;
  localCameraTrack: any;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onJoin: () => void;
  onLeave?: () => void;
  isLoading?: boolean;
  recovering?: boolean;
  error?: string | null;
  profile?: UserProfile | null;
  classBanner?: string;
  classTitle?: string;
}) {
  const {
    userName,
    channelName,
    micOn,
    videoOn,
    micError,
    camError,
    micPermissionRevoked = false,
    camPermissionRevoked = false,
    localCameraTrack,
    onToggleMic,
    onToggleVideo,
    onJoin,
    onLeave,
    isLoading,
    recovering,
    error,
    profile,
    classBanner,
    classTitle,
  } = props;
  return (
    <div className="flex h-screen bg-background text-foreground items-center justify-center relative overflow-hidden">
      {/* Join button at Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={onJoin}
          disabled={isLoading || recovering}
          className={cn(
            "px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#800000] hover:from-[#E8C85E] hover:to-[#D4AF37] text-[#0B0C10] font-bold rounded-2xl text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-3",
            (isLoading || recovering) && "opacity-50 cursor-not-allowed scale-100"
          )}
        >
          {(isLoading || recovering) && <div className="w-5 h-5 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />}
          {recovering ? 'Recovering...' : isLoading ? 'Joining...' : 'Join Class'}
        </button>
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#800000]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl mx-auto px-6 flex flex-col items-center z-10">
        {/* Class Banner / Logo Area */}
        <div className="w-full aspect-video rounded-[2rem] overflow-hidden mb-8 relative border border-border shadow-2xl group">
          {classBanner ? (
            <>
              <Image src={classBanner} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" alt="Class Banner" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#800000] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                   <Sparkles className="w-5 h-5 text-[#0B0C10]" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Live Class</span>
                    <h2 className="text-lg font-bold text-foreground leading-none">{classTitle || 'Class Session'}</h2>
                 </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#07120C] via-[#0a1a12] to-[#132E1B] flex flex-col items-center justify-center gap-6 relative overflow-hidden">
               {/* Background futuristic accents */}
               <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
               <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gold/5 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[10000ms]" />
               <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[#800000]/10 rounded-full blur-[100px] pointer-events-none" />
               
               <div className="relative w-20 h-20 rounded-3xl bg-background/40 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-transform group-hover:scale-110 duration-500 group-hover:shadow-[0_0_50px_rgba(212,175,55,0.3)]">
                 <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-[#800000] opacity-20 rounded-3xl" />
                 <Sparkles className="w-10 h-10 text-gold z-10" />
               </div>
               
               <div className="flex flex-col items-center z-10">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-2 drop-shadow-md">Dr Max Online School</p>
                  {classTitle ? (
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60 text-center px-6 leading-tight drop-shadow-xl">{classTitle}</h2>
                  ) : (
                    <h2 className="text-2xl font-bold text-foreground text-center drop-shadow-xl">Live Session</h2>
                  )}
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent mt-4 rounded-full" />
               </div>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-1 text-center">Ready to join?</h1>
        <p className="text-foreground/ text-sm mb-8 text-center">
          <span className="text-gold font-semibold">{profile?.id || channelName}</span> · Hello, {profile?.full_name || userName} {profile?.role && <span className="opacity-50 text-[10px] ml-1 uppercase tracking-tighter">({profile.role})</span>}
        </p>

        {/* Camera preview */}
        <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden bg-background/40 border border-border mb-6 shadow-2xl">
          {videoOn && localCameraTrack ? (
            <div className="absolute inset-0">
              <LocalVideoTrack
                track={localCameraTrack}
                play
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center mb-3">
                <VideoOff className="w-8 h-8 text-foreground/" />
              </div>
              <p className="text-foreground/ text-sm">
                {camPermissionRevoked ? 'Camera permission revoked' : camError ? 'Camera access denied' : 'Camera is off'}
              </p>
              {camPermissionRevoked && (
                <p className="text-gold/60 text-xs mt-1">Please allow camera access in your browser address bar</p>
              )}
              {!camPermissionRevoked && camError && (
                <p className="text-burgundy/80/60 text-xs mt-1">Check your browser permissions</p>
              )}
            </div>
          )}

          {/* Name badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-background/60 backdrop-blur-md rounded-full border border-border">
            <div className={cn('w-2 h-2 rounded-full', micOn ? 'bg-gold animate-pulse' : 'bg-muted')} />
            <span className="text-xs font-medium">{profile?.full_name || userName}</span>
          </div>

          {/* Error & Recovery badges */}
          {(micError || camError || error) && (
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              {micPermissionRevoked && (
                <div className="px-3 py-1.5 bg-gold/20 border border-gold/30 backdrop-blur-md rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-500/5">
                  <AlertTriangle className="w-3.5 h-3.5 text-gold animate-pulse" />
                  <span className="text-[10px] text-gold/80 font-bold uppercase tracking-wider">Mic Revoked</span>
                </div>
              )}
              {camPermissionRevoked && (
                <div className="px-3 py-1.5 bg-gold/20 border border-gold/30 backdrop-blur-md rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-500/5">
                  <AlertTriangle className="w-3.5 h-3.5 text-gold animate-pulse" />
                  <span className="text-[10px] text-gold/80 font-bold uppercase tracking-wider">Cam Revoked</span>
                </div>
              )}
              {!micPermissionRevoked && micError && (
                <div className="px-3 py-1.5 bg-burgundy/20 border border-burgundy/30 backdrop-blur-md rounded-full flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-burgundy/80" />
                  <span className="text-[10px] text-burgundy/80 font-medium uppercase tracking-wide">Mic Error</span>
                </div>
              )}
              {!camPermissionRevoked && camError && (
                <div className="px-3 py-1.5 bg-burgundy/20 border border-burgundy/30 backdrop-blur-md rounded-full flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-burgundy/80" />
                  <span className="text-[10px] text-burgundy/80 font-medium uppercase tracking-wide">Cam Error</span>
                </div>
              )}
              {error && (
                <div className="px-3 py-1.5 bg-burgundy/20 border border-burgundy/30 backdrop-blur-md rounded-full">
                  <span className="text-[10px] text-burgundy/80 font-medium uppercase tracking-wide">{error}</span>
                </div>
              )}
            </div>
          )}

          {recovering && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gold font-bold text-lg animate-pulse">Recovering Connection...</p>
              <p className="text-foreground/ text-xs mt-2">Resolving UID conflict, please wait</p>
            </div>
          )}
        </div>

        {/* Mic + Camera toggles */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onToggleMic}
            className={cn(
              'flex flex-col items-center gap-2 w-24 py-4 rounded-2xl border transition-all',
              micOn
                ? 'bg-gold/10 border-gold/30 text-gold'
                : 'bg-muted border-border text-foreground/ hover:text-foreground/ hover:bg-muted',
              micPermissionRevoked && 'border-gold/30 text-gold bg-gold/5',
              !micPermissionRevoked && micError && 'border-burgundy/30 text-burgundy/80'
            )}
          >
            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            <span className="text-[10px] uppercase tracking-widest font-semibold text-center leading-tight">
              {micPermissionRevoked ? 'Revoked' : micError ? 'Error' : micOn ? 'Mic On' : 'Mic Off'}
            </span>
          </button>

          <button
            onClick={onToggleVideo}
            className={cn(
              'flex flex-col items-center gap-2 w-24 py-4 rounded-2xl border transition-all',
              videoOn
                ? 'bg-gold/10 border-gold/30 text-gold'
                : 'bg-muted border-border text-foreground/ hover:text-foreground/ hover:bg-muted',
              camPermissionRevoked && 'border-gold/30 text-gold bg-gold/5',
              !camPermissionRevoked && camError && 'border-burgundy/30 text-burgundy/80'
            )}
          >
            {videoOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            <span className="text-[10px] uppercase tracking-widest font-semibold text-center leading-tight">
              {camPermissionRevoked ? 'Revoked' : camError ? 'Error' : videoOn ? 'Cam On' : 'Cam Off'}
            </span>
          </button>
        </div>

        {/* Join button moved to top right */}

        {/* Leave link */}
        {onLeave && (
          <button
            onClick={onLeave}
            className="text-foreground/ hover:text-foreground/ text-sm transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Leave
          </button>
        )}
      </div>
    </div>
  );
}

function SidebarIcon({ icon: Icon, active = false }: { icon: any, active?: boolean }) {
  return (
    <div className={cn(
      "w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer group",
      active ? "bg-white text-[#0B0C10] shadow-lg shadow-white/5" : "text-foreground/ hover:text-foreground/ hover:bg-muted"
    )}>
      <Icon className={cn("w-6 h-6", !active && "group-hover:scale-110 transition-transform")} />
    </div>
  );
}

function ControlButton({ 
  icon: Icon, 
  active = false, 
  isError = false,
  isWarning = false,
  onClick 
}: { 
  icon: any, 
  active?: boolean, 
  isError?: boolean,
  isWarning?: boolean,
  onClick?: () => void 
}) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={onClick}
      className={cn(
        "w-14 h-14 rounded-full transition-all border border-border backdrop-blur-md relative",
        active ? "bg-muted text-foreground" : "bg-background/20 text-foreground/ hover:bg-muted hover:text-foreground",
        isWarning && "border-gold/50 text-gold hover:text-gold hover:border-gold/80 bg-gold/10",
        isError && "border-burgundy/50 text-burgundy hover:text-burgundy/80"
      )}
    >
      <Icon className="w-6 h-6" />
      {isWarning && (
        <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-obsidian border border-obsidian animate-bounce">
          !
        </span>
      )}
    </Button>
  );
}

function MockParticipant({ name, img, status }: { name: string, img: string, status: 'muted' | 'active' | 'talking' }) {
  return (
    <div className="w-44 shrink-0 aspect-[4/3] rounded-[2rem] overflow-hidden border border-border bg-muted relative group cursor-pointer transition-all hover:border-gold/30">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=p${img}`} className="w-full h-full object-cover transition-transform group-hover:scale-110 opacity-60" alt={name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {status === 'talking' && (
           <div className="absolute top-3 right-3 w-6 h-6 bg-gold rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <Mic className="w-3.5 h-3.5 text-[#0B0C10]" />
           </div>
        )}

        <div className="absolute bottom-4 left-4 flex items-center gap-3">
           <Avatar className="w-8 h-8 border border-border">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=p${img}`} />
           </Avatar>
           <span className="text-xs font-bold tracking-tight text-foreground/">{name}</span>
        </div>
    </div>
  );
}

function InsightCard({ title, time, tasks, accomplished, progress, icon: Icon }: any) {
  return (
    <div className="bg-muted p-6 rounded-3xl border border-border hover:bg-white/[0.07] transition-all group cursor-pointer">
       <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center group-hover:bg-gold group-hover:text-[#0B0C10] transition-colors">
             <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
             <h4 className="font-bold text-foreground/ mb-1">{title}</h4>
             <div className="flex items-center gap-4 text-xs text-foreground/">
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {time}</span>
             </div>
          </div>
          <div className="flex-1 hidden md:block">
              <p className="text-[10px] uppercase tracking-widest text-foreground/ mb-2">Follow-Up Tasks <span className="text-foreground/ ml-2">{tasks}</span></p>
              <div className="flex items-center gap-4">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/">Accomplished <span className="text-foreground/ ml-2">{accomplished}</span></p>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#D9ED92]" style={{ width: `${progress}%` }} />
                  </div>
              </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
             <MoreVertical className="w-5 h-5 text-foreground/" />
          </Button>
       </div>
    </div>
  );
}

function ChatMessage({ user, time, msg, avatar, isMe = false, isAI = false }: any) {
  return (
    <div className={cn("flex flex-col gap-2", isMe && "items-end")}>
       <div className={cn("flex items-center gap-3", isMe && "flex-row-reverse")}>
          <Avatar className="w-8 h-8 border border-border">
             <AvatarImage src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`} />
             <AvatarFallback>{user[0]}</AvatarFallback>
          </Avatar>
          <div className={cn("flex items-center gap-2", isMe && "flex-row-reverse")}>
             <span className={cn("text-xs font-bold", isMe ? "text-foreground/" : "text-gold")}>{user}</span>
             <span className="text-[10px] text-foreground/">{time}</span>
          </div>
       </div>
       <div className={cn(
         "px-5 py-3 rounded-2xl text-sm max-w-[85%] leading-relaxed shadow-sm flex items-center gap-2",
         isMe ? "bg-[#0B1E14] border border-border text-foreground/ rounded-tr-none" : 
         isAI ? "bg-[#132E1F]/80 border border-gold/20 text-gold rounded-tl-none italic font-medium" : 
         "bg-[#132E1F] border border-border text-foreground/ rounded-tl-none"
       )}>
          {isAI && <Sparkles className="w-3.5 h-3.5 shrink-0 text-gold" />}
          <span>{msg}</span>
       </div>
    </div>
  );
}




