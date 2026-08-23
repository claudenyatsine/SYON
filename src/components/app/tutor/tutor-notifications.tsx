'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getTutorUnmarkedAssignments } from '@/app/actions/student-assignments';
import { useUser } from '@/components/providers/user-context';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export function TutorNotifications() {
  const { profile, user } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSecurityVisible, setIsSecurityVisible] = useState(false);

  useEffect(() => {
    if (user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google')) {
      setIsSecurityVisible(true);
    }
  }, [user]);
  
  useEffect(() => {
    if (!profile?.id) return;
    
    async function fetchNotifications() {
      const res = await getTutorUnmarkedAssignments(profile!.id);
      if (res.data) {
        setNotifications(res.data);
      }
      setLoading(false);
    }
    
    fetchNotifications();

    // Subscribe to realtime changes on student_assignments
    const supabase = createClient();
    const channel = supabase.channel('tutor_assignments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'student_assignments',
        filter: `tutor_id=eq.${profile.id}`
      }, () => {
        // Refresh notifications when assignments change
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const unreadCount = notifications.length + (isSecurityVisible ? 1 : 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-border bg-background text-foreground" align="end" side="top">
        <div className="p-4 border-b border-border">
          <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
          <p className="text-xs text-muted-foreground">You have {unreadCount} unmarked assignment{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {isSecurityVisible && (
            <div className="p-3 border-b border-gold bg-amber-50/50 dark:bg-gold/20 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-gold dark:bg-gold/40 rounded-full shrink-0">
                      <Shield className="w-4 h-4 text-gold dark:text-gold" />
                  </div>
                  <div>
                      <p className="font-semibold text-sm text-foreground">Secure Your Account</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Since you signed in with Google, we recommend setting up a permanent password for extra security.</p>
                  </div>
              </div>
              <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsSecurityVisible(false)}>Later</Button>
                  <Button size="sm" className="h-7 text-xs" asChild>
                      <Link href="/tutor/settings?tab=security">Set Password</Link>
                  </Button>
              </div>
            </div>
          )}
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {isSecurityVisible ? "No other notifications" : "No new notifications"}
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <Link 
                  key={n.id} 
                  href="/tutor/assignments"
                  className="p-3 border-b border-border hover:bg-card transition-colors flex flex-col gap-1"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-foreground">{n.profiles?.full_name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Submitted: {n.module_items?.title || 'Assignment ' + n.assignment_number}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
