

'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SignUpForm } from '@/components/auth/signup-form';
import { LoginForm } from '@/components/auth/login-form';
import { BrainCircuit, BookOpen, Users, FolderKanban, ClipboardCheck, GraduationCap, Presentation, MessageSquare, Bell, Library, Target, UsersRound, FileCog, Link2, Smartphone, Trophy, Bot, CircleUser, Menu, ArrowUp, BookCheck, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';


const features = [
    { icon: FolderKanban, title: 'Course Management', description: 'Course creation and organization by subjects/grade levels, syllabus and curriculum mapping, learning modules with structured content, prerequisite settings and course sequencing.' },
    { icon: ClipboardCheck, title: 'Assessment System', description: 'Assignment creation and submission portal, exam/quiz builder with various question types, automated grading for objective questions, rubric-based grading for subjective work, plagiarism detection integration.' },
    { icon: GraduationCap, title: 'Gradebook & Analytics', description: 'Comprehensive grade tracking, weighted grading systems, progress reports and transcripts, performance analytics and visualizations, comparative analytics (class averages, percentiles).' },
    { icon: Presentation, title: 'Live Classroom', description: 'Virtual classroom with video/audio streaming, interactive whiteboard and screen sharing, breakout rooms for group work, attendance tracking during live sessions, session recording and playback.' },
    { icon: Users, title: 'Collaboration Tools', description: 'Discussion forums and class boards, group project spaces, peer review systems, shared document editing, virtual study groups.' },
    { icon: MessageSquare, title: 'Messaging System', description: 'Direct messaging between users, class announcements broadcast, group chats for courses/teams, file sharing in conversations, read receipts and typing indicators.' },
    { icon: Bell, title: 'Notification Center', description: 'Real-time alerts for new grades, assignment deadline reminders, class schedule notifications, announcement broadcasts, customizable notification preferences.' },
    { icon: Library, title: 'Learning Resources', description: 'Digital library of study materials, multimedia content hosting (videos, podcasts), interactive learning objects, external resource linking, version control for materials.' },
    { icon: Target, title: 'Personalized Learning', description: 'Adaptive learning paths, skill gap analysis, recommended resources, learning style assessments, customizable dashboard widgets.' },
    { icon: UsersRound, title: 'User Management', description: 'Role-based access control (students, teachers, admins), batch enrollment tools, parent/guardian accounts, user activity logging, account approval workflows.' },
    { icon: FileCog, title: 'Reporting & Compliance', description: 'Institutional reporting, accreditation documentation, audit trails, data export capabilities, custom report builder.' },
    { icon: Link2, title: 'Integration Capabilities', description: 'Single Sign-On (SSO) support, API for third-party integrations, LTI compatibility for educational tools, calendar synchronization, cloud storage integration.' },
    { icon: Smartphone, title: 'Accessibility & Mobile', description: 'Responsive design for all devices, dedicated mobile app, screen reader compatibility, keyboard navigation, adjustable text sizes/contrast.' },
    { icon: Trophy, title: 'Gamification', description: 'Badges and achievements, leaderboards, experience points (XP) system, learning challenges, reward systems.' },
    { icon: Bot, title: 'AI Enhancements', description: 'Smart tutoring system, automated feedback generation, writing/style suggestions, predictive performance analytics, chatbot for student support.' },
    { icon: CircleUser, title: 'Parent Portal', description: 'Child progress monitoring, communication with teachers, attendance tracking, event calendars, fee payment integration.' }
];

const testimonials = [
    {
        name: 'Sarah L.',
        avatar: 'https://placehold.co/100x100.png',
        title: '11th Grade Student',
        quote: "LearnetIQ's AI assistant helped me finally understand calculus. The personalized resources are a game-changer for my study habits!"
    },
    {
        name: 'David C.',
        avatar: 'https://placehold.co/100x100.png',
        title: 'Parent',
        quote: "I've seen a remarkable improvement in my son's grades since he started using LearnetIQ. The platform is intuitive and engaging."
    },
     {
        name: 'Emily R.',
        avatar: 'https://placehold.co/100x100.png',
        title: '12th Grade Student',
        quote: "The live classes and community forums made me feel connected. It's like having a study group with you all the time."
    }
]

const overallProgressData = [
  { month: 'Jan', progress: 20 },
  { month: 'Feb', progress: 35 },
  { month: 'Mar', progress: 45 },
  { month: 'Apr', progress: 60 },
  { month: 'May', progress: 70 },
  { month: 'Jun', progress: 85 },
];

const subjectPerformanceData = [
  { subject: 'Math', score: 92 },
  { subject: 'Physics', score: 85 },
  { subject: 'History', score: 78 },
  { subject: 'English', score: 88 },
  { subject: 'Chemistry', score: 95 },
];


export default function LandingPage() {
  const isMobile = useIsMobile();

  return (
    <div className="bg-background text-foreground snap-container">
      <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl font-bold tracking-tight">Learnet<span className="text-primary">IQ</span></span>
          </Link>
          <div className="hidden items-center gap-2 md:flex">
             <Link href="#features" passHref>
                <Button variant="ghost">Features</Button>
            </Link>
             <Link href="#statistics" passHref>
                <Button variant="ghost">Statistics</Button>
            </Link>
            <Link href="#testimonials" passHref>
                <Button variant="ghost">Testimonials</Button>
            </Link>
             <Dialog>
              <DialogTrigger asChild>
                 <Button variant="ghost">Sign In</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                  <DialogHeader className="flex flex-col items-center text-center">
                      <Icons.logo className="h-12 w-12 text-primary" />
                      <DialogTitle className="font-headline text-3xl font-bold tracking-tighter text-foreground mt-4">
                          Welcome back
                      </DialogTitle>
                  <DialogDescription className="mt-2">
                     Sign in to continue your learning journey.
                  </DialogDescription>
                  </DialogHeader>
                  <LoginForm />
              </DialogContent>
             </Dialog>
           </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-4 p-4">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <Icons.logo className="h-8 w-8 text-primary" />
                  <span className="font-headline text-xl font-bold tracking-tight">Learnet<span className="text-primary">IQ</span></span>
                </Link>
                <Link href="#features" passHref>
                  <Button variant="ghost" className="w-full justify-start">Features</Button>
                </Link>
                <Link href="#statistics" passHref>
                    <Button variant="ghost" className="w-full justify-start">Statistics</Button>
                </Link>
                <Link href="#testimonials" passHref>
                  <Button variant="ghost" className="w-full justify-start">Testimonials</Button>
                </Link>
                 <Dialog>
                  <DialogTrigger asChild>
                     <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                      <DialogHeader className="flex flex-col items-center text-center">
                          <Icons.logo className="h-12 w-12 text-primary" />
                          <DialogTitle className="font-headline text-3xl font-bold tracking-tighter text-foreground mt-4">
                              Welcome back
                          </DialogTitle>
                      <DialogDescription className="mt-2">
                         Sign in to continue your learning journey.
                      </DialogDescription>
                      </DialogHeader>
                      <LoginForm />
                  </DialogContent>
                 </Dialog>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden py-20 md:py-24 snap-section">
           <Image src="https://placehold.co/1920x1080.png" alt="Hero background" layout="fill" objectFit="cover" className="z-0" data-ai-hint="modern classroom" />
           <div className="absolute inset-0 bg-background/60 dark:bg-background/80" />
           <div className="relative z-10 flex min-h-screen w-full items-center">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid items-center gap-8 md:grid-cols-2">
                    <div className="space-y-6 text-center md:text-left">
                        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
                        Unlock Your Learning Potential
                        </h1>
                        <p className="max-w-xl text-lg text-foreground/80">
                        LearnetIQ is your all-in-one platform for academic success, combining AI-powered tutoring with a vibrant community and curated resources.
                        </p>
                        <Dialog>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                            <DialogTrigger asChild>
                            <Button size="lg" className="font-bold">Get Started for Free</Button>
                            </DialogTrigger>
                            <Link href="#" passHref>
                            <Button size="lg" variant="outline">Learn More</Button>
                            </Link>
                        </div>
                        <DialogContent className="max-w-sm">
                            <DialogHeader className="flex flex-col items-center text-center">
                                <Icons.logo className="h-12 w-12 text-primary" />
                                <DialogTitle className="font-headline text-3xl font-bold tracking-tighter text-foreground mt-4">
                                Create your account
                                </DialogTitle>
                            <DialogDescription className="mt-2">
                                Get started on your learning journey.
                            </DialogDescription>
                            </DialogHeader>
                            <SignUpForm />
                        </DialogContent>
                        </Dialog>
                    </div>
                    <div className="hidden md:block" />
                    </div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="flex flex-col justify-center bg-secondary py-20 md:py-24 snap-section">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mx-auto max-w-3xl text-center">
                  <h2 className="font-headline text-3xl font-bold tracking-tight">Why Choose Learnet<span className="text-primary">IQ</span>?</h2>
                  <p className="mt-4 text-lg text-muted-foreground">Explore our unique system features</p>
                </div>
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {features.map((feature, index) => (
                        <Card key={index} className="flex flex-col items-center p-6 text-center">
                            <CardContent className="flex flex-col items-center p-0">
                                <feature.icon className="mb-4 h-12 w-12 text-accent" />
                                <CardTitle className="font-headline text-xl font-semibold mb-2">{feature.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
        
        {/* Statistics Section */}
        <section id="statistics" className="flex min-h-screen flex-col justify-center py-20 md:py-24 snap-section">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight">Platform Statistics</h2>
              <p className="mt-4 text-lg text-muted-foreground">See the impact LearnetIQ is having on students everywhere.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">10,000+</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Courses Available</CardTitle>
                  <BookOpen className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">500+</div>
                  <p className="text-xs text-muted-foreground">Across all subjects</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <GraduationCap className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs text-muted-foreground">Average course completion</p>
                </CardContent>
              </Card>
              <Card className="bg-primary text-primary-foreground">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-primary-foreground/80">Grade Improvement</CardTitle>
                  <ArrowUp className="h-5 w-5 text-primary-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+25%</div>
                  <p className="text-xs text-primary-foreground/80">Average student score increase</p>
                </CardContent>
              </Card>
            </div>
             <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Student Growth</CardTitle>
                        <CardDescription>Platform user engagement over time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={overallProgressData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                contentStyle={{
                                    background: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)"
                                }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="progress" name="New Students" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Popular Subjects</CardTitle>
                        <CardDescription>Distribution of student enrollment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={subjectPerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="subject" />
                                <YAxis />
                                <Tooltip
                                contentStyle={{
                                    background: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)"
                                }}
                                />
                                <Legend />
                                <Bar dataKey="score" name="Enrollment" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="flex min-h-screen flex-col justify-center py-20 md:py-24 snap-section">
             <div className="container mx-auto px-4 md:px-6">
                 <div className="mx-auto max-w-3xl text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tight">Loved by Students and Parents</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Don&apos;t just take our word for it. Here&apos;s what people are saying.</p>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial.name} className="flex flex-col">
                            <CardContent className="p-6 flex-grow">
                                <p className="italic text-foreground/90">&quot;{testimonial.quote}&quot;</p>
                            </CardContent>
                             <div className="p-6 pt-0 mt-auto flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
             </div>
        </section>
        
        <Dialog>
          {/* CTA Section */}
          <section className="flex flex-col bg-secondary snap-section">
            <div className="container mx-auto flex h-full flex-col justify-center px-4 md:px-6">
              <div className="flex h-full min-h-[50vh] flex-col rounded-lg bg-primary p-12 text-primary-foreground translate-y-[-30%]">
                <div className="m-auto flex flex-col justify-center text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tight">Ready to Start Learning?</h2>
                    <p className="mt-4 text-lg text-primary-foreground/90">Join thousands of students achieving their academic goals.</p>
                    <div className="mt-8">
                      <DialogTrigger asChild>
                        <Button size="lg" variant="secondary" className="font-bold">Sign Up Now</Button>
                      </DialogTrigger>
                    </div>
                </div>
                 <div className="mt-auto pt-8 text-sm text-primary-foreground/80">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p>&copy; {new Date().getFullYear()} LearnetIQ. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:underline">Privacy Policy</Link>
                        <Link href="#" className="hover:underline">Terms of Service</Link>
                    </div>
                    </div>
                </div>
              </div>
            </div>
          </section>
           <DialogContent className="max-w-sm">
              <DialogHeader className="flex flex-col items-center text-center">
                  <Icons.logo className="h-12 w-12 text-primary" />
                  <DialogTitle className="font-headline text-3xl font-bold tracking-tighter text-foreground mt-4">
                    Create your account
                  </DialogTitle>
                <DialogDescription className="mt-2">
                  Get started on your learning journey.
                </DialogDescription>
              </DialogHeader>
              <SignUpForm />
            </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
