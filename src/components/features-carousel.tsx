
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  FolderKanban,
  ClipboardCheck,
  GraduationCap,
  Presentation,
  Users,
  MessageSquare,
  Bell,
  Library,
  Target,
  UsersRound,
  FileCog,
  Link2,
  Smartphone,
  Trophy,
  Bot,
  CircleUser,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const features = [
  {
    icon: FolderKanban,
    title: 'Course Management',
    description: 'Course creation and organization by subjects/grade levels, syllabus and curriculum mapping, learning modules with structured content, prerequisite settings and course sequencing.',
    bgColor: 'bg-blue-500',
    image: 'https://placehold.co/800x600.png',
    aiHint: 'organizing files',
  },
  {
    icon: ClipboardCheck,
    title: 'Assessment System',
    description: 'Assignment creation and submission portal, exam/quiz builder with various question types, automated grading for objective questions, rubric-based grading for subjective work, plagiarism detection integration.',
    bgColor: 'bg-green-500',
    image: 'https://placehold.co/800x600.png',
    aiHint: 'checking test paper',
  },
  {
    icon: GraduationCap,
    title: 'Gradebook & Analytics',
    description: 'Comprehensive grade tracking, weighted grading systems, progress reports and transcripts, performance analytics and visualizations, comparative analytics (class averages, percentiles).',
    bgColor: 'bg-indigo-500',
    image: 'https://placehold.co/800x600.png',
    aiHint: 'data graphs analytics',
  },
  {
    icon: Presentation,
    title: 'Live Classroom',
    description: 'Virtual classroom with video/audio streaming, interactive whiteboard and screen sharing, breakout rooms for group work, attendance tracking during live sessions, session recording and playback.',
    bgColor: 'bg-purple-500',
    image: 'https://placehold.co/800x600.png',
    aiHint: 'online presentation',
  },
  {
    icon: Bot,
    title: 'AI Enhancements',
    description: 'Smart tutoring system, automated feedback generation, writing/style suggestions, predictive performance analytics, chatbot for student support.',
    bgColor: 'bg-sky-500',
    image: 'https://placehold.co/800x600.png',
    aiHint: 'robot thinking',
  },
];

const PrevButton = (props: React.ComponentProps<typeof Button>) => {
  const { className, ...rest } = props;
  return (
    <button
      className={cn('embla__button embla__button--prev', className)}
      type="button"
      {...rest}
    >
      <ChevronLeft className="embla__button__svg" />
    </button>
  );
};

const NextButton = (props: React.ComponentProps<typeof Button>) => {
  const { className, ...rest } = props;
  return (
    <button
      className={cn('embla__button embla__button--next', className)}
      type="button"
      {...rest}
    >
      <ChevronRight className="embla__button__svg" />
    </button>
  );
};

export function FeaturesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="embla">
      <div className="embla__viewport h-full" ref={emblaRef}>
        <div className="embla__container">
          {features.map((feature, index) => (
            <div
              className={cn(
                'embla__slide relative flex items-center justify-center',
                feature.bgColor
              )}
              key={index}
            >
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-4 md:px-6 text-primary-foreground">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <feature.icon className="w-24 h-24 mb-4" />
                  <h2 className="font-headline text-6xl md:text-7xl font-bold tracking-tight">
                    {feature.title}
                  </h2>
                  <p className="mt-4 text-2xl max-w-lg">
                    {feature.description}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                   <Image
                    src={feature.image}
                    alt={feature.title}
                    width={1040}
                    height={780}
                    data-ai-hint={feature.aiHint}
                    className="rounded-lg shadow-2xl w-[520px] h-[390px]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedIndex !== 0 && (
        <>
            <PrevButton onClick={scrollPrev} />
            <NextButton onClick={scrollNext} />
        </>
      )}
    </div>
  );
}
