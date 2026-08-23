import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { FORUM_RULES } from './mockData';
import { Community } from '../../../hooks/useForumRealtime';

export function RightSidebar({ trendingSubjects }: { trendingSubjects: Community[] }) {
  return (
    <div className="space-y-8">
      {/* Trending Subjects Card */}
      <div className="bg-card border border-border rounded-3xl p-6">
        <h3 className="font-headline font-bold text-lg text-foreground mb-6">Trending Subjects</h3>
        <ol className="space-y-4 counter-reset-trending">
          {trendingSubjects.slice(0, 5).map((subject, index) => (
            <li key={subject.id} className="flex items-start gap-4 group">
              <div className="text-2xl font-headline font-bold text-foreground/20 group-hover:text-accent transition-colors leading-none pt-1 shrink-0">
                {index + 1}
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm group-hover:text-accent transition-colors cursor-pointer line-clamp-1">
                  {subject.name}
                </h4>
                <p className="text-xs text-foreground/50 mt-1 font-medium">{subject.memberCount.toLocaleString()} Members</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 pt-4 border-t border-border flex justify-center">
          <Link href="#" className="text-sm font-bold text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Forum Rules Card */}
      <div className="bg-card border border-border rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-accent" />
          </div>
          <h3 className="font-headline font-bold text-lg text-foreground">Forum Rules</h3>
        </div>
        <ol className="space-y-3 text-sm text-foreground/70 font-medium list-decimal list-inside marker:text-foreground/40 marker:font-bold">
          {FORUM_RULES.map((rule, idx) => (
            <li key={idx} className="leading-relaxed pl-1">
              <span className="ml-1">{rule}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
