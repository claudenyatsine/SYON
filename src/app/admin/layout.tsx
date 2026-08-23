
'use client';
import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarTrigger, SidebarProvider, SidebarInset, SidebarFooter, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { UserCog, LayoutDashboard, Folder, Calendar, Mail, Bell, BarChart, Settings, Plus, Star, Copy, Slack, CircleHelp, LogOut, GraduationCap, Users, ShieldCheck, CreditCard, UserCheck, SlidersHorizontal, Palette, MessageCircle, HelpCircle, MessageSquare, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { GlobalChatDrawer } from '@/components/chat/global-chat-drawer';

function AdminSidebar() {
  const [userName, setUserName] = React.useState('Admin User');
  const [userInitial, setUserInitial] = React.useState('AD');
  const { setTheme } = useTheme()
  const router = useRouter();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loggedInUser');
    }
    router.push('/login');
  };

  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (data?.full_name) {
          setUserName(data.full_name);
          
          const nameParts = data.full_name.trim().split(/\s+/);
          if (nameParts.length > 1) {
            setUserInitial(`${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase());
          } else {
            setUserInitial(data.full_name.substring(0, 2).toUpperCase());
          }
        }
      } else if (typeof window !== 'undefined') {
        // Fallback to localStorage if no session
        const email = localStorage.getItem('loggedInUser');
        if (email) {
          const namePart = email.split('@')[0];
          setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
          setUserInitial(namePart.substring(0, 2).toUpperCase());
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarImage src="https://picsum.photos/seed/admin-avatar/100/100" alt="Admin" data-ai-hint="person portrait" />
                <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-xs text-muted-foreground">Good Day 👋</span>
                <span className="text-base font-semibold">{userName}</span>
            </div>
            <SidebarTrigger className="ml-auto -translate-x-[5px]" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/admin">
                    <SidebarMenuButton tooltip="Dashboard">
                        <LayoutDashboard />
                        <span>Dashboard</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/admin/tutors">
                    <SidebarMenuButton tooltip="Tutors">
                      <GraduationCap />
                      <span>Tutors</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/admin/students">
                    <SidebarMenuButton tooltip="Students">
                      <Users />
                      <span>Students</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Link href="/admin/admins">
                    <SidebarMenuButton tooltip="Admins">
                      <UserCog />
                      <span>Admins</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Link href="/admin/enrollments">
                    <SidebarMenuButton tooltip="Enrollments">
                      <BookOpen />
                      <span>Enrollments</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Link href="/admin/validations">
                    <SidebarMenuButton tooltip="Validations">
                      <ShieldCheck />
                      <span>Validations</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Link href="/admin/billing">
                    <SidebarMenuButton tooltip="Billing">
                      <CreditCard />
                      <span>Billing</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Link href="/admin/community">
                    <SidebarMenuButton tooltip="Forums">
                      <MessageSquare />
                      <span>Forums</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
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
                        <Link href="/admin/settings">
                            <Button variant="ghost" size="icon"><Settings /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut /></Button>
                    </div>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Button className="w-full h-12 mt-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0" asChild>
                        <Link href="/admin/tutors">
                            <Plus className="group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6" />
                            <span className="group-data-[collapsible=icon]:hidden">New Invitation</span>
                        </Link>
                    </Button>
                </SidebarMenuItem>
             </SidebarMenu>
         </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
