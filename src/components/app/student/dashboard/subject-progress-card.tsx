'use client';
import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Badge } from '../../../ui/badge';
import { BookOpen } from 'lucide-react';

type Topic = {
  name: string;
  progress: number;
};

type DetailedProgressCardProps = {
  subject: string;
  overallProgress: number;
  topics: Topic[];
  autoplayDelay?: number;
};

export function DetailedProgressCard({
  subject,
  overallProgress,
  topics,
  autoplayDelay = 2000,
}: DetailedProgressCardProps) {
    const plugin = React.useRef(
        Autoplay({ delay: autoplayDelay, stopOnInteraction: true })
      );

  return (
    <Card className="shrink-0 w-[85vw] snap-center sm:w-auto rounded-[2rem] shadow-sm border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-headline text-xl">{subject}</CardTitle>
            <CardDescription>Overall Progress</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">{overallProgress}%</span>
            <BookOpen className="h-6 w-6 text-gold" />
          </div>
        </div>
        <Progress value={overallProgress} className="mt-2 h-2" />
      </CardHeader>
      <CardContent>
        {topics.length > 0 ? (
          <Carousel
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{
              align: 'start',
              loop: true,
            }}
            orientation="vertical"
            className="w-full"
          >
            <CarouselContent className="-mt-1 h-20">
              {topics.map((topic, index) => (
                <CarouselItem key={index} className="pt-1">
                  <div className="p-1">
                    <Card className="bg-muted/50 rounded-2xl border-none">
                      <CardContent className="flex items-center justify-between p-3">
                        <p className="text-sm font-medium truncate">{topic.name}</p>
                        <Badge variant={topic.progress > 70 ? 'default' : 'secondary'} className={topic.progress > 70 ? "bg-gold text-background hover:bg-gold/80" : ""}>
                          {topic.progress}%
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <div className="h-20 flex items-center justify-center bg-muted/20 rounded-2xl">
            <p className="text-sm text-muted-foreground">No specific topics yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
