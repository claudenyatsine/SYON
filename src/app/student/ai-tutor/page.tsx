'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUser } from '@/components/providers/user-context';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConvoAI } from '@/hooks/useConvoAI';
import {
  Bot,
  Sparkles,
  Mic,
  MicOff,
  Send,
  Loader2,
  Volume2,
  VolumeX,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  RotateCcw,
  Copy,
  Check,
  Flame,
  ArrowRight,
  GraduationCap,
  Lightbulb,
  FileQuestion,
  Calculator,
  Layers,
  ChevronRight,
  Radio,
  Sliders,
  Settings2,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}

interface EnrolledSubject {
  id: string;
  name: string;
  level?: string;
  category?: string;
}

const QUICK_PROMPTS = [
  {
    icon: Lightbulb,
    label: 'Explain Concept',
    prompt: 'Explain the core principles of this topic step-by-step with real-world examples.',
  },
  {
    icon: FileQuestion,
    label: 'Exam Practice Quiz',
    prompt: 'Generate 3 high-yield exam past paper questions with allocated marks and marking scheme hints.',
  },
  {
    icon: Calculator,
    label: 'Step-by-Step Solver',
    prompt: 'Help me solve this problem step-by-step using the Socratic method: ',
  },
  {
    icon: Layers,
    label: 'Key Summary & Flashcards',
    prompt: 'Summarize the top 5 must-remember formulas, definitions, and common examiner traps for this subject.',
  },
];

export default function StudentAITutorPage() {
  const { profile } = useUser();
  const supabase = createClient();
  const { toast } = useToast();

  const [enrolledSubjects, setEnrolledSubjects] = useState<EnrolledSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [studyMode, setStudyMode] = useState<'socratic' | 'exam_drill' | 'step_by_step' | 'concept_explainer'>('socratic');
  const [curriculumBoard, setCurriculumBoard] = useState<string>('ZIMSEC & Cambridge');
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Voice AI State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [voicePersonality, setVoicePersonality] = useState<'alloy' | 'nova' | 'echo' | 'fable'>('alloy');
  const [voiceTranscript, setVoiceTranscript] = useState<string[]>([]);
  
  // Agora Voice Channel ID
  const voiceChannelName = useMemo(() => {
    const studentUid = profile?.id ? profile.id.slice(0, 8) : 'demo';
    return `ai_tutor_session_${studentUid}`;
  }, [profile?.id]);

  const numericUid = useMemo(() => {
    return Math.floor(100000 + Math.random() * 900000);
  }, []);

  const { isAgentActive, isStarting: isAiStarting, startAgent, stopAgent } = useConvoAI(voiceChannelName, numericUid);

  // Fetch enrolled subjects
  useEffect(() => {
    async function fetchSubjects() {
      if (!profile?.id) return;
      try {
        const { data } = await supabase
          .from('enrollments')
          .select('subject_id, subjects(id, name, level, category)')
          .eq('student_id', profile.id)
          .eq('status', 'approved');

        if (data && data.length > 0) {
          const subs: EnrolledSubject[] = data
            .map((item: any) => item.subjects)
            .filter(Boolean);
          setEnrolledSubjects(subs);
          if (subs[0]) {
            setSelectedSubjectId(subs[0].id);
          }
        }
      } catch (err) {
        console.error('[AI Tutor] Error fetching subjects:', err);
      }
    }
    fetchSubjects();
  }, [profile?.id, supabase]);

  // Initial welcome message
  useEffect(() => {
    const studentName = profile?.full_name?.split(' ')[0] || 'there';
    setMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `👋 Hello **${studentName}**! I am your **Dr Max AI Study Tutor**.\n\nI am curriculum-trained to guide you step-by-step through **ZIMSEC** and **Cambridge (O-Level & A-Level)** concepts, past papers, and exam techniques.\n\nChoose a subject above, try a quick action prompt, or click **Voice AI** to practice speaking out loud! What would you like to master today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'Dr Max Socratic Engine',
      },
    ]);
  }, [profile?.full_name]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const selectedSubject = useMemo(() => {
    return enrolledSubjects.find((s) => s.id === selectedSubjectId);
  }, [enrolledSubjects, selectedSubjectId]);

  // Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage.trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai-tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: {
            studentName: profile?.full_name || 'Student',
            curriculumBoard,
            studentLevel: selectedSubject?.level || 'O-Level / A-Level',
            subjectName: selectedSubject?.name || 'General Studies',
            mode: studyMode,
          },
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I am thinking about your question...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: data.model || 'Dr Max Socratic Engine',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('[AI Tutor Chat Error]:', err);
      toast({
        variant: 'destructive',
        title: 'Could not connect',
        description: 'Failed to generate response. Please try again.',
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    toast({ title: 'Copied to clipboard! 📋' });
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleClearChat = () => {
    const studentName = profile?.full_name?.split(' ')[0] || 'there';
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        content: `Chat cleared! Ready for a fresh study session, **${studentName}**. What topic are we tackling next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleToggleVoiceAgent = async () => {
    if (isAgentActive) {
      await stopAgent();
      setIsVoiceActive(false);
    } else {
      setIsVoiceActive(true);
      await startAgent();
      setVoiceTranscript((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Connected to Dr Max Voice AI in room ${voiceChannelName}`,
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-[#132E1B] p-6 rounded-[2rem] border border-gold/30 text-foreground shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 text-gold border border-gold/30 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Curriculum AI Study Partner
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Dr Max AI Tutor
            <Badge variant="outline" className="text-xs border-gold text-gold font-normal">
              v2.0 Socratic
            </Badge>
          </h1>
          <p className="text-sm text-foreground/ max-w-xl">
            Real-time step-by-step guidance, past exam paper drills, and voice practice for ZIMSEC & Cambridge syllabi.
          </p>
        </div>

        {/* Global Selectors */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-foreground/ uppercase tracking-wider">Subject</span>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="w-[180px] bg-background/80 border-border text-foreground rounded-xl h-10">
                <SelectValue placeholder="Choose Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects / General</SelectItem>
                {enrolledSubjects.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-foreground/ uppercase tracking-wider">Teaching Mode</span>
            <Select value={studyMode} onValueChange={(v: any) => setStudyMode(v)}>
              <SelectTrigger className="w-[180px] bg-background/80 border-border text-foreground rounded-xl h-10">
                <SelectValue placeholder="Study Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="socratic">Socratic Guidance</SelectItem>
                <SelectItem value="exam_drill">Past Paper Exam Drill</SelectItem>
                <SelectItem value="step_by_step">Step-by-Step Solver</SelectItem>
                <SelectItem value="concept_explainer">Deep Concept Explainer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Workspace Tabs */}
      <Tabs defaultValue="chat" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted p-1 rounded-2xl border border-border">
            <TabsTrigger value="chat" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground font-semibold flex items-center gap-2">
              <Bot className="w-4 h-4 text-gold" />
              Interactive Chat
            </TabsTrigger>
            <TabsTrigger value="voice" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground font-semibold flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              Live Voice AI Room
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="rounded-full text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Chat
            </Button>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE CHAT WORKSPACE */}
        <TabsContent value="chat" className="space-y-4 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left 3 Cols: Chat Canvas */}
            <Card className="lg:col-span-3 border-border shadow-sm rounded-[2rem] flex flex-col h-[650px] overflow-hidden bg-card">
              {/* Header */}
              <div className="p-4 px-6 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      Dr Max AI Assistant
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Focused on: <span className="font-medium text-foreground">{selectedSubject?.name || 'All Subjects'}</span> • {studyMode.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>

                <Badge variant="secondary" className="rounded-full text-xs font-mono">
                  {curriculumBoard}
                </Badge>
              </div>

              {/* Message List */}
              <div ref={chatScrollRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex items-start gap-3 max-w-[88%]',
                      msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    )}
                  >
                    <Avatar className="w-8 h-8 shrink-0 border border-border">
                      {msg.role === 'user' ? (
                        <>
                          <AvatarImage src={profile?.avatar_url || ''} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                            {profile?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarFallback className="bg-gold/20 text-gold text-xs font-bold">
                            AI
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>

                    <div className="space-y-1">
                      <div
                        className={cn(
                          'p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap select-text shadow-sm',
                          msg.role === 'user'
                            ? 'bg-foreground text-background dark:bg-white dark:text-black rounded-tr-none font-medium'
                            : 'bg-muted/70 text-foreground border border-border rounded-tl-none'
                        )}
                      >
                        {msg.content}
                      </div>

                      <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
                        <span>{msg.timestamp}</span>
                        {msg.role === 'assistant' && (
                          <>
                            <span>•</span>
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
                            >
                              {copiedMessageId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-3 mr-auto">
                    <Avatar className="w-8 h-8 shrink-0 border border-border">
                      <AvatarFallback className="bg-gold/20 text-gold text-xs font-bold">AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-3.5 px-5 rounded-2xl rounded-tl-none border border-border flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gold animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input & Action Bar */}
              <div className="p-4 border-t border-border bg-card space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Ask a question or paste a problem about ${selectedSubject?.name || 'your curriculum'}...`}
                    className="flex-1 bg-muted/50 border-border rounded-xl h-12 text-sm focus-visible:ring-gold"
                  />
                  <Button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="h-12 px-6 rounded-xl bg-gold text-[#0B0C10] hover:bg-gold/90 font-bold gap-2"
                  >
                    {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Send</span>
                  </Button>
                </form>
              </div>
            </Card>

            {/* Right 1 Col: Quick Prompts & Topic Tools */}
            <div className="space-y-4">
              <Card className="border-border rounded-[2rem] shadow-sm bg-card p-5 space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <Sparkles className="w-4 h-4 text-gold" />
                  Quick Study Prompts
                </div>
                <p className="text-xs text-muted-foreground">
                  Click any prompt to instantly run an exam drill or step-by-step explainer:
                </p>

                <div className="space-y-2.5">
                  {QUICK_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="w-full text-left p-3 rounded-xl bg-muted/50 hover:bg-muted border border-border/60 hover:border-gold/40 transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 rounded-lg bg-background border border-border group-hover:border-gold/30 shrink-0">
                        <item.icon className="w-4 h-4 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground group-hover:text-gold transition-colors">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                          {item.prompt}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Study Hub Shortcut Card */}
              {selectedSubject && (
                <Card className="border-gold/30 bg-gradient-to-br from-gold/10 via-background to-background rounded-[2rem] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-gold text-gold text-[10px]">
                      Study Hub
                    </Badge>
                    <BookOpen className="w-4 h-4 text-gold" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{selectedSubject.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Access recorded whiteboard lectures, past paper archives, and tutor revision notes.
                  </p>
                  <Button variant="outline" size="sm" className="w-full rounded-xl border-gold/40 text-gold hover:bg-gold/10 gap-2" asChild>
                    <Link href={`/student/study-panel/${selectedSubject.id}`}>
                      <span>Open Study Panel</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: LIVE VOICE AI PRACTICE ROOM (AGORA CONVERSATIONAL AI) */}
        <TabsContent value="voice" className="space-y-6 outline-none">
          <Card className="border-border shadow-2xl rounded-[2.5rem] bg-gradient-to-b from-[#0B0C10] via-neutral-950 to-[#132E1B] p-6 sm:p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#a7c957_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
              {/* Status Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/20 text-gold border border-gold/30 rounded-full text-xs font-bold uppercase tracking-widest">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  {isAgentActive ? 'Voice Channel Connected' : 'Voice Practice Offline'}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Real-time Voice AI Tutor
                </h2>
                <p className="text-sm text-foreground/ max-w-md mx-auto">
                  Practice explaining concepts out loud or asking spoken questions. The AI replies naturally in real-time with instant voice feedback.
                </p>
              </div>

              {/* Glowing Interactive Waveform Visualizer */}
              <div className="relative flex items-center justify-center py-10">
                <div
                  className={cn(
                    'w-48 h-48 rounded-full flex items-center justify-center transition-all duration-700 relative',
                    isAgentActive
                      ? 'bg-gold/20 shadow-[0_0_80px_rgba(167,201,87,0.4)] ring-4 ring-gold/40 scale-110'
                      : 'bg-muted border border-border'
                  )}
                >
                  {isAgentActive && (
                    <>
                      <div className="absolute inset-0 rounded-full border border-gold animate-ping opacity-25" />
                      <div className="absolute -inset-4 rounded-full border border-gold/30 animate-pulse" />
                    </>
                  )}

                  <div className="w-32 h-32 rounded-full bg-[#0B0C10] border border-border flex items-center justify-center shadow-inner">
                    {isAiStarting ? (
                      <Loader2 className="w-12 h-12 text-gold animate-spin" />
                    ) : isAgentActive ? (
                      <Volume2 className="w-12 h-12 text-gold animate-pulse" />
                    ) : (
                      <Bot className="w-12 h-12 text-foreground/" />
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  onClick={handleToggleVoiceAgent}
                  disabled={isAiStarting}
                  className={cn(
                    'h-14 px-8 rounded-full font-bold text-base shadow-xl transition-all gap-3 hover:scale-105 active:scale-95',
                    isAgentActive
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                      : 'bg-gold hover:bg-gold/90 text-[#0B0C10] shadow-gold/20'
                  )}
                >
                  {isAiStarting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting AI Voice...</span>
                    </>
                  ) : isAgentActive ? (
                    <>
                      <VolumeX className="w-5 h-5" />
                      <span>End Voice Session</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      <span>Start Voice Practice</span>
                    </>
                  )}
                </Button>

                {isAgentActive && (
                  <Button
                    variant="outline"
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className="h-14 w-14 rounded-full border-border bg-background/20 backdrop-blur-md text-foreground hover:bg-muted"
                  >
                    {isMicMuted ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
                  </Button>
                )}
              </div>

              {/* Voice Room Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-background/40 backdrop-blur-md rounded-2xl border border-border text-left">
                <div>
                  <p className="text-[11px] text-foreground/ uppercase font-semibold">Subject Focus</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">{selectedSubject?.name || 'General'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-foreground/ uppercase font-semibold">Curriculum</p>
                  <p className="text-xs font-bold text-gold mt-0.5">{curriculumBoard}</p>
                </div>
                <div>
                  <p className="text-[11px] text-foreground/ uppercase font-semibold">Voice Engine</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">Agora RTC + OpenAI Alloy</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
