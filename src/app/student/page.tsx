'use client'

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  BrainCircuit, Lightbulb, Video, Calendar, Clock, Shield, Search, Bell, Sparkles, 
  ChevronRight, BookOpen, ShieldAlert, X, MoreVertical, MessageCircle,
  Bot, Send, Loader2, Copy, Check, ExternalLink, RotateCcw, Volume2
} from 'lucide-react';
import Link from 'next/link';
import { DetailedProgressCard } from "@/components/app/student/dashboard/subject-progress-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SchoolHeader } from '@/components/app/school-header';
import { useUser } from '@/components/providers/user-context';
import { createClient } from '@/utils/supabase/client';
import { LiveClass } from '@/lib/types';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationBell } from "@/components/app/notification-bell";
import { CurriculumOnboardingModal } from "@/components/app/student/curriculum-onboarding-modal";
import { GlobalChatDrawer } from "@/components/chat/global-chat-drawer";

function AiStudyPanel() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-obsidian via-burgundy to-gold p-6 text-foreground shadow-xl shadow-burgundy/20 transition-transform duration-300 hover:-translate-y-1 group"
    >
      <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
        <Sparkles className="w-24 h-24" />
      </div>
      <div className="relative z-10 max-w-sm lg:max-w-md">
        <div className="inline-flex items-center gap-1.5 bg-muted backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3 border border-border uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          Premium Feature
        </div>
        <h2 className="text-xl font-bold mb-1.5">AI-Powered Study Panel</h2>
        <p className="text-sm text-foreground/ mb-5 line-clamp-2 leading-relaxed">Unlock tailored insights, instant concept breakdowns, and personalized quizzes powered by your AI Study Buddy.</p>
        <Button asChild className="bg-white text-obsidian px-5 py-2.5 h-auto rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-neutral-50 transition-colors shadow-md w-fit">
          <Link href="/student/study-panel">
            Enter Study Panel
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}

function AiTutorAssistant({ courses }: { courses: any[] }) {
  const { profile } = useUser();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; time: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleAsk = async (text?: string) => {
    const q = text || query.trim();
    if (!q || isTyping) return;

    const userMsg = {
      role: 'user' as const,
      content: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsOpen(true);
    setIsTyping(true);

    try {
      const activeSub = courses.find(c => c.id === selectedSubject || c.name === selectedSubject);
      const res = await fetch('/api/ai-tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: {
            studentName: profile?.full_name || 'Student',
            curriculumBoard: 'ZIMSEC & Cambridge',
            subjectName: activeSub?.name || 'General Studies',
            mode: 'socratic',
          },
        }),
      });

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'I am ready to help you with your question!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e) {
      console.error('[AI Tutor Assistant Error]:', e);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I could not generate an answer right now. Please check your network or try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <motion.div
        layout
        className="bg-background backdrop-blur-xl rounded-[1.5rem] p-5 border border-gold/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1 relative group"
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-gold dark:bg-gold/30 p-2 rounded-xl">
              <Lightbulb className="w-4 h-4 text-gold dark:text-gold" />
            </div>
            <h3 className="font-bold text-sm">AI Tutor Assistant</h3>
          </div>
          <Link
            href="/student/ai-tutor"
            className="text-[11px] font-semibold text-gold hover:underline inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
          >
            <span>Full Hub</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <p className="text-[13px] text-muted-foreground mb-3">
          Have a quick question? Your AI tutor is ready to help instantly.
        </p>

        {/* Quick prompt chips */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
          <button
            onClick={() => handleAsk('Quiz me on 2 exam questions for my courses')}
            className="px-2.5 py-1 bg-muted hover:bg-muted/80 border border-border rounded-full text-[10px] font-medium text-foreground/ transition-colors"
          >
            📝 Exam Quiz
          </button>
          <button
            onClick={() => handleAsk('Explain a key scientific or math concept')}
            className="px-2.5 py-1 bg-muted hover:bg-muted/80 border border-border rounded-full text-[10px] font-medium text-foreground/ transition-colors"
          >
            💡 Explain Concept
          </button>
          <button
            onClick={() => handleAsk('Give me a revision summary for my enrolled subjects')}
            className="px-2.5 py-1 bg-muted hover:bg-muted/80 border border-border rounded-full text-[10px] font-medium text-foreground/ transition-colors"
          >
            ⚡ Revision Summary
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="relative"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything..."
            className="w-full bg-muted/80 dark:bg-background/80 border-none rounded-xl py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isTyping}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-foreground p-1.5 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            {isTyping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </form>
      </motion.div>

      {/* Interactive AI Tutor Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-border rounded-[2rem] p-6 shadow-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    Dr Max AI Tutor
                    <Badge variant="outline" className="text-[10px] border-gold text-gold font-normal">
                      Socratic Mode
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    ZIMSEC & Cambridge Curriculum-Aligned Assistant
                  </DialogDescription>
                </div>
              </div>

              <Button variant="ghost" size="sm" asChild className="text-xs rounded-xl text-gold hover:bg-gold/10 gap-1.5">
                <Link href="/student/ai-tutor">
                  <span>Open Voice & Hub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </DialogHeader>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 my-2 min-h-[260px] max-h-[400px]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
                <Bot className="w-10 h-10 text-gold/60 animate-bounce" />
                <p className="text-sm font-medium text-foreground">What would you like to master today?</p>
                <p className="text-xs max-w-sm">Type any question, paste a problem, or ask for an exam past paper practice test.</p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-start gap-3 max-w-[90%]',
                    m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  )}
                >
                  <Avatar className="w-7 h-7 shrink-0 border border-border">
                    {m.role === 'user' ? (
                      <>
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                          {profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-gold/20 text-gold text-xs font-bold">AI</AvatarFallback>
                    )}
                  </Avatar>

                  <div className="space-y-1">
                    <div
                      className={cn(
                        'p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text shadow-sm',
                        m.role === 'user'
                          ? 'bg-foreground text-background dark:bg-white dark:text-black rounded-tr-none font-medium'
                          : 'bg-muted/80 text-foreground border border-border rounded-tl-none'
                      )}
                    >
                      {m.content}
                    </div>
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
                        <span>{m.time}</span>
                        <span>•</span>
                        <button
                          onClick={() => handleCopy(idx, m.content)}
                          className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
                        >
                          {copiedIndex === idx ? (
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
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex items-center gap-3 mr-auto">
                <Avatar className="w-7 h-7 shrink-0 border border-border">
                  <AvatarFallback className="bg-gold/20 text-gold text-xs font-bold">AI</AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 px-4 rounded-2xl rounded-tl-none border border-border flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Dialog Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2 pt-3 border-t border-border"
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="flex-1 bg-muted/60 border-border rounded-xl h-11 text-xs sm:text-sm focus-visible:ring-gold"
            />
            <Button
              type="submit"
              disabled={!query.trim() || isTyping}
              className="h-11 px-5 rounded-xl bg-gold text-[#0B0C10] hover:bg-gold/90 font-bold gap-2"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Send</span>
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UpcomingLiveClass({ upcomingClasses, loading }: { upcomingClasses: any[]; loading: boolean }) {
  const [selectedOffset, setSelectedOffset] = useState(0);

  if (loading) {
    return (
      <div className="animate-pulse bg-background rounded-3xl p-5 h-40 border border-border flex-1"></div>
    );
  }

  const selectedDate = new Date();
  selectedDate.setDate(selectedDate.getDate() + selectedOffset);
  selectedDate.setHours(0, 0, 0, 0);
  
  const upcomingClass = upcomingClasses?.find(c => {
    if (!c.start_date) return false;
    const cDate = new Date(c.start_date);
    cDate.setHours(0, 0, 0, 0);
    return cDate.getTime() === selectedDate.getTime();
  });

  return (
    <motion.div layout className="bg-background text-foreground rounded-[2rem] p-6 flex flex-col shadow-2xl relative">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg tracking-tight">Timeline Manager</h3>
        <span className="text-[9px] uppercase tracking-widest font-extrabold px-3 py-1 bg-muted rounded-full">Next Up</span>
      </div>

      <div className="flex items-end justify-center gap-1.5 sm:gap-3 mb-6 w-full">
        {Array.from({ length: 5 }).map((_, i) => {
          const offset = i - 2;
          const date = new Date();
          date.setDate(date.getDate() + offset);
          const isSelected = selectedOffset === offset;
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNumber = date.getDate();
          
          return (
            <div 
              key={i} 
              onClick={() => setSelectedOffset(offset)}
              className={`flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
              isSelected 
              ? 'w-12 h-16 sm:w-14 sm:h-20 bg-gold text-obsidian rounded-[1.25rem] sm:rounded-full shadow-lg scale-105 z-10' 
              : 'w-10 h-14 sm:w-10 sm:h-16 bg-muted text-foreground/ rounded-full hover:bg-muted'
            }`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isSelected ? 'text-obsidian/70' : 'opacity-60'}`}>{dayName}</span>
              <span className={`font-extrabold text-lg sm:text-xl leading-none ${!isSelected ? 'opacity-90' : ''}`}>{dayNumber}</span>
            </div>
          );
        })}
      </div>

      {upcomingClass ? (
        (() => {
          const startTime = upcomingClass.start_date ? new Date(upcomingClass.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : '10:00 am';
          const duration = upcomingClass.duration_minutes || 60;
          const endTime = upcomingClass.start_date ? new Date(new Date(upcomingClass.start_date).getTime() + duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : '11:00 am';
          const subjectName = upcomingClass.module?.subject?.name || upcomingClass.title;

          return (
            <div className="rounded-[1.25rem] bg-gold text-obsidian p-4 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 shadow-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background text-foreground rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-border">
                  <Clock className="w-5 h-5 text-gold" />
                </div>
                <div className="pr-2 flex-1">
                  <h4 className="font-extrabold text-[15px] leading-tight mb-0.5 text-obsidian truncate">{upcomingClass.title}</h4>
                  <p className="text-[10px] font-bold opacity-70 text-obsidian uppercase tracking-wide">{subjectName}</p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-obsidian/10 text-xs font-bold text-obsidian">
                <span className="opacity-80 uppercase tracking-wider text-[10px]">
                  {new Date(upcomingClass.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="bg-background/5 px-2 py-1 rounded-md">{startTime} - {endTime}</span>
              </div>
            </div>
          )
        })()
      ) : (
        <div className="rounded-[1.25rem] bg-muted border border-border text-foreground/ p-4 relative flex flex-col items-center justify-center h-[104px]">
           <p className="text-xs">No lessons scheduled</p>
        </div>
      )}
    </motion.div>
  )
}


export default function StudentDashboardPage() {
  const { profile } = useUser();
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = React.useState(true);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const supabase = React.useMemo(() => createClient(), []);
  const userName = profile?.full_name || 'Student';

  const fetchDashboardData = React.useCallback(async () => {
      if (!profile?.id) {
        setLoadingCourses(false);
        setLoadingUpcoming(false);
        return;
      }

      try {
        const [enrollmentsResult, upcomingClassResult] = await Promise.all([
          supabase
            .from('enrollments')
            .select(`
              subject:subjects (
                id,
                name,
                modules (
                  id,
                  title,
                  student_module_progress (
                    is_completed,
                    score
                  )
                )
              )
            `)
            .eq('student_id', profile.id)
            .eq('status', 'approved'),
          supabase
            .from('curriculum_items')
            .select(`
              *,
              module:curriculum_modules (
                subject:subjects (name)
              )
            `)
            .gte('start_date', new Date(new Date().setDate(new Date().getDate() - 2)).toISOString())
            .order('start_date', { ascending: true })
            .lte('start_date', new Date(new Date().setDate(new Date().getDate() + 3)).toISOString())
        ]);

        const enrollments = enrollmentsResult.data;
        if (enrollments) {
          const rawSubjects = enrollments.map(e => e.subject).filter(Boolean);
          // De-duplicate by subject ID or name to prevent duplicate cards/keys
          const uniqueSubjectsMap = new Map<string, any>();
          rawSubjects.forEach((sub: any) => {
            const key = sub.id || sub.name;
            if (!uniqueSubjectsMap.has(key)) {
              uniqueSubjectsMap.set(key, sub);
            }
          });

          const formatted = Array.from(uniqueSubjectsMap.values()).map((subject: any, idx: number) => {
            let overallProgress = 0;
            let fetchedTopics: any[] = [];
            
            if (subject.modules && subject.modules.length > 0) {
               fetchedTopics = subject.modules.map((m: any) => {
                  const progressRec = m.student_module_progress && m.student_module_progress.length > 0 
                    ? m.student_module_progress[0] 
                    : null;
                  const progressValue = progressRec?.is_completed ? 100 : (progressRec?.score || 0);
                  return { name: m.title, progress: progressValue };
               });
               overallProgress = Math.round(fetchedTopics.reduce((acc: number, curr: any) => acc + curr.progress, 0) / fetchedTopics.length);
            } else {
               fetchedTopics = [
                  { name: "Introduction to " + subject.name, progress: 15 },
                  { name: "Core Concepts", progress: 0 }
               ];
               overallProgress = 0;
            }
            
            return {
              id: subject.id || `sub-${idx}`,
              name: subject.name,
              overallProgress: overallProgress,
              topics: fetchedTopics
            };
          });
          setCourses(formatted);
        }

        if (upcomingClassResult.data) {
          setUpcomingClasses(upcomingClassResult.data as any[]);
        } else {
          setUpcomingClasses([]);
        }
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoadingCourses(false);
        setLoadingUpcoming(false);
      }
  }, [profile?.id, supabase]);

  React.useEffect(() => {
    fetchDashboardData();

    if (!profile?.id) return;
    const channel = supabase
      .channel(`student-enrollments-${profile.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'enrollments',
        filter: `student_id=eq.${profile.id}`,
      }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDashboardData, profile?.id, supabase]);

  return (
    <div className="min-h-screen text-foreground dark:text-foreground/ font-sans font-[family-name:var(--font-inter)] selection:bg-primary/30">
      <CurriculumOnboardingModal />
      <div className="w-full grid grid-cols-1 lg:grid-cols-[66%_34%] gap-6 h-full">
        
        {/* =========================================
            MIDDLE COLUMN: Main Learning Feed
            ========================================= */}
        <main className="flex flex-col gap-8 h-full pr-2 pb-24 lg:pb-0">
          
          <div className="flex items-center justify-between sm:hidden mb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt={userName} />
                <AvatarFallback>{userName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground leading-none">Good morning,</p>
                <h1 className="text-lg font-bold">Hi, {userName.split(' ')[0]}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
                <Search className="w-4 h-4 text-muted-foreground" />
              </Button>
              <GlobalChatDrawer 
                trigger={
                  <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 relative hover:bg-secondary transition-colors" title="Open Messages">
                    <MessageCircle className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                } 
              />
              <NotificationBell />
            </div>
          </div>

          <motion.header 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="pt-2 lg:pt-4 hidden sm:flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5">Welcome back, {userName.split(' ')[0]}!</h1>
              <p className="text-xs sm:text-sm text-foreground/ dark:text-foreground/">"The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."</p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <NotificationBell />
            </div>
          </motion.header>

          <AiStudyPanel />

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <h3 className="text-xl font-bold mb-4">Your Enrolled Subjects</h3>
            
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {loadingCourses ? (
                  [1, 2].map((i) => (
                    <div key={i} className="animate-pulse shrink-0 w-[85vw] snap-center sm:w-auto rounded-[2rem] bg-muted dark:bg-background/20 backdrop-blur-sm border border-border/50 dark:border-border/50 h-64" />
                  ))
                ) : courses.length > 0 ? (
                  courses.map((course, index) => (
                      <DetailedProgressCard 
                          key={course.id ? `${course.id}-${index}` : `${course.name}-${index}`} 
                          subject={course.name}
                          overallProgress={course.overallProgress}
                          topics={course.topics}
                          autoplayDelay={2000 + index * 500}
                      />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center text-center p-8 rounded-[2rem] bg-muted dark:bg-background/20 backdrop-blur-sm border border-border/50 dark:border-border/50 min-h-[300px]">
                      <div className="bg-muted dark:bg-background p-5 rounded-[2rem] mb-6 shadow-inner">
                        <BookOpen className="w-10 h-10 text-foreground/ dark:text-foreground/" />
                      </div>
                      <h4 className="text-xl font-semibold mb-2">No Subjects Enrolled</h4>
                      <p className="text-muted-foreground max-w-sm mb-8">
                        Your learning journey starts here. Discover new topics, enroll in subjects, and track your progress effortlessly.
                      </p>
                      <Button asChild className="bg-primary text-primary-foreground px-8 py-6 rounded-2xl font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/25">
                        <Link href="/student/courses">Browse Subjects</Link>
                      </Button>
                  </div>
                )}
            </div>
          </motion.div>
        </main>

        {/* =========================================
            RIGHT COLUMN: Utility & Notification Panel
            ========================================= */}
        <aside className="flex flex-col gap-4 h-full pb-6">
          <AiTutorAssistant courses={courses} />
          <UpcomingLiveClass upcomingClasses={upcomingClasses} loading={loadingUpcoming} />
        </aside>
      </div>
    </div>
  );
}


