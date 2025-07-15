import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const resources = [
  {
    title: 'Calculus I Full Course',
    subject: 'Mathematics',
    type: 'Video',
    description: 'A comprehensive video series covering all topics in Calculus I, from limits to integration.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'mathematics textbook',
  },
  {
    title: 'The Feynman Lectures on Physics',
    subject: 'Physics',
    type: 'Book',
    description: 'Iconic lectures by Richard Feynman, offering deep insights into the world of physics.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'physics equation',
  },
  {
    title: 'Crash Course World History',
    subject: 'History',
    type: 'Video Series',
    description: 'John Green teaches you the history of the world in a fast-paced, entertaining series.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'history map',
  },
  {
    title: 'Shakespeare\'s Complete Works',
    subject: 'English',
    type: 'Book',
    description: 'Explore the timeless plays and sonnets of William Shakespeare.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'literature book',
  },
  {
    title: 'Organic Chemistry Practice Problems',
    subject: 'Chemistry',
    type: 'Worksheet',
    description: 'A collection of practice problems to help you master organic chemistry concepts.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'chemistry lab',
  },
    {
    title: 'Introduction to Python Programming',
    subject: 'Computer Science',
    type: 'Interactive Tutorial',
    description: 'Learn the fundamentals of Python with hands-on coding exercises.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'programming code',
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Course Resources</h1>
        <p className="text-muted-foreground">Curated learning materials to help you succeed.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.title} className="flex flex-col overflow-hidden">
            <CardHeader>
              <Image
                src={resource.image}
                alt={resource.title}
                width={600}
                height={400}
                className="aspect-video w-full object-cover"
                data-ai-hint={resource.aiHint}
              />
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{resource.subject}</Badge>
                <Badge variant="outline">{resource.type}</Badge>
              </div>
              <CardTitle className="text-lg">{resource.title}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button className="w-full font-bold">View Resource</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
