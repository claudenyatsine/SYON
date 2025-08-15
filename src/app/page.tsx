

'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SignUpForm } from '@/components/auth/signup-form';
import { LoginForm } from '@/components/auth/login-form';
import { BookOpen, Users, GraduationCap, MessageSquare, Bell, Library, Target, UsersRound, FileCog, Link2, Smartphone, Trophy, Bot, CircleUser, Menu, ArrowUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { FeaturesCarousel } from '@/components/features-carousel';


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

const clients = [
    { name: 'NASA', hint: 'nasa logo' },
    { name: 'NIVEA', hint: 'nivea logo' },
    { name: 'Cricket', hint: 'cricket wireless logo' },
    { name: 'cloaked', hint: 'cloaked logo' },
    { name: 'Jeep', hint: 'jeep logo' },
    { name: 'Ritter Sport', hint: 'ritter sport logo' },
    { name: 'Vegan Burg', hint: 'vegan burger logo' },
]

const clientTeams = [
    { title: 'Founding & executive teams', description: "We'll translate your unique story into a strategic brand, helping you to appeal to your customers and investors alike." },
    { title: 'Communication teams', description: 'Combine experience and ideation to deliver limited editions and campaigns that look unique.' },
    { title: 'Brand teams', description: 'Innovate with fresh global perspectives. Ideate at scale, develop custom illustrations, or rebrand it all.' },
]

const overallProgressData = [
  { month: 'Jan', progress: 20 },
  { month: 'Feb', progress: 35 },
  { month: 'Mar', progress: 45 },
  { month: 'Apr', progress: 60 },
  { month: 'May', progress: 70 },
  { month: 'Jun', progress: 85 },
];

const studySuccessData = [
  { subject: 'Math', pass: 88, fail: 12 },
  { subject: 'Physics', pass: 92, fail: 8 },
  { subject: 'History', pass: 95, fail: 5 },
  { subject: 'English', pass: 85, fail: 15 },
  { subject: 'Chemistry', pass: 90, fail: 10 },
];


export default function LandingPage() {
  const isMobile = useIsMobile();

  return (
    <div className="bg-background text-foreground">
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
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
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

      <main className="snap-container">
        {/* Hero Section */}
        <section className="snap-section relative flex items-center justify-center overflow-hidden">
           <Image src="https://placehold.co/1920x1080.png" alt="Hero background" layout="fill" objectFit="cover" className="z-0" data-ai-hint="modern classroom" />
           <div className="absolute inset-0 bg-background/60 dark:bg-background/80" />
           <div className="relative z-10 flex w-full items-center">
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
        <section id="features" className="snap-section">
          <FeaturesCarousel />
        </section>
        
        {/* Statistics Section */}
        <section id="statistics" className="snap-section flex flex-col justify-center py-20 md:py-24">
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
                        <CardTitle className="font-headline">Study Success &amp; Pass Rate</CardTitle>
                        <CardDescription>A comparison of pass and fail rates across subjects.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={studySuccessData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="subject" />
                                <YAxis unit="%" />
                                <Tooltip
                                contentStyle={{
                                    background: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)"
                                }}
                                />
                                <Legend />
                                <Bar dataKey="pass" stackId="a" name="Pass Rate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="fail" stackId="a" name="Fail Rate" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="snap-section flex flex-col justify-center py-20 md:py-24">
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
        
        {/* Clients Section */}
        <section id="clients" className="snap-section flex flex-col justify-center py-20 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tight">Our Clients</h2>
                </div>
                <div className="mt-12 grid grid-cols-2 place-items-center gap-8 md:grid-cols-4 lg:grid-cols-7">
                    {clients.map((client) => (
                        <div key={client.name} className="flex h-24 w-40 items-center justify-center rounded-lg bg-secondary/50 p-4">
                        <Image src={`https://placehold.co/128x64.png`} alt={client.name} width={128} height={64} data-ai-hint={client.hint} className="object-contain" />
                        </div>
                    ))}
                </div>
                <div className="mt-16 grid gap-12 md:grid-cols-3">
                    {clientTeams.map((team) => (
                        <div key={team.title}>
                            <h3 className="font-headline text-xl font-semibold">{team.title}</h3>
                            <p className="mt-2 text-muted-foreground">{team.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            <footer className="bg-foreground text-background mt-auto py-6">
              <div className="container mx-auto px-4 md:px-6">
                  <div className="grid gap-12 md:grid-cols-2">
                      <div>
                      <h2 className="font-headline text-3xl font-bold tracking-tight">Ready to Start Learning?</h2>
                      <p className="mt-4 text-lg text-background/80">Join thousands of students achieving their academic goals.</p>
                      <div className="mt-8">
                          <Dialog>
                          <DialogTrigger asChild>
                              <Button size="lg" variant="secondary" className="font-bold">Sign Up Now</Button>
                          </DialogTrigger>
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
                      </div>
                      <div className="grid grid-cols-2 gap-8 text-sm">
                          <div>
                              <h3 className="font-semibold uppercase tracking-wider text-background/90">Product</h3>
                              <ul className="mt-4 space-y-2">
                                  <li><Link href="#" className="hover:underline text-background/70">Features</Link></li>
                                  <li><Link href="#" className="hover:underline text-background/70">Pricing</Link></li>
                                  <li><Link href="#" className="hover:underline text-background/70">Testimonials</Link></li>
                              </ul>
                          </div>
                          <div>
                              <h3 className="font-semibold uppercase tracking-wider text-background/90">Company</h3>
                              <ul className="mt-4 space-y-2">
                                  <li><Link href="#" className="hover:underline text-background/70">About Us</Link></li>
                                  <li><Link href="#" className="hover:underline text-background/70">Careers</Link></li>
                                  <li><Link href="#" className="hover:underline text-background/70">Contact</Link></li>
                              </ul>
                          </div>
                      </div>
                  </div>
                  <div className="mt-16 text-sm text-background/70">
                      <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
                      <p>&copy; {new Date().getFullYear()} LearnetIQ. All rights reserved.</p>
                      <div className="flex gap-4">
                          <Link href="#" className="hover:underline">Privacy Policy</Link>
                          <Link href="#" className="hover:underline">Terms of Service</Link>
                      </div>
                      </div>
                  </div>
              </div>
            </footer>
             <div className="container mx-auto px-4 md:px-6 pt-8">
                <div className="end-of-page-animation"></div>
            </div>
        </section>
      </main>

    </div>
  );
}

    

    
