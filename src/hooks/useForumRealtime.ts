import { useEffect, useState, useCallback } from 'react';
import { Post, CommentType } from '../app/student/community/types';
import { createClient } from '@/utils/supabase/client';

export type Community = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
};

export function useForumRealtime(initialPosts: Post[] = []) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [allowedSubjectIds, setAllowedSubjectIds] = useState<string[]>([]);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const role = profile?.role || 'student';
    setUserRole(role);

    let subjectsData: any[] = [];
    
    if (role === 'student') {
      const { data: enrolls } = await supabase.from('enrollments').select('subjects(id, name, category, level)').eq('student_id', user.id).eq('status', 'approved');
      subjectsData = (enrolls || []).map(e => e.subjects).filter(Boolean);
    } else if (role === 'tutor') {
      const { data: ts } = await supabase.from('tutor_subjects').select('subjects(id, name, category, level)').eq('tutor_id', user.id);
      subjectsData = (ts || []).map(t => t.subjects).filter(Boolean);
    } else { // admin
      const { data: all } = await supabase.from('subjects').select('id, name, category, level');
      subjectsData = all || [];
    }

    // De-duplicate subjects
    const uniqueSubjects = Array.from(new Map(subjectsData.map(s => [s.id, s])).values());
    const subjectIds = uniqueSubjects.map(s => s.id);
    setAllowedSubjectIds(subjectIds);

    // Fetch Posts
    let postsQuery = supabase
      .from('forum_posts')
      .select(`
        id, subject_id, user_id, title, content, tag, image_url, votes, created_at,
        profiles!forum_posts_user_id_fkey (full_name, avatar_url),
        subjects (name)
      `)
      .order('created_at', { ascending: false });

    if (role !== 'admin' && subjectIds.length > 0) {
      postsQuery = postsQuery.in('subject_id', subjectIds);
    } else if (role !== 'admin' && subjectIds.length === 0) {
      postsQuery = postsQuery.eq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { data: postsData, error: postsError } = await postsQuery;
    if (postsError) {
      console.error('Error fetching posts:', postsError.message || JSON.stringify(postsError));
    }

    const postIds = (postsData || []).map((p: any) => p.id);

    // Fetch Comments for those posts
    let commentsData: any[] = [];
    if (postIds.length > 0) {
      const { data: cData, error: commentsError } = await supabase
        .from('forum_comments')
        .select(`
          id, post_id, user_id, text, created_at, votes, parent_id,
          profiles!forum_comments_user_id_fkey (full_name, avatar_url)
        `)
        .in('post_id', postIds)
        .order('created_at', { ascending: true });
      
      if (commentsError) {
        console.error('Error fetching comments:', JSON.stringify(commentsError, null, 2));
      } else {
        commentsData = cData || [];
      }
    }

    const formattedPosts: Post[] = (postsData || []).map((p: any) => ({
      id: p.id,
      subject_id: p.subject_id,
      user_id: p.user_id,
      title: p.title,
      content: p.content,
      tag: p.tag,
      image_url: p.image_url,
      votes: p.votes,
      created_at: p.created_at,
      author_name: p.profiles?.full_name || 'Anonymous',
      author_avatar: p.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${p.profiles?.full_name || 'Anonymous'}`,
      community_name: p.subjects?.name || 'General Discussion',
      comments: commentsData
        .filter((c: any) => c.post_id === p.id)
        .map((c: any) => ({
          id: c.id,
          user_id: c.user_id,
          text: c.text,
          author: c.profiles?.full_name || 'Anonymous',
          avatar_url: c.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${c.profiles?.full_name || 'Anonymous'}`,
          created_at: c.created_at,
          votes: c.votes || 0,
          parent_id: c.parent_id
        })),
    }));

    // Calculate Members per subject
    const formattedCommunities: Community[] = uniqueSubjects.map((sub: any) => {
      const uniqueUsers = new Set<string>();
      const subjectPosts = formattedPosts.filter(p => p.subject_id === sub.id);
      
      subjectPosts.forEach(p => {
        if (p.user_id) uniqueUsers.add(p.user_id);
        p.comments?.forEach((c: any) => {
          if (c.user_id) uniqueUsers.add(c.user_id);
        });
      });
      
      return {
        id: sub.id,
        name: sub.name,
        description: `${sub.level || ''} ${sub.category || ''}`.trim() || 'General Subject',
        memberCount: uniqueUsers.size,
      };
    });

    setPosts(formattedPosts);
    setCommunities(formattedCommunities);
    setIsLoaded(true);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Supabase Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:forum_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_posts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newPost = payload.new as any;
          
          // Guard: Only insert if role is admin OR the post's subject_id is in user's allowed list
          if (userRole !== 'admin' && !allowedSubjectIds.includes(newPost.subject_id)) {
            return;
          }
          
          // Add post immediately with placeholders
          setPosts(current => {
            if (current.some(p => p.id === newPost.id)) return current;
            return [{
              id: newPost.id,
              subject_id: newPost.subject_id,
              user_id: newPost.user_id,
              title: newPost.title,
              content: newPost.content,
              tag: newPost.tag,
              image_url: newPost.image_url,
              votes: newPost.votes,
              created_at: newPost.created_at,
              author_name: 'Loading...',
              author_avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Loading`,
              community_name: 'Loading...',
              comments: []
            }, ...current];
          });

          // Fetch profile and subject details for the new post
          Promise.all([
            supabase.from('profiles').select('full_name, avatar_url').eq('id', newPost.user_id).single(),
            supabase.from('subjects').select('name').eq('id', newPost.subject_id).single()
          ]).then(([profileRes, subjectRes]) => {
            const profile = profileRes.data;
            const subject = subjectRes.data;
            
            const authorName = profile?.full_name || 'Anonymous';
            const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${authorName}`;
            const communityName = subject?.name || 'General Discussion';

            setPosts(current => current.map(p => 
              p.id === newPost.id 
                ? { ...p, author_name: authorName, author_avatar: avatarUrl, community_name: communityName } 
                : p
            ));
          });
        } else if (payload.eventType === 'UPDATE') {
          setPosts(current => current.map(p => p.id === payload.new.id ? { ...p, votes: payload.new.votes } : p));
        } else if (payload.eventType === 'DELETE') {
          setPosts(current => current.filter(p => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_comments' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newComment = payload.new as any;
          
          // Add comment immediately with placeholders
          setPosts(current => current.map(p => {
            if (p.id === newComment.post_id) {
              const exists = p.comments?.some(c => c.id === newComment.id);
              if (exists) return p;
              return {
                ...p,
                comments: [...(p.comments || []), { 
                  id: newComment.id, 
                  user_id: newComment.user_id, 
                  text: newComment.text, 
                  author: 'Loading...',
                  votes: newComment.votes || 0,
                  parent_id: newComment.parent_id,
                  created_at: newComment.created_at
                }]
              };
            }
            return p;
          }));

          // Fetch the author profile details asynchronously and update the comment once loaded
          supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newComment.user_id)
            .single()
            .then(({ data: profile }) => {
              const authorName = profile?.full_name || 'Anonymous';
              const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${authorName}`;

              setPosts(current => current.map(p => {
                if (p.id === newComment.post_id) {
                  return {
                    ...p,
                    comments: (p.comments || []).map(c => 
                      c.id === newComment.id 
                        ? { ...c, author: authorName, avatar_url: avatarUrl } 
                        : c
                    )
                  };
                }
                return p;
              }));
            });
        } else if (payload.eventType === 'UPDATE') {
          const updatedComment = payload.new as any;
          setPosts(current => current.map(p => {
            if (p.id === updatedComment.post_id) {
              return {
                ...p,
                comments: p.comments?.map(c => c.id === updatedComment.id ? { ...c, votes: updatedComment.votes } : c)
              };
            }
            return p;
          }));
        } else if (payload.eventType === 'DELETE') {
          const deletedComment = payload.old as any;
          setPosts(current => current.map(p => {
            return {
              ...p,
              comments: p.comments?.filter(c => c.id !== deletedComment.id)
            };
          }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, (payload) => {
        const isMyEnrollment = 
          (payload.new && (payload.new as any).student_id === currentUserId) ||
          (payload.old && (payload.old as any).student_id === currentUserId);
        if (isMyEnrollment) {
          fetchData();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tutor_subjects' }, (payload) => {
        const isMySubject = 
          (payload.new && (payload.new as any).tutor_id === currentUserId) ||
          (payload.old && (payload.old as any).tutor_id === currentUserId);
        if (isMySubject) {
          fetchData();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userRole, allowedSubjectIds, currentUserId, fetchData]);

  const broadcastNewPost = useCallback(async (post: Post) => {
    setPosts(current => [post, ...current]);
    const currentUser = (await supabase.auth.getUser()).data.user?.id;
    const finalUserId = (post.user_id && post.user_id !== 'current_user') ? post.user_id : currentUser;

    const { error } = await supabase.from('forum_posts').insert({
      id: post.id,
      subject_id: post.subject_id,
      user_id: finalUserId,
      title: post.title,
      content: post.content,
      tag: post.tag,
      image_url: post.image_url,
      votes: post.votes,
      created_at: post.created_at
    });
    if (error) console.error("Error creating post:", JSON.stringify(error, null, 2));
  }, [supabase]);

  const broadcastVoteUpdate = useCallback(async (postId: string, newVotes: number) => {
    setPosts(current => current.map(p => p.id === postId ? { ...p, votes: newVotes } : p));
    const { error } = await supabase.from('forum_posts').update({ votes: newVotes }).eq('id', postId);
    if (error) console.error("Error updating votes:", JSON.stringify(error, null, 2));
  }, [supabase]);

  const broadcastNewComment = useCallback(async (postId: string, comment: CommentType) => {
    setPosts(current => current.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...(p.comments || []), comment] };
      }
      return p;
    }));
    
    const { error } = await supabase.from('forum_comments').insert({
      id: comment.id,
      post_id: postId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      text: comment.text,
      parent_id: comment.parent_id || null,
      votes: comment.votes || 0,
      created_at: comment.created_at
    });
    if (error) console.error("Error creating comment:", JSON.stringify(error, null, 2));
  }, [supabase]);

  const broadcastCommentVoteUpdate = useCallback(async (postId: string, commentId: string, newVotes: number) => {
    setPosts(current => current.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments?.map(c => c.id === commentId ? { ...c, votes: newVotes } : c)
        };
      }
      return p;
    }));
    const { error } = await supabase.from('forum_comments').update({ votes: newVotes }).eq('id', commentId);
    if (error) console.error("Error updating comment votes:", JSON.stringify(error, null, 2));
  }, [supabase]);

  const broadcastDeletePost = useCallback(async (postId: string) => {
    setPosts(current => current.filter(p => p.id !== postId));
    const { error } = await supabase.from('forum_posts').delete().eq('id', postId);
    if (error) console.error("Error deleting post:", JSON.stringify(error, null, 2));
  }, [supabase]);

  return {
    posts,
    communities,
    setPosts,
    broadcastNewPost,
    broadcastVoteUpdate,
    broadcastNewComment,
    broadcastCommentVoteUpdate,
    broadcastDeletePost,
    isLoaded
  };
}
