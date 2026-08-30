'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Clock, ArrowRight, Loader2, BookOpen, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { getTutorLiveClassesAction } from "@/app/actions/classes";

export function UpcomingClasses({ tutorId }: { tutorId?: string }) {
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchClasses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getTutorLiveClassesAction(tutorId);
            if (res.success && res.data) {
                setUpcomingClasses(res.data);
            }
        } catch (err) {
            console.error('Error fetching tutor classes:', err);
        } finally {
            setLoading(false);
        }
    }, [tutorId]);

    useEffect(() => {
        fetchClasses();

        // Realtime subscription for instant updates when live classes are created/updated
        const channel = supabase
            .channel('live-classes-dashboard')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'live_classes',
            }, () => {
                fetchClasses();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchClasses, supabase]);

    if (loading) return (
        <Card className="h-full">
            <CardHeader><CardTitle className="text-xl">Live Classes</CardTitle></CardHeader>
            <CardContent className="flex justify-center py-10"><Loader2 className="animate-spin text-primary w-6 h-6" /></CardContent>
        </Card>
    );

    return (
        <Card className="h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">Live Classes</CardTitle>
                    {upcomingClasses.length > 0 && (
                        <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                            {upcomingClasses.length}
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/tutor/live-classes" className="flex items-center gap-1 text-xs">
                        Manage All <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="flex-1">
                {upcomingClasses.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingClasses.map((cls, index) => {
                            const isOngoing = cls.status === 'ongoing';
                            const isCompleted = cls.status === 'completed';
                            const startTime = cls.start_time || cls.schedule;

                            return (
                                <motion.div 
                                    key={cls.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-3.5 rounded-2xl border bg-card/60 hover:bg-card hover:shadow-md transition-all relative overflow-hidden group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
                                            <Video className="w-3.5 h-3.5" />
                                            <span>{cls.subject?.name || 'Classroom Session'}</span>
                                        </div>
                                        <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                            isOngoing 
                                                ? 'bg-burgundy text-white animate-pulse' 
                                                : isCompleted
                                                    ? 'bg-muted text-muted-foreground'
                                                    : 'bg-gold/20 text-gold border border-gold/30'
                                        }`}>
                                            {isOngoing ? 'Live Now' : isCompleted ? 'Completed' : (cls.status || 'Scheduled')}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1.5 truncate group-hover:text-primary transition-colors">
                                        {cls.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-gold" />
                                            {startTime ? new Date(startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Flexible'}
                                        </div>
                                        {cls.subject?.name && (
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="w-3 h-3 opacity-60" />
                                                <span>{cls.subject.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Button 
                                        className={`w-full h-8 text-xs font-semibold rounded-xl transition-all ${
                                            isOngoing
                                                ? 'bg-burgundy text-white hover:bg-burgundy/90'
                                                : isCompleted
                                                    ? 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        }`} 
                                        asChild
                                    >
                                        <Link href={`/classroom/${cls.agora_channel_name || cls.id}?role=host&subjectId=${cls.subject_id}`}>
                                            {isOngoing ? 'Join Live Room' : isCompleted ? 'Enter Room / Review' : 'Start Classroom'}
                                        </Link>
                                    </Button>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 text-muted-foreground bg-muted/5 rounded-2xl border border-dashed flex flex-col items-center justify-center">
                        <Video className="w-8 h-8 mx-auto mb-2 opacity-25 text-gold" />
                        <p className="text-sm font-medium">No live classes scheduled.</p>
                        <Button variant="link" size="sm" asChild className="text-gold mt-1">
                            <Link href="/tutor/live-classes">Schedule one now</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
