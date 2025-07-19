'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, Film } from 'lucide-react';

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

const mediaTypes = ['Video', 'Video Series', 'Audio', 'Voice Note'];
const documentTypes = ['Book', 'Worksheet', 'PDF', 'Docs', 'Excel', 'Interactive Tutorial'];

const groupedResources = resources.reduce((acc, resource) => {
  if (!acc[resource.subject]) {
    acc[resource.subject] = { media: [], documents: [] };
  }

  if (mediaTypes.includes(resource.type)) {
    acc[resource.subject].media.push(resource);
  } else if (documentTypes.includes(resource.type)) {
    acc[resource.subject].documents.push(resource);
  }
  
  return acc;
}, {} as Record<string, { media: typeof resources; documents: typeof resources }>);


export default function ResourcesPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Course Resources</h1>
        <p className="text-muted-foreground">Curated learning materials to help you succeed.</p>
      </div>
      <Accordion type="multiple" defaultValue={Object.keys(groupedResources)} className="w-full space-y-6">
        {Object.entries(groupedResources).map(([subject, categories]) => (
          <AccordionItem key={subject} value={subject} className="border-none">
             <Card>
                <AccordionTrigger className="p-4 md:p-6 hover:no-underline">
                    <h2 className="font-headline text-2xl font-bold">{subject}</h2>
                </AccordionTrigger>
                <AccordionContent className="p-4 md:p-6 pt-0">
                    {categories.media.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Film className="h-5 w-5 text-primary" />
                                <h3 className="font-headline text-xl font-semibold">Media</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                                {categories.media.map((resource) => (
                                    <ResourceCard key={resource.title} resource={resource} />
                                ))}
                            </div>
                        </div>
                    )}
                    {categories.documents.length > 0 && (
                         <div>
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="h-5 w-5 text-primary" />
                                <h3 className="font-headline text-xl font-semibold">Documents & Articles</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                                {categories.documents.map((resource) => (
                                    <ResourceCard key={resource.title} resource={resource} />
                                ))}
                            </div>
                        </div>
                    )}
                </AccordionContent>
             </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function ResourceCard({ resource }: { resource: typeof resources[0] }) {
    return (
        <Card className="flex flex-col overflow-hidden">
            <CardHeader className="p-0">
                <Image
                src={resource.image}
                alt={resource.title}
                width={600}
                height={400}
                className="aspect-video w-full object-cover"
                data-ai-hint={resource.aiHint}
                />
            </CardHeader>
            <CardContent className="flex-grow space-y-2 p-4">
                <Badge variant="outline">{resource.type}</Badge>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full font-bold">View Resource</Button>
            </CardFooter>
        </Card>
    )
}
