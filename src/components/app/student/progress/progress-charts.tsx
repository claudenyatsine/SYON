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
import React, { useEffect, useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';

// Mock Data for Area Chart (Progress Overview)
const areaData = [
  { day: '1', value: 20 },
  { day: '5', value: 25 },
  { day: '10', value: 28 },
  { day: '15', value: 50 },
  { day: '20', value: 50 },
  { day: '25', value: 65 },
  { day: '30', value: 95 },
];

// Mock Data for Weekly Activity
const activityData = [
  { name: 'Courses Viewed', value: 45, color: '#f59e0b' },
  { name: 'Assignments Done', value: 25, color: '#3b82f6' },
  { name: 'Discussions Joined', value: 20, color: '#ec4899' },
  { name: 'Live Sessions', value: 10, color: '#8b5cf6' },
];

// Mock Data for Upcoming Deadlines (Fallback)
const initialDeadlinesData = [
  { course: 'History', subject_id: '84897f2d-8b01-443b-aa58-5d2bc51d8b76', date: '2026-06-15', type: 'Essay on World War II', status: 'Pending', priority: 'High', color: 'bg-gold' },
  { course: 'Geography', subject_id: 'e44c6883-93bb-403d-aa8c-7f5dd17c0a87', date: '2026-06-20', type: 'Map Reading Quiz', status: 'Not Started', priority: 'Medium', color: 'bg-gold' },
  { course: 'Divinity', subject_id: '', date: '2026-07-05', type: 'Theological Project', status: 'In Progress', priority: 'High', color: 'bg-gold' },
];

export function ProgressCharts() {
  const { profile } = useUser();
  const [loading, setLoading] = useState(true);
  
  // Real data state
  const [coursesEnrolled, setCoursesEnrolled] = useState(0);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState<{id: string, name: string}[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const months = React.useMemo(() => {
    const result = [];
    const d = new Date();
    for (let i = 0; i < 6; i++) {
      result.push({
        value: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString('default', { month: 'long', year: 'numeric' })
      });
      d.setMonth(d.getMonth() - 1);
    }
    return result;
  }, []);
  const [selectedMonth, setSelectedMonth] = useState<string>(months[0].value);

  const supabase = React.useMemo(() => createClient(), []);

  const fetchProgressData = React.useCallback(async () => {
    if (!profile?.id) return;

    const [enrollmentsResult, assignmentsResult, deadlinesResult] = await Promise.all([
      supabase.from('enrollments').select('id, subject:subjects(id, name)').eq('student_id', profile.id),
      supabase.from('student_assignments').select('status, total_score').eq('student_id', profile.id),
      supabase.from('student_deadlines').select(`
        id, title, due_date, status, subject_id,
        subject:subjects(name)
      `).eq('student_id', profile.id).order('due_date', { ascending: true })
    ]);

    if (enrollmentsResult.data) {
      setCoursesEnrolled(enrollmentsResult.data.length);
      const subjects = enrollmentsResult.data
        .filter((e: any) => e.subject)
        .map((e: any) => ({ id: e.subject.id, name: e.subject.name }));
      setEnrolledSubjects(subjects);
    }

    if (assignmentsResult.data) {
      const completedCount = assignmentsResult.data.filter((p: any) => p.status === 'completed').length;
      setLessonsCompleted(completedCount);

      const scoredItems = assignmentsResult.data.filter((p: any) => p.total_score !== null);
      if (scoredItems.length > 0) {
        const totalScore = scoredItems.reduce((acc: number, curr: any) => acc + curr.total_score, 0);
        setAverageScore(Math.round(totalScore / scoredItems.length));
      }
    }

    if (deadlinesResult.data && deadlinesResult.data.length > 0) {
      const formattedDeadlines = deadlinesResult.data.map((d: any, index) => {
        const colors = ['bg-gold', 'bg-gold', 'bg-gold', 'bg-gold'];
        return {
          id: d.id,
          subject_id: d.subject_id,
          course: d.subject?.name || 'Unknown Subject',
          date: new Date(d.due_date).toISOString().split('T')[0],
          type: d.title,
          status: d.status === 'completed' ? 'Completed' : d.status === 'pending' ? 'Pending' : 'Overdue',
          priority: 'High',
          color: colors[index % colors.length]
        };
      });
      setDeadlines(formattedDeadlines);
    } else {
      // Use fallback if no real deadlines exist yet
      setDeadlines(initialDeadlinesData);
    }
    
    setLoading(false);
  }, [profile?.id, supabase]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Highlights Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Highlights</h2>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 rounded-full hover:bg-muted">
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </Button>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="rounded-[1.5rem] border-border/60 dark:border-border/60 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                 <GraduationCap className="w-4 h-4" />
                 Courses Enrolled
               </div>
               <Badge variant="secondary" className="bg-gold/20 text-gold hover:bg-gold/30 dark:bg-gold/30 dark:text-gold border-none rounded-sm px-1.5 text-[10px]">+12%</Badge>
            </div>
            <div className="flex items-end justify-between">
               <span className="text-4xl font-bold">{coursesEnrolled.toString().padStart(2, '0')}</span>
               {/* Mini Bar Chart Mock */}
               <div className="flex items-end gap-1 h-8">
                 <div className="w-2 bg-gold rounded-t-sm h-[40%]"></div>
                 <div className="w-2 bg-gold rounded-t-sm h-[60%]"></div>
                 <div className="w-2 bg-gold rounded-t-sm h-[80%]"></div>
                 <div className="w-2 bg-gold rounded-t-sm h-[100%]"></div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="rounded-[1.5rem] border-border/60 dark:border-border/60 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                 <CheckCircle2 className="w-4 h-4" />
                 Lessons Completed
               </div>
               <Badge variant="secondary" className="bg-gold/20 text-gold hover:bg-gold/30 dark:bg-gold/30 dark:text-gold border-none rounded-sm px-1.5 text-[10px]">+5%</Badge>
            </div>
            <div className="flex items-end justify-between">
               <span className="text-4xl font-bold">{lessonsCompleted}</span>
               {/* Mini Line Chart Mock */}
               <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M2 18L12 12L20 15L38 2" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="rounded-[1.5rem] border-border/60 dark:border-border/60 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                 <Flag className="w-4 h-4" />
                 Average Score
               </div>
               <Badge variant="secondary" className="bg-gold/20 text-gold hover:bg-gold/30 dark:bg-gold/30 dark:text-gold border-none rounded-sm px-1.5 text-[10px]">+10%</Badge>
            </div>
            <div className="flex items-end justify-between">
               <span className="text-4xl font-bold">{averageScore}%</span>
               {/* Mini Chart Mock */}
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

        {/* Card 4 */}
        <Card className="rounded-[1.5rem] border-border/60 dark:border-border/60 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                 <Zap className="w-4 h-4" />
                 Learning Streak
               </div>
               <Badge variant="secondary" className="bg-gold/20 text-gold hover:bg-gold/30 dark:bg-gold/30 dark:text-gold border-none rounded-sm px-1.5 text-[10px]">+6%</Badge>
            </div>
            <div className="flex items-end justify-between">
               <span className="text-4xl font-bold">07<span className="text-lg font-medium text-muted-foreground ml-1">Days</span></span>
               {/* Mini Streak Circles */}
               <div className="flex items-center gap-1 mb-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-gold"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-gold"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-gold"></div>
                 <div className="w-2.5 h-2.5 rounded-full border border-border dark:border-border"></div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart: Progress Overview */}
        <Card className="lg:col-span-2 rounded-[1.5rem] border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-lg">Progress Overview</h3>
                <p className="text-sm text-muted-foreground">Your learning activity and completion trends.</p>
              </div>
              <div className="flex gap-2 mt-4 sm:mt-0">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="h-8 text-xs font-medium rounded-full bg-transparent border-input hover:bg-accent hover:text-accent-foreground min-w-[140px]">
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
                  <SelectTrigger className="h-8 text-xs font-medium rounded-full bg-transparent border-input hover:bg-accent hover:text-accent-foreground min-w-[120px]">
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
                <AreaChart data={areaData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
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
                          <div className="bg-white dark:bg-background border border-border dark:border-border p-3 rounded-xl shadow-lg flex flex-col gap-1 min-w-[120px]">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-muted-foreground">Oct 15, 2025</span>
                              <span className="text-[10px] text-gold bg-gold px-1 rounded font-bold">+5%</span>
                            </div>
                            <span className="font-bold text-lg">{payload[0].value}%</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorProgress)" 
                    activeDot={{ r: 6, fill: "#f97316", stroke: "#fff", strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Weekly Activity Split */}
        <Card className="rounded-[1.5rem] border-border/60 shadow-sm flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-base flex items-center gap-2">
                <PieChart className="w-4 h-4 text-muted-foreground" />
                Weekly Activity Split
              </h3>
              <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon" className="w-6 h-6 rounded border"><Search className="w-3 h-3" /></Button>
                 <Button variant="ghost" size="icon" className="w-6 h-6 rounded border"><ChevronRight className="w-3 h-3" /></Button>
              </div>
            </div>

            <div className="relative flex-1 flex items-center justify-center min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-medium text-muted-foreground">Total Hrs</span>
                <span className="text-3xl font-bold">42</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mt-4">
              {activityData.map((item, i) => (
                 <div key={i} className="flex items-center gap-2 text-[10px] sm:text-xs">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                   <span className="text-muted-foreground truncate">{item.name}: {item.value}%</span>
                 </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Table: Upcoming Deadlines */}
        <Card className="xl:col-span-2 rounded-[1.5rem] border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border dark:border-border/50 gap-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                 <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
                    <path d="M13 1V15M1 1V15M1 4H13M1 12H13M4 1L10 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
                 Upcoming Deadlines
              </h3>
              <div className="flex gap-2">
                 <Button variant="outline" size="sm" className="rounded-md h-8 text-xs gap-1"><Search className="w-3 h-3" /></Button>
                 <Button variant="outline" size="sm" className="rounded-md h-8 text-xs gap-1"><ArrowDownWideNarrow className="w-3 h-3" /> Sort</Button>
                 <Button variant="outline" size="sm" className="rounded-md h-8 text-xs gap-1"><Filter className="w-3 h-3" /> Filter</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50/50 dark:bg-background/50 text-muted-foreground text-xs font-medium">
                  <tr>
                    <th className="px-6 py-4 font-medium">Course / Task</th>
                    <th className="px-6 py-4 font-medium">Due Date</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                  {deadlines.map((row, i) => (
                    <tr key={i} className="hover:bg-neutral-50/50 dark:hover:bg-background/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${row.color}`}></div>
                          <Link href={row.subject_id ? `/student/courses/${row.subject_id}` : '#'} className="hover:underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-4">
                            <span className="font-medium text-foreground dark:text-foreground/">{row.course}</span>
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{row.date}</td>
                      <td className="px-6 py-4 text-muted-foreground">{row.type}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                          row.status === 'Pending' ? 'text-gold bg-gold/20 dark:bg-gold/20 dark:text-gold' :
                          row.status === 'Not Started' ? 'text-gold bg-gold/20 dark:bg-gold/20 dark:text-gold' :
                          'text-gold bg-gold/20 dark:bg-gold/20 dark:text-gold'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{row.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
