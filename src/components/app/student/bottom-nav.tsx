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
  { href: '/student/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <div className="p-3 pointer-events-auto">
        <nav className="flex items-center justify-around bg-card/90 dark:bg-[#18181b]/95 backdrop-blur-2xl px-2 py-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] border border-border/80 dark:border-white/10">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/student' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-95",
                  isActive ? "text-gold font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-1 rounded-xl transition-colors duration-200",
                  isActive ? "bg-gold/15 text-gold" : "text-muted-foreground"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
