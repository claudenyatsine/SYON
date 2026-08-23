'use client';

import { createClient } from '@/utils/supabase/client';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  CommentThread,
  type ForumComment,
} from '@/components/app/student/community/comment-thread';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUser } from '@/components/providers/user-context';

export default function PostPage() {
  const params = useParams();
  const communityId = Array.isArray(params.communityId)
    ? params.communityId[0]
    : params.communityId;
  const postId = Array.isArray(params.postId) ? params.postId[0] : params.postId;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { profile } = useUser();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: postData } = await supabase
        .from('posts')
        .select(
          `
          *,
          author:profiles!posts_user_id_fkey (
            full_name,
            avatar_url
          )
        `
        )
        .eq('id', postId)
        .single();

      if (postData) setPost(postData);

      const { data: commentsData } = await supabase
        .from('forum_comments')
        .select(
          `
          *,
          author:profiles!forum_comments_author_id_fkey (
            full_name,
            avatar_url
          )
        `
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsData) setComments(commentsData as ForumComment[]);
      setLoading(false);
    };

    if (postId) {
      fetchData();

      // Real-time subscription for new comments
      const channel = supabase
        .channel(`post-comments-${postId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'forum_comments',
            filter: `post_id=eq.${postId}`,
          },
          (payload) => {
            supabase
              .from('forum_comments')
              .select(
                `
                *,
                author:profiles!forum_comments_author_id_fkey (
                  full_name,
                  avatar_url
                )
              `
              )
              .eq('id', payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) setComments((current) => [...current, data as ForumComment]);
              });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !profile?.id || !postId) return;

    setSubmitting(true);
    const { error } = await supabase.from('forum_comments').insert({
      post_id: postId,
      author_id: profile.id,
      content: commentText.trim(),
    });

    if (!error) {
      setCommentText('');
    } else {
      console.error('Failed to post comment:', error);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/student/community/${communityId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to community
        </Link>
      </Button>

      {/* Post header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={post.author?.avatar_url}
                alt={post.author?.full_name}
              />
              <AvatarFallback>{post.author?.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{post.author?.full_name || 'Unknown'}</span>
          </div>
          <span>&middot;</span>
          <span>
            {new Date(post.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Post body */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
          {post.image_url && (
            <div className="relative aspect-video w-full rounded-md overflow-hidden border bg-muted">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-contain"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Comment form */}
      {profile ? (
        <Card>
          <CardHeader>
            <CardTitle>Leave a Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitComment} className="flex flex-col gap-4">
              <Textarea
                placeholder="Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[100px]"
                disabled={submitting}
              />
              <Button
                type="submit"
                className="self-end"
                disabled={submitting || !commentText.trim()}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Please sign in to leave a comment.</p>
          </CardContent>
        </Card>
      )}

      {/* Comment list */}
      <Card>
        <CardHeader>
          <CardTitle>Comments ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentThread comments={comments} />
        </CardContent>
      </Card>
    </div>
  );
}
