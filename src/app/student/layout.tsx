import { StudentSidebar } from '@/components/app/student/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Suspense } from 'react';
import { PreviewBanner } from '@/components/app/preview-banner';
import { BottomNav } from '@/components/app/student/bottom-nav';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || user.user_metadata?.role || 'student';

  if (userRole !== 'student') {
    return redirect(`/${userRole}`);
  }

  return (
    <SidebarProvider>
      <StudentSidebar />
      <SidebarInset className="relative">
        <PreviewBanner />
        {/* Main Content Area - Add bottom padding on mobile to account for BottomNav */}
        <main className="flex-1 p-4 pb-28 sm:p-6 sm:pb-6">
          <Suspense>{children}</Suspense>
        </main>
        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}

