import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, MessageSquare, UserPlus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function RecentActivity({ tutorId }: { tutorId?: string }) {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = React.useMemo(() => createClient(), []);

    const fetchActivity = React.useCallback(async () => {
        try {
                // Run queries in parallel to eliminate sequential database roundtrip waterfalls
                const [studentsRes, enrollmentsRes, coursesRes] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('id, full_name, created_at')
                        .eq('role', 'student')
                        .order('created_at', { ascending: false })
                        .limit(3),
                    supabase
                        .from('enrollments')
                        .select(`
                            id,
                            created_at,
                            student:profiles!enrollments_student_id_fkey (full_name),
                            course:courses!enrollments_course_id_fkey (title, tutor_id)
                        `)
                        .eq('course.tutor_id', tutorId)
                        .order('created_at', { ascending: false })
                        .limit(3),
                    supabase
                        .from('courses')
                        .select('id, title, created_at')
                        .eq('tutor_id', tutorId)
                        .order('created_at', { ascending: false })
                        .limit(3)
                ]);

                const students = studentsRes.data;
                const enrollments = enrollmentsRes.data;
                const courses = coursesRes.data;

                const aggregated: any[] = [];

                if (students) {
                    students.forEach(s => aggregated.push({
                        id: `student-${s.id}`,
                        user: s.full_name,
                        action: 'joined the platform',
                        target: '',
                        time: new Date(s.created_at),
                        icon: UserPlus,
                        iconColor: 'text-gold',
                        iconBg: 'bg-gold/10'
                    }));
                }

                if (enrollments) {
                    enrollments.forEach((e: any) => aggregated.push({
                        id: `enroll-${e.id}`,
                        user: e.student?.full_name || 'A student',
                        action: 'enrolled in',
                        target: e.course?.title || 'your course',
                        time: new Date(e.created_at),
                        icon: CheckCircle2,
                        iconColor: 'text-gold',
                        iconBg: 'bg-gold/10'
                    }));
                }

                if (courses) {
                    courses.forEach(c => aggregated.push({
                        id: `course-${c.id}`,
                        user: 'You',
                        action: 'published',
                        target: c.title,
                        time: new Date(c.created_at),
                        icon: FileText,
                        iconColor: 'text-gold',
                        iconBg: 'bg-gold/10'
                    }));
                }

                // Sort by time descending
                setActivities(aggregated.sort((a, b) => b.time - a.time).slice(0, 8));
            } catch (err) {
                console.error('Error fetching activity:', err);
            } finally {
                setLoading(false);
            }
    }, [tutorId, supabase]);

    useEffect(() => {
        fetchActivity();

        if (!tutorId) return;

        const channel = supabase
            .channel(`recent-activity-${tutorId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: 'role=eq.student' }, () => fetchActivity())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, () => fetchActivity())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'courses', filter: `tutor_id=eq.${tutorId}` }, () => fetchActivity())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchActivity, tutorId, supabase]);

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) return (
        <Card className="h-full">
            <CardHeader><CardTitle className="text-xl">Recent Activity</CardTitle></CardHeader>
            <CardContent className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></CardContent>
        </Card>
    );

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {activities.length > 0 ? (
                    <div className="space-y-6">
                        {activities.map((activity, index) => (
                            <motion.div 
                                key={activity.id} 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-4"
                            >
                                <div className={`p-2 rounded-full ${activity.iconBg}`}>
                                    <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                                </div>
                                <div className="space-y-1 flex-grow">
                                    <p className="text-sm">
                                        <span className="font-semibold">{activity.user}</span> {activity.action}{" "}
                                        <span className="text-primary font-medium">{activity.target}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">{formatTime(activity.time)}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-muted-foreground bg-muted/5 rounded-xl border border-dashed">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No recent activity.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
