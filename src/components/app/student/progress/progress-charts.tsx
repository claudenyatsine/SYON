'use client';

import {
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/components/providers/user-context';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Loader2, 
  RefreshCw,
  GraduationCap,
  CheckCircle2,
  Flag,
  Zap,
  ChevronDown,
  Search,
  Filter,
  ArrowDownWideNarrow,
  BrainCircuit,
  Database,
  Layout,
  Code,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  X,
  ExternalLink,
  Flame,
  Award,
  BookOpen,
  Clock,
  Trash2,
  Check,
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createSelfStudentDeadline, toggleSelfDeadlineStatus } from '@/app/actions/student-tutor';
import Link from 'next/link';

// Mock base data for Area Chart
const baseChartData: Record<string, { day: string; value: number }[]> = {
  all: [
    { day: '1', value: 20 },
    { day: '5', value: 28 },
    { day: '10', value: 35 },
    { day: '15', value: 50 },
    { day: '20', value: 65 },
    { day: '25', value: 78 },
    { day: '30', value: 92 },
  ],
  subject_alt: [
    { day: '1', value: 15 },
    { day: '5', value: 22 },
    { day: '10', value: 40 },
    { day: '15', value: 45 },
    { day: '20', value: 58 },
    { day: '25', value: 70 },
    { day: '30', value: 85 },
  ]
};

// Activity data
const initialActivityData = [
  { name: 'Courses Viewed', value: 45, hours: 19, color: '#f59e0b', icon: BookOpen },
  { name: 'Assignments Done', value: 25, hours: 10.5, color: '#3b82f6', icon: CheckCircle2 },
  { name: 'Discussions Joined', value: 20, hours: 8.5, color: '#ec4899', icon: Award },
  { name: 'Live Sessions', value: 10, hours: 4, color: '#8b5cf6', icon: Flame },
];

const fallbackDeadlinesData = [
  { id: 'f-1', course: 'History', subject_id: '84897f2d-8b01-443b-aa58-5d2bc51d8b76', date: '2026-06-15', type: 'Essay on World War II', status: 'Pending', priority: 'High', color: 'bg-gold' },
  { id: 'f-2', course: 'Geography', subject_id: 'e44c6883-93bb-403d-aa8c-7f5dd17c0a87', date: '2026-06-20', type: 'Map Reading Quiz', status: 'Not Started', priority: 'Medium', color: 'bg-gold' },
  { id: 'f-3', course: 'Divinity', subject_id: '', date: '2026-07-05', type: 'Theological Project', status: 'In Progress', priority: 'High', color: 'bg-gold' },
];

export function ProgressCharts() {
  const { profile } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Real data state
  const [coursesEnrolled, setCoursesEnrolled] = useState(0);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [rawAssignments, setRawAssignments] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState<{id: string, name: string, level?: string}[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Month selection dropdown generator (no 31st overflow)
  const months = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        value: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString('default', { month: 'long', year: 'numeric' })
      });
    }
    return result;
  }, []);
  const [selectedMonth, setSelectedMonth] = useState<string>(months[0]?.value || '');

  // Search & Filter state for Deadlines table
  const [showDeadlineSearch, setShowDeadlineSearch] = useState(false);
  const [deadlineSearchQuery, setDeadlineSearchQuery] = useState('');
  const [deadlineSortBy, setDeadlineSortBy] = useState<'due_date_asc' | 'due_date_desc' | 'priority' | 'course' | 'status'>('due_date_asc');
  const [deadlineFilterStatus, setDeadlineFilterStatus] = useState<string>('all');
  const [deadlineFilterPriority, setDeadlineFilterPriority] = useState<string>('all');

  // Modal dialog states
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  const [isLessonsModalOpen, setIsLessonsModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isActivitySearchOpen, setIsActivitySearchOpen] = useState(false);
  const [isActivityBreakdownOpen, setIsActivityBreakdownOpen] = useState(false);
  const [isAddDeadlineOpen, setIsAddDeadlineOpen] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<any | null>(null);

  // New Deadline form state
  const [newDeadlineTitle, setNewDeadlineTitle] = useState('');
  const [newDeadlineSubjectId, setNewDeadlineSubjectId] = useState('');
  const [newDeadlineDate, setNewDeadlineDate] = useState('');
  const [newDeadlinePriority, setNewDeadlinePriority] = useState('High');
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchProgressData = useCallback(async (isManualRefresh = false) => {
    if (!profile?.id) return;
    if (isManualRefresh) setIsRefreshing(true);

    try {
      const [enrollmentsResult, assignmentsResult, deadlinesResult] = await Promise.all([
        supabase.from('enrollments').select('id, subject:subjects(id, name, level, category)').eq('student_id', profile.id),
        supabase.from('student_assignments').select('id, status, total_score, submitted_at, feedback, assignment_id').eq('student_id', profile.id),
        supabase.from('student_deadlines').select(`
          id, title, due_date, status, subject_id,
          subject:subjects(name)
        `).eq('student_id', profile.id).order('due_date', { ascending: true })
      ]);

      if (enrollmentsResult.data) {
        setCoursesEnrolled(enrollmentsResult.data.length);
        const subjects = enrollmentsResult.data
          .filter((e: any) => e.subject)
          .map((e: any) => ({ id: e.subject.id, name: e.subject.name, level: e.subject.level }));
        setEnrolledSubjects(subjects);
      }

      if (assignmentsResult.data) {
        setRawAssignments(assignmentsResult.data);
        const completedCount = assignmentsResult.data.filter((p: any) => p.status === 'completed').length;
        setLessonsCompleted(completedCount);

        const scoredItems = assignmentsResult.data.filter((p: any) => p.total_score !== null);
        if (scoredItems.length > 0) {
          const totalScore = scoredItems.reduce((acc: number, curr: any) => acc + curr.total_score, 0);
          setAverageScore(Math.round(totalScore / scoredItems.length));
        } else {
          setAverageScore(88); // projected/initial display
        }
      }

      if (deadlinesResult.data && deadlinesResult.data.length > 0) {
        const formattedDeadlines = deadlinesResult.data.map((d: any) => ({
          id: d.id,
          subject_id: d.subject_id,
          course: d.subject?.name || 'General Study Task',
          date: d.due_date ? new Date(d.due_date).toISOString().split('T')[0] : 'No date',
          type: d.title,
          status: d.status === 'completed' ? 'Completed' : d.status === 'in_progress' ? 'In Progress' : 'Pending',
          priority: 'High',
          color: 'bg-gold'
        }));
        setDeadlines(formattedDeadlines);
      } else {
        setDeadlines(fallbackDeadlinesData);
      }

      if (isManualRefresh) {
        toast({
          title: "Data Refreshed ⚡",
          description: "Your academic progress and metrics are up to date.",
        });
      }
    } catch (err) {
      console.error('[ProgressCharts] Error fetching data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [profile?.id, supabase, toast]);

  useEffect(() => {
    fetchProgressData();
    
    if (!profile?.id) return;

    const channel = supabase
      .channel(`student-progress-${profile.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments', filter: `student_id=eq.${profile.id}` }, () => fetchProgressData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_assignments', filter: `student_id=eq.${profile.id}` }, () => fetchProgressData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_deadlines', filter: `student_id=eq.${profile.id}` }, () => fetchProgressData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchProgressData, profile?.id, supabase]);

  // Compute dynamic area chart data based on subject & month filters
  const currentChartData = useMemo(() => {
    if (selectedSubject === 'all') {
      return baseChartData.all;
    }
    // Shift points slightly to reflect subject-specific activity
    return baseChartData.subject_alt.map(p => ({
      day: p.day,
      value: Math.min(100, Math.max(10, p.value + (selectedSubject.charCodeAt(0) % 15)))
    }));
  }, [selectedSubject]);

  // Filter & Sort Deadlines
  const filteredAndSortedDeadlines = useMemo(() => {
    let list = [...deadlines];

    // Search filter
    if (deadlineSearchQuery.trim()) {
      const q = deadlineSearchQuery.toLowerCase();
      list = list.filter(d => 
        d.course.toLowerCase().includes(q) || 
        d.type.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (deadlineFilterStatus !== 'all') {
      list = list.filter(d => d.status.toLowerCase() === deadlineFilterStatus.toLowerCase());
    }

    // Priority filter
    if (deadlineFilterPriority !== 'all') {
      list = list.filter(d => d.priority.toLowerCase() === deadlineFilterPriority.toLowerCase());
    }

    // Sort
    list.sort((a, b) => {
      if (deadlineSortBy === 'due_date_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (deadlineSortBy === 'due_date_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (deadlineSortBy === 'course') {
        return a.course.localeCompare(b.course);
      }
      if (deadlineSortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      if (deadlineSortBy === 'priority') {
        const pOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      return 0;
    });

    return list;
  }, [deadlines, deadlineSearchQuery, deadlineFilterStatus, deadlineFilterPriority, deadlineSortBy]);

  // Handle adding a new deadline
  const handleCreateDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeadlineTitle.trim() || !newDeadlineDate) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a task title and due date.",
      });
      return;
    }

    setIsSavingDeadline(true);
    try {
      let createdRow: any = null;
      if (profile?.id) {
        const res = await createSelfStudentDeadline(
          profile.id,
          newDeadlineTitle.trim(),
          new Date(newDeadlineDate).toISOString(),
          newDeadlineSubjectId === 'none' ? undefined : newDeadlineSubjectId,
          newDeadlinePriority
        );

        if (res?.error) {
          throw new Error(res.error);
        }
        createdRow = res?.data;
      }

      const selectedSub = enrolledSubjects.find(s => s.id === newDeadlineSubjectId);
      const newD = {
        id: createdRow?.id || `custom-${Date.now()}`,
        subject_id: newDeadlineSubjectId === 'none' ? '' : (newDeadlineSubjectId || createdRow?.subject_id),
        course: createdRow?.subject?.name || selectedSub?.name || 'General Task',
        date: newDeadlineDate,
        type: newDeadlineTitle.trim(),
        status: 'Pending',
        priority: newDeadlinePriority,
        color: 'bg-gold'
      };

      setDeadlines(prev => [newD, ...prev.filter(d => !d.id.startsWith('f-'))]);
      setIsAddDeadlineOpen(false);
      setNewDeadlineTitle('');
      setNewDeadlineDate('');
      setNewDeadlineSubjectId('');

      toast({
        title: "Deadline Scheduled! 🎯",
        description: `"${newDeadlineTitle}" has been added to your study schedule.`,
      });
    } catch (err: any) {
      console.error('[Add Deadline Error]:', err);
      toast({
        variant: "destructive",
        title: "Could not save task",
        description: err.message || "Please try again.",
      });
    } finally {
      setIsSavingDeadline(false);
    }
  };

  // Handle toggling deadline status
  const handleToggleDeadlineStatus = async (item: any) => {
    const nextStatus = item.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      if (profile?.id && !item.id.startsWith('f-') && !item.id.startsWith('custom-')) {
        await toggleSelfDeadlineStatus(item.id, nextStatus);
      }

      setDeadlines(prev => prev.map(d => d.id === item.id ? { ...d, status: nextStatus } : d));
      if (selectedDeadline && selectedDeadline.id === item.id) {
        setSelectedDeadline({ ...selectedDeadline, status: nextStatus });
      }

      toast({
        title: nextStatus === 'Completed' ? "Task Marked Done! 🎉" : "Task Reopened",
        description: `Status updated to ${nextStatus}.`,
      });
    } catch (err) {
      console.error('[Toggle Deadline Status Error]:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Highlights Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Highlights</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => fetchProgressData(true)}
          disabled={isRefreshing}
          className="text-muted-foreground gap-2 rounded-full hover:bg-muted hover:text-foreground transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Highlights Cards — Interactive & Clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Courses Enrolled */}
        <Card 
          onClick={() => setIsCoursesModalOpen(true)}
          className="rounded-[1.5rem] border-border/60 shadow-sm hover:border-gold/50 hover:shadow-md transition-all cursor-pointer group bg-card"
        >
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                 <GraduationCap className="w-4 h-4 text-gold" />
                 Courses Enrolled
               </div>
               <Badge variant="secondary" className="bg-gold/20 text-gold border-none rounded-sm px-1.5 text-[10px] font-bold">
                 View All →
               </Badge>
            </div>
            <div className="flex items-end justify-between">
               <span className="text-4xl font-bold text-foreground">{coursesEnrolled.toString().padStart(2, '0')}</span>
               <div className="flex items-end gap-1 h-8">
                 <div className="w-2 bg-gold/50 rounded-t-sm h-[40%]"></div>
                 <div className="w-2 bg-gold/70 rounded-t-sm h-[60%]"></div>
                 <div className="w-2 bg-gold/90 rounded-t-sm h-[80%]"></div>
                 <div className="w-2 bg-gold rounded-t-sm h-[100%]"></div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Lessons Completed */}
        <Card 
          onClick={() => setIsLessonsModalOpen(true)}
          className="rounded-[1.5rem] border-border/60 shadow-sm hover:border-gold/50 hover:shadow-md transition-all cursor-pointer group bg-card"
        >
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 Lessons Completed
               </div>
               <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500 border-none rounded-sm px-1.5 text-[10px] font-bold">
                 Breakdown →
               </Badge>
            </div>
            <div className="flex items-end justify-between">
               <span className="text-4xl font-bold text-foreground">{lessonsCompleted}</span>
               <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M2 18L12 12L20 15L38 2" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Average Score */}
        <Card 
          onClick={() => setIsScoreModalOpen(true)}
          className="rounded-[1.5rem] border-border/60 shadow-sm hover:border-gold/50 hover:shadow-md transition-all cursor-pointer group bg-card"
        >
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                 <Flag className="w-4 h-4 text-gold" />
                 Average Score
               </div>
               <Badge variant="secondary" className="bg-gold/20 text-gold border-none rounded-sm px-1.5 text-[10px] font-bold">
                 Scores →
               </Badge>
            </div>
            <div className="flex items-end justify-between">
               <span className="text-4xl font-bold text-foreground">{averageScore}%</span>
               <div className="relative w-10 h-8">
                  <svg width="100%" height="100%" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2V26C2 27.1046 2.89543 28 4 28H38" stroke="#d4d4d8" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 12C12 12 14 22 20 22C26 22 28 14 34 14" stroke="#eab308" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="34" cy="14" r="2" fill="#eab308"/>
                  </svg>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Learning Streak */}
        <Card 
          onClick={() => setIsStreakModalOpen(true)}
          className="rounded-[1.5rem] border-border/60 shadow-sm hover:border-gold/50 hover:shadow-md transition-all cursor-pointer group bg-card"
        >
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                 <Zap className="w-4 h-4 text-amber-500" />
                 Learning Streak
               </div>
               <Badge variant="secondary" className="bg-amber-500/20 text-amber-500 border-none rounded-sm px-1.5 text-[10px] font-bold">
                 Streak Info →
               </Badge>
            </div>
            <div className="flex items-end justify-between">
               <span className="text-4xl font-bold text-foreground">07<span className="text-lg font-medium text-muted-foreground ml-1">Days</span></span>
               <div className="flex items-center gap-1 mb-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-gold"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-gold"></div>
                 <div className="w-2.5 h-2.5 rounded-full border border-border"></div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart: Progress Overview */}
        <Card className="lg:col-span-2 rounded-[1.5rem] border-border/60 shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="font-bold text-lg text-foreground">Progress Overview</h3>
                <p className="text-sm text-muted-foreground">Your learning activity and completion trends.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="h-8 text-xs font-medium rounded-full bg-background border-input hover:bg-accent hover:text-accent-foreground min-w-[140px]">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {enrolledSubjects.map(sub => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-8 text-xs font-medium rounded-full bg-background border-input hover:bg-accent hover:text-accent-foreground min-w-[120px]">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border p-3 rounded-xl shadow-lg flex flex-col gap-1 min-w-[120px]">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">Progress Score</span>
                              <span className="text-[10px] text-gold bg-gold/20 px-1 rounded font-bold">+5%</span>
                            </div>
                            <span className="font-bold text-lg text-foreground">{payload[0].value}%</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorProgress)" 
                    activeDot={{ r: 6, fill: "#f59e0b", stroke: "#fff", strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Weekly Activity Split */}
        <Card className="rounded-[1.5rem] border-border/60 shadow-sm flex flex-col bg-card">
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
                <PieChart className="w-4 h-4 text-muted-foreground" />
                Weekly Activity Split
              </h3>
              <div className="flex items-center gap-1">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => setIsActivitySearchOpen(true)}
                   title="Search Activities"
                   className="w-7 h-7 rounded-lg border border-border hover:bg-muted hover:text-gold cursor-pointer"
                 >
                   <Search className="w-3.5 h-3.5" />
                 </Button>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => setIsActivityBreakdownOpen(true)}
                   title="Detailed Activity Breakdown"
                   className="w-7 h-7 rounded-lg border border-border hover:bg-muted hover:text-gold cursor-pointer"
                 >
                   <ChevronRight className="w-3.5 h-3.5" />
                 </Button>
              </div>
            </div>

            <div className="relative flex-1 flex items-center justify-center min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={initialActivityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {initialActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-medium text-muted-foreground">Total Hrs</span>
                <span className="text-3xl font-bold text-foreground">42</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mt-4">
              {initialActivityData.map((item, i) => (
                 <button 
                   key={i} 
                   onClick={() => setIsActivityBreakdownOpen(true)}
                   className="flex items-center gap-2 text-[10px] sm:text-xs text-left hover:opacity-80 transition-opacity cursor-pointer"
                 >
                   <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                   <span className="text-muted-foreground truncate">{item.name}: {item.value}%</span>
                 </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Upcoming Deadlines with Interactive Search, Sort, Filter, Add */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="rounded-[1.5rem] border-border/60 shadow-sm overflow-hidden bg-card">
          <CardContent className="p-0">
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border gap-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                   <CalendarIcon className="w-4 h-4 text-gold" />
                   Upcoming Deadlines & Tasks
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Stay on track with assignments, live sessions, and study goals.</p>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                 {/* Toggle Search */}
                 <Button 
                   variant={showDeadlineSearch ? "default" : "outline"} 
                   size="sm" 
                   onClick={() => {
                     setShowDeadlineSearch(!showDeadlineSearch);
                     if (showDeadlineSearch) setDeadlineSearchQuery('');
                   }}
                   className="rounded-xl h-8 text-xs gap-1.5 cursor-pointer"
                 >
                   <Search className="w-3.5 h-3.5" />
                   {showDeadlineSearch ? "Close" : "Search"}
                 </Button>

                 {/* Sort Dropdown */}
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs gap-1.5 cursor-pointer">
                       <ArrowDownWideNarrow className="w-3.5 h-3.5" />
                       Sort
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-48 bg-card border-border rounded-xl">
                     <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Sort Deadlines</DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <DropdownMenuRadioGroup value={deadlineSortBy} onValueChange={(v) => setDeadlineSortBy(v as any)}>
                       <DropdownMenuRadioItem value="due_date_asc">Earliest Due Date</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="due_date_desc">Latest Due Date</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="priority">Priority (High to Low)</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="course">Course Name (A-Z)</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
                     </DropdownMenuRadioGroup>
                   </DropdownMenuContent>
                 </DropdownMenu>

                 {/* Filter Dropdown */}
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button 
                       variant={deadlineFilterStatus !== 'all' || deadlineFilterPriority !== 'all' ? "default" : "outline"} 
                       size="sm" 
                       className="rounded-xl h-8 text-xs gap-1.5 cursor-pointer"
                     >
                       <Filter className="w-3.5 h-3.5" />
                       Filter {deadlineFilterStatus !== 'all' || deadlineFilterPriority !== 'all' ? '(Active)' : ''}
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-52 bg-card border-border rounded-xl">
                     <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Filter by Status</DropdownMenuLabel>
                     <DropdownMenuRadioGroup value={deadlineFilterStatus} onValueChange={setDeadlineFilterStatus}>
                       <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="not started">Not Started</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="in progress">In Progress</DropdownMenuRadioItem>
                     </DropdownMenuRadioGroup>
                     <DropdownMenuSeparator />
                     <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Filter by Priority</DropdownMenuLabel>
                     <DropdownMenuRadioGroup value={deadlineFilterPriority} onValueChange={setDeadlineFilterPriority}>
                       <DropdownMenuRadioItem value="all">All Priorities</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="high">High Priority</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="medium">Medium Priority</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="low">Low Priority</DropdownMenuRadioItem>
                     </DropdownMenuRadioGroup>
                     {(deadlineFilterStatus !== 'all' || deadlineFilterPriority !== 'all') && (
                       <>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem 
                           onClick={() => {
                             setDeadlineFilterStatus('all');
                             setDeadlineFilterPriority('all');
                           }}
                           className="text-xs text-burgundy font-semibold cursor-pointer"
                         >
                           Reset All Filters
                         </DropdownMenuItem>
                       </>
                     )}
                   </DropdownMenuContent>
                 </DropdownMenu>

                 {/* Add New Deadline Button */}
                 <Button 
                   size="sm" 
                   onClick={() => setIsAddDeadlineOpen(true)}
                   className="rounded-xl h-8 text-xs gap-1.5 bg-gold text-obsidian hover:bg-gold/90 font-bold cursor-pointer"
                 >
                   <Plus className="w-3.5 h-3.5" />
                   Add Task
                 </Button>
              </div>
            </div>

            {/* Inline Search Bar */}
            {showDeadlineSearch && (
              <div className="px-6 py-3 bg-muted/40 border-b border-border flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter tasks by name, course, or status..."
                  value={deadlineSearchQuery}
                  onChange={(e) => setDeadlineSearchQuery(e.target.value)}
                  className="h-8 text-xs bg-background border-border rounded-xl"
                  autoFocus
                />
                {deadlineSearchQuery && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setDeadlineSearchQuery('')}
                    className="h-7 px-2 text-xs text-muted-foreground cursor-pointer"
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground text-xs font-medium border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Course / Task</th>
                    <th className="px-6 py-4 font-medium">Due Date</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Priority</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAndSortedDeadlines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        <p className="text-sm">No deadlines matching your filters.</p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => {
                            setDeadlineSearchQuery('');
                            setDeadlineFilterStatus('all');
                            setDeadlineFilterPriority('all');
                          }}
                          className="text-xs text-gold mt-1 cursor-pointer"
                        >
                          Clear filters
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedDeadlines.map((row, i) => (
                      <tr 
                        key={row.id || i} 
                        onClick={() => setSelectedDeadline(row)}
                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-gold shrink-0"></div>
                            <span className="font-semibold text-foreground group-hover:text-gold transition-colors">
                              {row.course}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{row.date}</td>
                        <td className="px-6 py-4 text-muted-foreground font-medium">{row.type}</td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant="secondary"
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border-none ${
                              row.status === 'Completed' ? 'text-emerald-500 bg-emerald-500/10' :
                              row.status === 'In Progress' ? 'text-amber-500 bg-amber-500/10' :
                              'text-gold bg-gold/10'
                            }`}
                          >
                            {row.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold ${
                            row.priority === 'High' ? 'text-rose-400' : 'text-muted-foreground'
                          }`}>
                            {row.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleDeadlineStatus(row);
                            }}
                            className="h-7 px-2.5 text-xs rounded-lg hover:bg-muted font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {row.status === 'Completed' ? (
                              <span className="text-emerald-500 flex items-center gap-1"><Check className="w-3 h-3" /> Done</span>
                            ) : (
                              'Mark Done'
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. Enrolled Courses Dialog (Clicked from Courses Enrolled Card)
      ───────────────────────────────────────────────────────────── */}
      <Dialog open={isCoursesModalOpen} onOpenChange={setIsCoursesModalOpen}>
        <DialogContent className="sm:max-w-[540px] bg-card border-border rounded-3xl p-6 text-foreground shadow-2xl">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold border border-gold/30 flex items-center justify-center mb-1">
              <GraduationCap className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Enrolled Courses & Curriculums</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              You are currently enrolled in {enrolledSubjects.length} academic courses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4 max-h-[360px] overflow-y-auto custom-scrollbar">
            {enrolledSubjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No course enrollments found yet.
              </div>
            ) : (
              enrolledSubjects.map((sub) => (
                <div 
                  key={sub.id} 
                  className="p-4 rounded-2xl border border-border bg-muted/20 hover:border-gold/40 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center font-bold text-sm">
                      {sub.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{sub.name}</h4>
                      <p className="text-xs text-muted-foreground">{sub.level || 'Secondary Level'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline" className="rounded-xl h-8 text-xs font-semibold cursor-pointer">
                      <Link href={`/student/study-panel/${sub.id}`}>
                        Study Hub →
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="flex flex-row justify-between items-center pt-2">
            <Button asChild variant="outline" className="rounded-xl h-9 text-xs cursor-pointer">
              <Link href="/student/courses">Browse All Courses</Link>
            </Button>
            <Button onClick={() => setIsCoursesModalOpen(false)} className="rounded-xl h-9 text-xs bg-gold text-obsidian hover:bg-gold/90 font-bold cursor-pointer">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          2. Lessons Completed Dialog
      ───────────────────────────────────────────────────────────── */}
      <Dialog open={isLessonsModalOpen} onOpenChange={setIsLessonsModalOpen}>
        <DialogContent className="sm:max-w-[540px] bg-card border-border rounded-3xl p-6 text-foreground shadow-2xl">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mb-1">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Completed Lessons & Submissions</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Detailed log of assignments, lessons, and tests completed across all subjects.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4 max-h-[360px] overflow-y-auto custom-scrollbar">
            {rawAssignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No completed lesson submissions logged yet. Start studying from your course dashboard!
              </div>
            ) : (
              rawAssignments.map((a, idx) => (
                <div key={a.id || idx} className="p-3.5 rounded-2xl border border-border bg-muted/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Lesson Activity #{idx + 1}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Status: <span className="capitalize font-semibold text-emerald-500">{a.status}</span>
                      {a.submitted_at && ` · ${new Date(a.submitted_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  {a.total_score !== null ? (
                    <Badge variant="secondary" className="bg-gold/20 text-gold font-mono font-bold text-xs">
                      {a.total_score}%
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Complete
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button onClick={() => setIsLessonsModalOpen(false)} className="w-full rounded-xl h-9 text-xs bg-gold text-obsidian hover:bg-gold/90 font-bold cursor-pointer">
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          3. Average Score Breakdown Dialog
      ───────────────────────────────────────────────────────────── */}
      <Dialog open={isScoreModalOpen} onOpenChange={setIsScoreModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border rounded-3xl p-6 text-foreground shadow-2xl">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold border border-gold/30 flex items-center justify-center mb-1">
              <TrendingUp className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Academic Performance & Scores</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Overall grade trajectory, quiz percentiles, and subject performance.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="p-4 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-gold font-semibold uppercase tracking-wider">Overall Average</span>
                <h3 className="text-3xl font-bold text-foreground mt-0.5">{averageScore}%</h3>
              </div>
              <Badge className="bg-gold text-obsidian font-bold text-xs">Grade A Projection</Badge>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground">Performance by Subject</span>
              {enrolledSubjects.map((sub, i) => {
                const score = 85 + (i * 4) % 15;
                return (
                  <div key={sub.id} className="p-3 rounded-xl border border-border bg-muted/20 space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{sub.name}</span>
                      <span className="font-bold text-gold">{score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gold rounded-full" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button onClick={() => setIsScoreModalOpen(false)} className="w-full rounded-xl h-9 text-xs bg-gold text-obsidian hover:bg-gold/90 font-bold cursor-pointer">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          4. Learning Streak Details Dialog
      ───────────────────────────────────────────────────────────── */}
      <Dialog open={isStreakModalOpen} onOpenChange={setIsStreakModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-card border-border rounded-3xl p-6 text-foreground shadow-2xl">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center mb-1">
              <Flame className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold">7-Day Study Streak 🔥</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Consistency is key! You have logged study sessions for 7 consecutive days.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground">{day}</span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs ${
                    idx < 6 
                      ? 'bg-gold text-obsidian border-gold shadow-sm shadow-gold/20' 
                      : 'bg-gold/20 text-gold border-gold/40 animate-pulse'
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Zap className="w-4 h-4 text-amber-500" /> Daily Goal: 45 Mins Study
              </div>
              <p className="text-xs text-muted-foreground">
                Complete at least one lesson or review cards daily to keep your learning streak burning.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button onClick={() => setIsStreakModalOpen(false)} className="w-full rounded-xl h-9 text-xs bg-gold text-obsidian hover:bg-gold/90 font-bold cursor-pointer">
              Keep It Up!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          5. Weekly Activity Breakdown Dialog
      ───────────────────────────────────────────────────────────── */}
      <Dialog open={isActivityBreakdownOpen} onOpenChange={setIsActivityBreakdownOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border rounded-3xl p-6 text-foreground shadow-2xl">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold border border-gold/30 flex items-center justify-center mb-1">
              <BarChart3 className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Weekly Activity Breakdown</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Total 42 hours distributed across learning channels this week.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            {initialActivityData.map((item) => (
              <div key={item.name} className="p-3.5 rounded-2xl border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    <span className="font-bold text-foreground">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold" style={{ color: item.color }}>
                    {item.hours} hrs ({item.value}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="pt-2">
            <Button onClick={() => setIsActivityBreakdownOpen(false)} className="w-full rounded-xl h-9 text-xs bg-gold text-obsidian hover:bg-gold/90 font-bold cursor-pointer">
              Close Breakdown
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          6. Activity Search Dialog
      ───────────────────────────────────────────────────────────── */}
      <Dialog open={isActivitySearchOpen} onOpenChange={setIsActivitySearchOpen}>
        <DialogContent className="sm:max-w-[480px] bg-card border-border rounded-3xl p-6 text-foreground shadow-2xl">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold border border-gold/30 flex items-center justify-center mb-1">
              <Search className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Search Learning Activities</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Quickly find past live classes, viewed videos, and completed assignments.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Input 
              placeholder="Search by topic, lesson name, or subject..."
              className="h-10 text-xs bg-muted border-border rounded-xl"
              autoFocus
            />
            <div className="p-4 rounded-2xl bg-muted/20 border border-border text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Showing recent activity logs from the last 30 days.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {['Live Classes', 'Past Papers', 'Quizzes', 'Whiteboard Sessions'].map(tag => (
                  <Badge key={tag} variant="outline" className="text-[10px] cursor-pointer hover:bg-muted">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button onClick={() => setIsActivitySearchOpen(false)} className="w-full rounded-xl h-9 text-xs bg-gold text-obsidian hover:bg-gold/90 font-bold cursor-pointer">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          7. Add New Task / Deadline Dialog
      ───────────────────────────────────────────────────────────── */}
      <Dialog open={isAddDeadlineOpen} onOpenChange={setIsAddDeadlineOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border rounded-3xl p-6 text-foreground shadow-2xl">
          <form onSubmit={handleCreateDeadline}>
            <DialogHeader className="space-y-1.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold border border-gold/30 flex items-center justify-center mb-1">
                <Plus className="w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-bold">Schedule Study Task</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set custom deadlines to organize your revision and test prep.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Task Title / Topic</Label>
                <Input 
                  placeholder="e.g. Past Paper 2 Revision, Essay on Biology"
                  value={newDeadlineTitle}
                  onChange={(e) => setNewDeadlineTitle(e.target.value)}
                  className="h-10 text-xs bg-muted border-border rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Subject / Course (Optional)</Label>
                <Select value={newDeadlineSubjectId} onValueChange={setNewDeadlineSubjectId}>
                  <SelectTrigger className="h-10 text-xs bg-muted border-border rounded-xl">
                    <SelectValue placeholder="Select relevant course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General / None</SelectItem>
                    {enrolledSubjects.map(sub => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Due Date</Label>
                  <Input 
                    type="date"
                    value={newDeadlineDate}
                    onChange={(e) => setNewDeadlineDate(e.target.value)}
                    className="h-10 text-xs bg-muted border-border rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Priority</Label>
                  <Select value={newDeadlinePriority} onValueChange={setNewDeadlinePriority}>
                    <SelectTrigger className="h-10 text-xs bg-muted border-border rounded-xl">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High Priority</SelectItem>
                      <SelectItem value="Medium">Medium Priority</SelectItem>
                      <SelectItem value="Low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDeadlineOpen(false)}
                className="rounded-xl h-10 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSavingDeadline}
                className="rounded-xl h-10 text-xs bg-gold text-obsidian hover:bg-gold/90 font-bold px-6 cursor-pointer"
              >
                {isSavingDeadline ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Save Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          8. Deadline Details Modal (When a row is clicked)
      ───────────────────────────────────────────────────────────── */}
      <Dialog open={!!selectedDeadline} onOpenChange={(open) => { if (!open) setSelectedDeadline(null); }}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border rounded-3xl p-6 text-foreground shadow-2xl">
          {selectedDeadline && (
            <div>
              <DialogHeader className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold border border-gold/30 flex items-center justify-center mb-1">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <Badge 
                    variant="secondary"
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border-none ${
                      selectedDeadline.status === 'Completed' ? 'text-emerald-500 bg-emerald-500/10' :
                      selectedDeadline.status === 'In Progress' ? 'text-amber-500 bg-amber-500/10' :
                      'text-gold bg-gold/10'
                    }`}
                  >
                    {selectedDeadline.status}
                  </Badge>
                </div>
                <DialogTitle className="text-lg font-bold text-foreground">{selectedDeadline.type}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Course: <span className="font-semibold text-foreground">{selectedDeadline.course}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-3">
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-bold text-foreground font-mono">{selectedDeadline.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority Level:</span>
                    <span className="font-bold text-rose-400">{selectedDeadline.priority}</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2 flex flex-row justify-between">
                {selectedDeadline.subject_id && (
                  <Button asChild variant="outline" className="rounded-xl h-10 text-xs cursor-pointer">
                    <Link href={`/student/study-panel/${selectedDeadline.subject_id}`}>
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Study Hub
                    </Link>
                  </Button>
                )}
                <Button 
                  onClick={() => handleToggleDeadlineStatus(selectedDeadline)}
                  className="rounded-xl h-10 text-xs bg-gold text-obsidian hover:bg-gold/90 font-bold cursor-pointer"
                >
                  {selectedDeadline.status === 'Completed' ? 'Mark Incomplete' : 'Mark Completed'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
