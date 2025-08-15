

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams } from 'next/navigation';
import { Atom, Book, Calculator, Calendar as CalendarIcon, Download, FileText, Landmark, Target, ClipboardCheck, Lightbulb, CheckSquare, ExternalLink, Clock, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import React from 'react';
import { DayProps } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


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
        type: 'Exam',
        score: '85/100',
        weight: '30%',
        insights: 'Solid understanding of core concepts. Some difficulty with application questions.',
        improvement: 'Review Chapter 3, Section 2 on practical applications. Try the supplementary practice problems.',
        summary: 'The midterm exam covered all topics from the first half of the semester, including differentiation, integration, and their applications. It consisted of multiple-choice and free-response questions.',
        status: 'Completed'
    },
    {
        task: 'Assignment 1: Algebra Problems',
        type: 'Assignment',
        score: '95/100',
        weight: '15%',
        insights: 'Excellent work. All problems were solved correctly and efficiently.',
        improvement: 'Keep up the great work! Challenge yourself with the advanced problems in the textbook.',
        summary: 'This assignment focused on solving complex algebraic equations and inequalities from Chapter 2.',
        status: 'Completed'
    },
     {
        task: 'Quiz: Geometry',
        type: 'Quiz',
        score: '88/100',
        weight: '10%',
        insights: 'Good performance. Minor calculation errors on two questions.',
        improvement: 'Double-check calculations before submitting. Use a calculator to verify your answers.',
        summary: 'A short quiz covering the fundamentals of Euclidean geometry, including triangles, circles, and polygons.',
        status: 'Completed'
    },
     {
        task: 'Final Project: Real-World Application',
        type: 'Assignment',
        summary: 'Apply calculus concepts to a real-world problem of your choice. Awaiting grading.',
        status: 'Pending',
        dueDate: 'Submitted 2 days ago'
    },
     {
        task: 'Chapter 5 Problem Set',
        type: 'Assignment',
        summary: 'This assignment covers the core concepts of differentiation and integration from Chapter 5. It includes 10 problems that test your understanding of derivatives, integrals, and their applications in solving real-world problems. Ensure you show all your work for full credit.',
        status: 'Upcoming',
        dueDate: 'Due in 3 days'
    },
    {
        task: 'Final Exam',
        type: 'Exam',
        summary: 'The final exam will cover all course topics, with an emphasis on integration techniques and real-world applications.',
        status: 'Upcoming',
        dueDate: 'In 2 weeks'
    }
]

const syllabusData = {
  mathematics: [
    { week: 1, topic: 'Introduction to Calculus', description: 'Understanding limits, continuity, and the definition of a derivative.' },
    { week: 2, topic: 'Differentiation Techniques', description: 'Mastering the power rule, product rule, quotient rule, and chain rule.' },
    { week: 3, topic: 'Applications of Differentiation', description: 'Optimization problems, related rates, and curve sketching.' },
    { week: 4, topic: 'Introduction to Integration', description: 'Understanding the definite and indefinite integral, and the Fundamental Theorem of Calculus.' },
  ],
   physics: [
    { week: 1, topic: 'Kinematics', description: 'Study of motion, including displacement, velocity, and acceleration.' },
    { week: 2, topic: 'Newton\'s Laws of Motion', description: 'Understanding the three laws that form the basis of classical mechanics.' },
  ],
  history: [
    { week: 1, topic: 'The Ancient World', description: 'A survey of early civilizations in Mesopotamia, Egypt, and the Indus Valley.' },
    { week: 2, topic: 'The Roman Republic and Empire', description: 'Exploring the rise and fall of one of history\'s most influential civilizations.' },
  ],
  english: [
    { week: 1, topic: 'Introduction to Shakespeare', description: 'An overview of Shakespearean drama and the context of his works.' },
    { week: 2, topic: 'Analyzing Hamlet', description: 'A deep dive into the themes, characters, and language of Shakespeare\'s most famous tragedy.' },
  ],
};


const scheduledClasses = [
    { date: new Date(2025, 7, 15), subject: 'Mathematics', startTime: '10:00', endTime: '11:00' },
    { date: new Date(2025, 7, 20), subject: 'Physics', startTime: '14:00', endTime: '15:00' },
    { date: new Date(2025, 7, 22), subject: 'History', startTime: '11:00', endTime: '12:00' },
];


function formatTimeRange(start: string, end: string) {
    const startFormatted = start.replace(':', '');
    const endFormatted = end.replace(':', '');
    return `${startFormatted}-${endFormatted}hrs`;
}

function CustomDay({ date }: DayProps) {
    const scheduledClass = scheduledClasses.find(c => format(c.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));

    return (
        <div className={cn(
          "relative flex h-full w-full flex-col items-center justify-center p-1",
          scheduledClass && "bg-black/30 text-white rounded-md"
        )}>
            <time dateTime={date.toDateString()}>{format(date, 'd')}</time>
            {scheduledClass && (
                <div className="mt-2 text-center text-[10px] leading-tight">
                    <p>{formatTimeRange(scheduledClass.startTime, scheduledClass.endTime)}</p>
                </div>
            )}
        </div>
    );
}

const TaskCard = ({ task }: { task: typeof gradeBreakdown[0] }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-lg">{task.task}</CardTitle>
                    {task.status === 'Completed' ? (
                         <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{task.score}</Badge>
                            <span className="text-sm text-muted-foreground font-normal">({task.weight})</span>
                        </div>
                    ) : (
                         <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            {task.status === 'Upcoming' ? <Clock className="h-4 w-4" /> : <Hourglass className="h-4 w-4" />}
                            <span>{task.dueDate}</span>
                        </div>
                    )}
                </div>
                 <Badge variant={task.status === 'Completed' ? 'default' : task.status === 'Pending' ? 'secondary': 'outline'}>{task.status}</Badge>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{task.summary}</p>
                 {task.status === 'Completed' && (
                    <Accordion type="single" collapsible className="w-full">
                         <AccordionItem value="insights">
                            <AccordionTrigger>View Insights</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                                <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-3">
                                    <Lightbulb className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0"/>
                                    <div>
                                        <h4 className="font-semibold">Insights</h4>
                                        <p className="text-sm text-muted-foreground">{task.insights}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border bg-green-500/10 p-3">
                                    <Target className="h-5 w-5 text-green-600 mt-1 flex-shrink-0"/>
                                    <div>
                                        <h4 className="font-semibold">How to Improve</h4>
                                        <p className="text-sm text-muted-foreground">{task.improvement}</p>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </CardContent>
            <CardFooter>
                 <Button variant="outline">
                    {task.status === 'Upcoming' ? 'View Details' : 'Review Task'}
                    <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
};


const TaskSection = ({ tasks, type }: { tasks: typeof gradeBreakdown, type: string }) => {
    const upcoming = tasks.filter(t => (t.type === type || (type === 'Assignment' && t.type === 'Quiz')) && t.status === 'Upcoming');
    const pending = tasks.filter(t => (t.type === type || (type === 'Assignment' && t.type === 'Quiz')) && t.status === 'Pending');
    const completed = tasks.filter(t => (t.type === type || (type === 'Assignment' && t.type === 'Quiz')) && t.status === 'Completed');

    return (
        <div className="space-y-8">
            {upcoming.length > 0 && (
                <div>
                    <h3 className="font-headline text-xl font-semibold mb-4">Upcoming</h3>
                    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                        {upcoming.map(task => <TaskCard key={task.task} task={task} />)}
                    </div>
                </div>
            )}
             {pending.length > 0 && (
                <div>
                    <h3 className="font-headline text-xl font-semibold mb-4">Pending</h3>
                     <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                        {pending.map(task => <TaskCard key={task.task} task={task} />)}
                    </div>
                </div>
            )}
             {completed.length > 0 && (
                <div>
                    <h3 className="font-headline text-xl font-semibold mb-4">Completed</h3>
                     <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                        {completed.map(task => <TaskCard key={task.task} task={task} />)}
                    </div>
                </div>
            )}
            {upcoming.length === 0 && pending.length === 0 && completed.length === 0 && (
                <p className="text-muted-foreground text-sm py-4">No {type.toLowerCase()}s found for this subject.</p>
            )}
        </div>
    )
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

  const [date, setDate] = React.useState<Date | undefined>(new Date(2025, 7, 15));
  const currentSyllabus = syllabusData[subjectSlug as keyof typeof syllabusData] || [];
  
  const subjectScheduledClasses = scheduledClasses.filter(
    (c) => c.subject.toLowerCase() === subject.name.toLowerCase()
  );

  const scheduledDays = subjectScheduledClasses.map((c) => c.date);

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
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
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
                                {gradeBreakdown.filter(t => t.status === 'Completed').map((item) => (
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Next Class</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Tomorrow</div>
                                <p className="text-xs text-muted-foreground">10:00 AM - 11:30 AM</p>
                            </CardContent>
                        </Card>
                      </DialogTrigger>
                       <DialogContent className="w-auto">
                        <DialogHeader>
                          <DialogTitle className="font-headline text-2xl">Class Schedule</DialogTitle>
                           <DialogDescription>
                            Your scheduled lessons for {subject.name}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                defaultMonth={scheduledDays.length > 0 ? scheduledDays[0] : new Date()}
                                modifiers={{ scheduled: scheduledDays }}
                                classNames={{
                                  cell: "h-16 w-16 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                  day: "h-16 w-16 p-0",
                                  head_cell: "w-16"
                                }}
                                components={{
                                  Day: CustomDay
                                }}
                            />
                        </div>
                      </DialogContent>
                    </Dialog>
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
                   <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                      {currentSyllabus.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                          <AccordionTrigger>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <CheckSquare className="h-5 w-5" />
                              </div>
                              <span>Week {item.week}: {item.topic}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pl-14">
                            {item.description}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                     <Button className="mt-6">
                        <Download className="mr-2 h-4 w-4"/>
                        Download Syllabus PDF
                    </Button>
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
                    <CardTitle>Assignments & Quizzes</CardTitle>
                    <CardDescription>Track and manage all your assignments and quizzes for {subject.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                   <TaskSection tasks={gradeBreakdown} type="Assignment" />
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="exams" className="mt-6">
           <Card>
                <CardHeader>
                    <CardTitle>Exams</CardTitle>
                     <CardDescription>Review your performance on major exams for {subject.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                   <TaskSection tasks={gradeBreakdown} type="Exam" />
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
    

    
