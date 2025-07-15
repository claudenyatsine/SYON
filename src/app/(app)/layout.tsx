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
  SidebarGroup,
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
  Home,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Icons.logo className="h-8 w-8 text-primary" />
              <span className="font-headline text-xl font-bold tracking-tight">TutorHub</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/dashboard" tooltip="Dashboard" isActive>
                  <LayoutDashboard />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/resources" tooltip="Resources">
                  <BookOpen />
                  Resources
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/forums" tooltip="Forums">
                  <Users />
                  Forums
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/messages" tooltip="Messages">
                  <MessageSquare />
                  Messages
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/progress" tooltip="Progress">
                  <BarChart3 />
                  Progress
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/live-classes" tooltip="Live Classes">
                  <Video />
                  Live Classes
                </SidebarMenuButton>
              </SidebarMenuItem>
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
        <main className="flex-1">
          <DashboardHeader />
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
