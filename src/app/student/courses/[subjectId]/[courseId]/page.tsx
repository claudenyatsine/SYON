'use client';

import { createClient } from '@/utils/supabase/client';
import { notFound, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { BookUser, Clock, PlayCircle, FileText, HelpCircle, ChevronLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function LessonViewPage() {
  const params = useParams();
  const courseId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId;
  const lessonId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchLesson = async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      
      if (data) setLesson(data);
      setLoading(false);
    };

    if (lessonId) fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="-ml-4">
        <Link href={`/student/courses/${courseId}`}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Link>
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
        <Badge variant="outline">{lesson.video_url ? 'Video Lesson' : 'Reading Lesson'}</Badge>
      </div>
      
      {lesson.video_url && (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-background shadow-lg">
           {/* Replace with a real video player later */}
           <div className="w-full h-full flex flex-col items-center justify-center text-foreground/">
              <PlayCircle className="w-16 h-16 mb-4" />
              <p>Video Player Placeholder</p>
              <p className="text-xs">{lesson.video_url}</p>
           </div>
        </div>
      )}

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 prose prose-lg dark:prose-invert max-w-none">
          <div className="bg-card p-8 rounded-2xl border shadow-sm">
            {lesson.content ? (
              <p className="whitespace-pre-wrap">{lesson.content}</p>
            ) : (
              <p className="text-muted-foreground italic">This lesson has no written content yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
