
'use client';

import { recommendLearningResources } from '@/ai/flows/recommend-learning-resources';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Atom, Book, BrainCircuit, Calculator, Landmark, Rocket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import images from '@/lib/placeholder-images.json';

const subjects = [
  { name: 'Mathematics', icon: Calculator, color: 'text-blue-500' },
  { name: 'Physics', icon: Atom, color: 'text-green-500' },
  { name: 'History', icon: Landmark, color: 'text-yellow-500' },
  { name: 'English', icon: Book, color: 'text-red-500' },
];

const formSchema = z.object({
  gradeLevel: z.string().min(1, { message: 'Please select a grade level.' }),
  subject: z.string().min(1, { message: 'Please select a subject.' }),
});

export default function DashboardPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gradeLevel: '',
      subject: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setRecommendations([]);
    try {
      const result = await recommendLearningResources({
        gradeLevel: values.gradeLevel,
        subjects: [values.subject],
      });
      setRecommendations(result.resources);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get recommendations. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Welcome, Alex!</h1>
        <p className="text-muted-foreground">Here&apos;s your personalized learning dashboard.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {subjects.map((subject) => (
          <Card key={subject.name} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{subject.name}</CardTitle>
              <subject.icon className={`h-5 w-5 ${subject.color}`} />
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-2xl font-bold">85% Progress</div>
              <p className="text-xs text-muted-foreground">+5% from last week</p>
            </CardContent>
            <CardFooter>
              <Link href={`/subjects/${subject.name.toLowerCase().replace(/\s/g, '-')}`} passHref className="w-full">
                <Button size="sm" variant="outline" className="w-full">
                  View Subject
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">AI Tutor Assistant</CardTitle>
            </div>
            <CardDescription>Get personalized learning resource recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[...Array(12)].map((_, i) => (
                              <SelectItem key={i + 1} value={`Grade ${i + 1}`}>
                                Grade {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((s) => (
                              <SelectItem key={s.name} value={s.name}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={loading} className="font-bold">
                  {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
                  {!loading && <Rocket className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </Form>
            {recommendations.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="font-semibold">Here are your recommendations:</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Live Class</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <Image src={images.onlineLearning.src} alt={images.onlineLearning.alt} width={images.onlineLearning.width} height={images.onlineLearning.height} className="rounded-lg" data-ai-hint={images.onlineLearning.hint} />
            <h3 className="font-semibold">Introduction to Algebra</h3>
            <p className="text-sm text-muted-foreground">Join Mr. Davidson to master the basics of algebraic expressions.</p>
            <div className="text-sm font-medium">Today at 4:00 PM</div>
          </CardContent>
          <CardFooter>
            <Button className="w-full font-bold">Join Class</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
