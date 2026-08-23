'use client';

import { ProgressCharts } from "@/components/app/student/progress/progress-charts";
import { Search, Bell, MoreHorizontal, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/components/providers/user-context";

export default function ProgressPage() {
  const { profile } = useUser();
  const userName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Student';

  return (
    <div className="space-y-8 bg-neutral-50/50 dark:bg-background/10 min-h-screen p-2 sm:p-6 rounded-[2rem]">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-foreground/">
            Welcome Back {userName}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            You've completed 3 lessons today — keep it up!
          </p>
        </div>


      </div>

      <ProgressCharts />
    </div>
  );
}
