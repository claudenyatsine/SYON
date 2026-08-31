'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getCurriculumBoard, getSubjectLevel, getSubjectCode, SubjectLike } from '@/utils/subject-utils';
import { Landmark, GraduationCap, Award, BookOpen } from 'lucide-react';

interface CurriculumBoardBadgeProps {
  board?: string | null;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function CurriculumBoardBadge({ board, className = '', size = 'default' }: CurriculumBoardBadgeProps) {
  const isCambridge = (board || '').toLowerCase().includes('cambridge');
  const sizeClasses = size === 'sm' 
    ? 'text-[9px] px-1.5 py-0.5' 
    : size === 'lg' 
    ? 'text-xs px-3 py-1 font-bold' 
    : 'text-[10px] px-2 py-0.5 font-semibold';

  if (isCambridge) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-300 font-medium ${sizeClasses} ${className}`}>
        <Award className="w-3 h-3 text-sky-400 shrink-0" />
        <span>Cambridge CIE</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 text-gold font-medium ${sizeClasses} ${className}`}>
      <Landmark className="w-3 h-3 text-gold shrink-0" />
      <span>ZIMSEC</span>
    </span>
  );
}

interface SubjectLevelBadgeProps {
  level?: string | null;
  className?: string;
  size?: 'sm' | 'default';
}

export function SubjectLevelBadge({ level, className = '', size = 'default' }: SubjectLevelBadgeProps) {
  const lvl = level || 'O-Level';
  const sizeClasses = size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5';

  const isZJC = lvl.includes('ZJC') || lvl.includes('Form 1');
  const isALevel = lvl.includes('A-Level') || lvl.includes('Advanced');
  const isIGCSE = lvl.includes('IGCSE');

  let colorClasses = 'border-border bg-muted/60 text-muted-foreground';
  if (isZJC) {
    colorClasses = 'border-amber-500/30 bg-amber-950/30 text-amber-300';
  } else if (isALevel) {
    colorClasses = 'border-purple-500/30 bg-purple-950/30 text-purple-300';
  } else if (isIGCSE) {
    colorClasses = 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300';
  } else {
    colorClasses = 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300';
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${colorClasses} ${sizeClasses} ${className}`}>
      <GraduationCap className="w-3 h-3 shrink-0" />
      <span>{lvl}</span>
    </span>
  );
}

interface SubjectFullBadgeProps {
  subject?: SubjectLike | null;
  className?: string;
  showCategory?: boolean;
}

export function SubjectFullBadge({ subject, className = '', showCategory = false }: SubjectFullBadgeProps) {
  if (!subject) return null;
  const board = getCurriculumBoard(subject);
  const level = getSubjectLevel(subject);
  const code = getSubjectCode(subject);

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      <CurriculumBoardBadge board={board} size="sm" />
      <SubjectLevelBadge level={level} size="sm" />
      {showCategory && subject.category && (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-border bg-muted text-muted-foreground">
          {subject.category}
        </span>
      )}
    </div>
  );
}
