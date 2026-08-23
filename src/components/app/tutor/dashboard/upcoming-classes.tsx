import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Clock, Users, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function UpcomingClasses({ tutorId }: { tutorId?: string }) {
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchClasses = async () => {
            if (!tutorId) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('classes')
                    .select('*')
                    .eq('tutor_id', tutorId)
                    .or('status.eq.upcoming,status.eq.ongoing')
                    .order('schedule', { ascending: true })
                    .limit(5);

                if (data && !error) {
                    console.log('DEBUG: Classes Table Columns:', data[0] ? Object.keys(data[0]) : 'No data found in table');
                    setUpcomingClasses(data);
                }
            } catch (err) {
                console.error('Error fetching upcoming classes:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [tutorId]);

    if (loading) return (
        <Card className="h-full">
            <CardHeader><CardTitle className="text-xl">Upcoming Live Classes</CardTitle></CardHeader>
            <CardContent className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></CardContent>
        </Card>
    );

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Upcoming Live Classes</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/tutor/live-classes" className="flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {upcomingClasses.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingClasses.map((cls, index) => (
                            <motion.div 
                                key={cls.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-primary font-semibold">
                                        <Video className="w-4 h-4" />
                                        <span className="text-sm">Live Session</span>
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${cls.status === 'ongoing' ? 'bg-burgundy text-burgundy animate-pulse' : 'bg-gold text-black'}`}>
                                        {cls.status}
                                    </span>
                                </div>
                                <h4 className="font-bold mb-2">{cls.title}</h4>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {cls.schedule ? new Date(cls.schedule).toLocaleString() : 'TBD'}
                                    </div>
                                    {cls.students_count !== undefined && (
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            {cls.students_count} Students
                                        </div>
                                    )}
                                </div>
                                <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg" asChild>
                                    <Link href={`/classroom/${cls.agora_channel_name || cls.id}?role=host&subjectId=${cls.subject_id}`}>
                                        {cls.status === 'ongoing' ? 'Join Classroom' : 'Start Classroom'}
                                    </Link>
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-muted-foreground bg-muted/5 rounded-xl border border-dashed">
                        <Video className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No live classes scheduled.</p>
                        <Button variant="link" size="sm" asChild><Link href="/tutor/live-classes">Schedule one now</Link></Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
