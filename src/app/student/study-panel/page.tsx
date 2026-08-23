'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
    Calculator, Map, Landmark, Atom, Beaker, Dna, Languages,
    FlaskConical, Building2, Network, Dumbbell, TrendingUp,
    BookOpenText, Store, Cpu, Theater, ScrollText, Users, Tractor,
    DraftingCompass, Palette, MessageCircle, Scale, Lightbulb,
    BookCopy, Book, GraduationCap, Loader2,
    Search, BrainCircuit, Code, Database, Layout, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { SchoolHeader } from "@/components/app/school-header";
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

const iconMap: Record<string, React.ElementType> = {
    "English Language":                     BookOpenText,
    "English":                              BookOpenText,
    "Mathematics":                          Calculator,
    "Additional Mathematics":               Cpu,
    "Biology":                              Dna,
    "History":                              Landmark,
    "Chemistry":                            Beaker,
    "Geography":                            Map,
    "Commerce":                             Store,
    "Principles of Accounting":             Scale,
    "Business Enterprise and Skills":       Lightbulb,
    "Literature in Indigenous Languages":   BookCopy,
    "Indigenous Languages (Shona)":         Languages,
    "Computer Science":                     Cpu,
    "Science":                              FlaskConical,
    "Business studies":                     Building2,
    "Physics":                              Atom,
    "ICT":                                  Network,
    "Physical Education":                   Dumbbell,
    "Economics":                            TrendingUp,
    "English Literature":                   BookOpenText,
    "Performing arts":                      Theater,
    "Religious studies":                    ScrollText,
    "Sociology":                            Users,
    "Agriculture":                          Tractor,
    "Design and Technology":               DraftingCompass,
    "Visual Arts":                          Palette,
    "Art":                                  Palette,
    "Music":                                MessageCircle,
    "Business English":                     MessageCircle,
};

function SubjectCard({ subject }: { subject: any }) {
    const Icon = iconMap[subject.name] || Book;
    const color = subject.color || '#6366f1';
    return (
        <Link href={`/student/courses/${subject.id}`} className="group block">
            <Card className="h-full hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div
                        className="p-4 rounded-full transition-opacity group-hover:opacity-80"
                        style={{ backgroundColor: `${color}20`, color }}
                    >
                        <Icon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold line-clamp-1">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{subject.description}</p>
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
                            
                            <p className="text-[10px] text-muted-foreground mb-6 font-medium">
                                Selected: <span className="text-gold font-bold">{selectedReviewTopic ? selectedReviewTopic.title : 'None'}</span>
                            </p>
                            
                            <div className="flex items-center justify-start gap-1.5 mb-8 px-2 overflow-x-auto no-scrollbar">
                            {subjects.slice(0, 5).map((subject) => {
                                const Icon = iconMap[subject.name] || Book;
                                const isSelected = selectedReviewSubject?.id === subject.id;
                                return (
                                    <div 
                                        key={subject.id} 
                                        title={subject.name}
                                        onClick={() => setSelectedReviewSubject(subject)}
                                        className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center border border-white shadow-sm cursor-pointer transition-colors ${isSelected ? 'bg-gold/10 text-gold' : 'bg-muted text-foreground/ hover:bg-muted'}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </div>
                                )
                            })}
                            {subjects.length > 5 && (
                                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center ml-auto text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            )}
                            </div>

                            <div className="flex items-center gap-3">
                            <Button variant="outline" className="flex-1 rounded-xl h-11 font-semibold border-border shadow-sm" disabled={!selectedReviewSubject}>
                                Practice
                            </Button>
                                                        <Button asChild={!!selectedReviewTopic} className="flex-1 rounded-xl h-11 font-semibold bg-background text-foreground hover:bg-background dark:bg-white dark:text-foreground dark:hover:bg-muted" disabled={!selectedReviewTopic}>
                                {selectedReviewTopic ? (
                                    <Link href={`/student/quiz?topicId=${selectedReviewTopic.id}`}>Start Quiz →</Link>
                                ) : (
                                    <span>Start Quiz →</span>
                                )}
                            </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
