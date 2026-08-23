'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Briefcase, GraduationCap, Shield, UserCog, Eye } from 'lucide-react';
import Link from 'next/link';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

type Role = {
  name: UserRole;
  description: string;
  icon: React.ElementType;
  loginHref: string;
  previewHref: string;
};

const roles: Role[] = [
  {
    name: 'Student',
    description: 'Access your courses, track progress, and get AI help.',
    icon: GraduationCap,
    loginHref: '/login/student',
    previewHref: '/student',
  },
  {
    name: 'Tutor',
    description: 'Manage your courses, schedule classes, and grade assignments.',
    icon: Briefcase,
    loginHref: '/login/tutor',
    previewHref: '/tutor',
  },
  {
    name: 'Parent',
    description: "View your child's progress, reports, and communicate with tutors.",
    icon: Shield,
    loginHref: '/login/parent',
    previewHref: '/parent',
  },
  {
    name: 'School Admin',
    description: 'Oversee school operations, manage users, and view analytics.',
    icon: UserCog,
    loginHref: '/login/admin',
    previewHref: '/admin',
  },
];

export function RoleSelection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {roles.map((role) => (
        <Card
          key={role.name}
          className="bg-muted border-border hover:border-border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col rounded-3xl overflow-hidden group"
        >
          <Link href={role.loginHref} className="block flex-grow p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-muted p-3 rounded-2xl group-hover:bg-gold/10 transition-colors">
                <role.icon className="w-6 h-6 text-foreground group-hover:text-gold transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-foreground">{role.name}</h3>
            </div>
            <p className="text-foreground/ text-sm leading-relaxed">
              {role.description}
            </p>
          </Link>
          <div className="px-6 pb-4 mt-auto flex justify-end">
            <Link 
              href={role.previewHref} 
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/ hover:text-foreground transition-colors"
            >
              <Eye className="h-3 w-3" />
              <span>Preview Portal</span>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}

