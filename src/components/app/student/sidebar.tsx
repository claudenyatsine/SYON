
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  BarChart,
  Library,
  Settings,
  LogOut,
  SlidersHorizontal,
  Palette,
  MessageCircle,
  HelpCircle,
  Copy,
  Star,
  Bell,
  Plus,
  BrainCircuit,
  Video,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import React from 'react';
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUser } from '@/components/providers/user-context';
import { GlobalChatDrawer } from '@/components/chat/global-chat-drawer';

const navItems = [
  { href: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/student/study-panel', icon: BrainCircuit, label: 'Study Panel' },
  { href: '/student/live-classes', icon: Video, label: 'Live Classes' },
  { href: '/student/community', icon: MessageSquare, label: 'Forums' },
  { href: '/student/resources', icon: Library, label: 'Resources' },
  { href: '/student/progress', icon: BarChart, label: 'Progress' },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { profile, loading } = useUser();
  const { setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const userName = profile?.full_name || 'Student';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'S';

  return (
    <Sidebar variant="floating" collapsible="icon" className="bg-background backdrop-blur-xl border-gold/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <SidebarHeader>
        <div className="flex items-center gap-3 w-full overflow-hidden">
            <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || 'Student'}`} alt={userName} data-ai-hint="student portrait" />
                <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0">
                <span className="text-[10px] text-muted-foreground leading-tight">Welcome back,</span>
                <span className="text-sm font-semibold truncate" title={userName}>{userName}</span>
            </div>
            <SidebarTrigger className="ml-auto shrink-0 -translate-x-[5px]" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const restricted = !!(profile && !profile.is_approved && item.href !== '/student');
              
              const ButtonContent = (
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href) && (item.href !== '/student' || pathname === '/student')}
                    tooltip={restricted ? 'Restricted in Preview Mode' : item.label}
                    disabled={restricted}
                    className={restricted ? "opacity-50" : ""}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    {restricted && <Lock className="ml-auto w-4 h-4 text-muted-foreground" />}
                  </SidebarMenuButton>
              );

              return (
              <SidebarMenuItem key={item.href}>
                {restricted ? (
                    ButtonContent
                ) : (
                    <Link href={item.href}>
                      {ButtonContent}
                    </Link>
                )}
              </SidebarMenuItem>
            )})}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                    <div className="flex justify-around items-center group-data-[collapsible=icon]:hidden">
                        <Link href="#"><Button variant="ghost" size="icon"><HelpCircle /></Button></Link>
                        <GlobalChatDrawer trigger={<Button variant="ghost" size="icon"><MessageCircle /></Button>} />
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                <Palette />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="mb-2">
                                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Link href="/student/settings"><Button variant="ghost" size="icon"><Settings /></Button></Link>
                        <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut /></Button>
                    </div>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Button className="w-full h-10 mt-1 group relative flex items-center justify-center gap-2 bg-background dark:bg-white text-foreground dark:text-foreground px-4 rounded-xl font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neutral-900/10 dark:hover:shadow-white/10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0" asChild>
                        <Link href="#">
                            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
                            <span className="text-sm group-data-[collapsible=icon]:hidden">Create New Task</span>
                        </Link>
                    </Button>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

