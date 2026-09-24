'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { SchoolHeader } from '@/components/app/school-header';

export function StudentMobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-3 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-4 md:hidden">
      <SidebarTrigger className="h-9 w-9 shrink-0" />
      <div className="flex-1 min-w-0">
        <SchoolHeader />
      </div>
    </header>
  );
}
