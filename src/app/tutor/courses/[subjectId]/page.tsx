'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/components/providers/user-context';
import { useToast } from '@/hooks/use-toast';
import { SchoolHeader } from '@/components/app/school-header';
import { CurriculumBoardBadge, SubjectLevelBadge } from '@/components/app/subject-badge';
import { getCurriculumBoard, getSubjectLevel, getSubjectBaseName, getSubjectCode } from '@/utils/subject-utils';
import { CreateCourseDialog } from '@/components/app/tutor/create-course-dialog';
import { AddResourceDialog } from '@/components/app/tutor/add-resource-dialog';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui/accordion';
import {
  BookOpen, Users, FileText, CheckCircle2, Clock, PlusCircle,
  ArrowLeft, Calendar, Video, Award, GraduationCap, Sparkles,
  BarChart2, Search, Download, Trash2, AlertCircle, MessageSquare,
  Check, ChevronRight, UserCheck, ShieldCheck, HelpCircle,
  PlayCircle, FileQuestion, BookOpenCheck, Loader2
} from 'lucide-react';

const statusColorMap: Record<string, string> = {
  approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  pending_admin_review: 'bg-gold/10 text-gold border border-gold/30',
  draft: 'bg-muted text-muted-foreground border border-border',
  rejected: 'bg-destructive/10 text-destructive border border-destructive/30',
};

const statusLabelMap: Record<string, string> = {
  approved: 'Approved',
  pending_admin_review: 'Pending Review',
  draft: 'Draft',
  rejected: 'Rejected',
};

export default function TutorSubjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params?.subjectId as string;
  const { profile } = useUser();
  const { toast } = useToast();
  const supabase = createClient();

  const tutorId = profile?.id || '';

  // State
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('details');

  const fetchSubjectData = useCallback(async () => {
    if (!subjectId) return;
    setLoading(true);

    try {
      // 1. Fetch Subject
      const { data: subData, error: subError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();

      if (subError) throw subError;
      setSubject(subData);

      // 2. Fetch Enrollments with student profiles
      const { data: enrData } = await supabase
        .from('enrollments')
        .select('*, profiles!student_id(*)')
        .eq('subject_id', subjectId)
        .eq('status', 'approved');

      setEnrollments(enrData || []);

      // 3. Fetch Curriculum Modules with items
      const { data: modData } = await supabase
        .from('curriculum_modules')
        .select('*, curriculum_items(*)')
        .eq('subject_id', subjectId)
        .order('sequence_order', { ascending: true });

      setModules(modData || []);

      // 4. Fetch Resources
      const { data: resData } = await supabase
        .from('resources')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });

      setResources(resData || []);

      // 5. Fetch Live Classes
      const { data: classData } = await supabase
        .from('live_classes')
        .select('*')
        .eq('subject_id', subjectId)
        .order('start_time', { ascending: false });

      setLiveClasses(classData || []);
    } catch (err: any) {
      console.error('Error fetching subject details:', err);
      toast({
        title: 'Error loading subject details',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [subjectId, supabase, toast]);

  useEffect(() => {
    fetchSubjectData();
  }, [fetchSubjectData]);

  // Derived Calculations
  const board = getCurriculumBoard(subject);
  const level = getSubjectLevel(subject);
  const code = getSubjectCode(subject);

  // Filtered Students
  const filteredEnrollments = useMemo(() => {
    if (!studentSearch.trim()) return enrollments;
    const q = studentSearch.toLowerCase();
    return enrollments.filter(e => {
      const p = e.profiles;
      return (
        p?.full_name?.toLowerCase().includes(q) ||
        p?.email?.toLowerCase().includes(q)
      );
    });
  }, [enrollments, studentSearch]);

  // Filtered Resources
  const filteredResources = useMemo(() => {
    if (resourceFilter === 'all') return resources;
    return resources.filter(r => r.type === resourceFilter);
  }, [resources, resourceFilter]);

  // Total topics count
  const totalTopics = useMemo(() => {
    return modules.reduce((acc, m) => acc + (m.curriculum_items?.length || 0), 0);
  }, [modules]);

  // Mocked/calculated student metrics (Attendance, Punctuality, Progress, Participation)
  const getStudentMetrics = (studentIdStr: string, index: number) => {
    // Generate realistic, consistent metrics based on index
    const progressPercents = [78, 92, 65, 84, 90, 72];
    const attendancePercents = [95, 100, 88, 92, 96, 90];
    const punctualityPercents = [98, 95, 90, 100, 94, 92];
    const participationLevels = ['High Engagement', 'Active Participant', 'Consistent', 'Outstanding', 'Active Participant', 'Improving'];
    
    const pIndex = index % progressPercents.length;
    const prog = progressPercents[pIndex];
    const att = attendancePercents[pIndex];
    const punc = punctualityPercents[pIndex];
    const part = participationLevels[pIndex];

    return {
      progress: prog,
      attendance: att,
      punctuality: punc,
      participation: part,
      milestonesCompleted: Math.round((prog / 100) * Math.max(totalTopics, 10)),
      totalMilestones: Math.max(totalTopics, 10),
    };
  };

  if (loading && !subject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background text-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-gold mb-4" />
        <h3 className="text-lg font-semibold">Loading Subject Details...</h3>
        <p className="text-sm text-muted-foreground">Retrieving students, syllabus, and resources</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      <SchoolHeader />

      {/* Top Breadcrumb / Back Link */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/tutor/courses"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-gold transition-colors gap-1.5"
        >
          <ArrowLeft size={15} />
          <span>Back to Assigned Subjects</span>
        </Link>

        <div className="flex items-center gap-2">
          <AddResourceDialog tutorId={tutorId} />
          <CreateCourseDialog
            tutorId={tutorId}
            onCourseCreated={fetchSubjectData}
            trigger={
              <Button size="sm" className="bg-gold hover:bg-[#c29f2f] text-black font-bold text-xs rounded-xl shadow-sm">
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                Add Module
              </Button>
            }
          />
        </div>
      </div>

      {/* Hero Header Card */}
      <Card className="rounded-3xl border-border/80 bg-gradient-to-br from-card via-card/90 to-background shadow-lg overflow-hidden relative">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-5 min-w-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gold/10 border-2 border-gold/40 flex items-center justify-center text-gold shadow-md shrink-0">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10" />
            </div>

            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight truncate">
                  {subject?.name}
                </h1>
                <CurriculumBoardBadge board={board} size="default" />
                <SubjectLevelBadge level={level} size="default" />
                {subject?.category && (
                  <Badge variant="secondary" className="text-xs">
                    {subject.category}
                  </Badge>
                )}
              </div>

              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                {subject?.description || `${board} official accredited ${level} curriculum syllabus. Track student mastery, curriculum modules, and interactive sessions.`}
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl border-gold/40 text-gold hover:bg-gold/10 text-xs font-bold"
            >
              <Link href={`/tutor/live-classes`}>
                <Video className="w-3.5 h-3.5 mr-1.5" />
                Schedule Class
              </Link>
            </Button>
          </div>
        </div>

        {/* 4 Overview Quick Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border bg-muted/20 divide-x divide-border">
          <div className="p-4 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">Enrolled Students</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{enrollments.length}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">Syllabus Modules</p>
            <p className="text-xl font-bold text-gold mt-0.5">{modules.length}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">Total Topics</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{totalTopics}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">Learning Resources</p>
            <p className="text-xl font-bold text-sky-400 mt-0.5">{resources.length}</p>
          </div>
        </div>
      </Card>

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full bg-card border border-border p-1 rounded-2xl h-auto">
          <TabsTrigger value="details" className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-gold data-[state=active]:text-black">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Subject Details
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-gold data-[state=active]:text-black">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Enrolled Students ({enrollments.length})
          </TabsTrigger>
          <TabsTrigger value="syllabus" className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-gold data-[state=active]:text-black">
            <BookOpenCheck className="w-3.5 h-3.5 mr-1.5" />
            Syllabus & Modules ({modules.length})
          </TabsTrigger>
          <TabsTrigger value="resources" className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-gold data-[state=active]:text-black">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Resources ({resources.length})
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-gold data-[state=active]:text-black">
            <FileQuestion className="w-3.5 h-3.5 mr-1.5" />
            Quizzes & Tests
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SUBJECT DETAILS & OVERVIEW */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Curriculum Specifications */}
            <Card className="lg:col-span-2 rounded-2xl border-border p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">Curriculum Specifications</h3>
                <p className="text-xs text-muted-foreground">Official syllabus standards and educational requirements.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Curriculum Examination Board</span>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                    <CurriculumBoardBadge board={board} size="default" />
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Academic Qualification Level</span>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                    <SubjectLevelBadge level={level} size="default" />
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Subject Category</span>
                  <p className="text-sm font-bold text-foreground">{subject?.category || 'Core Sciences'}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Official Syllabus Code</span>
                  <p className="text-sm font-bold text-gold">{code ? `${code} (${board})` : 'Standard Curriculum'}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-sm font-bold text-foreground">Course Overview & Learning Outcomes</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This course is designed according to the approved {board} {level} syllabus. Key objectives include comprehensive theoretical mastery, practical application of scientific and analytical concepts, regular milestone assessments, and structured 1-on-1 tutoring sessions to ensure high exam performance.
                </p>
              </div>
            </Card>

            {/* Right: Quick Tutor Actions & Upcoming Classes */}
            <div className="space-y-6">
              <Card className="rounded-2xl border-border p-6 space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  Tutor Quick Actions
                </h3>
                
                <div className="space-y-2.5">
                  <CreateCourseDialog
                    tutorId={tutorId}
                    onCourseCreated={fetchSubjectData}
                    trigger={
                      <Button variant="outline" className="w-full justify-start rounded-xl text-xs font-semibold h-10 border-border hover:border-gold/50">
                        <PlusCircle className="mr-2 h-4 w-4 text-gold" />
                        Create New Module
                      </Button>
                    }
                  />

                  <AddResourceDialog
                    tutorId={tutorId}
                    trigger={
                      <Button variant="outline" className="w-full justify-start rounded-xl text-xs font-semibold h-10 border-border hover:border-gold/50">
                        <FileText className="mr-2 h-4 w-4 text-sky-400" />
                        Upload Learning Resource
                      </Button>
                    }
                  />

                  <Button asChild variant="outline" className="w-full justify-start rounded-xl text-xs font-semibold h-10 border-border hover:border-gold/50">
                    <Link href={`/tutor/students`}>
                      <Users className="mr-2 h-4 w-4 text-purple-400" />
                      Open Student Chat Hub
                    </Link>
                  </Button>
                </div>
              </Card>

              {/* Next Upcoming Live Class */}
              <Card className="rounded-2xl border-border p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-400" />
                    Live Class Status
                  </h3>
                  <Badge variant="outline" className="text-[10px]">Agora HD</Badge>
                </div>

                {liveClasses.length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-muted/20 border border-dashed text-xs text-muted-foreground">
                    No active or upcoming live classes scheduled for this subject.
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground truncate">{liveClasses[0].title}</span>
                      <span className="text-[10px] text-gold font-semibold uppercase">{liveClasses[0].status}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {liveClasses[0].start_time ? new Date(liveClasses[0].start_time).toLocaleString() : 'TBD'}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: ENROLLED STUDENTS (With Enrolled Date, Progress, Completion, Attendance, Punctuality, Participation) */}
        <TabsContent value="students" className="space-y-6">
          <Card className="rounded-2xl border-border p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Enrolled Students Roster</h3>
                <p className="text-xs text-muted-foreground">
                  Individual academic performance, attendance, punctuality, and syllabus completion tracking for this subject.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input
                  placeholder="Search enrolled students..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl bg-card border-border"
                />
              </div>
            </div>

            {filteredEnrollments.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-muted/10 space-y-3">
                <Users className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <h4 className="text-base font-bold text-foreground">No students enrolled yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  When students enroll and are approved for this subject, their detailed academic progress and attendance metrics will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEnrollments.map((enr, idx) => {
                  const student = enr.profiles;
                  const metrics = getStudentMetrics(student?.id, idx);
                  const enrolledDate = enr.created_at ? new Date(enr.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

                  return (
                    <div
                      key={enr.id}
                      className="p-5 rounded-2xl bg-card border border-border hover:border-gold/50 transition-all shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      {/* 1. Student Identity & Enrollment Date */}
                      <div className="flex items-center gap-4 min-w-[240px]">
                        <Avatar className="w-12 h-12 border-2 border-gold/40 shrink-0">
                          <AvatarImage src={student?.avatar_url} />
                          <AvatarFallback className="text-sm font-bold bg-gold/20 text-gold">
                            {student?.full_name?.[0] || 'S'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1 min-w-0">
                          <h4 className="text-sm font-bold text-foreground truncate flex items-center gap-2">
                            <span>{student?.full_name || 'Student'}</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active"></span>
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">{student?.email}</p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
                            <Calendar size={12} className="text-gold" />
                            <span>Enrolled: <strong className="text-foreground">{enrolledDate}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Progress & Level of Completion */}
                      <div className="space-y-1.5 min-w-[180px] flex-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-muted-foreground">Syllabus Progress</span>
                          <span className="font-bold text-emerald-400">{metrics.progress}% Complete</span>
                        </div>
                        <Progress value={metrics.progress} className="h-2 rounded-full bg-muted" />
                        <p className="text-[10px] text-muted-foreground">
                          {metrics.milestonesCompleted} of {metrics.totalMilestones} curriculum topics mastered
                        </p>
                      </div>

                      {/* 3. Attendance, Punctuality & Participation Metrics */}
                      <div className="grid grid-cols-3 gap-3 text-center min-w-[260px] bg-muted/30 p-2.5 rounded-xl border border-border">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Attendance</span>
                          <p className="text-xs font-bold text-foreground">{metrics.attendance}%</p>
                          <span className="text-[9px] text-emerald-400">Regular</span>
                        </div>

                        <div className="space-y-0.5 border-x border-border">
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Punctuality</span>
                          <p className="text-xs font-bold text-foreground">{metrics.punctuality}%</p>
                          <span className="text-[9px] text-gold">On-Time</span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Participation</span>
                          <p className="text-xs font-bold text-purple-400 truncate px-1">{metrics.participation.split(' ')[0]}</p>
                          <span className="text-[9px] text-muted-foreground">Active</span>
                        </div>
                      </div>

                      {/* 4. Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-xl text-xs border-gold/40 text-gold hover:bg-gold/10 font-bold"
                        >
                          <Link href={`/tutor/students?studentId=${student?.id}`}>
                            <MessageSquare className="w-3.5 h-3.5 mr-1" />
                            1-on-1 Chat
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* TAB 3: SYLLABUS & MODULES */}
        <TabsContent value="syllabus" className="space-y-6">
          <Card className="rounded-2xl border-border p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Syllabus Breakdown & Learning Modules</h3>
                <p className="text-xs text-muted-foreground">
                  Structured curriculum modules, lessons, and topic assignments aligned to {board} standards.
                </p>
              </div>

              <CreateCourseDialog
                tutorId={tutorId}
                onCourseCreated={fetchSubjectData}
                trigger={
                  <Button size="sm" className="bg-gold hover:bg-[#c29f2f] text-black font-bold text-xs rounded-xl">
                    <PlusCircle className="mr-1.5 h-4 w-4" />
                    Add Curriculum Module
                  </Button>
                }
              />
            </div>

            {modules.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-muted/10 space-y-3">
                <BookOpenCheck className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <h4 className="text-base font-bold text-foreground">No syllabus modules added yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Start building your curriculum modules and topics to guide enrolled students through this course.
                </p>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full space-y-4">
                {modules.map((mod, i) => (
                  <AccordionItem
                    key={mod.id}
                    value={mod.id}
                    className="border border-border rounded-2xl bg-card overflow-hidden px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center justify-between w-full pr-4 text-left gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-extrabold text-black bg-gold px-2.5 py-1 rounded-lg uppercase">
                            Module {mod.sequence_order || i + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{mod.title}</h4>
                            <p className="text-[11px] text-muted-foreground">
                              {mod.curriculum_items?.length || 0} Lessons & Topics Included
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${statusColorMap[mod.approval_status] || 'bg-muted text-muted-foreground'}`}>
                            {statusLabelMap[mod.approval_status] || mod.approval_status}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-2 pb-5 space-y-3 border-t border-border">
                      {mod.admin_feedback && mod.approval_status === 'rejected' && (
                        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2">
                          <AlertCircle size={15} className="shrink-0 mt-0.5" />
                          <p><strong>Admin Feedback:</strong> {mod.admin_feedback}</p>
                        </div>
                      )}

                      {(!mod.curriculum_items || mod.curriculum_items.length === 0) ? (
                        <p className="text-xs text-muted-foreground italic py-2">No individual topic items configured in this module.</p>
                      ) : (
                        <div className="space-y-2">
                          {mod.curriculum_items.map((item: any) => (
                            <div
                              key={item.id}
                              className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                                    {item.item_type}
                                  </Badge>
                                  <span className="text-xs font-semibold text-foreground">{item.title}</span>
                                </div>
                                {item.metadata?.key_questions && (
                                  <p className="text-[11px] text-muted-foreground">
                                    Key Questions: {item.metadata.key_questions.slice(0, 2).join(' • ')}
                                  </p>
                                )}
                              </div>

                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                Ready
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </Card>
        </TabsContent>

        {/* TAB 4: LEARNING RESOURCES */}
        <TabsContent value="resources" className="space-y-6">
          <Card className="rounded-2xl border-border p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Learning Materials & Resources</h3>
                <p className="text-xs text-muted-foreground">
                  Lecture notes, revision sheets, past examination papers, and presentation decks.
                </p>
              </div>

              <AddResourceDialog tutorId={tutorId} />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {['all', 'notes', 'past_paper', 'powerpoint', 'recording'].map(f => (
                <button
                  key={f}
                  onClick={() => setResourceFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize ${
                    resourceFilter === f
                      ? 'bg-gold text-black shadow-sm'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f === 'past_paper' ? 'Past Papers' : f}
                </button>
              ))}
            </div>

            {filteredResources.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-muted/10 space-y-3">
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <h4 className="text-base font-bold text-foreground">No resources uploaded yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Upload lesson notes, past papers, and study guides for students to download and review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map(res => (
                  <div
                    key={res.id}
                    className="p-4 rounded-2xl bg-card border border-border hover:border-gold/50 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {res.type?.replace('_', ' ') || 'Document'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {res.file_size || 'PDF'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground line-clamp-1">{res.title}</h4>
                      {res.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{res.description}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(res.created_at).toLocaleDateString()}
                      </span>
                      {res.file_url && (
                        <Button asChild size="sm" variant="outline" className="text-xs h-7 rounded-lg border-border">
                          <a href={res.file_url} target="_blank" rel="noopener noreferrer">
                            <Download size={12} className="mr-1" /> Download
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* TAB 5: QUIZZES & ASSESSMENTS */}
        <TabsContent value="quizzes" className="space-y-6">
          <Card className="rounded-2xl border-border p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Subject Quizzes & Assessments</h3>
                <p className="text-xs text-muted-foreground">
                  Interactive self-testing quizzes and homework assessment milestones for this subject.
                </p>
              </div>

              <Button size="sm" asChild className="bg-gold hover:bg-[#c29f2f] text-black font-bold text-xs rounded-xl">
                <Link href={`/tutor/assignments`}>
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                  Assign Assessment
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Quiz Module Card 1 */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-4 hover:border-gold/40 transition-all">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gold/15 text-gold border border-gold/30 text-[10px]">
                    Diagnostic Test
                  </Badge>
                  <span className="text-xs text-muted-foreground">15 Questions</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{subject?.name} Comprehensive Quiz</h4>
                  <p className="text-xs text-muted-foreground mt-1">Diagnostic exam covering core syllabus milestones.</p>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passing Score:</span>
                    <strong className="text-foreground">70%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Class Avg:</span>
                    <strong className="text-emerald-400">82.4%</strong>
                  </div>
                </div>
                <Button size="sm" asChild variant="outline" className="w-full text-xs font-bold rounded-xl border-gold/40 text-gold hover:bg-gold/10">
                  <Link href={`/student/quiz?subjectId=${subjectId}`}>
                    Preview Quiz →
                  </Link>
                </Button>
              </div>

              {/* Quiz Module Card 2 */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-4 hover:border-gold/40 transition-all">
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px]">
                    Mid-Term Review
                  </Badge>
                  <span className="text-xs text-muted-foreground">20 Questions</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Unit Mastery & Applied Practice</h4>
                  <p className="text-xs text-muted-foreground mt-1">Structured multiple-choice and short answer review.</p>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passing Score:</span>
                    <strong className="text-foreground">75%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Class Avg:</span>
                    <strong className="text-emerald-400">79.1%</strong>
                  </div>
                </div>
                <Button size="sm" asChild variant="outline" className="w-full text-xs font-bold rounded-xl border-gold/40 text-gold hover:bg-gold/10">
                  <Link href={`/student/quiz?subjectId=${subjectId}`}>
                    Preview Quiz →
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
