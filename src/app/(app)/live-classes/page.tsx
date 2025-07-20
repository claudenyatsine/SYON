
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const liveClasses = [
  {
    title: 'Advanced Algebra Workshop',
    subject: 'Mathematics',
    tutor: 'Ms. Anya Sharma',
    tutorAvatar: 'https://placehold.co/100x100.png',
    date: 'July 25, 2024',
    time: '3:00 PM - 4:30 PM',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'mathematics classroom',
    status: 'On going',
    url: 'https://meet.google.com/new'
  },
  {
    title: 'Thermodynamics Explained',
    subject: 'Physics',
    tutor: 'Dr. Evelyn Reed',
    tutorAvatar: 'https://placehold.co/100x100.png',
    date: 'July 26, 2024',
    time: '1:00 PM - 2:00 PM',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'science experiment',
    status: 'On going',
    url: 'https://meet.google.com/new'
  },
   {
    title: 'Introduction to Python',
    subject: 'Computer Science',
    tutor: 'Mr. Alex Maxwell',
    tutorAvatar: 'https://placehold.co/100x100.png',
    date: 'July 28, 2024',
    time: '11:00 AM - 12:30 PM',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'programming code',
    status: 'Upcoming',
    url: 'https://meet.google.com/new'
  },
  {
    title: 'The Renaissance Era',
    subject: 'History',
    tutor: 'Mr. John Carter',
    tutorAvatar: 'https://placehold.co/100x100.png',
    date: 'July 24, 2024',
    time: '10:00 AM - 11:30 AM',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'historical painting',
    status: 'Completed',
    url: '#'
  },
  {
    title: 'Poetry Analysis Techniques',
    subject: 'English',
    tutor: 'Dr. Olivia Chen',
    tutorAvatar: 'https://placehold.co/100x100.png',
    date: 'July 27, 2024',
    time: '5:00 PM - 6:00 PM',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'writing poetry',
    status: 'Upcoming',
    url: 'https://meet.google.com/new'
  },
];

const getBadgeVariant = (status: string) => {
  switch (status) {
    case 'On going':
      return 'default';
    case 'Upcoming':
      return 'secondary';
    case 'Completed':
      return 'outline';
    default:
      return 'secondary';
  }
}

const getButtonText = (status: string) => {
    switch (status) {
        case 'On going':
            return 'Join Class';
        case 'Upcoming':
            return 'Register';
        case 'Completed':
            return 'View Recording';
        default:
            return 'View Details';
    }
}


export default function LiveClassesPage() {
    const [filter, setFilter] = useState('all');

    const filteredClasses = liveClasses.filter(cls => {
        if (filter === 'all') return true;
        return cls.status.toLowerCase().replace(' ', '-') === filter;
    });

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Live Classes</h1>
        <p className="text-muted-foreground">Join live, interactive classes with expert tutors.</p>
      </div>
      
       <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="on-going">On going</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredClasses.map((cls) => (
          <Card key={cls.title} className="flex flex-col overflow-hidden">
            <CardHeader className="relative p-0">
              <Image
                src={cls.image}
                alt={cls.title}
                width={600}
                height={400}
                className="aspect-video w-full object-cover"
                data-ai-hint={cls.aiHint}
              />
              <Badge className="absolute top-3 right-3" variant={getBadgeVariant(cls.status)}>{cls.status}</Badge>
            </CardHeader>
            <CardContent className="flex-grow space-y-3 p-4">
              <Badge variant="secondary">{cls.subject}</Badge>
              <CardTitle className="text-lg">{cls.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={cls.tutorAvatar} alt={cls.tutor} />
                  <AvatarFallback>{cls.tutor.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{cls.tutor}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{cls.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{cls.time}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Link href={cls.url} passHref className="w-full" target={cls.status !== 'Completed' ? '_blank' : ''} rel="noopener noreferrer">
                <Button className="w-full font-bold" disabled={cls.status === 'Completed'}>
                   {getButtonText(cls.status)}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
       {filteredClasses.length === 0 && (
          <div className="col-span-1 sm:col-span-2 xl:col-span-3 text-center py-12">
            <p className="text-muted-foreground">No classes found for this filter.</p>
          </div>
        )}
    </div>
  );
}
