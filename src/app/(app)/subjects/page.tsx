
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Atom, Book, Calculator, Landmark } from 'lucide-react';
import Link from 'next/link';

const subjects = [
  { 
    name: 'Mathematics', 
    icon: Calculator, 
    color: 'text-blue-500',
    description: 'Explore topics like algebra, geometry, and calculus.'
  },
  { 
    name: 'Physics', 
    icon: Atom, 
    color: 'text-green-500',
    description: 'Discover the laws of motion, energy, and the universe.'
  },
  { 
    name: 'History', 
    icon: Landmark, 
    color: 'text-yellow-500',
    description: 'Journey through the events that shaped the world.'
  },
  { 
    name: 'English', 
    icon: Book, 
    color: 'text-red-500',
    description: 'Analyze literature and improve your writing skills.'
  },
];

export default function SubjectsPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Subjects</h1>
        <p className="text-muted-foreground">Browse through all the available subjects.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {subjects.map((subject) => (
          <Link href={`/subjects/${subject.name.toLowerCase().replace(/\s/g, '-')}`} key={subject.name} className="group">
            <Card className="flex h-full flex-col transition-all group-hover:border-primary group-hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <subject.icon className={`h-8 w-8 ${subject.color}`} />
                  <CardTitle>{subject.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{subject.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
