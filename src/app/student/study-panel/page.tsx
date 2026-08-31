'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
    Calculator, Map, Landmark, Atom, Beaker, Dna, Languages,
    FlaskConical, Building2, Network, Dumbbell, TrendingUp,
    BookOpenText, Store, Cpu, Theater, ScrollText, Users, Tractor,
    DraftingCompass, Palette, MessageCircle, Scale, Lightbulb,
    BookCopy, Book, GraduationCap, Loader2,
    Search, BrainCircuit, Code, Database, Layout, ChevronRight, ChevronLeft, BookOpen, Award, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { SchoolHeader } from "@/components/app/school-header";
import { createClient } from '@/utils/supabase/client';
import React, { useEffect, useState, useRef } from 'react';
import { CurriculumBoardBadge, SubjectLevelBadge } from "@/components/app/subject-badge";
import { getCurriculumBoard, getSubjectLevel, getSubjectBaseName, getSubjectCode } from "@/utils/subject-utils";

const iconMap: Record<string, React.ElementType> = {
    "English Language":                     BookOpenText,
    "English":                              BookOpenText,
    "Mathematics":                          Calculator,
    "Pure Mathematics":                     Calculator,
    "Additional Mathematics":               Cpu,
    "Advanced Mathematics":                 Cpu,
    "Biology":                              Dna,
    "History":                              Landmark,
    "Chemistry":                            Beaker,
    "Integrated Science":                   Beaker,
    "Geography":                            Map,
    "Commerce":                             Store,
    "Principles of Accounting":             Scale,
    "Business Enterprise and Skills":       Lightbulb,
    "Literature in Indigenous Languages":   BookCopy,
    "Indigenous Languages (Shona)":         Languages,
    "Indigenous Languages":                 Languages,
    "Computer Science":                     Cpu,
    "Computer Operations":                  Cpu,
    "Combined Science":                     FlaskConical,
    "General Science":                      FlaskConical,
    "Science":                              FlaskConical,
    "Business studies":                     Building2,
    "Physics":                              Atom,
    "Physical Science":                     Atom,
    "ICT":                                  Network,
    "Physical Education":                   Dumbbell,
    "Economics":                            TrendingUp,
    "English Literature":                   BookOpenText,
    "Literature in English":                BookOpenText,
    "English & Literature":                 BookOpenText,
    "Performing arts":                      Theater,
    "Performing Arts":                      Theater,
    "Religious studies":                    ScrollText,
    "Family & Religious Studies":           ScrollText,
    "Family and Religious Studies":         ScrollText,
    "Sociology":                            Users,
    "Agriculture":                          Tractor,
    "Design and Technology":               DraftingCompass,
    "Visual Arts":                          Palette,
    "Art":                                  Palette,
    "Music":                                MessageCircle,
    "Business English":                     MessageCircle,
    "Global Perspectives":                  Award,
    "Thinking Skills":                      BrainCircuit,
};

function getSubjectIcon(name: string = '') {
    const base = name.replace(/\s*\([^)]+\)/, '').trim();
    return iconMap[base] || iconMap[name] || BookOpen;
}

function SubjectCard({ subject }: { subject: any }) {
    const Icon = getSubjectIcon(subject.name);
    const board = getCurriculumBoard(subject);
    const level = getSubjectLevel(subject);

    return (
        <Link href={`/student/study-panel/${subject.id}`} className="group block h-full">
            <Card className="h-full bg-card border-border hover:border-gold/60 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-1 rounded-2xl overflow-hidden flex flex-col justify-between">
                <CardContent className="p-5 flex flex-col items-center text-center gap-3.5">
                    {/* Top Badges */}
                    <div className="w-full flex items-center justify-between gap-1.5">
                        <CurriculumBoardBadge board={board} size="sm" />
                        <SubjectLevelBadge level={level} size="sm" />
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gold/10 text-gold border border-gold/30 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm mt-1">
                        <Icon className="w-7 h-7" />
                    </div>

                    {/* Title & Info */}
                    <div className="space-y-1 w-full">
                        <h3 className="text-base font-bold text-foreground group-hover:text-gold transition-colors line-clamp-1">
                            {subject.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {board} Curriculum • {subject.category || 'Core'}
                        </p>
                    </div>

                    {/* Footer Action */}
                    <div className="pt-2.5 w-full border-t border-border/50 flex items-center justify-center gap-1 text-[11px] text-muted-foreground group-hover:text-gold transition-colors font-medium">
                        <span>1-on-1 Study Hub</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function SubjectSkeleton() {
    return (
        <Card className="animate-pulse">
            <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted" />
                <div className="space-y-2 w-full">
                    <div className="h-5 bg-muted rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function StudyPanelPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedReviewTopic, setSelectedReviewTopic] = useState<any>(null);
    const [selectedReviewSubject, setSelectedReviewSubject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchSubjects = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('enrollments')
                .select('subjects(*)')
                .eq('student_id', user.id)
                .eq('status', 'approved');

            if (data) {
                const enrolledSubjects = data.map((e: any) => e.subjects).filter(Boolean);
                setSubjects(enrolledSubjects);
                if (enrolledSubjects.length > 0) {
                    setSelectedReviewSubject(enrolledSubjects[0]);
                }

                const subjectIds = enrolledSubjects.map((s: any) => s.id);
                if (subjectIds.length > 0) {
                    const { data: topicsData } = await supabase
                        .from('curriculum_items')
                        .select('id, title, module:curriculum_modules(subject_id)')
                        .eq('item_type', 'topic');
                        
                    if (topicsData) {
                        const filtered = topicsData.filter((t: any) => subjectIds.includes(t.module?.subject_id));
                        setTopics(filtered);
                    }
                }
            }
            setLoading(false);
        };

        fetchSubjects();

        // Real-time: update if an admin approves a subject while they are on the page
        const channel = supabase
            .channel('enrollments-live')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'enrollments'
            }, fetchSubjects)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase]);

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <SchoolHeader />
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Study Panel</h1>
                <p className="text-muted-foreground">Select a subject to start your learning journey.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => <SubjectSkeleton key={i} />)}
                        </div>
                    ) : subjects.length === 0 ? (
                        <Card className="p-16 text-center border-dashed">
                            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
                            <h3 className="text-lg font-medium">No subjects available yet</h3>
                            <p className="text-muted-foreground text-sm mt-1">Check back later or contact your school administrator.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {subjects.map((subject) => (
                                <SubjectCard key={subject.id} subject={subject} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <Card className="rounded-[1.5rem] border-border/60 shadow-sm bg-neutral-50/50 dark:bg-background/30">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-1">Quick Review</h3>
                            <p className="text-sm text-muted-foreground mb-6">Sharpen your knowledge in 2 minutes!</p>
                            
                                                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder={selectedReviewTopic ? selectedReviewTopic.title : "Choose a topic to review..."}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchOpen(true);
                                }}
                                onFocus={() => setIsSearchOpen(true)}
                                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                                className="pl-9 h-11 bg-white dark:bg-background border-none rounded-xl shadow-sm text-sm"
                            />
                            {isSearchOpen && searchQuery.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-background border border-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto no-scrollbar">
                                    {topics.filter((t: any) => t.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                                        topics.filter((t: any) => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map((topic: any) => (
                                            <div 
                                                key={topic.id}
                                                className="px-4 py-2 hover:bg-gold/10 cursor-pointer text-sm font-medium"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    setSelectedReviewTopic(topic);
                                                    setSearchQuery('');
                                                    setIsSearchOpen(false);
                                                }}
                                            >
                                                {topic.title}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-xs text-muted-foreground">No topics found.</div>
                                    )}
                                </div>
                            )}
                            </div>
                            
                            {/* Live Target / Selected Indicator */}
                            <div className="p-3 rounded-xl bg-card border border-border/80 mb-5 space-y-1.5 shadow-sm">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                        <BookOpen className="w-3.5 h-3.5 text-gold shrink-0" />
                                        Target:
                                    </span>
                                    <div className="truncate max-w-[200px] text-right">
                                        {selectedReviewTopic ? (
                                            <span className="text-gold font-bold text-xs truncate">
                                                {selectedReviewTopic.title}
                                            </span>
                                        ) : selectedReviewSubject ? (
                                            <span className="text-foreground font-bold text-xs truncate">
                                                {selectedReviewSubject.name}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">Select a subject</span>
                                        )}
                                    </div>
                                </div>
                                {selectedReviewSubject && !selectedReviewTopic && (
                                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                                        <CurriculumBoardBadge board={getCurriculumBoard(selectedReviewSubject)} size="sm" />
                                        <SubjectLevelBadge level={getSubjectLevel(selectedReviewSubject)} size="sm" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Subject Toggle & Scroll Header */}
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                        Choose Subject ({subjects.length}):
                                    </span>
                                    {subjects.length > 2 && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => scrollContainerRef.current?.scrollBy({ left: -140, behavior: 'smooth' })}
                                                className="w-6 h-6 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
                                                title="Scroll left"
                                            >
                                                <ChevronLeft size={13} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => scrollContainerRef.current?.scrollBy({ left: 140, behavior: 'smooth' })}
                                                className="w-6 h-6 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
                                                title="Scroll right"
                                            >
                                                <ChevronRight size={13} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Smooth Scrollable Subject Toggle Buttons */}
                                <div 
                                    ref={scrollContainerRef}
                                    className="flex items-center gap-2 px-1 py-1.5 overflow-x-auto custom-study-scrollbar scroll-smooth"
                                >
                                    {subjects.map((subject) => {
                                        const Icon = getSubjectIcon(subject.name);
                                        const isSelected = selectedReviewSubject?.id === subject.id && !selectedReviewTopic;
                                        const board = getCurriculumBoard(subject);
                                        const level = getSubjectLevel(subject);

                                        return (
                                            <button 
                                                key={subject.id} 
                                                type="button"
                                                title={`${board} • ${subject.name} (${level})`}
                                                onClick={() => {
                                                    setSelectedReviewSubject(subject);
                                                    setSelectedReviewTopic(null);
                                                }}
                                                className={`h-11 px-3 rounded-xl flex shrink-0 items-center gap-2 border transition-all text-left shadow-sm cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-gold/15 border-gold text-gold font-bold ring-1 ring-gold/40' 
                                                        : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border/80'
                                                }`}
                                            >
                                                <Icon className="w-4 h-4 shrink-0" />
                                                <div className="flex flex-col min-w-0 pr-1">
                                                    <span className="text-xs font-semibold truncate max-w-[130px] leading-tight text-foreground">
                                                        {subject.name}
                                                    </span>
                                                    <span className="text-[9px] opacity-75 font-medium leading-none mt-0.5">
                                                        {board} • {level}
                                                    </span>
                                                </div>
                                                {isSelected && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <Button 
                                    asChild={!!selectedReviewSubject}
                                    variant="outline" 
                                    className="flex-1 rounded-xl h-11 font-bold border-gold/40 text-gold hover:bg-gold/10 hover:text-gold shadow-sm transition-all"
                                    disabled={!selectedReviewSubject}
                                >
                                    {selectedReviewSubject ? (
                                        <Link href={`/student/quiz?subjectId=${selectedReviewSubject.id}`}>
                                            Practice
                                        </Link>
                                    ) : (
                                        <span>Practice</span>
                                    )}
                                </Button>

                                <Button 
                                    asChild={!!(selectedReviewTopic || selectedReviewSubject)} 
                                    className="flex-1 rounded-xl h-11 font-bold bg-gold hover:bg-[#c29f2f] text-black shadow-md shadow-gold/20 transition-all disabled:opacity-50 disabled:bg-gold/20 disabled:text-gold"
                                    disabled={!(selectedReviewTopic || selectedReviewSubject)}
                                >
                                    {selectedReviewTopic ? (
                                        <Link href={`/student/quiz?topicId=${selectedReviewTopic.id}`}>
                                            Start Quiz →
                                        </Link>
                                    ) : selectedReviewSubject ? (
                                        <Link href={`/student/quiz?subjectId=${selectedReviewSubject.id}`}>
                                            Start Quiz →
                                        </Link>
                                    ) : (
                                        <span>Start Quiz →</span>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-study-scrollbar::-webkit-scrollbar { height: 4px; }
                .custom-study-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-study-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 9999px; }
                .custom-study-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}} />
        </div>
    );
}
