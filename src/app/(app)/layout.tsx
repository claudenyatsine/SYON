
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  BarChart3,
  Video,
  Settings,
  LogOut,
  PanelLeft,
  Library,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/subjects', icon: Library, label: 'Subjects' },
  { href: '/resources', icon: BookOpen, label: 'Resources' },
  { href: '/forums', icon: Users, label: 'Forums' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/progress', icon: BarChart3, label: 'Progress' },
  { href: '/live-classes', icon: Video, label: 'Live Classes' },
];

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state: sidebarState, toggleSidebar } = useSidebar();

  return (
    <>
      <Sidebar variant="inset" collapsible="offcanvas">
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icons.logo className="h-8 w-8 text-primary" />
              <span className="font-headline text-xl font-bold tracking-tight">
                Learnet<span className="text-primary">IQ</span>
              </span>
            </div>
            <SidebarMenuButton
              tooltip="Collapse"
              size="icon"
              variant="ghost"
              className="hidden h-8 w-8 md:flex"
              onClick={toggleSidebar}
            >
              {sidebarState === 'expanded' ? (
                <Icons.closeX className="text-foreground" />
              ) : (
                <PanelLeft />
              )}
            </SidebarMenuButton>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    href={item.href}
                    tooltip={item.label}
                    className={cn(
                      isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                    )}
                  >
                    <item.icon />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Settings">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/" tooltip="Log Out">
                <LogOut />
                Log Out
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppLayoutContent>{children}</AppLayoutContent>
      </div>
    </SidebarProvider>
  );
}
