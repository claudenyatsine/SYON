import React, { useState, useEffect } from 'react';
import { ChevronDown, MessageSquare, Eye } from 'lucide-react';
import Image from 'next/image';
import { Post } from '../../../app/student/community/types';
import { Community } from '../../../hooks/useForumRealtime';

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

export function ListLayout({ 
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(6);
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

  const filteredThreads = threads.filter(t => activeFilter === 'all' || t.subject_id === activeFilter);
  const visibleThreads = filteredThreads.slice(0, visibleCount);
  const hasMore = visibleCount < filteredThreads.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  return (
    <div className="space-y-6">
      {/* Filter Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => { setActiveFilter('all'); setVisibleCount(6); }}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeFilter === 'all'
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-foreground/60 hover:bg-muted/80'
            }`}
          >
            All Threads
          </button>
          {communities.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveFilter(cat.id); setVisibleCount(6); }}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                activeFilter === cat.id
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-foreground/60 hover:bg-muted/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-bold text-foreground/70 hover:bg-muted transition-colors shrink-0">
          Filter <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Threads Table/List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[3fr_1.5fr_1fr_1fr_1fr] gap-4 p-4 border-b border-border bg-muted/30">
          <div className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Thread</div>
          <div className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Category</div>
          <div className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Replies</div>
          <div className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Views</div>
          <div className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Activity</div>
        </div>

        <div className="divide-y divide-border">
          {visibleThreads.map((thread) => {
            const commIdx = communities.findIndex(c => c.id === thread.subject_id);
            const colors = getColorForId(thread.subject_id || '', commIdx >= 0 ? commIdx : 0);
            return (
              <div
                key={thread.id}
                onClick={() => onThreadClick && onThreadClick(thread)}
                className="grid grid-cols-1 md:grid-cols-[3fr_1.5fr_1fr_1fr_1fr] gap-4 p-4 items-center hover:bg-muted/20 transition-colors group cursor-pointer"
              >
                {/* Thread Column */}
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
                    <MessageSquare className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm leading-tight group-hover:text-accent transition-colors line-clamp-1">
                      {thread.title}
                    </h3>
                    <p className="text-xs text-foreground/50 mt-1 line-clamp-1">{thread.content}</p>
                  </div>
                </div>

                {/* Category Column */}
                <div className="hidden md:block">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap ${colors.bg} ${colors.text}`}>
                    {thread.community_name}
                  </span>
                </div>

                {/* Replies Column */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onThreadClick) onThreadClick(thread);
                  }}
                  className="hidden md:flex items-center gap-1.5 text-sm font-bold text-foreground/70 hover:text-accent cursor-pointer transition-colors"
                >
                  {thread.comments?.length || 0} <span className="md:hidden">Replies</span>
                </div>

                {/* Views Column */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(thread.id, thread.votes || 0);
                  }}
                  className={`hidden md:flex items-center gap-1.5 text-sm font-bold cursor-pointer transition-colors ${
                    upvotedThreads[thread.id] ? 'text-accent font-bold' : 'text-foreground/70 hover:text-accent'
                  }`}
                >
                  {thread.votes || 0} <span className="md:hidden">Votes</span>
                </div>

                {/* Activity Column */}
                <div className="flex items-center gap-3 mt-3 md:mt-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                    {thread.author_avatar && (
                      <Image src={thread.author_avatar} alt={thread.author_name || 'User'} width={32} height={32} className="object-cover w-full h-full" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground truncate">{thread.author_name}</span>
                    <span className="text-[10px] font-medium text-foreground/50">
                      {new Date(thread.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Load More Button */}
      <div className="mt-8 flex justify-center">
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
    </div>
  );
}
