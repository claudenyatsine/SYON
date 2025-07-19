import { generateSubjectForumSummaries } from '@/ai/flows/generate-subject-forum-summaries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Atom, Book, Calculator, Landmark } from 'lucide-react';
import Link from 'next/link';

const forums = [
  {
    subject: 'Mathematics',
    icon: Calculator,
    description: 'Discuss everything from algebra to calculus.',
    posts: 'UserA: "How do you solve for x in this equation?"\nUserB: "I\'m having trouble with derivatives."',
  },
  {
    subject: 'Physics',
    icon: Atom,
    description: 'Quantum mechanics, relativity, and more.',
    posts: 'UserC: "What is dark matter?"\nUserD: "Can someone explain Newton\'s third law in simple terms?"',
  },
  {
    subject: 'History',
    icon: Landmark,
    description: 'From ancient civilizations to modern times.',
    posts: 'UserE: "What were the main causes of WWI?"\nUserF: "Interesting facts about the Roman Empire."',
  },
  {
    subject: 'English Literature',
    icon: Book,
    description: 'Analyze great works of literature.',
    posts: 'UserG: "What is the theme of The Great Gatsby?"\nUserH: "Shakespeare\'s use of iambic pentameter is fascinating."',
  },
];

async function ForumSummary({ subject, forumPosts }: { subject: string; forumPosts: string }) {
  const summary = await generateSubjectForumSummaries({ subject, forumPosts });
  return <p className="text-sm text-muted-foreground">{summary.summary}</p>;
}

export default async function ForumsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Subject Forums</h1>
        <p className="text-muted-foreground">Ask questions, share knowledge, and connect with peers.</p>
      </div>
      <div className="space-y-6">
        {forums.map((forum) => (
          <Card key={forum.subject}>
            <CardHeader>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <forum.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline text-2xl">{forum.subject}</CardTitle>
                  </div>
                  <CardDescription className="mt-2">{forum.description}</CardDescription>
                </div>
                 <Link href={`/forums/${forum.subject.toLowerCase().replace(/\s/g, '-')}`} passHref>
                    <Button className="mt-4 sm:mt-0">Enter Forum</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
                <Separator className="my-4"/>
                <h4 className="font-semibold text-sm mb-2">Recent Activity Summary</h4>
                <ForumSummary subject={forum.subject} forumPosts={forum.posts} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
