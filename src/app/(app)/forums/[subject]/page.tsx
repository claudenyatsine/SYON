
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, ThumbsUp, Pin, Lock, Trash2, MoreVertical, Flag, HelpCircle, CheckCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const mockPosts = [
  {
    id: 1,
    author: 'Alice Johnson',
    avatar: 'https://placehold.co/100x100.png',
    handle: 'ajohnson',
    time: '2 hours ago',
    content: "I'm having a hard time understanding the concept of derivatives in calculus. Can anyone explain it in a simple way or recommend a good video tutorial?",
    likes: 12,
    repliesCount: 3,
    isPinned: true,
    isLocked: false,
    replies: [
        {
            id: 101,
            author: 'Anya Sharma',
            isTutor: true,
            avatar: 'https://placehold.co/100x100.png',
            handle: 'asharma',
            time: '1 hour ago',
            content: "Great question, Alice! Think of a derivative as the instantaneous rate of change, or the slope of a curve at a single point. For videos, Khan Academy has an excellent series on the topic. I've linked it in the main resources tab!",
            likes: 8,
        },
        {
            id: 102,
            author: 'Bob Williams',
            isTutor: false,
            avatar: 'https://placehold.co/100x100.png',
            handle: 'bwilliams',
            time: '45 minutes ago',
            content: "That video series really helped me too. The product rule section was super clear.",
            likes: 3,
        }
    ]
  },
  {
    id: 2,
    author: 'Bob Williams',
    avatar: 'https://placehold.co/100x100.png',
    handle: 'bwilliams',
    time: '5 hours ago',
    content: 'What are the most significant long-term effects of the Industrial Revolution on modern society? I\'m working on a paper and need some ideas.',
    likes: 25,
    repliesCount: 8,
    isPinned: false,
    isLocked: true,
    replies: []
  },
   {
    id: 3,
    author: 'Charlie Davis',
    avatar: 'https://placehold.co/100x100.png',
    handle: 'cdavis',
    time: '1 day ago',
    content: 'Is there a practice sheet for the upcoming physics quiz? I want to get some extra reps in on the kinematics problems.',
    likes: 5,
    repliesCount: 0,
    isPinned: false,
    isLocked: false,
    replies: []
  },
];

export default function SubjectForumPage() {
  const params = useParams();
  const subject = params.subject as string;
  const subjectName = subject ? decodeURIComponent(subject).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Forum';

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">{subjectName} Forum Management</h1>
        <p className="text-muted-foreground">Moderate discussions, answer questions, and post announcements.</p>
      </div>

       <Card>
        <CardContent className="p-4 flex items-center justify-around text-center">
            <Button variant="ghost" className="flex-1 flex flex-col h-auto">
                <HelpCircle className="h-6 w-6 mb-1 text-yellow-500" />
                <span className="font-bold text-lg">5</span>
                <span className="text-xs text-muted-foreground">Unanswered</span>
            </Button>
            <Separator orientation="vertical" className="h-10" />
            <Button variant="ghost" className="flex-1 flex flex-col h-auto">
                <Flag className="h-6 w-6 mb-1 text-red-500" />
                 <span className="font-bold text-lg">2</span>
                <span className="text-xs text-muted-foreground">Flagged</span>
            </Button>
             <Separator orientation="vertical" className="h-10" />
            <Button variant="ghost" className="flex-1 flex flex-col h-auto">
                <CheckCircle className="h-6 w-6 mb-1 text-green-500" />
                 <span className="font-bold text-lg">28</span>
                <span className="text-xs text-muted-foreground">Resolved</span>
            </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <Avatar className="hidden sm:flex">
              <AvatarImage src="https://placehold.co/100x100.png" alt="Tutor Avatar" />
              <AvatarFallback>T</AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2">
              <Textarea placeholder={`Create an announcement or pinned post in the ${subjectName} forum...`} className="h-24" />
              <div className="flex justify-end">
                <Button>Post to Forum</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4 md:space-y-6">
        <h2 className="font-headline text-2xl font-semibold">Discussions</h2>
        {mockPosts.map((post) => (
          <Card key={post.id} className={post.isPinned ? 'border-primary' : ''}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <Avatar>
                  <AvatarImage src={post.avatar} alt={post.author} />
                  <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{post.author}</p>
                        {post.isPinned && <Badge variant="secondary"><Pin className="h-3 w-3 mr-1" /> Pinned</Badge>}
                        {post.isLocked && <Badge variant="destructive"><Lock className="h-3 w-3 mr-1" /> Locked</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">@{post.handle} · {post.time}</p>
                    </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 sm:mt-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pin className="mr-2 h-4 w-4" />
                          <span>{post.isPinned ? 'Unpin Post' : 'Pin Post'}</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem>
                          <Lock className="mr-2 h-4 w-4" />
                          <span>{post.isLocked ? 'Unlock Thread' : 'Lock Thread'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 focus:text-red-500">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Post</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mt-3 text-foreground/90">{post.content}</p>
                  <div className="mt-4 flex items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.likes} Likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.repliesCount} Replies</span>
                    </div>
                  </div>
                   {post.replies && post.replies.length > 0 && (
                    <div className="mt-4 space-y-4 pt-4 border-t">
                        {post.replies.map(reply => (
                            <div key={reply.id} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={reply.avatar} alt={reply.author} />
                                    <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="w-full">
                                     <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm">{reply.author}</p>
                                        {reply.isTutor && <Badge variant="default" className="h-5">Tutor</Badge>}
                                      </div>
                                    <p className="text-sm text-muted-foreground">@{reply.handle} · {reply.time}</p>
                                    <p className="mt-1 text-sm text-foreground/90">{reply.content}</p>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs">
                                            <ThumbsUp className="h-3 w-3 mr-1" /> {reply.likes}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                   )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

  