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
  ChevronRight, BookOpen, ShieldAlert, X, MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { DetailedProgressCard } from "@/components/app/student/dashboard/subject-progress-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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
  return (
    <motion.div layout className="bg-background backdrop-blur-xl rounded-[1.5rem] p-5 border border-gold/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-3">
         <div className="bg-gold dark:bg-gold/30 p-2 rounded-xl">
           <Lightbulb className="w-4 h-4 text-gold dark:text-gold" />
         </div>
         <h3 className="font-bold text-sm">AI Tutor Assistant</h3>
      </div>
      <p className="text-[13px] text-muted-foreground mb-4">Have a quick question? Your AI tutor is ready to help instantly.</p>
      <div className="relative">
        <input 
          type="text" 
          placeholder="Ask anything..." 
          className="w-full bg-muted/80 dark:bg-background/80 border-none rounded-xl py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
        />
        <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-foreground p-1.5 rounded-lg hover:scale-105 transition-transform">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
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
          const formatted = enrollments
            .map(e => e.subject)
            .filter(Boolean)
            .map((subject: any) => {
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
                          key={course.name} 
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


