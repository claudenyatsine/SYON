'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BrainCircuit, Library, BarChart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/student', icon: LayoutDashboard, label: 'Home' },
  { href: '/student/study-panel', icon: BrainCircuit, label: 'Study' },
  { href: '/student/resources', icon: Library, label: 'Resources' },
  { href: '/student/progress', icon: BarChart, label: 'Progress' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 sm:hidden">
      <nav className="flex items-center justify-between bg-background dark:bg-[#1C1C1C] px-6 py-4 rounded-[2rem] shadow-2xl border border-border dark:border-border">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="relative flex flex-col items-center justify-center w-12 h-12"
            >
              <div
                className={cn(
                  "absolute inset-0 rounded-full transition-all duration-300",
                  isActive ? "bg-gold scale-100" : "bg-transparent scale-0"
                )}
              />
              <item.icon 
                className={cn(
                  "w-6 h-6 transition-colors duration-300 relative z-10",
                  isActive ? "text-background" : "text-foreground/ dark:text-muted-foreground"
                )} 
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
