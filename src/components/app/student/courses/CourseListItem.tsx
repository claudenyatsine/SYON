'use client';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";

type Course = {
    id: string;
    title: string;
    description: string;
    image: string;
    aiHint: string;
    rating: number;
    reviewCount: number;
    level: string;
    category: string;
    status: 'active' | 'completed';
    color: string;
};

type CourseListItemProps = {
    course: Course;
};

export function CourseListItem({ course }: CourseListItemProps) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0 flex">
                <div className="relative w-1/3 aspect-[4/3]">
                     <Image src={course.image} alt={course.title} width={300} height={200} className="object-cover h-full w-full" data-ai-hint={course.aiHint} />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                        <h3 className="text-xl font-bold">{course.title}</h3>
                        <p className="text-muted-foreground mt-2">{course.description}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-gold fill-gold' : 'text-foreground/'}`} />
                            ))}
                            <span className="text-muted-foreground ml-1">({course.reviewCount})</span>
                        </div>
                        <Badge variant="outline">{course.level}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
