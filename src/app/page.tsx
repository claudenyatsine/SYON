
'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SignUpForm } from '@/components/auth/signup-form';
import { LoginForm } from '@/components/auth/login-form';
import { BrainCircuit, BookOpen, Users, FolderKanban, ClipboardCheck, GraduationCap, Presentation, MessageSquare, Bell, Library, Target, UsersRound, FileCog, Link2, Smartphone, Trophy, Bot, CircleUser } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import './carousel.css';
import React from 'react';

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
        quote: "TutorHub's AI assistant helped me finally understand calculus. The personalized resources are a game-changer for my study habits!"
    },
    {
        name: 'David C.',
        avatar: 'https://placehold.co/100x100.png',
        title: 'Parent',
        quote: "I've seen a remarkable improvement in my son's grades since he started using TutorHub. The platform is intuitive and engaging."
    },
     {
        name: 'Emily R.',
        avatar: 'https://placehold.co/100x100.png',
        title: '12th Grade Student',
        quote: "The live classes and community forums made me feel connected. It's like having a study group with you all the time."
    }
]

export default function LandingPage() {
  const plugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true, direction: 'backward' })
  )

  return (
    <div className="bg-background text-foreground snap-container">
      <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl font-bold tracking-tight">TutorHub</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
             <Link href="#features" passHref>
                <Button variant="ghost">Features</Button>
            </Link>
             <Link href="/progress" passHref>
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
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="snap-section relative flex min-h-screen items-center justify-center overflow-hidden py-20 md:py-24">
           <div className="absolute inset-0 h-full w-full bg-cover bg-center" style={{ backgroundImage: "url('https://placehold.co/1200x800.png')", height: '97%' }} data-ai-hint="modern classroom" />
           <div className="absolute inset-0 bg-background/60 dark:bg-background/80" style={{ height: '97%' }}/>
           <div className="relative z-10 flex min-h-screen w-full items-center">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid items-center gap-8 md:grid-cols-2">
                    <div className="space-y-6 text-center md:text-left">
                        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
                        Unlock Your Learning Potential
                        </h1>
                        <p className="max-w-xl text-lg text-foreground/80">
                        TutorHub is your all-in-one platform for academic success, combining AI-powered tutoring with a vibrant community and curated resources.
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
        <section id="features" className="snap-section flex flex-col justify-center bg-secondary py-20 md:py-24 overflow-hidden">
             <Carousel
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                opts={{
                    align: 'center',
                    loop: true,
                }}
              >
              <div className="container mx-auto px-4 md:px-6">
                <div className="mx-auto max-w-3xl text-center">
                  <h2 className="font-headline text-3xl font-bold tracking-tight">Why Choose TutorHub?</h2>
                  <p className="mt-4 text-lg text-muted-foreground">Explore our unique system features</p>
                </div>
                <CarouselContent className="mt-12">
                    {features.map((feature, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1 h-full">
                                <Card className="flex flex-col h-full items-center justify-center p-6 text-center feature-card">
                                    <div className="glowing-border"></div>
                                    <CardContent className="flex flex-col items-center p-0">
                                        <feature.icon className="mb-4 h-12 w-12 text-accent" />
                                        <CardTitle className="font-headline text-xl font-semibold mb-2">{feature.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
              </div>
              <CarouselPrevious className="left-[15px] sm:left-4" />
              <CarouselNext className="right-[15px] sm:right-4" />
            </Carousel>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="snap-section flex flex-col justify-center py-20 md:py-24">
             <div className="container mx-auto px-4 md:px-6">
                 <div className="mx-auto max-w-3xl text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tight">Loved by Students and Parents</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Don&apos;t just take our word for it. Here&apos;s what people are saying.</p>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-3">
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
          <section className="snap-section flex flex-col justify-center py-20">
              <div className="container mx-auto px-4 md:px-6">
                  <div className="rounded-lg bg-primary p-12 text-center text-primary-foreground">
                      <h2 className="font-headline text-3xl font-bold tracking-tight">Ready to Start Learning?</h2>
                      <p className="mt-4 text-lg text-primary-foreground/90">Join thousands of students achieving their academic goals.</p>
                      <div className="mt-8">
                          <DialogTrigger asChild>
                              <Button size="lg" variant="secondary" className="font-bold">Sign Up Now</Button>
                          </DialogTrigger>
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

      <footer className="border-t bg-secondary snap-section flex flex-col justify-center">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:px-6 md:flex-row">
              <div className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} TutorHub. All rights reserved.
              </div>
              <div className="flex gap-4">
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
              </div>
          </div>
      </footer>
    </div>
  );
}
