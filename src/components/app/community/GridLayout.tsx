import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Pin, MessageSquare, Eye } from 'lucide-react';
import Image from 'next/image';
import { Post } from '../../../app/student/community/types';
import { Community } from '../../../hooks/useForumRealtime';

// A simple color map based on community ID to give each one a distinct pastel look
const getColorForId = (id: string, index: number) => {
  const styles = [
    { bg: 'bg-orange-100', text: 'text-orange-600' },
    { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    { bg: 'bg-purple-100', text: 'text-purple-600' },
    { bg: 'bg-blue-100', text: 'text-blue-600' },
    { bg: 'bg-rose-100', text: 'text-rose-600' },
  ];
  return styles[index % styles.length];
};

const getSubjectImage = (subjectName: string) => {
  const lower = subjectName.toLowerCase();
  if (lower.includes('account')) return '/accounting.png';
  if (lower.includes('biolog')) return '/Biology.png';
  if (lower.includes('business')) return '/Business.png';
  if (lower.includes('chemist')) return '/chemistry.png';
  if (lower.includes('economic')) return '/Economics.png';
  if (lower.includes('literature')) return '/englishlitariture.png';
  if (lower.includes('english')) return '/englishlanguage.png';
  if (lower.includes('further math')) return '/further mathematic.png';
  if (lower.includes('math')) return '/maths.png';
  if (lower.includes('geograph')) return '/geography.png';
  if (lower.includes('histor')) return '/history.png';
  if (lower.includes('physic')) return '/physics.png';
  return '/science.png'; // default fallback
};

export function GridLayout({ 
  communities, 
  threads, 
  onThreadClick,
  onVote 
}: { 
  communities: Community[], 
  threads: Post[], 
  onThreadClick?: (thread: Post) => void,
  onVote?: (threadId: string, newVotes: number) => void
}) {
  const [visibleCount, setVisibleCount] = useState(4);
  const [upvotedThreads, setUpvotedThreads] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('upvoted_threads');
      if (stored) {
        setUpvotedThreads(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleVote = (threadId: string, currentVotes: number) => {
    const isUpvoted = !!upvotedThreads[threadId];
    const newVotes = isUpvoted ? currentVotes - 1 : currentVotes + 1;
    
    const newUpvoted = { ...upvotedThreads, [threadId]: !isUpvoted };
    setUpvotedThreads(newUpvoted);
    try {
      localStorage.setItem('upvoted_threads', JSON.stringify(newUpvoted));
    } catch (e) {
      console.error(e);
    }

    if (onVote) {
      onVote(threadId, newVotes);
    }
  };

  const visibleThreads = threads.slice(0, visibleCount);
  const hasMore = visibleCount < threads.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  return (
    <div className="space-y-10">
      {/* Categories Row */}
      <section>
        <h2 className="text-sm font-bold text-foreground/60 uppercase tracking-widest mb-4">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communities.map((category, idx) => {
            const colors = getColorForId(category.id, idx);
            return (
              <div
                key={category.id}
                className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`}>
                  <div className="w-5 h-5 rounded-full bg-current opacity-70" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base leading-tight">{category.name}</h3>
                  <p className="text-xs text-foreground/50 mt-1 font-medium">{category.memberCount.toLocaleString()} Members</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Threads Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-foreground/60 uppercase tracking-widest">Recent Threads</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleThreads.map((thread) => {
            const commIdx = communities.findIndex(c => c.id === thread.subject_id);
            const colors = getColorForId(thread.subject_id || '', commIdx >= 0 ? commIdx : 0);
            return (
              <div
                key={thread.id}
                onClick={() => onThreadClick && onThreadClick(thread)}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col h-full hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
              >
                {/* Background Image Blending */}
                <div 
                  className="absolute top-0 right-0 w-[60%] h-full opacity-[0.23] pointer-events-none select-none transition-opacity group-hover:opacity-[0.30]"
                  style={{
                    maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                    WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
                  }}
                >
                  <Image 
                    src={getSubjectImage(thread.community_name || '')} 
                    alt="" 
                    fill 
                    className="object-cover object-right-top mix-blend-luminosity" 
                  />
                </div>

                {/* Content Container to keep it above background */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {/* Assuming threads with > 5 votes might be 'pinned' or 'hot' */}
                      {thread.votes > 5 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-accent px-2 py-1 rounded-md bg-accent/10">
                          <Pin className="w-3 h-3" />
                          Hot
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${colors.bg} ${colors.text}`}>
                        {thread.community_name}
                      </span>
                    </div>
                    <button className="text-foreground/40 hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-accent transition-colors">
                      {thread.title}
                    </h3>
                    <p className="text-sm text-foreground/60 mt-2 line-clamp-2 leading-relaxed">
                      {thread.content}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border border-border">
                        {thread.author_avatar && (
                           <Image src={thread.author_avatar} alt={thread.author_name || 'User'} width={32} height={32} className="object-cover w-full h-full" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{thread.author_name}</p>
                        <p className="text-[10px] font-medium text-foreground/50">
                          {new Date(thread.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-foreground/50 text-xs font-medium">
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onThreadClick) onThreadClick(thread);
                        }}
                        className="flex items-center gap-1.5 hover:text-accent transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {thread.comments?.length || 0}
                      </span>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(thread.id, thread.votes || 0);
                        }}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                          upvotedThreads[thread.id] ? 'text-accent font-bold' : 'hover:text-accent'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        {thread.votes || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        <div className="mt-10 flex justify-center">
          {hasMore ? (
            <button 
              onClick={handleLoadMore}
              className="text-sm font-bold text-foreground/60 hover:text-foreground border border-border hover:border-foreground/30 rounded-full px-6 py-2.5 transition-all flex items-center gap-2 bg-transparent cursor-pointer"
            >
              Load More Threads <span className="text-xs">∨</span>
            </button>
          ) : (
            <p className="text-sm font-medium text-foreground/40 px-6 py-2.5">
              No more threads to load.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
