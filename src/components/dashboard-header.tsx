
'use client';

import { Bell, Search, User, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { SidebarTrigger, useSidebar } from './ui/sidebar';
import { useTheme } from 'next-themes';
import { Icons } from './icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function DashboardHeader() {
  const { setTheme, theme } = useTheme();
  const { state: sidebarState, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm sm:gap-4 sm:px-6 lg:px-8">
      <div className="flex w-fit items-center justify-start gap-2 md:w-[250px]">
        <SidebarTrigger className="md:hidden" />
        {sidebarState === 'collapsed' && (
          <div className={cn('hidden items-center gap-2 md:flex')}>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Icons.panelLeft className="h-6 w-6" />
            </Button>
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl font-bold tracking-tight">
              Learnet<span className="text-primary">IQ</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses, resources..."
            className="h-9 w-full rounded-full bg-secondary pl-10 sm:h-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile">
              <DropdownMenuItem>Profile</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
             <Link href="/">
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
