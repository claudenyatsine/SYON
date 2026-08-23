'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Download, FileText, Book, Video, FileSpreadsheet, Presentation, FileAudio, File, Loader2, Library, Cloud, CloudOff, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SchoolHeader } from '@/components/app/school-header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import * as React from 'react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

const resourceIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  video: Video,
  word: FileText,
  excel: FileSpreadsheet,
  ppt: Presentation,
  mp3: FileAudio,
};

const filterOptions = [
    { type: 'pdf', label: 'PDFs' },
    { type: 'video', label: 'Videos' },
    { type: 'word', label: 'Word' },
    { type: 'excel', label: 'Excel' },
    { type: 'ppt', label: 'PPT' },
    { type: 'mp3', label: 'MP3' },
];

function ResourceCard({ resource, isOffline, onToggleOffline }: { resource: any, isOffline: boolean, onToggleOffline: (id: string, currentlyOffline: boolean) => void }) {
    const Icon = resourceIcons[resource.format] || File;
    const [toggling, setToggling] = useState(false);

    const handleOfflineToggle = async () => {
        setToggling(true);
        await onToggleOffline(resource.id, isOffline);
        setToggling(false);
    };

    return (
        <Card className="flex-shrink-0 w-[280px] overflow-hidden">
             <CardHeader className="p-0">
                <div className="relative aspect-[3/2] w-full bg-muted flex items-center justify-center group">
                    <Icon className="h-12 w-12 text-muted-foreground/20" />
                    <Badge className="absolute top-2 left-2 capitalize bg-background/50 backdrop-blur-sm text-foreground hover:bg-background/80">
                        {resource.source === 'live_class_automation' ? 'Class Recording' : 'Tutor Upload'}
                    </Badge>
                    <Badge className="absolute top-2 right-2 capitalize">{resource.format}</Badge>
                    
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="absolute bottom-2 right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      onClick={handleOfflineToggle}
                      disabled={toggling}
                      title={isOffline ? "Remove from offline" : "Save for offline"}
                    >
                        {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                         isOffline ? <BookmarkCheck className="h-4 w-4 text-gold" /> : <Bookmark className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <h4 className="font-semibold truncate" title={resource.title}>{resource.title}</h4>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Icon className="h-4 w-4 mr-2" />
                        <span>{resource.size_mb ? `${resource.size_mb} MB` : 'Unknown size'}</span>
                    </div>
                    {isOffline && (
                        <div className="flex items-center text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full font-medium">
                            <Cloud className="w-3 h-3 mr-1" />
                            Saved
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full" asChild>
                    <Link href={resource.file_url || '#'} target="_blank">
                        <Download className="mr-2 h-4 w-4" />
                        {isOffline ? 'Open Offline' : 'Download'}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = React.useState<string | 'all'>('all');
  const [resources, setResources] = useState<any[]>([]);
  const [offlineResourceIds, setOfflineResourceIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchResources = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch student's enrolled subjects
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('subject_id')
        .eq('student_id', user.id)
        .eq('status', 'approved');

      if (!enrollments || enrollments.length === 0) {
        setResources([]);
        setLoading(false);
        return;
      }

      const subjectIds = enrollments.map(e => e.subject_id);

      // Fetch resources for those subjects
      const [{ data: resourcesData }, { data: offlineData }] = await Promise.all([
          supabase
            .from('resources')
            .select(`
              *,
              subject:subjects (
                name
              )
            `)
            .in('subject_id', subjectIds)
            .eq('approval_status', 'approved'),
          supabase
            .from('student_offline_resources')
            .select('resource_id')
            .eq('student_id', user.id)
      ]);
      
      if (resourcesData) {
          const urlParams = new URLSearchParams(window.location.search);
          const liveClassId = urlParams.get('liveClassId');
          if (liveClassId) {
              setResources(resourcesData.filter(r => r.live_class_id === liveClassId));
          } else {
              setResources(resourcesData);
          }
      }
      if (offlineData) setOfflineResourceIds(new Set(offlineData.map(o => o.resource_id)));
      
      setLoading(false);
    };

    fetchResources();
  }, []);

  const handleToggleOffline = async (resourceId: string, currentlyOffline: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (currentlyOffline) {
        const { error } = await supabase
            .from('student_offline_resources')
            .delete()
            .eq('student_id', user.id)
            .eq('resource_id', resourceId);
            
        if (!error) {
            setOfflineResourceIds(prev => {
                const next = new Set(prev);
                next.delete(resourceId);
                return next;
            });
            toast({ title: "Removed from Offline", description: "Resource removed from offline storage." });
        }
    } else {
        const { error } = await supabase
            .from('student_offline_resources')
            .insert({
                student_id: user.id,
                resource_id: resourceId
            });
            
        if (!error) {
            setOfflineResourceIds(prev => {
                const next = new Set(prev);
                next.add(resourceId);
                return next;
            });
            toast({ title: "Saved Offline", description: "Resource is now available offline." });
        }
    }
  };

  const filteredResources = resources.filter(r => 
    activeFilter === 'all' || r.format === activeFilter
  );

  // Group by Subject Name
  const groupedResources = filteredResources.reduce((acc: any, resource) => {
    const subjectTitle = resource.subject?.name || 'General Resources';
    if (!acc[subjectTitle]) acc[subjectTitle] = [];
    acc[subjectTitle].push(resource);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <SchoolHeader />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
        <p className="text-muted-foreground">
          Find worksheets, videos, and articles to support your learning.
        </p>
      </div>

       <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-2">
            <Button variant={activeFilter === 'all' ? 'default' : 'ghost'} onClick={() => setActiveFilter('all')}>All Formats</Button>
            {filterOptions.map(option => (
                <Button key={option.type} variant={activeFilter === option.type ? 'default' : 'ghost'} onClick={() => setActiveFilter(option.type)}>
                    {option.label}
                </Button>
            ))}
        </CardContent>
      </Card>

      {resources.length === 0 ? (
        <Card className="p-16 text-center">
          <Library className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-medium">Your library is currently empty</h3>
          <p className="text-muted-foreground">Tutors haven't uploaded any resources yet.</p>
        </Card>
      ) : Object.keys(groupedResources).length === 0 ? (
         <Card className="p-16 text-center">
          <Library className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-medium">No resources match your filter</h3>
          <p className="text-muted-foreground">Try selecting a different format.</p>
        </Card>
      ) : (
        <Accordion type="multiple" className="w-full space-y-4" defaultValue={Object.keys(groupedResources)}>
          {Object.entries(groupedResources).map(([subject, items]: [string, any]) => (
            <AccordionItem key={subject} value={subject} className="border rounded-lg bg-card">
              <AccordionTrigger className="p-6 text-lg font-medium hover:no-underline">
                <div className="flex items-center gap-4">
                  <Book className="h-6 w-6 text-primary" />
                  {subject}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {items.map((resource: any) => (
                    <ResourceCard 
                        key={resource.id} 
                        resource={resource} 
                        isOffline={offlineResourceIds.has(resource.id)}
                        onToggleOffline={handleToggleOffline}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
