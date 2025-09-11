
'use client';

import { generateSubjectForumSummaries } from '@/ai/flows/generate-subject-forum-summaries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Atom, Book, Calculator, Landmark, PlusCircle, MessageSquare, Users, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const initialForums = [
  {
    subject: 'Mathematics',
    icon: Calculator,
    description: 'Discuss everything from algebra to calculus.',
    posts: 'UserA: "How do you solve for x in this equation?"\nUserB: "I\'m having trouble with derivatives."',
    totalPosts: 125,
    activeDiscussions: 34,
    unansweredQuestions: 5,
  },
  {
    subject: 'Physics',
    icon: Atom,
    description: 'Quantum mechanics, relativity, and more.',
    posts: 'UserC: "What is dark matter?"\nUserD: "Can someone explain Newton\'s third law in simple terms?"',
    totalPosts: 98,
    activeDiscussions: 28,
    unansweredQuestions: 3,
  },
  {
    subject: 'History',
    icon: Landmark,
    description: 'From ancient civilizations to modern times.',
    posts: 'UserE: "What were the main causes of WWI?"\nUserF: "Interesting facts about the Roman Empire."',
    totalPosts: 152,
    activeDiscussions: 41,
    unansweredQuestions: 8,
  },
  {
    subject: 'English Literature',
    icon: Book,
    description: 'Analyze great works of literature.',
    posts: 'UserG: "What is the theme of The Great Gatsby?"\nUserH: "Shakespeare\'s use of iambic pentameter is fascinating."',
    totalPosts: 85,
    activeDiscussions: 22,
    unansweredQuestions: 2,
  },
];


export default function ForumsTutorPage() {
    const [summaries, setSummaries] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummaries = async () => {
            try {
                const result = await generateSubjectForumSummaries({ 
                    forums: initialForums.map(f => ({ subject: f.subject, posts: f.posts })) 
                });
                setSummaries(result);
            } catch (error) {
                console.error("Failed to generate forum summaries:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummaries();
    }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Forum Management</h1>
            <p className="text-muted-foreground">Oversee discussions and manage all subject forums.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Forum
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {initialForums.map((forum) => (
          <Card key={forum.subject}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <forum.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="font-headline text-2xl">{forum.subject}</CardTitle>
                </div>
                <CardDescription className="mt-2">{forum.description}</CardDescription>
              </div>
               <Link href={`/forums/${forum.subject.toLowerCase().replace(/\s/g, '-')}`} passHref>
                  <Button variant="outline">Manage Forum</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <MessageSquare className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-bold text-lg">{forum.totalPosts}</p>
                        <p className="text-xs text-muted-foreground">Total Posts</p>
                    </div>
                    <div>
                        <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-bold text-lg">{forum.activeDiscussions}</p>
                        <p className="text-xs text-muted-foreground">Active Discussions</p>
                    </div>
                    <div>
                        <HelpCircle className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-bold text-lg">{forum.unansweredQuestions}</p>
                        <p className="text-xs text-muted-foreground">Unanswered</p>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-sm mb-2">Recent Activity Summary</h4>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Generating summary...</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">{summaries[forum.subject] || 'No summary available.'}</p>
                    )}
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
