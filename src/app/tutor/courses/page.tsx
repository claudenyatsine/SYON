'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { BookOpenCheck, PlusCircle, Users, Eye, Settings, Loader2, Image as ImageIcon, BookOpen, Clock, AlertCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SchoolHeader } from "@/components/app/school-header";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useUser } from "@/components/providers/user-context";
import { CreateCourseDialog } from "@/components/app/tutor/create-course-dialog";
import { AddResourceDialog } from "@/components/app/tutor/add-resource-dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const statusColorMap: Record<string, string> = {
    "approved": "bg-gold hover:bg-gold text-foreground",
    "pending_admin_review": "bg-gold/10 text-gold hover:bg-gold/20",
    "draft": "bg-muted text-muted-foreground",
    "rejected": "bg-burgundy text-foreground hover:bg-burgundy",
};

const statusLabelMap: Record<string, string> = {
    "approved": "Approved",
    "pending_admin_review": "Pending Review",
    "draft": "Draft",
    "rejected": "Rejected",
};

function CourseList({ tutorId }: { tutorId: string }) {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchCourses = async () => {
        if (!tutorId) return;
        
        // 1. Fetch subjects assigned to tutor
        const { data: assignments } = await supabase
            .from('tutor_subjects')
            .select('subjects(*)')
            .eq('tutor_id', tutorId);

        // 2. Fetch curriculum modules created by tutor
        const { data: modulesData } = await supabase
            .from('curriculum_modules')
            .select('id, subject_id, title, sequence_order, course_level, approval_status, admin_feedback')
            .eq('tutor_id', tutorId)
            .order('sequence_order', { ascending: true });

        // Group modules by subject
        const subjectsWithModules = (assignments || []).map((assignment: any) => {
            const subject = assignment.subjects;
            const subjectModules = (modulesData || []).filter((m: any) => 
                m.subject_id === subject.id && 
                m.title !== 'Climatology' && 
                m.title !== '1' &&
                m.title !== 'Module 1' &&
                m.title !== 'Module 2'
            );
            return {
                ...subject,
                modules: subjectModules
            };
        });

        setSubjects(subjectsWithModules);
        setLoading(false);
    };

    useEffect(() => {
        if (tutorId) {
            fetchCourses();

            // Real-time subscription to curriculum_modules
            const channel = supabase
                .channel(`tutor-modules-${tutorId}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'curriculum_modules',
                    filter: `tutor_id=eq.${tutorId}`
                }, () => {
                    fetchCourses();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [tutorId]);

    if (loading) {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CreateCourseDialog 
                    tutorId={tutorId} 
                    onCourseCreated={fetchCourses} 
                    trigger={
                        <Card className="border-dashed flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-muted/50 transition-colors group h-full min-h-[300px]">
                            <div className="bg-primary/5 p-4 rounded-full group-hover:scale-110 transition-transform">
                                <PlusCircle className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="mt-4 font-bold text-lg">Create Curriculum Module</h3>
                        </Card>
                    }
                />
                {[1, 2].map(i => (
                    <Card key={i} className="animate-pulse">
                        <div className="aspect-[3/2] bg-muted w-full" />
                        <div className="p-4 space-y-2">
                            <div className="h-6 w-3/4 bg-muted rounded" />
                            <div className="h-4 w-1/2 bg-muted rounded" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (subjects.length === 0) {
        return (
            <Card className="p-16 text-center border-dashed">
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-primary/5 p-4 rounded-full">
                        <PlusCircle className="h-12 w-12 text-primary/20" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">No subjects assigned yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            You have not been assigned to teach any subjects yet. Contact the admin to get assigned.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-3">
                <AddResourceDialog tutorId={tutorId} />
                <CreateCourseDialog 
                    tutorId={tutorId} 
                    onCourseCreated={fetchCourses} 
                    trigger={
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Module
                        </Button>
                    }
                />
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {subjects.map(subject => (
                    <Card key={subject.id} className="overflow-hidden flex flex-col h-full border-border/60 shadow-sm transition-all hover:border-primary/50">
                        <CardHeader className="p-0 relative">
                            <div className="relative aspect-[3/2] w-full bg-gradient-to-br from-primary/10 to-primary/5">
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                    <BookOpen className="w-12 h-12 text-primary/40 mb-3" />
                                    <h3 className="text-2xl font-bold text-primary/80 line-clamp-2">{subject.name}</h3>
                                    <Badge variant="outline" className="mt-2 bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
                                        {subject.level}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow flex flex-col">
                            <div className="p-4 border-b bg-muted/10">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <BookOpenCheck className="w-4 h-4" />
                                        <span>{subject.modules.length} Modules</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span>{subject.category}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 flex-grow">
                                {subject.modules.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-sm text-muted-foreground mb-3">No curriculum modules created yet.</p>
                                        <CreateCourseDialog 
                                            tutorId={tutorId} 
                                            onCourseCreated={fetchCourses} 
                                            trigger={
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    Create First Module
                                                </Button>
                                            }
                                        />
                                    </div>
                                ) : (
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="modules" className="border-none">
                                            <AccordionTrigger className="hover:no-underline py-2 px-1 rounded-md hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center justify-between w-full pr-2">
                                                    <span className="text-sm font-semibold">View Curriculum Modules</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-2 pb-0">
                                                <div className="space-y-3 mt-1">
                                                    {subject.modules.map((mod: any) => (
                                                        <div key={mod.id} className="p-3 bg-muted/20 border rounded-md space-y-2">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <span className="text-xs font-bold text-primary uppercase mr-2">Mod {mod.sequence_order}</span>
                                                                    <span className="text-sm font-medium">{mod.title}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge className={`text-[10px] whitespace-nowrap ${statusColorMap[mod.approval_status]}`}>
                                                                        {statusLabelMap[mod.approval_status]}
                                                                    </Badge>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                        onClick={async (e) => {
                                                                            e.preventDefault();
                                                                            if (window.confirm('Are you sure you want to delete this module?')) {
                                                                                try {
                                                                                    // 1. Delete items first
                                                                                    const { error: itemsError } = await supabase.from('curriculum_items').delete().eq('module_id', mod.id);
                                                                                    if (itemsError) throw new Error("Failed to delete items: " + itemsError.message);
                                                                                    
                                                                                    // 2. Delete module
                                                                                    const { error: modError } = await supabase.from('curriculum_modules').delete().eq('id', mod.id);
                                                                                    if (modError) throw new Error("Failed to delete module: " + modError.message);
                                                                                    
                                                                                    alert("Module deleted successfully!");
                                                                                    fetchCourses();
                                                                                } catch (err: any) {
                                                                                    console.error("Delete error:", err);
                                                                                    alert(err.message || "Failed to delete");
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            
                                                            {mod.approval_status === 'rejected' && mod.admin_feedback && (
                                                                <div className="bg-burgundy/10 border border-burgundy/20 p-2 rounded text-xs text-burgundy flex items-start gap-1.5">
                                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                                    <p>{mod.admin_feedback}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function TutorCoursesPage() {
    const { profile, loading: profileLoading } = useUser();
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Assigned Subjects</h1>
                    <p className="text-muted-foreground">Manage your curriculum modules and learning materials.</p>
                </div>
            </div>
            {profileLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                            <div className="aspect-[3/2] bg-muted w-full" />
                            <div className="p-4 space-y-2">
                                <div className="h-6 w-3/4 bg-muted rounded" />
                                <div className="h-4 w-1/2 bg-muted rounded" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : profile?.id ? (
                <CourseList tutorId={profile.id} />
            ) : (
                <p className="text-muted-foreground text-sm">Could not load tutor profile. Please try refreshing.</p>
            )}
        </div>
    );
}

