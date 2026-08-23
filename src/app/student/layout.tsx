import { StudentSidebar } from '@/components/app/student/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Suspense } from 'react';
import { PreviewBanner } from '@/components/app/preview-banner';
import { BottomNav } from '@/components/app/student/bottom-nav';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
