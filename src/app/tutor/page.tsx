'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FolderPlus, PlusCircle, FilePlus, Users, Activity, FileCheck, CalendarClock, Shield } from "lucide-react";
import Link from "next/link";
import { ClassPerformance } from "@/components/app/tutor/dashboard/class-performance";
import * as React from "react";
import { SchoolHeader } from "@/components/app/school-header";
import { useUser } from "@/components/providers/user-context";
import { createClient } from "@/utils/supabase/client";
import { CreateCourseDialog } from "@/components/app/tutor/create-course-dialog";
import { ScheduleClassDialog } from "@/components/app/tutor/schedule-class-dialog";
import { motion } from "framer-motion";
import { RecentActivity } from "@/components/app/tutor/dashboard/recent-activity";
import { UpcomingClasses } from "@/components/app/tutor/dashboard/upcoming-classes";
import { useRouter } from "next/navigation";

const tutorTools = [
    {
        title: "Create Course",
        description: "Build a new course from scratch.",
        icon: PlusCircle,
        href: "/tutor/courses",
    },
    {
        title: "Schedule Class",
        description: "Set up a new live session for your students.",
        icon: Calendar,
        href: "/tutor/live-classes",
    },
    {
        title: "Add Resource",
        description: "Upload new materials to the library.",
        icon: FolderPlus,
        href: "/tutor/courses", 
    },
    {
        title: "Create Assignment",
        description: "Design a new assignment or quiz.",
        icon: FilePlus,
        href: "/tutor/assignments",
    }
]

type StatCardProps = {
    title: string;
    value: string;
    icon: React.ElementType;
    change?: string;
    changeType?: 'increase' | 'decrease';
}

function StatCard({ title, value, icon: Icon, change, changeType }: StatCardProps) {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change && (
                    <p className={`text-xs ${changeType === 'increase' ? 'text-gold' : 'text-burgundy'}`}>
                        {change} from last week
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

function TutorStats() {
    const [stats, setStats] = React.useState({
        totalStudents: "0",
        engagementRate: "0%",
        engagementChange: "0% from last week",
        engagementChangeType: "neutral" as "increase" | "decrease" | "neutral",
        assignmentsToGrade: "0",
        upcomingSession: "None scheduled"
    });
    const [loading, setLoading] = React.useState(true);
    const supabase = React.useMemo(() => createClient(), []);
    const { profile } = useUser();

    const fetchTutorStats = React.useCallback(async () => {
        if (!profile?.id) {
            setLoading(false);
            return;
        }

        try {
            // 1. Fetch tutor's assigned subjects to get the correct student scope
            const { data: assignedSubjects } = await supabase
                .from('tutor_subjects')
                .select('subject_id')
                .eq('tutor_id', profile.id);
            
            const subjectIds = assignedSubjects?.map(s => s.subject_id) || [];

            // 2. Fetch all assignment IDs for this tutor
            const { data: tutorModules } = await supabase.from('curriculum_modules').select('id').eq('tutor_id', profile.id);
            const moduleIds = tutorModules?.map((m: any) => m.id) || [];
            let assignmentIds: string[] = [];
            
            if (moduleIds.length > 0) {
                const { data: tutorItems } = await supabase.from('curriculum_items').select('id').in('module_id', moduleIds);
                const itemIds = tutorItems?.map((i: any) => i.id) || [];
                
                if (itemIds.length > 0) {
                    const { data: tutorAssignments } = await supabase.from('curriculum_assignments').select('id').in('module_item_id', itemIds);
                    assignmentIds = tutorAssignments?.map((a: any) => a.id) || [];
                }
            }

            // 3. Run other queries in parallel
            const [{ data: upcomingClass }, { count: unmarkedCount }, { data: tutorEnrollments }] = await Promise.all([
                supabase
                    .from('classes')
                    .select('schedule, title')
                    .eq('tutor_id', profile.id)
                    .or('status.eq.upcoming,status.eq.ongoing')
                    .order('schedule', { ascending: true })
                    .limit(1)
                    .single(),
                assignmentIds.length > 0 
                    ? supabase
                        .from('submissions')
                        .select('*', { count: 'exact', head: true })
                        .in('assignment_id', assignmentIds)
                        .eq('status', 'submitted')
                    : Promise.resolve({ count: 0 }),
                subjectIds.length > 0 
                    ? supabase
                        .from('enrollments')
                        .select('student_id, status, created_at')
                        .in('subject_id', subjectIds)
                    : Promise.resolve({ data: [] })
            ]);

            let totalE = 0;
            let activeE = 0;
            let recentActiveE = 0;
            let uniqueStudentCount = 0;

            if (tutorEnrollments && tutorEnrollments.length > 0) {
                totalE = tutorEnrollments.length;
                const uniqueStudents = new Set(tutorEnrollments.map((e: any) => e.student_id));
                uniqueStudentCount = uniqueStudents.size;

                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                tutorEnrollments.forEach((e: any) => {
                    if (e.status === 'approved' || e.status === 'active') {
                        activeE++;
                        if (new Date(e.created_at) > oneWeekAgo) {
                            recentActiveE++;
                        }
                    }
                });
            }

            const calculatedRate = totalE > 0 ? Math.round((activeE / totalE) * 100) : 0;
            const changeNum = totalE > 0 ? Math.round((recentActiveE / totalE) * 100) : 0;

            setStats({
                totalStudents: uniqueStudentCount.toString() || "0",
                engagementRate: `${calculatedRate}%`,
                engagementChange: changeNum > 0 ? `+${changeNum}% from last week` : "0% from last week",
                engagementChangeType: changeNum > 0 ? "increase" : "neutral",
                assignmentsToGrade: unmarkedCount?.toString() || "0",
                upcomingSession: upcomingClass
                    ? `${new Date(upcomingClass.schedule).toLocaleDateString()}, ${new Date(upcomingClass.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : "None scheduled"
            });
        } catch (err) {
            console.error('Error fetching tutor stats:', err);
        } finally {
            setLoading(false);
        }
    }, [profile?.id, supabase]);

    React.useEffect(() => {
        fetchTutorStats();

        if (!profile?.id) return;

        const channel = supabase
            .channel(`tutor-stats-${profile.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'classes',
                filter: `tutor_id=eq.${profile.id}`
            }, () => {
                fetchTutorStats();
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'profiles',
                filter: `role=eq.student`
            }, () => {
                fetchTutorStats();
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'student_assignments',
                filter: `tutor_id=eq.${profile.id}`
            }, () => {
                fetchTutorStats();
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'enrollments'
            }, () => {
                fetchTutorStats();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchTutorStats, profile?.id, supabase]);

    if (loading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
    </div>;

    const cards = [
        { title: "Total Students", value: stats.totalStudents, icon: Users },
        { title: "Engagement Rate", value: stats.engagementRate, icon: Activity, change: stats.engagementChange, changeType: stats.engagementChangeType },
        { title: "Assignments to Grade", value: stats.assignmentsToGrade, icon: FileCheck },
        { title: "Upcoming Session", value: stats.upcomingSession, icon: CalendarClock },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                >
                    <StatCard {...card} />
                </motion.div>
            ))}
        </div>
    );
}

function TutorTools({ profileId }: { profileId?: string }) {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {tutorTools.map((tool, index) => (
                    <motion.div
                        key={tool.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
                            <CardHeader className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <tool.icon className="w-5 h-5" />
                                    </div>
                                    <CardTitle className="text-base">{tool.title}</CardTitle>
                                </div>
                                <CardDescription className="text-xs mt-2">{tool.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                {tool.title === "Create Course" && profileId ? (
                                    <CreateCourseDialog 
                                        tutorId={profileId} 
                                        trigger={<Button variant="ghost" size="sm" className="w-full text-xs">Execute Action</Button>} 
                                    />
                                ) : tool.title === "Schedule Class" && profileId ? (
                                    <ScheduleClassDialog 
                                        tutorId={profileId} 
                                        trigger={<Button variant="ghost" size="sm" className="w-full text-xs">Execute Action</Button>} 
                                    />
                                ) : (
                                    <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                                        <Link href={tool.href}>Execute Action</Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}


export default function TutorPage() {
    const { profile, loading } = useUser();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && profile && profile.role !== 'tutor') {
            router.push(`/${profile.role}`);
        }
    }, [profile, loading, router]);

    if (loading) return <div className="p-10 text-center animate-pulse">Loading dashboard...</div>;
    if (profile && profile.role !== 'tutor') return null;

    const userName = profile?.full_name || 'Tutor';

    return (
        <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
            <SchoolHeader />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Tutor Dashboard
                    </h1>
                    <p className="text-muted-foreground">Welcome back, {userName}. Here's what's happening with your classes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-full" asChild><Link href="/tutor/live-classes">View Schedule</Link></Button>
                    <ScheduleClassDialog 
                        tutorId={profile?.id || ''} 
                        trigger={<Button className="rounded-full shadow-lg shadow-primary/20">Schedule Class</Button>}
                    />
                </div>
            </div>

            <TutorStats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <UpcomingClasses tutorId={profile?.id} />
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <RecentActivity tutorId={profile?.id} />
                </div>
            </div>

            <TutorTools profileId={profile?.id} />

            <ClassPerformance tutorId={profile?.id} />
        </div>
    );
}
