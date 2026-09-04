'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/components/providers/user-context';
import { createClient } from '@/utils/supabase/client';
import { 
  getStudentSubjectDashboardData,
  createStudentPersonalTask,
  requestStudentLiveClass,
  toggleDeadlineStatus
} from '@/app/actions/student-tutor';
import { getGlobalChatMessages, sendGlobalChatMessage } from '@/app/actions/chat';
import { submitAssignment } from '@/app/actions/student-assignments';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Search, MessageSquare, Calendar, Trash2, Send, Check, 
  User, Plus, Loader2, CalendarClock, AlertCircle, FileText, CheckCircle2, Users,
  ChevronDown, BookOpen, Clock, BarChart2, Paperclip, Smile, ClipboardList,
  MoreVertical, RefreshCw, Video, X, Info, GraduationCap, ShieldCheck,
  Calculator, Atom, Beaker, Dna, Languages, FlaskConical, Building2,
  Network, Dumbbell, TrendingUp, BookOpenText, Store, Cpu, Theater,
  ScrollText, Tractor, DraftingCompass, Palette, MessageCircle, Scale,
  Lightbulb, BookCopy, Book, Radio, PlayCircle, ArrowRight, ExternalLink,
  Sparkles, CheckCircle, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { CurriculumBoardBadge, SubjectLevelBadge } from '@/components/app/subject-badge';
import { getCurriculumBoard, getSubjectLevel, getSubjectBaseName, getSubjectCode } from '@/utils/subject-utils';

// Icon Map for subjects
const iconMap: Record<string, React.ElementType> = {
  "English Language": BookOpenText,
  "English": BookOpenText,
  "Mathematics": Calculator,
  "Pure Mathematics": Calculator,
  "Additional Mathematics": Cpu,
  "Advanced Mathematics": Cpu,
  "Biology": Dna,
  "History": ScrollText,
  "Chemistry": Beaker,
  "Integrated Science": Beaker,
  "Geography": Building2,
  "Commerce": Store,
  "Principles of Accounting": Scale,
  "Business Enterprise and Skills": Lightbulb,
  "Literature in Indigenous Languages": BookCopy,
  "Indigenous Languages (Shona)": Languages,
  "Indigenous Languages": Languages,
  "Computer Science": Cpu,
  "Computer Operations": Cpu,
  "Combined Science": FlaskConical,
  "General Science": FlaskConical,
  "Science": FlaskConical,
  "Business studies": Building2,
  "Physics": Atom,
  "Physical Science": Atom,
  "ICT": Network,
  "Physical Education": Dumbbell,
  "Economics": TrendingUp,
  "English Literature": BookOpenText,
  "Literature in English": BookOpenText,
  "English & Literature": BookOpenText,
  "Performing arts": Theater,
  "Performing Arts": Theater,
  "Religious studies": ScrollText,
  "Family & Religious Studies": ScrollText,
  "Family and Religious Studies": ScrollText,
  "Sociology": Users,
  "Agriculture": Tractor,
  "Design and Technology": DraftingCompass,
  "Visual Arts": Palette,
  "Art": Palette,
  "Music": MessageCircle,
  "Business English": MessageCircle,
};

function getSubjectIcon(name: string = '') {
  const base = name.replace(/\s*\([^)]+\)/, '').trim();
  return iconMap[base] || iconMap[name] || BookOpen;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

export default function StudentSubjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const rawSubjectId = params?.subjectId as string;
  const [currentSubjectId, setCurrentSubjectId] = useState(rawSubjectId);

  const { profile } = useUser();
  const { toast } = useToast();
  const supabase = createClient();

  const studentId = profile?.id || '';

  // Main Dashboard Data State
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Left subjects search & filter
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('All Levels');

  // Main Center Tabs
  const [activeMainTab, setActiveMainTab] = useState<'chat' | 'live-classes' | 'curriculum'>('chat');

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [useChatFallback, setUseChatFallback] = useState(false);
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Right Side Assignment Filter Tab
  const [assignmentFilter, setAssignmentFilter] = useState<'pending' | 'submitted' | 'completed'>('pending');

  // Right Side Live Class Filter Tab
  const [classFilter, setClassFilter] = useState<'ongoing' | 'upcoming' | 'completed'>('upcoming');

  // Submission Dialog State
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState<any>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);

  // Personal Goal / Task Form State
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Request 1-on-1 Session Dialog State
  const [isRequestSessionOpen, setIsRequestSessionOpen] = useState(false);
  const [requestTopic, setRequestTopic] = useState('');
  const [requestTime, setRequestTime] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Tutor Profile Dialog
  const [isTutorInfoOpen, setIsTutorInfoOpen] = useState(false);

  // Subject Notes State (Local Storage)
  const [notes, setNotes] = useState('');

  // 1. Fetch Subject Dashboard Data
  const loadDashboardData = useCallback(async (subId: string) => {
    if (!studentId || !subId) return;
    setLoading(true);
    const res = await getStudentSubjectDashboardData(studentId, subId);

    if (res.error) {
      console.error('Error loading subject dashboard:', res.error);
      toast({
        title: 'Error loading subject',
        description: res.error,
        variant: 'destructive'
      });
    } else if (res.data) {
      setDashboardData(res.data);
      // Load saved notes
      const savedNotes = localStorage.getItem(`syon_student_notes_${studentId}_${subId}`);
      setNotes(savedNotes || '');
    }
    setLoading(false);
  }, [studentId, toast]);

  useEffect(() => {
    if (rawSubjectId) {
      setCurrentSubjectId(rawSubjectId);
      loadDashboardData(rawSubjectId);
    }
  }, [rawSubjectId, loadDashboardData]);

  // Current Subject & Tutor references
  const currentSubject = dashboardData?.enrollment?.subjects || null;
  const currentTutor = dashboardData?.enrollment?.tutor || null;
  const tutorId = currentTutor?.id || '';

  // 2. Fetch Realtime Chat Messages
  const loadChat = useCallback(async () => {
    if (!studentId || !tutorId) return;
    setChatLoading(true);
    const res = await getGlobalChatMessages(studentId, tutorId);

    if (res.error) {
      console.warn('Chat fetch fallback to localStorage:', res.error);
      setUseChatFallback(true);
      const stored = localStorage.getItem(`syon_chat_${studentId}_${tutorId}`);
      if (stored) {
        try {
          setMessages(JSON.parse(stored));
        } catch {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } else if (res.data) {
      setUseChatFallback(false);
      setMessages(res.data);
    }
    setChatLoading(false);
  }, [studentId, tutorId]);

  useEffect(() => {
    if (!studentId || !tutorId) return;
    loadChat();

    // Subscribe to real-time chat messages
    const channel = supabase
      .channel(`chat_${studentId}_${tutorId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'student_tutor_messages'
      }, (payload) => {
        const newMsg = payload.new as Message;
        if (
          (newMsg.sender_id === studentId && newMsg.receiver_id === tutorId) ||
          (newMsg.sender_id === tutorId && newMsg.receiver_id === studentId)
        ) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, tutorId, loadChat, supabase]);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeMainTab]);

  // Filtered displayed messages for in-chat search
  const displayedMessages = useMemo(() => {
    if (!chatSearchQuery.trim()) return messages;
    return messages.filter(m => m.message?.toLowerCase().includes(chatSearchQuery.toLowerCase()));
  }, [messages, chatSearchQuery]);

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || newMessage).trim();
    if (!textToSend || !studentId || !tutorId) return;

    setNewMessage('');

    if (useChatFallback) {
      const newMsg: Message = {
        id: crypto.randomUUID(),
        sender_id: studentId,
        receiver_id: tutorId,
        message: textToSend,
        created_at: new Date().toISOString()
      };
      const updated = [...messages, newMsg];
      setMessages(updated);
      localStorage.setItem(`syon_chat_${studentId}_${tutorId}`, JSON.stringify(updated));
    } else {
      const res = await sendGlobalChatMessage(studentId, tutorId, textToSend);
      if (res.error) {
        toast({
          title: 'Failed to send message',
          description: res.error,
          variant: 'destructive'
        });
      } else if (res.data) {
        setMessages(prev => [...prev, res.data]);
      }
    }
  };

  // Submit Assignment
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmit || !submissionContent.trim()) {
      toast({
        title: 'Please enter your submission text',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmittingAssignment(true);
    const res = await submitAssignment({
      studentId,
      subjectId: currentSubjectId,
      moduleItemId: selectedAssignmentForSubmit.moduleItemId,
      assignmentNum: selectedAssignmentForSubmit.assignmentNumber,
      submission: submissionContent.trim(),
      tutorId
    });

    if (res.error) {
      toast({
        title: 'Error submitting assignment',
        description: res.error,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Assignment Submitted! 🚀',
        description: 'Your work has been submitted to your tutor for review.'
      });
      setIsSubmitDialogOpen(false);
      setSubmissionContent('');
      setSelectedAssignmentForSubmit(null);
      // Reload dashboard data
      loadDashboardData(currentSubjectId);
    }
    setIsSubmittingAssignment(false);
  };

  // Create Personal Task
  const handleCreatePersonalTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDueDate) {
      toast({ title: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setIsSubmittingTask(true);
    const res = await createStudentPersonalTask(
      studentId,
      currentSubjectId,
      tutorId,
      taskTitle.trim(),
      new Date(taskDueDate).toISOString(),
      taskDesc.trim()
    );

    if (res.error) {
      toast({
        title: 'Failed to create task',
        description: res.error,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Task Created!',
        description: 'New self-study goal added to your subject dashboard.'
      });
      setIsTaskDialogOpen(false);
      setTaskTitle('');
      setTaskDueDate('');
      setTaskDesc('');
      loadDashboardData(currentSubjectId);
    }
    setIsSubmittingTask(false);
  };

  // Request 1-on-1 Live Class Session
  const handleRequestSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTopic.trim() || !requestTime) {
      toast({ title: 'Please provide topic and requested time.', variant: 'destructive' });
      return;
    }

    setIsSubmittingRequest(true);
    const res = await requestStudentLiveClass(
      studentId,
      tutorId,
      currentSubjectId,
      requestTopic.trim(),
      new Date(requestTime).toISOString(),
      requestNotes.trim()
    );

    if (res.error) {
      toast({
        title: 'Failed to send request',
        description: res.error,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Session Requested! 📅',
        description: `Your 1-on-1 class request for "${requestTopic}" was sent to your tutor.`
      });
      setIsRequestSessionOpen(false);
      setRequestTopic('');
      setRequestTime('');
      setRequestNotes('');
      loadChat();
    }
    setIsSubmittingRequest(false);
  };

  // Toggle Task Completion
  const handleToggleTask = async (task: any) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    await toggleDeadlineStatus(task.id, nextStatus);
    loadDashboardData(currentSubjectId);
  };

  // Save Notes
  const handleNotesChange = (val: string) => {
    setNotes(val);
    localStorage.setItem(`syon_student_notes_${studentId}_${currentSubjectId}`, val);
  };

  // Enrolled Subjects list filtered for left sidebar
  const allEnrollments = dashboardData?.allEnrollments || [];
  const filteredEnrollments = useMemo(() => {
    return allEnrollments.filter((e: any) => {
      const sub = e.subjects;
      if (!sub) return false;
      const q = subjectSearchQuery.toLowerCase();
      const matchesSearch = sub.name.toLowerCase().includes(q) || (sub.level && sub.level.toLowerCase().includes(q));
      const matchesLevel = levelFilter === 'All Levels' || sub.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [allEnrollments, subjectSearchQuery, levelFilter]);

  // Unique Levels for filter dropdown
  const uniqueLevels = useMemo(() => {
    const levels = new Set<string>();
    allEnrollments.forEach((e: any) => {
      if (e.subjects?.level) levels.add(e.subjects.level);
    });
    return Array.from(levels).sort();
  }, [allEnrollments]);

  // Live Classes Breakdown
  const liveClasses = dashboardData?.liveClasses || [];
  const ongoingClasses = useMemo(() => liveClasses.filter((c: any) => c.status === 'ongoing'), [liveClasses]);
  const upcomingClasses = useMemo(() => liveClasses.filter((c: any) => c.status === 'upcoming'), [liveClasses]);
  const completedClasses = useMemo(() => liveClasses.filter((c: any) => c.status === 'completed'), [liveClasses]);

  // Assignments Breakdown
  const assignments = dashboardData?.assignments || [];
  const pendingAssignments = useMemo(() => assignments.filter((a: any) => a.status === 'pending'), [assignments]);
  const submittedAssignments = useMemo(() => assignments.filter((a: any) => a.status === 'submitted'), [assignments]);
  const completedAssignments = useMemo(() => assignments.filter((a: any) => a.status === 'completed'), [assignments]);

  // Deadlines / Personal Tasks
  const deadlines = dashboardData?.deadlines || [];

  // Overall Progress Stats
  const progressStats = dashboardData?.progress || { total: 0, completed: 0, percent: 0, trendPath: "M0,28 L100,28" };

  // Subject Icon
  const SubjectIcon = iconMap[currentSubject?.name || ''] || BookOpen;

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background text-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37] mb-4" />
        <h3 className="text-lg font-semibold">Loading Subject Dashboard...</h3>
        <p className="text-sm text-muted-foreground">Preparing your 1-on-1 tutoring hub & materials</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground font-sans overflow-hidden min-h-[calc(100vh-3.5rem)]">
      
      {/* 2-Column Main Layout: Left Switcher + Right Main Subject View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ================= LEFT SUBJECT SWITCHER PANEL ================= */}
        <section className="w-64 flex-shrink-0 flex flex-col border-r border-border bg-background">
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[#D4AF37] text-xl font-bold">My Subjects</h2>
              <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-full border border-[#D4AF37]/30 font-medium">
                {allEnrollments.length} Enrolled
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Select a subject to open your tailored 1-on-1 hub.</p>
            
            {/* Search Filter */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <Input 
                type="text" 
                placeholder="Search subject..." 
                value={subjectSearchQuery}
                onChange={e => setSubjectSearchQuery(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-2 pl-9 pr-3 text-xs text-foreground focus:outline-none focus:border-[#D4AF37] transition-colors h-9"
              />
            </div>

            {/* Level Filter Dropdown */}
            {uniqueLevels.length > 1 && (
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full bg-card border border-border rounded-xl py-2 px-3 text-xs text-muted-foreground hover:bg-muted transition-colors h-9 mb-1">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-muted-foreground text-xs">
                  <SelectItem value="All Levels">All Levels</SelectItem>
                  {uniqueLevels.map(lvl => (
                    <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Enrolled Subjects List */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 custom-scrollbar">
            {filteredEnrollments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-xs">No subjects found</div>
            ) : (
              filteredEnrollments.map((enr: any) => {
                const sub = enr.subjects;
                const tut = enr.tutor;
                const isActive = sub.id === currentSubjectId;
                const IconComp = getSubjectIcon(sub.name);
                const board = getCurriculumBoard(sub);
                const level = getSubjectLevel(sub);

                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      if (sub.id !== currentSubjectId) {
                        setCurrentSubjectId(sub.id);
                        router.push(`/student/study-panel/${sub.id}`);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-sm' 
                        : 'bg-card border-border hover:border-[#D4AF37]/40 hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#D4AF37] text-black font-bold' : 'bg-muted text-[#D4AF37]'
                      }`}>
                        <IconComp size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className={`text-xs font-bold truncate ${isActive ? 'text-[#D4AF37]' : 'text-foreground'}`}>
                            {sub.name}
                          </h4>
                          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="Active"></span>
                        </div>

                        {/* Curriculum Board & Level Badges */}
                        <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                          <CurriculumBoardBadge board={board} size="sm" />
                          <SubjectLevelBadge level={level} size="sm" />
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground truncate">
                            {tut?.full_name ? `Tutor: ${tut.full_name.split(' ')[0]}` : (sub.category || 'Core')}
                          </span>
                          <span className={isActive ? 'text-green-400 font-bold' : 'text-muted-foreground'}>
                            {isActive ? `${progressStats.percent}%` : '→'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Left Footer Link to Catalog */}
          <div className="p-3 border-t border-border">
            <Link 
              href="/student/courses"
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted"
            >
              <GraduationCap size={15} />
              <span>Browse All Courses</span>
            </Link>
          </div>
        </section>


        {/* ================= RIGHT MAIN SUBJECT DASHBOARD AREA ================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-background p-4 overflow-hidden">
          
          {/* 1. TOP HEADER HERO CARD (Curated Subject & Tutor Overview) */}
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 shrink-0 shadow-sm">
            
            {/* Subject Details & Assigned Tutor Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-md">
                  <SubjectIcon size={32} />
                </div>
                {ongoingClasses.length > 0 && (
                  <div className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[8px] text-white font-bold items-center justify-center">●</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground truncate">{currentSubject?.name || 'Subject Dashboard'}</h1>
                  <CurriculumBoardBadge board={getCurriculumBoard(currentSubject)} size="default" />
                  <SubjectLevelBadge level={getSubjectLevel(currentSubject)} size="default" />
                  {currentSubject?.category && (
                    <Badge variant="secondary" className="text-[10px]">
                      {currentSubject.category}
                    </Badge>
                  )}
                </div>

                {/* Assigned Tutor snippet */}
                {currentTutor ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-0.5 rounded-lg border border-border">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={currentTutor.avatar_url} />
                        <AvatarFallback className="text-[9px]">{currentTutor.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-foreground">Tutor: {currentTutor.full_name}</span>
                      <div className="w-2 h-2 rounded-full bg-green-500" title="Online & Available"></div>
                    </div>

                    <button 
                      onClick={() => setIsTutorInfoOpen(true)}
                      className="text-[#D4AF37] hover:underline text-[11px] font-medium flex items-center gap-1"
                    >
                      <Info size={12} /> Profile
                    </button>

                    <button 
                      onClick={() => setIsRequestSessionOpen(true)}
                      className="text-emerald-400 hover:underline text-[11px] font-medium flex items-center gap-1"
                    >
                      <Video size={12} /> Request 1-on-1 Class
                    </button>

                    <Link 
                      href="/student/ai-tutor"
                      className="bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 px-2.5 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all hover:scale-105"
                    >
                      <Sparkles size={12} className="text-gold animate-pulse" /> Ask AI Tutor
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <p className="text-xs text-muted-foreground">Personal 1-on-1 Tutoring Hub • {getCurriculumBoard(currentSubject)} Curriculum</p>
                    <Link 
                      href="/student/ai-tutor"
                      className="bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 px-2.5 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all hover:scale-105"
                    >
                      <Sparkles size={12} className="text-gold animate-pulse" /> Ask AI Tutor
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Progress & Quick CTA */}
            <div className="flex items-center gap-6 self-end sm:self-auto shrink-0">
              
              {/* Progress metric */}
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-0.5">Subject Mastery</p>
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="text-2xl font-extrabold text-green-400">{progressStats.percent}%</span>
                  <span className="text-green-400 text-xs font-bold">↗</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {progressStats.completed} of {progressStats.total} milestones done
                </p>
              </div>

              {/* Sparkline Graph */}
              <div className="w-20 h-10 opacity-90 hidden sm:block">
                <Sparkline 
                  color={progressStats.percent >= 50 || progressStats.total === 0 ? "#4ade80" : "#facc15"} 
                  path={progressStats.trendPath} 
                />
              </div>

              {/* Quick Action Button */}
              {ongoingClasses.length > 0 ? (
                <Button 
                  asChild
                  className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 animate-pulse text-xs px-4 py-2"
                >
                  <Link href={`/classroom/${ongoingClasses[0].agora_channel_name || ongoingClasses[0].id}?role=participant&name=${profile?.full_name || 'Student'}`}>
                    <Video className="w-4 h-4 mr-1.5" /> Join Live Now
                  </Link>
                </Button>
              ) : (
                <Button 
                  asChild
                  className="bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-bold rounded-xl text-xs px-4 py-2"
                >
                  <Link href={`/student/quiz?subjectId=${currentSubjectId}`}>
                    <Sparkles className="w-4 h-4 mr-1.5" /> Quick Quiz
                  </Link>
                </Button>
              )}
            </div>
          </div>


          {/* 2. LOWER SPLIT GRID (Center Interactive Tabs + Right Specialized Widgets) */}
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 gap-4 min-h-0 overflow-hidden">
            
            {/* ================= CENTER COLUMN (Tutor Chat & Live Classes Hub) ================= */}
            <div className="xl:col-span-3 flex flex-col gap-4 min-h-0">
              
              {/* Tab Navigation Header for Center Area */}
              <div className="flex items-center justify-between bg-card border border-border rounded-xl p-1 shrink-0">
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setActiveMainTab('chat')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeMainTab === 'chat'
                        ? 'bg-[#D4AF37] text-black shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <MessageSquare size={14} />
                    <span>Tutor Chat</span>
                  </button>

                  <button 
                    onClick={() => setActiveMainTab('live-classes')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeMainTab === 'live-classes'
                        ? 'bg-[#D4AF37] text-black shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Video size={14} />
                    <span>Live Classes & Video</span>
                    {ongoingClasses.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    )}
                  </button>

                  <button 
                    onClick={() => setActiveMainTab('curriculum')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeMainTab === 'curriculum'
                        ? 'bg-[#D4AF37] text-black shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <BookOpen size={14} />
                    <span>Syllabus & Lessons</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pr-2">
                  <button 
                    onClick={() => setIsRequestSessionOpen(true)}
                    className="text-xs text-[#D4AF37] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus size={13} /> Book 1-on-1
                  </button>
                </div>
              </div>

              {/* TAB 1: 1-ON-1 TUTOR CHAT */}
              {activeMainTab === 'chat' && (
                <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden min-h-0">
                  
                  {/* Chat Header */}
                  <div className="p-3.5 border-b border-border flex justify-between items-center bg-card shrink-0">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-7 h-7 border border-[#D4AF37]">
                        <AvatarImage src={currentTutor?.avatar_url} />
                        <AvatarFallback className="text-xs font-bold">{currentTutor?.full_name?.[0] || 'T'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xs font-bold text-foreground">
                          {currentTutor ? `Chat with ${currentTutor.full_name}` : 'Tutor Support Chat'}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">Direct 1-on-1 academic assistance & inquiries</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground">
                      <button 
                        onClick={() => setIsChatSearchOpen(!isChatSearchOpen)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isChatSearchOpen ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'hover:bg-muted hover:text-foreground'
                        }`}
                        title="Search messages"
                      >
                        <Search size={16} />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 bg-card border-border shadow-xl rounded-xl p-1 text-xs">
                          <DropdownMenuItem onClick={() => setIsTutorInfoOpen(true)} className="gap-2 cursor-pointer">
                            <User size={14} className="text-[#D4AF37]" /> Tutor Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setIsRequestSessionOpen(true)} className="gap-2 cursor-pointer">
                            <Video size={14} className="text-emerald-400" /> Request Video Class
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setIsTaskDialogOpen(true)} className="gap-2 cursor-pointer">
                            <Plus size={14} className="text-[#D4AF37]" /> Add Study Goal
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border my-1" />
                          <DropdownMenuItem onClick={loadChat} className="gap-2 cursor-pointer">
                            <RefreshCw size={14} className="text-muted-foreground" /> Refresh Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* In-Chat Search bar */}
                  {isChatSearchOpen && (
                    <div className="px-3.5 py-2 bg-muted/40 border-b border-border flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                      <Search size={13} className="text-muted-foreground" />
                      <input 
                        type="text" 
                        value={chatSearchQuery}
                        onChange={e => setChatSearchQuery(e.target.value)}
                        placeholder="Search conversation..." 
                        className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                        autoFocus
                      />
                      {chatSearchQuery && (
                        <button onClick={() => setChatSearchQuery('')} className="text-xs text-muted-foreground hover:text-foreground">
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Quick Action Suggestion Chips */}
                  <div className="px-4 py-2 border-b border-border/50 bg-background/50 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                    <button 
                      onClick={() => handleSendMessage(undefined, "Hi tutor, could you help me review the latest assignment?")}
                      className="px-2.5 py-1 rounded-full bg-muted/80 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] text-[11px] text-muted-foreground transition-colors shrink-0 flex items-center gap-1 border border-border"
                    >
                      📝 Assignment help
                    </button>
                    <button 
                      onClick={() => setIsRequestSessionOpen(true)}
                      className="px-2.5 py-1 rounded-full bg-muted/80 hover:bg-emerald-500/20 hover:text-emerald-400 text-[11px] text-muted-foreground transition-colors shrink-0 flex items-center gap-1 border border-border"
                    >
                      🎥 Request 1-on-1 class
                    </button>
                    <button 
                      onClick={() => handleSendMessage(undefined, "When is our next live class session scheduled?")}
                      className="px-2.5 py-1 rounded-full bg-muted/80 hover:bg-purple-500/20 hover:text-purple-400 text-[11px] text-muted-foreground transition-colors shrink-0 flex items-center gap-1 border border-border"
                    >
                      📅 Schedule question
                    </button>
                  </div>

                  {/* Chat Messages Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {chatLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#D4AF37]" />
                      </div>
                    ) : displayedMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                        <MessageSquare className="h-10 w-10 opacity-20 mb-2" />
                        <h4 className="text-sm font-semibold text-foreground mb-1">Start your tutoring discussion</h4>
                        <p className="text-xs max-w-xs">Ask questions about assignments, clarify lecture concepts, or coordinate study goals directly with your tutor.</p>
                      </div>
                    ) : (
                      displayedMessages.map(msg => {
                        const isMe = msg.sender_id === studentId;
                        return (
                          <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                            {!isMe && (
                              <Avatar className="w-7 h-7 border border-[#D4AF37] shrink-0 mt-0.5">
                                <AvatarImage src={currentTutor?.avatar_url} />
                                <AvatarFallback className="text-[10px] font-bold">{currentTutor?.full_name?.[0] || 'T'}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`flex flex-col gap-1 max-w-[82%] ${isMe ? 'items-end' : ''}`}>
                              <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                                isMe 
                                  ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] rounded-tr-sm font-medium' 
                                  : 'bg-muted text-foreground rounded-tl-sm border border-border'
                              }`}>
                                {msg.message}
                              </div>
                              <div className={`flex items-center gap-1 text-[9px] text-muted-foreground ${isMe ? 'mr-1' : 'ml-1'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {isMe && <span className="text-[#D4AF37]">✓✓</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Chat Input Form */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-card border-t border-border shrink-0">
                    <div className="relative flex items-center bg-muted/60 border border-slate-700/60 rounded-xl overflow-hidden focus-within:border-[#D4AF37] transition-colors">
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder={`Message ${currentTutor?.full_name?.split(' ')[0] || 'your tutor'}...`} 
                        className="flex-1 bg-transparent py-2.5 pl-3.5 pr-24 text-xs text-foreground focus:outline-none placeholder:text-muted-foreground"
                      />
                      <div className="absolute right-2.5 flex items-center gap-2">
                        <button type="button" title="Attach file" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                          <Paperclip size={15} />
                        </button>
                        <button type="button" title="Insert emoji" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                          <Smile size={15} />
                        </button>
                        <button type="submit" className="w-7 h-7 bg-[#D4AF37] hover:bg-[#c29f2f] rounded-lg flex items-center justify-center text-black transition-colors shadow-sm">
                          <Send size={12} className="-ml-0.5" />
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: LIVE CLASSES & VIDEO HUB */}
              {activeMainTab === 'live-classes' && (
                <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl p-4 overflow-y-auto custom-scrollbar gap-4 min-h-0">
                  
                  {/* Ongoing Class Alert */}
                  {ongoingClasses.length > 0 ? (
                    <div className="bg-gradient-to-r from-red-950/40 via-red-900/20 to-background border-2 border-red-500/60 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="flex h-3 w-3 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-xs uppercase font-extrabold tracking-wider text-red-400">Class Is Live Right Now</span>
                          </div>
                          <h3 className="text-lg font-bold text-foreground">{ongoingClasses[0].title}</h3>
                          <p className="text-xs text-muted-foreground">
                            Hosted by {ongoingClasses[0].tutor?.full_name || 'Tutor'} • Agora High-Definition Video/Audio
                          </p>
                        </div>

                        <Button 
                          asChild
                          className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl py-6 px-6 shadow-xl"
                        >
                          <Link href={`/classroom/${ongoingClasses[0].agora_channel_name || ongoingClasses[0].id}?role=participant&name=${profile?.full_name || 'Student'}`}>
                            <Video className="w-5 h-5 mr-2" /> Join Classroom Now
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                          <Video size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground">No Live Class Active</h4>
                          <p className="text-[11px] text-muted-foreground">Check upcoming scheduled classes below or request a 1-on-1 tutoring session.</p>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => setIsRequestSessionOpen(true)}
                        className="bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-bold rounded-xl text-xs"
                      >
                        Request Class
                      </Button>
                    </div>
                  )}

                  {/* Upcoming Scheduled Live Classes */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#D4AF37]" /> Upcoming Scheduled Sessions ({upcomingClasses.length})
                    </h3>

                    {upcomingClasses.length === 0 ? (
                      <div className="p-6 bg-card border border-dashed rounded-xl text-center text-xs text-muted-foreground">
                        No upcoming live classes scheduled for this subject yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {upcomingClasses.map((cls: any) => (
                          <div key={cls.id} className="p-4 bg-card border border-border rounded-xl hover:border-[#D4AF37]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] border-purple-500/40 text-purple-400 bg-purple-500/10">
                                  Scheduled
                                </Badge>
                                <span className="text-xs font-semibold text-muted-foreground">
                                  {cls.start_time ? new Date(cls.start_time).toLocaleString() : 'TBD'}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-foreground">{cls.title}</h4>
                              {cls.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">{cls.description}</p>
                              )}
                            </div>

                            <Button 
                              size="sm"
                              variant="outline"
                              asChild
                              className="rounded-xl text-xs font-semibold shrink-0 border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 text-[#D4AF37]"
                            >
                              <Link href={`/student/live-classes/${cls.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Past Recorded Classes */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <PlayCircle size={14} className="text-green-400" /> Completed & Recorded Sessions ({completedClasses.length})
                    </h3>

                    {completedClasses.length === 0 ? (
                      <div className="p-6 bg-card border border-dashed rounded-xl text-center text-xs text-muted-foreground">
                        No recorded sessions archived yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {completedClasses.map((cls: any) => (
                          <div key={cls.id} className="p-4 bg-card border border-border rounded-xl flex items-center justify-between gap-3">
                            <div>
                              <h4 className="text-xs font-bold text-foreground">{cls.title}</h4>
                              <p className="text-[10px] text-muted-foreground">
                                Completed on {cls.start_time ? new Date(cls.start_time).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>

                            <Button 
                              size="sm"
                              variant="outline"
                              asChild
                              className="rounded-xl text-xs border-border hover:bg-muted"
                            >
                              <Link href={`/student/resources?liveClassId=${cls.id}`}>
                                View Resources
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CURRICULUM & SYLLABUS */}
              {activeMainTab === 'curriculum' && (
                <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl p-4 overflow-y-auto custom-scrollbar gap-4 min-h-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Course Curriculum & Learning Modules</h3>
                      <p className="text-xs text-muted-foreground">Official approved syllabus content for this subject.</p>
                    </div>
                    <Button size="sm" asChild className="bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-bold rounded-xl text-xs">
                      <Link href={`/student/courses/${currentSubjectId}`}>
                        Full Course View →
                      </Link>
                    </Button>
                  </div>

                  {dashboardData?.modules?.length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-xl text-xs text-muted-foreground">
                      No curriculum modules published yet for this subject.
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full space-y-3">
                      {dashboardData?.modules?.map((mod: any) => (
                        <AccordionItem key={mod.id} value={mod.id} className="border border-border rounded-xl bg-card px-4">
                          <AccordionTrigger className="py-3 hover:no-underline">
                            <div className="flex items-center gap-2 text-left">
                              <span className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded uppercase">
                                Module {mod.sequence_order}
                              </span>
                              <span className="text-xs font-bold text-foreground">{mod.title}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4 space-y-3 border-t border-border">
                            {mod.items?.map((item: any) => (
                              <div key={item.id} className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="text-[9px]">
                                      {item.item_type}
                                    </Badge>
                                    <span className="text-xs font-semibold text-foreground">{item.title}</span>
                                  </div>
                                  {item.metadata?.key_questions && (
                                    <p className="text-[10px] text-muted-foreground">
                                      Objectives: {item.metadata.key_questions.slice(0, 2).join(', ')}
                                    </p>
                                  )}
                                </div>

                                <Button size="sm" variant="outline" asChild className="rounded-xl text-[11px] h-7 border-border">
                                  <Link href={`/student/quiz?topicId=${item.id}`}>
                                    Practice Quiz
                                  </Link>
                                </Button>
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </div>
              )}
            </div>


            {/* ================= RIGHT COLUMN (Specialized Student Widgets) ================= */}
            <div className="xl:col-span-2 flex flex-col gap-4 min-h-0 overflow-y-auto custom-scrollbar pr-1">
              
              {/* WIDGET 1: LIVE CLASSES (Ongoing / Upcoming / Completed) */}
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col shrink-0 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Video size={16} className="text-purple-400" />
                    <span>Live Classes</span>
                  </div>
                  
                  {/* Status pills */}
                  <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-[10px]">
                    <button 
                      onClick={() => setClassFilter('ongoing')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                        classFilter === 'ongoing' ? 'bg-red-500 text-white' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Live ({ongoingClasses.length})
                    </button>
                    <button 
                      onClick={() => setClassFilter('upcoming')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                        classFilter === 'upcoming' ? 'bg-[#D4AF37] text-black' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Upcoming ({upcomingClasses.length})
                    </button>
                    <button 
                      onClick={() => setClassFilter('completed')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                        classFilter === 'completed' ? 'bg-green-500 text-black' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Past ({completedClasses.length})
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar">
                  {classFilter === 'ongoing' && (
                    ongoingClasses.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">No active live class right now.</p>
                    ) : (
                      ongoingClasses.map((cls: any) => (
                        <div key={cls.id} className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/50 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-foreground truncate">{cls.title}</h5>
                            <p className="text-[10px] text-red-400 font-semibold">🔴 Live right now</p>
                          </div>
                          <Button size="sm" asChild className="bg-red-600 hover:bg-red-700 text-white text-[10px] h-7 rounded-lg font-bold">
                            <Link href={`/classroom/${cls.agora_channel_name || cls.id}?role=participant&name=${profile?.full_name || 'Student'}`}>
                              Join
                            </Link>
                          </Button>
                        </div>
                      ))
                    )
                  )}

                  {classFilter === 'upcoming' && (
                    upcomingClasses.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">No upcoming classes scheduled.</p>
                    ) : (
                      upcomingClasses.map((cls: any) => (
                        <div key={cls.id} className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-foreground truncate">{cls.title}</h5>
                            <p className="text-[10px] text-muted-foreground">
                              {cls.start_time ? new Date(cls.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[9px] border-purple-500/30 text-purple-400">
                            Upcoming
                          </Badge>
                        </div>
                      ))
                    )
                  )}

                  {classFilter === 'completed' && (
                    completedClasses.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">No completed sessions.</p>
                    ) : (
                      completedClasses.map((cls: any) => (
                        <div key={cls.id} className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-foreground truncate">{cls.title}</h5>
                            <p className="text-[10px] text-muted-foreground">
                              {cls.start_time ? new Date(cls.start_time).toLocaleDateString() : 'Completed'}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-[9px]">Archived</Badge>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>


              {/* WIDGET 2: SUBJECT ASSIGNMENTS (Pending, Submitted, Completed) */}
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col shrink-0 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <FileText size={16} className="text-[#D4AF37]" />
                    <span>Assignments & Tasks</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsTaskDialogOpen(true)}
                      className="text-[11px] text-[#D4AF37] hover:underline font-semibold flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Goal
                    </button>
                  </div>
                </div>

                {/* Assignment Status Filter Tabs */}
                <div className="flex items-center gap-1 bg-muted p-1 rounded-xl text-[10px] mb-3">
                  <button 
                    onClick={() => setAssignmentFilter('pending')}
                    className={`flex-1 py-1 rounded-lg font-bold transition-colors ${
                      assignmentFilter === 'pending' ? 'bg-[#D4AF37] text-black shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Pending ({pendingAssignments.length + deadlines.filter((d: any) => d.status !== 'completed').length})
                  </button>
                  <button 
                    onClick={() => setAssignmentFilter('submitted')}
                    className={`flex-1 py-1 rounded-lg font-bold transition-colors ${
                      assignmentFilter === 'submitted' ? 'bg-[#D4AF37] text-black shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Submitted ({submittedAssignments.length})
                  </button>
                  <button 
                    onClick={() => setAssignmentFilter('completed')}
                    className={`flex-1 py-1 rounded-lg font-bold transition-colors ${
                      assignmentFilter === 'completed' ? 'bg-[#D4AF37] text-black shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Graded ({completedAssignments.length + deadlines.filter((d: any) => d.status === 'completed').length})
                  </button>
                </div>

                {/* Assignments List */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar">
                  {assignmentFilter === 'pending' && (
                    <>
                      {/* Personal Deadlines */}
                      {deadlines.filter((d: any) => d.status !== 'completed').map((d: any) => {
                        const daysLeft = Math.max(0, Math.ceil((new Date(d.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                        return (
                          <div key={d.id} className="p-3 rounded-xl bg-muted/40 border border-border flex items-start justify-between gap-3 group">
                            <button 
                              onClick={() => handleToggleTask(d)}
                              className="w-4 h-4 rounded-full mt-0.5 border border-[#D4AF37] hover:bg-[#D4AF37] flex items-center justify-center transition-colors shrink-0"
                              title="Mark as completed"
                            >
                              <Check size={9} className="text-black opacity-0 group-hover:opacity-100" />
                            </button>
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs font-bold text-foreground truncate">{d.title}</h5>
                              <p className="text-[10px] text-muted-foreground">Due: {new Date(d.due_date).toLocaleDateString()}</p>
                            </div>
                            <span className="text-[10px] font-bold text-[#D4AF37] shrink-0">{daysLeft}d left</span>
                          </div>
                        );
                      })}

                      {/* Curriculum Pending Assignments */}
                      {pendingAssignments.map((a: any) => (
                        <div key={a.id} className="p-3 rounded-xl bg-muted/40 border border-border flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 font-bold">
                                Pending Submission
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-foreground truncate">{a.title}</h5>
                            <p className="text-[10px] text-muted-foreground truncate">{a.topicTitle}</p>
                          </div>

                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedAssignmentForSubmit(a);
                              setIsSubmitDialogOpen(true);
                            }}
                            className="bg-[#D4AF37] hover:bg-[#c29f2f] text-black text-[10px] font-bold h-7 px-2.5 rounded-lg shrink-0"
                          >
                            Submit
                          </Button>
                        </div>
                      ))}

                      {pendingAssignments.length === 0 && deadlines.filter((d: any) => d.status !== 'completed').length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">No pending assignments or deadlines!</p>
                      )}
                    </>
                  )}

                  {assignmentFilter === 'submitted' && (
                    submittedAssignments.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No assignments currently awaiting review.</p>
                    ) : (
                      submittedAssignments.map((a: any) => (
                        <div key={a.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">
                                Under Review
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-foreground truncate">{a.title}</h5>
                            <p className="text-[10px] text-muted-foreground">Submitted to tutor</p>
                          </div>
                          <Clock size={16} className="text-amber-400 shrink-0 mt-1" />
                        </div>
                      ))
                    )
                  )}

                  {assignmentFilter === 'completed' && (
                    <>
                      {completedAssignments.map((a: any) => (
                        <div key={a.id} className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">
                              {a.grade || 'Graded'}
                            </span>
                            <CheckCircle size={14} className="text-green-400" />
                          </div>
                          <h5 className="text-xs font-bold text-foreground truncate">{a.title}</h5>
                          {a.feedback && (
                            <p className="text-[10px] text-muted-foreground italic border-l-2 border-[#D4AF37] pl-2 mt-1">
                              "{a.feedback}"
                            </p>
                          )}
                        </div>
                      ))}

                      {deadlines.filter((d: any) => d.status === 'completed').map((d: any) => (
                        <div key={d.id} className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-medium text-foreground line-through opacity-70 truncate">{d.title}</h5>
                            <p className="text-[10px] text-muted-foreground">Goal accomplished</p>
                          </div>
                          <Check size={14} className="text-green-400" />
                        </div>
                      ))}

                      {completedAssignments.length === 0 && deadlines.filter((d: any) => d.status === 'completed').length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">No completed tasks yet.</p>
                      )}
                    </>
                  )}
                </div>
              </div>


              {/* WIDGET 3: RECENT ACADEMIC ACTIVITY */}
              <div className="bg-card border border-border rounded-2xl p-4 shrink-0 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground mb-3">
                  <Flame size={16} className="text-emerald-400" />
                  <span>Recent Activity</span>
                </div>

                <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-muted">
                  {completedAssignments.length > 0 && (
                    <div className="relative pl-7 flex items-start gap-2">
                      <div className="absolute left-0 w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-[10px] font-bold border border-border">
                        ✓
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-semibold text-foreground truncate">
                          Assignment Marked: {completedAssignments[0].title}
                        </h5>
                        <p className="text-[10px] text-muted-foreground">Feedback provided by tutor</p>
                      </div>
                    </div>
                  )}

                  {upcomingClasses.length > 0 && (
                    <div className="relative pl-7 flex items-start gap-2">
                      <div className="absolute left-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold border border-border">
                        🎥
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-semibold text-foreground truncate">
                          Live Class Scheduled: {upcomingClasses[0].title}
                        </h5>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(upcomingClasses[0].start_time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="relative pl-7 flex items-start gap-2">
                    <div className="absolute left-0 w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center text-[10px] font-bold border border-border">
                      📚
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-semibold text-foreground truncate">
                        Enrolled in {currentSubject?.name || 'Subject'}
                      </h5>
                      <p className="text-[10px] text-muted-foreground">Active 1-on-1 personal curriculum</p>
                    </div>
                  </div>
                </div>
              </div>


              {/* WIDGET 4: SUBJECT STUDY NOTES (Auto-saved) */}
              <div className="bg-[#1A1810]/90 border border-[#D4AF37]/30 rounded-2xl p-4 shrink-0 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#D4AF37]">
                    <ClipboardList size={16} />
                    <span>My Subject Notes</span>
                  </div>
                  <span className="text-[10px] text-[#D4AF37]/80">Auto-saved</span>
                </div>

                <textarea 
                  value={notes}
                  onChange={e => handleNotesChange(e.target.value)}
                  placeholder={`Write key formulas, lecture reminders, and study notes for ${currentSubject?.name || 'this subject'}...`}
                  className="w-full bg-transparent text-xs text-foreground/90 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 rounded-xl p-2 h-24 border border-[#D4AF37]/20 placeholder:text-muted-foreground/60"
                />
              </div>

            </div>
          </div>
        </main>
      </div>


      {/* ================= MODALS & DIALOGS ================= */}

      {/* 1. SUBMIT ASSIGNMENT MODAL */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[460px] bg-card border-border rounded-3xl p-6 text-foreground">
          <form onSubmit={handleAssignmentSubmit}>
            <DialogHeader>
              <DialogTitle className="text-[#D4AF37] flex items-center gap-2">
                <FileText size={18} /> Submit Assignment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedAssignmentForSubmit?.title} • {selectedAssignmentForSubmit?.topicTitle}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Your Response / Solution</label>
                <Textarea 
                  value={submissionContent}
                  onChange={e => setSubmissionContent(e.target.value)}
                  placeholder="Type your answer, working steps, or paste your solution link here..."
                  className="bg-muted/50 border-border text-foreground text-xs min-h-[140px] rounded-xl"
                  required
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setIsSubmitDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingAssignment} className="bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-[#c29f2f]">
                {isSubmittingAssignment ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1" />}
                Submit for Grading
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. ADD PERSONAL GOAL / TASK MODAL */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[420px] bg-card border-border rounded-3xl p-6 text-foreground">
          <form onSubmit={handleCreatePersonalTask}>
            <DialogHeader>
              <DialogTitle className="text-[#D4AF37] flex items-center gap-2">
                <Plus size={18} /> Add Study Goal
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set a self-study deadline or review milestone for {currentSubject?.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Goal / Task Title</label>
                <Input 
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g., Complete Chapter 3 Practice Questions"
                  className="bg-muted/50 border-border text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Target Due Date</label>
                <Input 
                  type="datetime-local"
                  value={taskDueDate}
                  onChange={e => setTaskDueDate(e.target.value)}
                  className="bg-muted/50 border-border text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Extra Notes (Optional)</label>
                <Input 
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  placeholder="e.g., Focus on questions 10 to 18"
                  className="bg-muted/50 border-border text-xs rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setIsTaskDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingTask} className="bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-[#c29f2f]">
                {isSubmittingTask ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null}
                Save Goal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. REQUEST 1-ON-1 LIVE CLASS MODAL */}
      <Dialog open={isRequestSessionOpen} onOpenChange={setIsRequestSessionOpen}>
        <DialogContent className="sm:max-w-[440px] bg-card border-border rounded-3xl p-6 text-foreground">
          <form onSubmit={handleRequestSession}>
            <DialogHeader>
              <DialogTitle className="text-[#D4AF37] flex items-center gap-2">
                <Video size={18} /> Request 1-on-1 Class
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Request a dedicated video session with your tutor on a topic you want to master.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Topic to Cover</label>
                <Input 
                  value={requestTopic}
                  onChange={e => setRequestTopic(e.target.value)}
                  placeholder="e.g. Help with Organic Chemistry Mechanisms"
                  className="bg-muted/50 border-border text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Preferred Date & Time</label>
                <Input 
                  type="datetime-local"
                  value={requestTime}
                  onChange={e => setRequestTime(e.target.value)}
                  className="bg-muted/50 border-border text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Notes / Questions for Tutor</label>
                <Textarea 
                  value={requestNotes}
                  onChange={e => setRequestNotes(e.target.value)}
                  placeholder="Specific questions or exam papers you want to review together..."
                  className="bg-muted/50 border-border text-xs rounded-xl min-h-[80px]"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setIsRequestSessionOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingRequest} className="bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-[#c29f2f]">
                {isSubmittingRequest ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Video className="w-3.5 h-3.5 mr-1" />}
                Send Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. TUTOR PROFILE MODAL */}
      <Dialog open={isTutorInfoOpen} onOpenChange={setIsTutorInfoOpen}>
        <DialogContent className="sm:max-w-[420px] bg-card border-border rounded-3xl p-6 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-[#D4AF37] flex items-center gap-2">
              <User size={18} /> Tutor Profile
            </DialogTitle>
          </DialogHeader>

          {currentTutor && (
            <div className="space-y-4 py-3">
              <div className="flex items-center gap-4 p-3 bg-muted/40 rounded-2xl border border-border">
                <Avatar className="w-14 h-14 border-2 border-[#D4AF37]">
                  <AvatarImage src={currentTutor.avatar_url} />
                  <AvatarFallback className="text-base font-bold">{currentTutor.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-foreground truncate">{currentTutor.full_name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{currentTutor.email}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Badge variant="outline" className="text-[9px] border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/10">
                      Personal Tutor
                    </Badge>
                    <span className="text-[10px] text-green-400 flex items-center gap-1 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Assigned Subject</span>
                <p className="text-xs font-semibold text-foreground">{currentSubject?.name} ({currentSubject?.level})</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsTutorInfoOpen(false)} className="w-full bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-[#c29f2f]">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}} />
    </div>
  );
}

// Sparkline SVG Helper
function Sparkline({ color, path }: { color: string, path?: string }) {
  const dPath = path || "M0,25 C10,20 20,28 30,15 C40,5 50,22 60,10 C70,0 80,18 90,8 L100,5";
  return (
    <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
      <path 
        d={dPath} 
        fill="none" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
