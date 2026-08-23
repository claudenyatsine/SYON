'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { createClient } from '@/utils/supabase/client';
import {
  LayoutDashboard,
  BookOpenCheck,
  Users,
  FileText,
  Settings,
  LogOut,
  Plus,
  Video,
  HelpCircle,
  MessageCircle,
  Palette,
  Lock,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUser } from '@/components/providers/user-context';
import { TutorNotifications } from '@/components/app/tutor/tutor-notifications';
import { GlobalChatDrawer } from '@/components/chat/global-chat-drawer';

export function TutorSidebar() {
  const pathname = usePathname();
  const { profile, loading } = useUser();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { href: '/tutor', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/tutor/courses', icon: BookOpenCheck, label: 'My Courses' },
    { href: '/tutor/students', icon: Users, label: 'My Students' },
    { href: '/tutor/assignments', icon: FileText, label: 'Grade' },
    { href: '/tutor/live-classes', icon: Video, label: 'Live Classes' },
    { href: '/tutor/community', icon: MessageSquare, label: 'Forums' },
  ];

  const userName = profile?.full_name || 'Tutor';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'T';

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || 'Tutor'}`}
              alt="Tutor"
            />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-xs text-muted-foreground">Welcome back,</span>
            <span className="text-base font-semibold">{userName}</span>
          </div>
          <SidebarTrigger className="ml-auto -translate-x-[5px]" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
                const restricted = !!(profile && !profile.is_approved && item.href !== '/tutor' && item.href !== '/tutor/settings');

                const ButtonContent = (
                    <SidebarMenuButton 
                        tooltip={restricted ? 'Restricted in Preview Mode' : item.label} 
                        isActive={pathname === item.href}
                        disabled={restricted}
                        className={restricted ? "opacity-50" : ""}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                        {restricted && <Lock className="ml-auto w-4 h-4 text-muted-foreground" />}
                    </SidebarMenuButton>
                );

                return (
                <SidebarMenuItem key={item.label}>
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
                        <GlobalChatDrawer trigger={<Button variant="ghost" size="icon"><MessageCircle /></Button>} />
                        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                            <Palette />
                        </Button>
                        <TutorNotifications />
                        <Link href="/tutor/settings"><Button variant="ghost" size="icon"><Settings /></Button></Link>
                        <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut /></Button>
                    </div>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Button className="w-full h-12 mt-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0" asChild>
                        <Link href="#">
                            <Plus className="group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6" />
                            <span className="group-data-[collapsible=icon]:hidden">Create new task</span>
                        </Link>
                    </Button>
                </SidebarMenuItem>
             </SidebarMenu>
         </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
