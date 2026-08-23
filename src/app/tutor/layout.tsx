import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React, { Suspense } from 'react';

// Only this route segment (and children) opt into dynamic server rendering.
// The root layout is now static-cacheable.
export const dynamic = 'force-dynamic';
import { SchoolHeader } from '@/components/app/school-header';
import { TutorSidebar } from '@/components/app/tutor/tutor-sidebar';
import { PreviewBanner } from '@/components/app/preview-banner';

export default async function TutorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // If profile is missing or role is not tutor, fallback to metadata or redirect
    const userRole = profile?.role || user.user_metadata?.role || 'student';
    
    if (userRole !== 'tutor') {
        return redirect(`/${userRole}`);
    }

    return (
        <SidebarProvider>
            <TutorSidebar />
            <SidebarInset>
                <PreviewBanner />
                <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b bg-background px-3 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-4 md:hidden">
                    <SidebarTrigger />
                    <div className="flex-1">
                        <SchoolHeader />
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto">
                    <Suspense>{children}</Suspense>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
