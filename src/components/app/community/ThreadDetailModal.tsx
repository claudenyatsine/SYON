import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Send, Reply } from 'lucide-react';
import { Post, CommentType } from '@/app/student/community/types';

interface ThreadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: Post | null;
  currentUserId: string | null;
  onAddComment: (postId: string, text: string, parentId: string | null) => void;
  onVoteComment: (postId: string, commentId: string, newVotes: number) => void;
  onVoteThread: (postId: string, newVotes: number) => void;
}

export function ThreadDetailModal({ 
  isOpen, 
  onClose, 
  thread, 
  currentUserId,
  onAddComment, 
  onVoteComment,
  onVoteThread
}: ThreadDetailModalProps) {
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommentType | null>(null);

  if (!thread) return null;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    
    onAddComment(thread.id, newCommentText, replyingTo?.id || null);
    setNewCommentText('');
    setReplyingTo(null);
  };

  const handleCommentVote = (comment: CommentType, change: number) => {
    const currentVotes = comment.votes || 0;
    onVoteComment(thread.id, comment.id, currentVotes + change);
  };

  const handleThreadVote = (change: number) => {
    onVoteThread(thread.id, thread.votes + change);
  };

  // Helper to render nested comments
  const renderComments = (parentId: string | null = null, depth: number = 0) => {
    const childComments = (thread.comments || []).filter(c => 
      (parentId === null && !c.parent_id) || (c.parent_id === parentId)
    );

    return childComments.map(comment => (
      <div key={comment.id} className={`flex gap-3 ${depth > 0 ? 'ml-8 mt-4 border-l-2 border-border/50 pl-4' : 'mt-6'}`}>
        <div className="flex flex-col items-center gap-1 shrink-0">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.author}`} />
            <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center mt-2 bg-muted rounded-full p-1">
            <button 
              onClick={() => handleCommentVote(comment, 1)}
              className="p-1 hover:text-accent hover:bg-background rounded-full transition-colors"
            >
              <ArrowBigUp className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-bold my-1">{comment.votes || 0}</span>
            <button 
              onClick={() => handleCommentVote(comment, -1)}
              className="p-1 hover:text-red-500 hover:bg-background rounded-full transition-colors"
            >
              <ArrowBigDown className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-card border border-border rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm">{comment.author}</span>
            <span className="text-xs text-foreground/50">
              {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Just now'}
            </span>
          </div>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{comment.text}</p>
          <div className="mt-2 flex items-center gap-4">
            <button 
              onClick={() => setReplyingTo(comment)}
              className="text-xs font-medium text-foreground/50 hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Reply className="w-3 h-3" /> Reply
            </button>
          </div>
          
          {/* Render children of this comment */}
          {renderComments(comment.id, depth + 1)}
        </div>
      </div>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] h-[85vh] flex flex-col p-0 overflow-hidden bg-background">
        
        {/* Header */}
        <div className="p-6 border-b border-border bg-card shrink-0">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-1 bg-muted p-2 rounded-xl shrink-0">
              <button onClick={() => handleThreadVote(1)} className="hover:text-accent transition-colors">
                <ArrowBigUp className="w-5 h-5" />
              </button>
              <span className="font-bold text-sm">{thread.votes}</span>
              <button onClick={() => handleThreadVote(-1)} className="hover:text-red-500 transition-colors">
                <ArrowBigDown className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-1 bg-accent/20 text-accent-foreground rounded-full">
                  {thread.community_name || 'General'}
                </span>
                <span className="text-xs text-foreground/50">
                  Posted by {thread.author_name} • {new Date(thread.created_at).toLocaleDateString()}
                </span>
              </div>
              <DialogTitle className="text-xl font-bold mb-2">{thread.title}</DialogTitle>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{thread.content}</p>
            </div>
          </div>
        </div>

        {/* Comments Area */}
        <ScrollArea className="flex-1 p-6 bg-muted/20">
          <h3 className="font-bold flex items-center gap-2 text-sm mb-4">
            <MessageSquare className="w-4 h-4" /> 
            {thread.comments?.length || 0} Comments
          </h3>
          
          <div className="pb-8">
            {renderComments(null, 0)}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card shrink-0">
          {replyingTo && (
            <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg mb-3 text-sm">
              <span className="text-foreground/70">
                Replying to <span className="font-bold text-foreground">{replyingTo.author}</span>
              </span>
              <button onClick={() => setReplyingTo(null)} className="text-foreground/50 hover:text-foreground font-bold">
                ✕
              </button>
            </div>
          )}
          <form onSubmit={handleSubmitComment} className="flex gap-2 items-end">
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarFallback>Me</AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <Input 
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                className="pr-12 bg-background border-border rounded-full"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!newCommentText.trim()}
                className="absolute right-1 top-1 w-8 h-8 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

      </DialogContent>
    </Dialog>
  );
}
