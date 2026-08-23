'use client';
import * as React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import { FileCheck, Bot, Video, BarChart, ShieldCheck, FileScan } from 'lucide-react';

const features = [
  {
    icon: FileCheck,
    title: 'Course Management',
    description:
      'Easily create, organize, and manage your courses with our intuitive tools. Keep your curriculum structured and accessible.',
    image: 'https://picsum.photos/seed/feature-course/1200/800',
    aiHint: 'course management',
  },
  {
    icon: BarChart,
    title: 'Assessment System',
    description:
      'Design quizzes, tests, and assignments to track student progress. Get detailed analytics to understand performance.',
    image: 'https://picsum.photos/seed/feature-assessment/1200/800',
    aiHint: 'student assessment',
  },
  {
    icon: Video,
    title: 'Live Classroom',
    description:
      'Engage with students in real-time through our feature-rich virtual classrooms. Interactive whiteboards, chat, and more.',
    image: 'https://picsum.photos/seed/feature-live/1200/800',
    aiHint: 'online classroom',
  },
  {
    icon: Bot,
    title: 'AI Enhancements',
    description:
      'Leverage the power of AI for personalized learning paths, resource recommendations, and automated feedback.',
    image: 'https://picsum.photos/seed/feature-ai/1200/800',
    aiHint: 'artificial intelligence',
  },
  {
    icon: FileScan,
    title: 'Plagiarism Checker',
    description:
      'Ensure academic integrity with our built-in plagiarism detection tool. Compare submissions against a vast database of sources.',
    image: 'https://picsum.photos/seed/feature-plagiarism/1200/800',
    aiHint: 'document scan',
  },
  {
    icon: ShieldCheck,
    title: 'AI Checker',
    description:
      'Detect AI-generated content in student submissions to maintain authenticity and uphold academic standards.',
    image: 'https://picsum.photos/seed/feature-ai-check/1200/800',
    aiHint: 'security check',
  }
];

export function FeaturesCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 8000, stopOnInteraction: true })
  );

  return (
    <div className="container">
        <h2 className="text-center text-3xl font-bold md:text-4xl mb-2">
          We got Everything you need to succeed
        </h2>
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{ loop: true }}
        >
          <CarouselContent>
            {features.map((feature, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="bg-background text-foreground overflow-hidden border-border">
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-0 p-0">
                      <div className="relative min-h-[300px] md:min-h-[450px]">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-cover"
                          data-ai-hint={feature.aiHint}
                        />
                      </div>
                      <div className="flex flex-col justify-center p-8 md:p-12">
                        <feature.icon className="h-12 w-12 text-accent mb-4" />
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground text-lg">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 text-primary bg-background/80 hover:bg-background" />
          <CarouselNext className="right-4 text-primary bg-background/80 hover:bg-background" />
        </Carousel>
      </div>
  );
}
