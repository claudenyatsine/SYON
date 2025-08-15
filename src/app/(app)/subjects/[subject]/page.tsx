
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams } from 'next/navigation';
import { Atom, Book, BookCopy, Calculator, Calendar, Download, FileText, Landmark, Target, ClipboardCheck, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';


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

const gradeBreakdown = [
    {
        task: 'Midterm Exam',
        score: '85/100',
        weight: '30%',
        insights: 'Solid understanding of core concepts. Some difficulty with application questions.',
        improvement: 'Review Chapter 3, Section 2 on practical applications. Try the supplementary practice problems.'
    },
    {
        task: 'Assignment 1: Algebra Problems',
        score: '95/100',
        weight: '15%',
        insights: 'Excellent work. All problems were solved correctly and efficiently.',
        improvement: 'Keep up the great work! Challenge yourself with the advanced problems in the textbook.'
    },
     {
        task: 'Quiz: Geometry',
        score: '88/100',
        weight: '10%',
        insights: 'Good performance. Minor calculation errors on two questions.',
        improvement: 'Double-check calculations before submitting. Use a calculator to verify your answers.'
    },
]

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
                    <Dialog>
                        <DialogTrigger asChild>
                            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
                                    <Target className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">A-</div>
                                    <p className="text-xs text-muted-foreground">91.5%</p>
                                </CardContent>
                            </Card>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="font-headline text-2xl">Overall Grade Breakdown</DialogTitle>
                                <DialogDescription>
                                    Here is a summary of all the tasks contributing to your grade in {subject.name}.
                                </DialogDescription>
                            </DialogHeader>
                            <Accordion type="single" collapsible className="w-full">
                                {gradeBreakdown.map((item) => (
                                    <AccordionItem value={item.task} key={item.task}>
                                        <AccordionTrigger>
                                            <div className="flex justify-between w-full pr-4">
                                                <div className="flex items-center gap-2">
                                                     <ClipboardCheck className="h-4 w-4" />
                                                     <span>{item.task}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">{item.score}</Badge>
                                                    <span className="text-sm text-muted-foreground font-normal">({item.weight})</span>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-2">
                                            <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-3">
                                                <Lightbulb className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0"/>
                                                <div>
                                                    <h4 className="font-semibold">Insights</h4>
                                                    <p className="text-sm text-muted-foreground">{item.insights}</p>
                                                </div>
                                            </div>
                                             <div className="flex items-start gap-3 rounded-lg border bg-green-500/10 p-3">
                                                <Target className="h-5 w-5 text-green-600 mt-1 flex-shrink-0"/>
                                                <div>
                                                    <h4 className="font-semibold">How to Improve</h4>
                                                    <p className="text-sm text-muted-foreground">{item.improvement}</p>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                         <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Upcoming Assignment</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Chapter 5 Problems</div>
                                <p className="text-xs text-muted-foreground">Due in 3 days</p>
                            </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-headline text-2xl">Assignment: Chapter 5 Problems</DialogTitle>
                          <DialogDescription>
                            Due in 3 days. Please submit your solutions before the deadline.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <h4 className="font-semibold">Summary</h4>
                          <p className="text-sm text-muted-foreground">
                            This assignment covers the core concepts of differentiation and integration from Chapter 5. It includes 10 problems that test your understanding of derivatives, integrals, and their applications in solving real-world problems. Ensure you show all your work for full credit.
                          </p>
                        </div>
                        <DialogFooter>
                          <Button>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
