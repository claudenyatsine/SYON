import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, BookOpen, BrainCircuit, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Tutoring',
    description: 'Get personalized help from our AI tutor, available 24/7 to answer your questions.',
  },
  {
    icon: BookOpen,
    title: 'Curated Resources',
    description: 'Access a vast library of videos, articles, and practice problems for every subject.',
  },
  {
    icon: Users,
    title: 'Community Forums',
    description: 'Connect with peers, ask questions, and collaborate on projects in our active forums.',
  },
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
  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl font-bold tracking-tight">TutorHub</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" passHref>
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login" passHref>
              <Button className="font-bold">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div className="space-y-6 text-center md:text-left">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Unlock Your Learning Potential
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground">
                  TutorHub is your all-in-one platform for academic success, combining AI-powered tutoring with a vibrant community and curated resources.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                   <Link href="/login" passHref>
                    <Button size="lg" className="font-bold">Get Started for Free</Button>
                  </Link>
                   <Link href="#" passHref>
                    <Button size="lg" variant="outline">Learn More</Button>
                  </Link>
                </div>
              </div>
               <Image
                  src="https://placehold.co/600x400.png"
                  alt="Student learning online"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                  data-ai-hint="student online learning"
                />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary py-20 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight">Why Choose TutorHub?</h2>
              <p className="mt-4 text-lg text-muted-foreground">Everything you need to excel in your studies, all in one place.</p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <feature.icon className="mb-4 h-12 w-12 text-primary" />
                    <h3 className="font-headline text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 md:py-24">
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

        {/* CTA Section */}
        <section className="py-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="rounded-lg bg-primary p-12 text-center text-primary-foreground">
                     <h2 className="font-headline text-3xl font-bold tracking-tight">Ready to Start Learning?</h2>
                     <p className="mt-4 text-lg text-primary-foreground/90">Join thousands of students achieving their academic goals.</p>
                     <div className="mt-8">
                         <Link href="/login" passHref>
                            <Button size="lg" variant="secondary" className="font-bold">Sign Up Now</Button>
                        </Link>
                     </div>
                </div>
            </div>
        </section>
      </main>

      <footer className="border-t bg-secondary">
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
