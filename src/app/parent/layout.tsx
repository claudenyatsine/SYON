
'use client';
import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarTrigger, SidebarProvider, SidebarInset, SidebarFooter, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { Shield, LayoutDashboard, Settings, LogOut, SlidersHorizontal, Palette, MessageCircle, HelpCircle, Copy, Star, Bell } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { GlobalChatDrawer } from '@/components/chat/global-chat-drawer';

function ParentSidebar() {
    const [userName, setUserName] = React.useState('Parent');
    const [userInitials, setUserInitials] = React.useState('P');
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
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('loggedInUser');
            if (email) {
                const namePart = email.split('@')[0];
                try {
                    let nameGuess = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                    if (namePart.includes('.')) {
                        const parts = namePart.split('.');
                        const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                        const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
                        nameGuess = `${firstName} ${lastName}`;
                    }
                    setUserName(nameGuess);
                    
                    const nameParts = nameGuess.split(' ');
                    if (nameParts.length > 1) {
                        setUserInitials(`${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`);
                    } else {
                        setUserInitials(nameGuess.substring(0, 2).toUpperCase());
                    }
                } catch(e) {
                    setUserName('Parent');
                    setUserInitials('P');
                }
            }
        }
    }, []);

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarImage src="https://picsum.photos/seed/parent-avatar/100/100" alt="Parent" data-ai-hint="person portrait" />
                <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-xs text-muted-foreground">Signed in as,</span>
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
                    <Link href="/parent">
                        <SidebarMenuButton tooltip="Dashboard" isActive>
                            <LayoutDashboard />
                            <span>Dashboard</span>
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
                        <Link href="/parent/settings">
                            <Button variant="ghost" size="icon"><Settings /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut /></Button>
                    </div>
                </SidebarMenuItem>
             </SidebarMenu>
         </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ParentSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <SidebarTrigger />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
