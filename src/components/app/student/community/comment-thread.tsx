'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface ForumComment {
  id: string;
  content: string;
  created_at: string;
  author: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

function CommentItem({ comment }: { comment: ForumComment }) {
  const name = comment.author?.full_name ?? 'Unknown';
  return (
    <div className="flex gap-4">
      <Avatar className="h-8 w-8 mt-1 shrink-0">
        <AvatarImage src={comment.author?.avatar_url ?? undefined} alt={name} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(comment.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
}

export function CommentThread({ comments }: { comments: ForumComment[] }) {
  if (!comments || comments.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No comments yet. Start the conversation!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
