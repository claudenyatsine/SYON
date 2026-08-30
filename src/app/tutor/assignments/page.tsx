'use client';

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileText, CheckCircle, Award, CalendarClock } from "lucide-react";
import { SchoolHeader } from "@/components/app/school-header";
import { useUser } from "@/components/providers/user-context";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getTutorUnmarkedAssignments, gradeAssignment } from "@/app/actions/student-assignments";
import { createClient } from "@/utils/supabase/client";
import GradingHeader from "@/components/TutorGrading/GradingHeader";
import LeftPanel from "@/components/TutorGrading/LeftPanel";
import RightPanel from "@/components/TutorGrading/RightPanel";
import GradingEditor from "@/components/TutorGrading/GradingEditor";

export default function TutorAssignmentsPage() {
  const { profile } = useUser();
  const { toast } = useToast();
  const tutorId = profile?.id || '';

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Grading Dialog State
  const [isMarkingDialogOpen, setIsMarkingDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [feedback, setFeedback] = useState('');
  const [gradingLoading, setGradingLoading] = useState(false);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);

  const loadSubmissions = async () => {
    setLoading(true);
    let dbSubmissions: any[] = [];

    if (tutorId) {
      const supabase = createClient();
      
      const { data: tutorModules } = await supabase.from('curriculum_modules').select('id, subjects(id, name, level)').eq('tutor_id', tutorId);
      const moduleIds = tutorModules?.map((m: any) => m.id) || [];
      
      if (moduleIds.length > 0) {
          const { data: tutorItems } = await supabase.from('curriculum_items').select('id, title, module_id').in('module_id', moduleIds);
          const itemIds = tutorItems?.map((i: any) => i.id) || [];
          
          if (itemIds.length > 0) {
              const { data: tutorAssignments } = await supabase.from('curriculum_assignments').select('id, title, module_item_id, assignment_number').in('module_item_id', itemIds);
              const assignmentIds = tutorAssignments?.map((a: any) => a.id) || [];
              
              if (assignmentIds.length > 0) {
                  const { data: dbData } = await supabase
                      .from('submissions')
                      .select('*, profiles(full_name, email, avatar_url)')
                      .in('assignment_id', assignmentIds)
                      .order('created_at', { ascending: false });
                  
                  if (dbData) {
                      dbSubmissions = dbData.map((sub: any) => {
                          const assignment = tutorAssignments?.find((a: any) => a.id === sub.assignment_id);
                          const item = tutorItems?.find((i: any) => i.id === assignment?.module_item_id);
                          const mod = tutorModules?.find((m: any) => m.id === item?.module_id);
                          
                          // Handle array mapping issues for relationships
                          const subject = Array.isArray(mod?.subjects) ? mod?.subjects[0] : mod?.subjects;
                          
                          return {
                              id: sub.id,
                              status: sub.status === 'submitted' ? 'unmarked' : (sub.status === 'grading' ? 'unmarked' : 'graded'),
                              submitted_at: sub.created_at,
                              assignment_number: assignment?.assignment_number,
                              profiles: sub.profiles,
                              subjects: subject,
                              module_items: { title: item?.title },
                              student_id: sub.student_id,
                              subject_id: subject?.id,
                              module_item_id: item?.id,
                              student_submission: sub.raw_text,
                              file_url: sub.file_url
                          }
                      });
                  }
              }
          }
      }
    }

    // Local Storage Fallback
    const localSubmissions: any[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('drmax_submissions_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsedList = JSON.parse(stored);
            if (Array.isArray(parsedList)) {
              parsedList.forEach((sub: any) => {
                if (sub.status === 'unmarked' || sub.status === 'completed' || sub.status === 'graded') {
                  localSubmissions.push({
                    id: sub.id || `${sub.student_id}_${sub.module_item_id}_${sub.assignment_number}`,
                    student_id: sub.student_id,
                    subject_id: sub.subject_id,
                    module_item_id: sub.module_item_id,
                    assignment_number: sub.assignment_number,
                    status: sub.status,
                    student_submission: sub.student_submission,
                    submitted_at: sub.submitted_at,
                    profiles: {
                      full_name: sub.student_name || 'Pelaiah Tadiwanashe Tapera Ngarande',
                      email: 'student@pelaiah.com',
                      avatar_url: ''
                    },
                    subjects: {
                      name: sub.subject_name || 'History',
                      level: 'A-Level'
                    },
                    module_items: {
                      title: sub.topic_title || 'France, 1774–1814'
                    },
                    isLocal: true
                  });
                }
              });
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse local storage submissions:", e);
    }

    const merged = [...dbSubmissions, ...localSubmissions];
    


    const seen = new Set();
    const uniqueSubmissions = merged.filter((sub: any) => {
      const key = `${sub.student_id}_${sub.module_item_id}_${sub.assignment_number}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setSubmissions(uniqueSubmissions);
    setLoading(false);
  };

  useEffect(() => {
    loadSubmissions();
  }, [tutorId]);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !feedback.trim()) return;

    setGradingLoading(true);
    const sub = selectedSubmission;

    try {
      if (sub.isLocal) {
        const key = `drmax_submissions_${sub.student_id}_${sub.subject_id}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = parsed.map((item: any) => {
            if (item.module_item_id === sub.module_item_id && item.assignment_number === sub.assignment_number) {
              return {
                ...item,
                status: 'completed',
                tutor_feedback: feedback,
                marked_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(updated));
        } else {
          const updated = [{
            id: sub.id,
            student_id: sub.student_id,
            subject_id: sub.subject_id,
            module_item_id: sub.module_item_id,
            assignment_number: sub.assignment_number,
            status: 'completed',
            student_submission: sub.student_submission,
            tutor_feedback: feedback,
            tutor_id: tutorId,
            submitted_at: sub.submitted_at,
            marked_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }];
          localStorage.setItem(key, JSON.stringify(updated));
        }

        toast({
          title: 'Assignment Marked',
          description: 'Feedback saved successfully (Local Mode).'
        });
      } else {
        const res = await gradeAssignment(sub.id, feedback);
        if (res.error) {
          toast({
            title: 'Grading failed',
            description: res.error,
            variant: 'destructive'
          });
          setGradingLoading(false);
          return;
        }

        toast({
          title: 'Assignment Marked',
          description: 'Feedback saved and assignment sent to student.'
        });
      }

      setIsMarkingDialogOpen(false);
      setFeedback('');
      setSelectedSubmission(null);
      setActiveAnnotationId(null);
      loadSubmissions();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error saving feedback',
        description: 'Something went wrong.',
        variant: 'destructive'
      });
    } finally {
      setGradingLoading(false);
    }
  };

  const openMarkingDialog = async (submission: any) => {
    // Navigate to the new grading page. We pass the assignment ID.
    // In a real flow, you'd check if a submission exists in the `submissions` table first,
    // but for now we route to the new page.
    window.location.href = `/tutor/grading/${submission.id}`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <SchoolHeader />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Grading
          </h1>
          <p className="text-muted-foreground">Review, grade, and provide detailed feedback on student submissions.</p>
        </div>
      </div>

      {loading ? (
        <Card className="border-border bg-card">
          <CardContent className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="unmarked" className="w-full">
          <TabsList className="bg-muted/50 border border-border p-1 rounded-lg">
            <TabsTrigger value="unmarked" className="rounded-md data-[state=active]:bg-gold data-[state=active]:text-obsidian">Inbox ({submissions.filter((s:any) => s.status === 'unmarked').length})</TabsTrigger>
            <TabsTrigger value="marked" className="rounded-md data-[state=active]:bg-gold data-[state=active]:text-obsidian">Marked ({submissions.filter((s:any) => s.status === 'completed' || s.status === 'graded').length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="unmarked" className="mt-6">
            {submissions.filter((s:any) => s.status === 'unmarked').length === 0 ? (
              <Card className="border-dashed border-border bg-card py-16 text-center">
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="bg-gold/10 p-4 rounded-full text-gold animate-pulse">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Inbox Clear!</h3>
                  <p className="text-muted-foreground max-w-sm">No student assignments are currently waiting to be marked.</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Inbox: Received Submissions</CardTitle>
                </CardHeader>
                <CardContent className="!pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="border-border">
                        <TableRow className="hover:bg-transparent border-border">
                          <TableHead className="text-muted-foreground">Student</TableHead>
                          <TableHead className="text-muted-foreground">Subject</TableHead>
                          <TableHead className="text-muted-foreground">Topic</TableHead>
                          <TableHead className="text-muted-foreground">Task</TableHead>
                          <TableHead className="text-muted-foreground">Submitted</TableHead>
                          <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.filter((s:any) => s.status === 'unmarked').map((sub) => {
                          const initials = sub.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'ST';
                          return (
                            <TableRow key={sub.id} className="hover:bg-muted/50 border-border">
                              <TableCell className="font-medium text-foreground">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9 border border-border">
                                    <AvatarImage src={sub.profiles?.avatar_url} />
                                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">{initials}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-sm">{sub.profiles?.full_name}</span>
                                    <span className="text-[10px] text-muted-foreground">{sub.profiles?.email}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground font-medium text-sm">
                                {sub.subjects?.name} <span className="text-[10px] text-muted-foreground ml-1.5">({sub.subjects?.level})</span>
                              </TableCell>
                              <TableCell className="text-foreground text-sm max-w-[200px] truncate">{sub.module_items?.title}</TableCell>
                              <TableCell>
                                <Badge className="bg-gold/10 text-gold border-gold/20 hover:bg-gold/20">Assignment {sub.assignment_number}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs">
                                {new Date(sub.submitted_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button onClick={() => openMarkingDialog(sub)} className="bg-gold hover:bg-gold/80 text-obsidian font-bold size-sm text-xs gap-1.5 h-8">
                                  <Award className="w-3.5 h-3.5" />
                                  Mark Assignment
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="marked" className="mt-6">
            {submissions.filter((s:any) => s.status === 'completed' || s.status === 'graded').length === 0 ? (
              <Card className="border-dashed border-border bg-card py-16 text-center">
                <CardContent className="flex flex-col items-center gap-4">
                  <p className="text-muted-foreground max-w-sm">No marked assignments yet.</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Marked / Graded</CardTitle>
                </CardHeader>
                <CardContent className="!pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="border-border">
                        <TableRow className="hover:bg-transparent border-border">
                          <TableHead className="text-muted-foreground">Student</TableHead>
                          <TableHead className="text-muted-foreground">Subject</TableHead>
                          <TableHead className="text-muted-foreground">Topic</TableHead>
                          <TableHead className="text-muted-foreground">Task</TableHead>
                          <TableHead className="text-muted-foreground">Marked Date</TableHead>
                          <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.filter((s:any) => s.status === 'completed' || s.status === 'graded').map((sub) => {
                          const initials = sub.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'ST';
                          return (
                            <TableRow key={sub.id} className="hover:bg-muted/50 border-border">
                              <TableCell className="font-medium text-foreground">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9 border border-border">
                                    <AvatarImage src={sub.profiles?.avatar_url} />
                                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">{initials}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-sm">{sub.profiles?.full_name}</span>
                                    <span className="text-[10px] text-muted-foreground">{sub.profiles?.email}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground font-medium text-sm">
                                {sub.subjects?.name} <span className="text-[10px] text-muted-foreground ml-1.5">({sub.subjects?.level})</span>
                              </TableCell>
                              <TableCell className="text-foreground text-sm max-w-[200px] truncate">{sub.module_items?.title}</TableCell>
                              <TableCell>
                                <Badge className="bg-gold/10 text-gold border-gold/20">Assignment {sub.assignment_number}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs">
                                {sub.marked_at ? new Date(sub.marked_at).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" onClick={() => openMarkingDialog(sub)} className="border-border hover:bg-muted/50 text-foreground text-xs h-8">
                                  View Grade
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Grade Dialog has been moved to its own page route */}
    </div>
  );
}

