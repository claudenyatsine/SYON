
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Calendar, Clock } from 'lucide-react';

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
    status: 'On going'
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
    status: 'On going'
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
    status: 'Completed'
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
    status: 'On going'
  },
];

export default function LiveClassesPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Live Classes</h1>
        <p className="text-muted-foreground">Join live, interactive classes with expert tutors.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {liveClasses.map((cls) => (
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
              <Badge className="absolute top-3 right-3" variant={cls.status === 'On going' ? 'default' : 'secondary'}>{cls.status}</Badge>
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
              <Button className="w-full font-bold" disabled={cls.status !== 'On going'}>
                {cls.status === 'On going' ? 'Join Class' : 'View Recording'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
