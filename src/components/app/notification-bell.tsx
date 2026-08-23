'use client'

import { Bell, ShieldAlert, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from 'next/link';
import { useUser } from '@/components/providers/user-context';
import { useEffect, useState } from 'react';

export function NotificationBell() {
  const { user } = useUser();
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  useEffect(() => {
    // Check if user is logged in via Google (OAuth)
    if (user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google')) {
      setIsAlertVisible(true);
    }
  }, [user]);

  const hasNotifications = isAlertVisible;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 relative hover:bg-secondary/70">
          {hasNotifications && <span className="absolute top-2 right-2 w-2 h-2 bg-burgundy rounded-full animate-pulse shadow-sm"></span>}
          <Bell className="w-4 h-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 mr-4 sm:mr-8 mt-2 border border-border shadow-2xl rounded-[1.5rem] bg-muted dark:bg-[#1a1f2c]/90 backdrop-blur-xl z-50" align="end">
        <h3 className="font-bold text-lg mb-4 px-1">Notifications</h3>
        {hasNotifications ? (
          <div className="flex flex-col gap-3">
             {isAlertVisible && (
                <div className="relative bg-amber-50/80 dark:bg-gold/30 backdrop-blur-md border border-gold/50 dark:border-gold/50 rounded-2xl p-4 shadow-sm">
                  <button 
                    onClick={() => setIsAlertVisible(false)}
                    className="absolute top-3 right-3 text-gold/50 hover:text-gold transition-colors p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex gap-3 mb-3">
                    <div className="bg-gold dark:bg-gold/50 p-2 rounded-xl h-fit">
                      <ShieldAlert className="w-4 h-4 text-gold dark:text-gold" />
                    </div>
                    <div className="pt-0.5">
                      <h4 className="font-bold text-gold dark:text-gold text-sm leading-none mb-1">Secure Your Account</h4>
                      <p className="text-[11px] text-gold/80 dark:text-gold/80 pr-4 leading-tight">We noticed you logged in via Google. Set a password for backup access.</p>
                    </div>
                  </div>
                  <Button asChild className="w-full bg-gold/50 dark:bg-gold/50 hover:bg-gold dark:hover:bg-gold/10 text-gold dark:text-gold text-[11px] font-bold py-2 rounded-xl transition-colors h-auto uppercase tracking-wide">
                    <Link href="/student/settings?tab=security">Setup Password</Link>
                  </Button>
                </div>
             )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-background/5 dark:bg-muted flex items-center justify-center mx-auto mb-3">
              <Bell className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground">You're all caught up</p>
            <p className="text-[11px] text-muted-foreground mt-1">Check back later for new alerts</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
