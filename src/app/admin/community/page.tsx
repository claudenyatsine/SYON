'use client';

import React, { useState, useEffect } from 'react';
import { Search, LayoutGrid, List, Plus } from 'lucide-react';
import { GridLayout } from '@/components/app/community/GridLayout';
import { ListLayout } from '@/components/app/community/ListLayout';
import { RightSidebar } from '@/components/app/community/RightSidebar';
import { Button } from '@/components/ui/button';
import { useForumRealtime } from '../../../hooks/useForumRealtime';
import { createClient } from '@/utils/supabase/client';
import { CreateThreadModal } from '@/components/app/community/CreateThreadModal';
import { ThreadDetailModal } from '@/components/app/community/ThreadDetailModal';
import { Post } from '../../student/community/types';

export default function AdminForum() {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState<Post | null>(null);
  
  const { 
    posts, 
    communities, 
    broadcastNewPost, 
    broadcastNewComment, 
    broadcastCommentVoteUpdate, 
    broadcastVoteUpdate, 
    isLoaded 
  } = useForumRealtime();
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    fetchUser();
  }, []);

  // Sort communities by members for trending
  const trendingSubjects = [...communities].sort((a, b) => b.memberCount - a.memberCount);

  const finalThreads = posts;

  // Sync selected thread with posts to update comments in real-time
  const currentSelectedThread = selectedThread ? posts.find(p => p.id === selectedThread.id) || null : null;

  const handleCreateThread = async (data: { title: string; content: string; subject_id: string }) => {
    await broadcastNewPost({
      id: crypto.randomUUID(),
      subject_id: data.subject_id,
      user_id: currentUserId || 'current_user',
      title: data.title,
      content: data.content,
      votes: 0,
      created_at: new Date().toISOString(),
    } as any);
  };

  const handleAddComment = (postId: string, text: string, parentId: string | null) => {
    broadcastNewComment(postId, {
      id: crypto.randomUUID(),
      text,
      author: 'Current User', // Realtime will update this to their name
      parent_id: parentId,
      votes: 0,
      created_at: new Date().toISOString(),
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* Container matching admin layout boundaries */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Community Forums</h1>
            <p className="text-foreground/60 text-sm font-medium mt-1">Connect. Share. Learn Together.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative group">
              <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                placeholder="Search forums..."
                className="h-10 pl-10 pr-4 bg-muted border border-border rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all w-64 placeholder:text-foreground/40"
              />
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center bg-muted border border-border p-1 rounded-full shrink-0">
              <button
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded-full transition-all ${
                  layout === 'grid'
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-foreground/50 hover:text-foreground hover:bg-background/50'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`p-1.5 rounded-full transition-all ${
                  layout === 'list'
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-foreground/50 hover:text-foreground hover:bg-background/50'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Create Thread Button */}
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="h-10 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] shrink-0 gap-2 px-6"
            >
              <Plus className="w-4 h-4" />
              Create Thread
            </Button>
          </div>
        </div>

        {/* Main Content Layout (2 columns here, 3rd column is global sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          
          {/* Central Main Content Feed */}
          <main className="min-w-0">
            {layout === 'grid' 
              ? <GridLayout communities={communities} threads={finalThreads} onThreadClick={setSelectedThread} onVote={broadcastVoteUpdate} /> 
              : <ListLayout communities={communities} threads={finalThreads} onThreadClick={setSelectedThread} onVote={broadcastVoteUpdate} />}
          </main>

          {/* Right Sidebar (Widgets) */}
          <aside className="sticky top-8">
            <RightSidebar trendingSubjects={trendingSubjects} />
          </aside>

        </div>
      </div>

      <CreateThreadModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        communities={communities}
        onSubmit={handleCreateThread}
      />

      <ThreadDetailModal
        isOpen={!!selectedThread}
        onClose={() => setSelectedThread(null)}
        thread={currentSelectedThread}
        currentUserId={currentUserId}
        onAddComment={handleAddComment}
        onVoteComment={broadcastCommentVoteUpdate}
        onVoteThread={broadcastVoteUpdate}
      />
    </div>
  );
}
