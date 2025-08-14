
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams } from 'next/navigation';
import { Atom, Book, BookCopy, Calculator, Calendar, FileText, Landmark, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const subjectDetails: { [key: string]: any } = {
  mathematics: {
    name: 'Mathematics',
    icon: Calculator,
    color: 'text-blue-500',
    description: 'This page provides all the resources, assignments, and progress tracking for your Mathematics course. Let\'s solve some problems!'
  },
  physics: {
    name: 'Physics',
    icon: Atom,
    color: 'text-green-500',
    description: 'Welcome to Physics! Here you can find everything you need to understand the laws of the universe, from lectures to lab assignments.'
  },
  history: {
    name: 'History',
    icon: Landmark,
    color: 'text-yellow-500',
    description: 'Explore the annals of history. This page contains your syllabus, reading materials, and timelines to help you navigate the past.'
  },
  english: {
    name: 'English',
    icon: Book,
    color: 'text-red-500',
    description: 'Welcome to your English Literature and Language hub. Access essays, analyze texts, and track your writing progress here.'
  },
};

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectSlug = params.subject as string;
  const subject = subjectDetails[subjectSlug] || {
    name: subjectSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: Book,
    color: 'text-gray-500',
    description: 'Details for this subject are not yet available.'
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
             <subject.icon className={`h-8 w-8 ${subject.color}`} />
             <h1 className="font-headline text-3xl font-bold tracking-tight">{subject.name}</h1>
          </div>
          <p className="mt-2 text-muted-foreground">{subject.description}</p>
        </div>
      </div>
      
       <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Subject Overview</CardTitle>
                    <CardDescription>Key metrics and quick links for {subject.name}.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">A-</div>
                            <p className="text-xs text-muted-foreground">91.5%</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Assignment</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Chapter 5 Problems</div>
                            <p className="text-xs text-muted-foreground">Due in 3 days</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Next Class</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Tomorrow</div>
                            <p className="text-xs text-muted-foreground">10:00 AM - 11:30 AM</p>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="syllabus" className="mt-6">
           <Card>
                <CardHeader>
                    <CardTitle>Syllabus</CardTitle>
                    <CardDescription>The course structure and topics for {subject.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Syllabus content will be displayed here. This includes the course outline, grading policy, and learning objectives.</p>
                     <Button className="mt-4">Download Syllabus PDF</Button>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="resources" className="mt-6">
           <Card>
                <CardHeader>
                    <CardTitle>Learning Resources</CardTitle>
                     <CardDescription>All your study materials for {subject.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">A list of videos, documents, and other resources for this subject will be displayed here.</p>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="assignments" className="mt-6">
           <Card>
                <CardHeader>
                    <CardTitle>Assignments & Exams</CardTitle>
                     <CardDescription>Submit your work and prepare for exams for {subject.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">A list of upcoming and past assignments, quizzes, and exams will be displayed here.</p>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="progress" className="mt-6">
           <Card>
                <CardHeader>
                    <CardTitle>Your Progress</CardTitle>
                     <CardDescription>Your performance and progress in {subject.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Charts and statistics detailing your progress in this subject will be displayed here.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
