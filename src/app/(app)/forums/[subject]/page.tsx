
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, ThumbsUp } from 'lucide-react';
import { useParams } from 'next/navigation';

const mockPosts = [
  {
    id: 1,
    author: 'Alice Johnson',
    avatar: 'https://placehold.co/100x100.png',
    handle: 'ajohnson',
    time: '2 hours ago',
    content: "I'm having a hard time understanding the concept of derivatives in calculus. Can anyone explain it in a simple way or recommend a good video tutorial?",
    likes: 12,
    replies: 3,
  },
  {
    id: 2,
    author: 'Bob Williams',
    avatar: 'https://placehold.co/100x100.png',
    handle: 'bwilliams',
    time: '5 hours ago',
    content: 'What are the most significant long-term effects of the Industrial Revolution on modern society? I\'m working on a paper and need some ideas.',
    likes: 25,
    replies: 8,
  },
];

export default function SubjectForumPage() {
  const params = useParams();
  const subject = params.subject as string;
  const subjectName = subject ? decodeURIComponent(subject).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Forum';

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">{subjectName} Forum</h1>
        <p className="text-muted-foreground">Ask questions and discuss topics related to {subjectName}.</p>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <Avatar className="hidden sm:flex">
              <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2">
              <Textarea placeholder={`Ask a question in the ${subjectName} forum...`} className="h-24" />
              <div className="flex justify-end">
                <Button>Post Question</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4 md:space-y-6">
        <h2 className="font-headline text-2xl font-semibold">Discussions</h2>
        {mockPosts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <Avatar>
                  <AvatarImage src={post.avatar} alt={post.author} />
                  <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{post.author}</p>
                      <p className="text-sm text-muted-foreground">@{post.handle} · {post.time}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-foreground/90">{post.content}</p>
                  <div className="mt-4 flex items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.likes} Likes</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.replies} Replies</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
