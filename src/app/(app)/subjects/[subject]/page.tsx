
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams } from 'next/navigation';
import { Atom, Book, Calculator, Calendar as CalendarIcon, Download, FileText, Landmark, Target, ClipboardCheck, Lightbulb, CheckSquare, ExternalLink, Clock, Hourglass, CheckCircle, XCircle, TrendingUp, BookOpen, Clock3, Percent, BarChart3, MessageSquare, UserCheck, Timer, PlusCircle, Users, FileUp, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import React from 'react';
import { DayProps } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Link from 'next/link';
import { StudentsTable } from './students-table';

const subjectDetails: { [key: string]: any } = {
  mathematics: {
    name: 'Mathematics',
    icon: Calculator,
    color: 'text-blue-500',
    description: 'Manage resources, assignments, and track progress for your Mathematics course.'
  },
  physics: {
    name: 'Physics',
    icon: Atom,
    color: 'text-green-500',
    description: 'Manage everything needed to teach the laws of the universe, from lectures to lab assignments.'
  },
  history: {
    name: 'History',
    icon: Landmark,
    color: 'text-yellow-500',
    description: 'Administer your course syllabus, reading materials, and timelines to help students navigate the past.'
  },
  english: {
    name: 'English',
    icon: Book,
    color: 'text-red-500',
    description: 'Administer essays, analyze texts, and track writing progress for your English Literature and Language course.'
  },
};


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

const classStats = {
    enrolledStudents: 32,
    averageGrade: 'B+',
    assignmentsCompleted: '85%',
}

const classPerformanceData = [
  { month: 'Jan', avgScore: 78 },
  { month: 'Feb', avgScore: 81 },
  { month: 'Mar', avgScore: 80 },
  { month: 'Apr', avgScore: 85 },
  { month: 'May', avgScore: 88 },
  { month: 'Jun', avgScore: 90 },
];

const assignmentStats = [
    { title: 'Assignment 1: Algebra', submitted: 32, graded: 32, avgScore: 95 },
    { title: 'Quiz: Geometry', submitted: 31, graded: 31, avgScore: 88 },
    { title: 'Midterm Exam', submitted: 30, graded: 30, avgScore: 85 },
    { title: 'Final Project', submitted: 28, graded: 0, avgScore: null },
]

export default function SubjectTutorDetailPage() {
  const params = useParams();
  const subjectSlug = params.subject as string;
  const subject = subjectDetails[subjectSlug] || {
    name: subjectSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: Book,
    color: 'text-gray-500',
    description: 'Details for this subject are not yet available.'
  };

  const currentSyllabus = syllabusData[subjectSlug as keyof typeof syllabusData] || [];
  
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
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Announcement
        </Button>
      </div>
      
       <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{classStats.enrolledStudents}</div>
                        <p className="text-xs text-muted-foreground">+3 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{classStats.averageGrade}</div>
                        <p className="text-xs text-muted-foreground">88.5% average score</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Assignment Completion</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{classStats.assignmentsCompleted}</div>
                        <p className="text-xs text-muted-foreground">Overall submission rate</p>
                    </CardContent>
                </Card>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Class Performance Over Time</CardTitle>
                    <CardDescription>Average student scores this semester.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={classPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis unit="%" domain={[60, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="avgScore" name="Average Score" stroke="hsl(var(--primary))" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="students" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Student Roster</CardTitle>
                    <CardDescription>Manage and monitor all students enrolled in {subject.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <StudentsTable />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="syllabus" className="mt-6">
           <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Syllabus</CardTitle>
                        <CardDescription>The course structure and topics for {subject.name}.</CardDescription>
                    </div>
                     <Button variant="outline">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Syllabus
                    </Button>
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Learning Resources</CardTitle>
                        <CardDescription>Manage all study materials for {subject.name}.</CardDescription>
                    </div>
                    <Button>
                        <FileUp className="mr-2 h-4 w-4"/>
                        Add Resource
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">A list of videos, documents, and other resources for this subject will be displayed here.</p>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="assignments" className="mt-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Assignments & Quizzes</CardTitle>
                        <CardDescription>Manage and track all assignments and quizzes for {subject.name}.</CardDescription>
                    </div>
                     <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Assignment
                    </Button>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                        {assignmentStats.map(item => (
                            <Card key={item.title}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Submitted</p>
                                        <p className="font-bold">{item.submitted} / {classStats.enrolledStudents}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Graded</p>
                                        <p className="font-bold">{item.graded} / {item.submitted}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Avg. Score</p>
                                        <p className="font-bold">{item.avgScore ? `${item.avgScore}%` : 'N/A'}</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline">View Submissions</Button>
                                </CardFooter>
                            </Card>
                        ))}
                   </div>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="exams" className="mt-6">
           <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Exams</CardTitle>
                        <CardDescription>Manage and review performance on major exams.</CardDescription>
                    </div>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Exam
                    </Button>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                        {assignmentStats.filter(item => item.title.includes('Exam')).map(item => (
                            <Card key={item.title}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Submitted</p>
                                        <p className="font-bold">{item.submitted} / {classStats.enrolledStudents}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Graded</p>
                                        <p className="font-bold">{item.graded} / {item.submitted}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Avg. Score</p>
                                        <p className="font-bold">{item.avgScore ? `${item.avgScore}%` : 'N/A'}</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline">View Submissions</Button>
                                </CardFooter>
                            </Card>
                        ))}
                   </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
    

    



    

    