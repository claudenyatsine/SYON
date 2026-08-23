'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle2, Clock, PlayCircle, FileText, CheckCircle, Award, Loader2, Maximize2, Minimize2 } from "lucide-react"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useUser } from "@/components/providers/user-context"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getSubjectAssignments, submitAssignment } from "@/app/actions/student-assignments"
import CollaborativeEditor from "@/components/Editor/CollaborativeEditor"

export function CurriculumTree({ modules, progress, itemCompletions }: { 
  modules: any[], 
  progress: any[],
  itemCompletions: any[]
}) {
  const { profile } = useUser();
  const { toast } = useToast();
  const { subjectId } = useParams() as { subjectId: string };
  const supabase = createClient();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // Submit modal state
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Preview feedback modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Expand/collapse the submission editor dialog
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);


  // Selected assignment for submit/preview
  const [selectedAssignment, setSelectedAssignment] = useState<{
    topicId: string;
    topicTitle: string;
    assignmentNum: number;
    submission?: string;
    feedback?: string;
  } | null>(null);

  const loadData = async () => {
    if (!profile?.id || !subjectId) return;
    setLoadingAssignments(true);
    
    // 1. Fetch tutor_id from enrollments
    try {
      const { data: enrollData } = await supabase
        .from('enrollments')
        .select('tutor_id')
        .eq('student_id', profile.id)
        .eq('subject_id', subjectId)
        .maybeSingle();
        
      if (enrollData?.tutor_id) {
        setTutorId(enrollData.tutor_id);
      }
    } catch (e) {
      console.warn("Failed to fetch tutor_id from enrollments", e);
    }

    // 2. Fetch assignments
    try {
      const res = await getSubjectAssignments(subjectId, profile.id);
      if (res.data && !res.error) {
        setAssignments(res.data);
      } else {
        const stored = localStorage.getItem(`drmax_submissions_${profile.id}_${subjectId}`);
        if (stored) {
          setAssignments(JSON.parse(stored));
        } else {
          setAssignments([]);
        }
      }
    } catch (err) {
      console.error(err);
      const stored = localStorage.getItem(`drmax_submissions_${profile.id}_${subjectId}`);
      if (stored) {
        try {
          setAssignments(JSON.parse(stored));
        } catch {
          setAssignments([]);
        }
      }
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile?.id, subjectId]);

  const openSubmitDialog = (topicId: string, topicTitle: string, assignmentNum: number) => {
    setSelectedAssignment({ topicId, topicTitle, assignmentNum });
    setSubmissionText('');
    setIsSubmitOpen(true);
  };

  const openPreviewDialog = (topicId: string, topicTitle: string, assignmentNum: number, record: any) => {
    setSelectedAssignment({
      topicId,
      topicTitle,
      assignmentNum,
      submission: record.student_submission,
      feedback: record.tutor_feedback
    });
    setIsPreviewOpen(true);
  };

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !subjectId || !selectedAssignment || !submissionText.trim()) return;

    setSubmitting(true);
    const { topicId, topicTitle, assignmentNum } = selectedAssignment;

    try {
      const res = await submitAssignment({
        studentId: profile.id,
        subjectId,
        moduleItemId: topicId,
        assignmentNum,
        submission: submissionText.trim(),
        tutorId: tutorId || undefined
      });

      if (res.error) {
        console.warn("DB submission failed, falling back to Local Storage", res.error);
        
        const key = `drmax_submissions_${profile.id}_${subjectId}`;
        const stored = localStorage.getItem(key);
        let submissionsList: any[] = [];
        if (stored) {
          try {
            submissionsList = JSON.parse(stored);
          } catch {
            submissionsList = [];
          }
        }

        const existingIdx = submissionsList.findIndex(
          s => s.module_item_id === topicId && s.assignment_number === assignmentNum
        );

        const localRecord = {
          id: crypto.randomUUID(),
          student_id: profile.id,
          student_name: profile.full_name || 'Pelaiah Tadiwanashe Tapera Ngarande',
          subject_id: subjectId,
          subject_name: document.querySelector('h1')?.textContent || 'History',
          module_item_id: topicId,
          topic_title: topicTitle,
          assignment_number: assignmentNum,
          status: 'unmarked',
          student_submission: submissionText.trim(),
          tutor_id: tutorId,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (existingIdx > -1) {
          submissionsList[existingIdx] = localRecord;
        } else {
          submissionsList.push(localRecord);
        }

        localStorage.setItem(key, JSON.stringify(submissionsList));
        
        toast({
          title: 'Submitted Successfully',
          description: 'Your work has been saved locally.'
        });
      } else {
        toast({
          title: 'Submitted Successfully',
          description: 'Your assignment has been sent to your tutor.'
        });
      }

      setIsSubmitOpen(false);
      setSubmissionText('');
      loadData();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Submission Failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!modules || modules.length === 0) {
    return (
      <div className="rounded-lg border text-card-foreground shadow-sm p-12 text-center bg-muted/50">
        <p className="text-muted-foreground">Course modules are currently being prepared by the instructor.</p>
      </div>
    )
  }

  const getProgressForModule = (moduleId: string) => {
    return progress.find(p => p.module_id === moduleId)
  }

  const getItemCompletion = (itemId: string) => {
    return itemCompletions.find(ic => ic.item_id === itemId)
  }

  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full space-y-4">
        {modules.map((mod) => {
          const modProgress = getProgressForModule(mod.id);
          const isCompleted = modProgress?.is_completed;
          const score = modProgress?.score || 0;

          // Compute basic progress based on items if score is 0 but items are checked off
          const totalItems = mod.items?.length || 0;
          const completedItems = mod.items?.filter((i: any) => getItemCompletion(i.id)?.is_done).length || 0;
          const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

          return (
            <AccordionItem key={mod.id} value={mod.id} className="border rounded-xl bg-card shadow-sm overflow-hidden px-2">
              <AccordionTrigger className="hover:no-underline py-4 px-4 data-[state=open]:border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between w-full pr-4 gap-4 text-left">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                        Module {mod.sequence_order}
                      </span>
                      {mod.course_level && (
                        <Badge variant="outline" className="text-xs">{mod.course_level}</Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-bold">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-sm text-muted-foreground font-normal line-clamp-1">{mod.description}</p>
                    )}
                  </div>
                  
                  {/* Progress Info */}
                  <div className="flex flex-col items-end min-w-[150px] space-y-2">
                    <div className="flex items-center justify-between w-full text-xs font-medium">
                      <span className="text-muted-foreground">Progress</span>
                      <span className={isCompleted ? "text-gold" : "text-primary"}>
                        {progressPercent}%
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2 w-full bg-muted" />
                    {score > 0 && (
                      <div className="text-[10px] font-bold text-muted-foreground uppercase">
                        Avg Score: <span className="text-foreground">{score}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0 bg-muted/20">
                <div className="divide-y">
                  {mod.items && mod.items.length > 0 ? mod.items.map((item: any, idx: number) => {
                    const completion = getItemCompletion(item.id);
                    const isItemDone = completion?.is_done;

                    return (
                      <div key={item.id} className="p-5 hover:bg-muted/40 transition-colors flex flex-col md:flex-row gap-6 relative">
                        {/* Status / Timeline Column */}
                        <div className="flex flex-col items-center gap-2 md:min-w-[120px]">
                          {isItemDone ? (
                            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground">
                              {idx + 1}
                            </div>
                          )}
                          
                          {item.start_date && (
                            <div className="flex flex-col items-center text-center mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scheduled</span>
                              <div className="flex items-center text-xs font-medium bg-background border px-2 py-1 rounded shadow-sm whitespace-nowrap mt-1">
                                <Calendar className="w-3 h-3 mr-1.5 text-primary" />
                                {format(new Date(item.start_date), "MMM d")}
                              </div>
                            </div>
                          )}
                          
                          {completion?.score_achieved !== undefined && completion.score_achieved !== null && (
                            <div className="mt-2 text-center">
                              <Badge variant="secondary" className="bg-gold/10 text-gold hover:bg-gold/20">
                                Score: {completion.score_achieved}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="text-base font-bold">{item.title}</h4>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No topics have been scheduled for this module yet.
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      {/* Student Submission Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={(open) => { setIsSubmitOpen(open); if (!open) setIsEditorExpanded(false); }}>
        <DialogContent className={`transition-all duration-300 bg-white border-border shadow-2xl rounded-2xl ${
          isEditorExpanded ? 'sm:max-w-[92vw] h-[90vh] flex flex-col' : 'sm:max-w-5xl'
        }`}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-foreground text-lg flex items-center gap-2 font-bold">
                <FileText className="w-5 h-5 text-primary" />
                <span>Submit Assignment {selectedAssignment?.assignmentNum}</span>
              </DialogTitle>
              <button
                type="button"
                onClick={() => setIsEditorExpanded(prev => !prev)}
                title={isEditorExpanded ? 'Collapse editor' : 'Expand editor'}
                className="p-1.5 rounded-md text-foreground/ hover:text-foreground/ hover:bg-muted transition-colors flex-shrink-0"
              >
                {isEditorExpanded
                  ? <Minimize2 className="w-4 h-4" />
                  : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmission} className={`grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 py-2 ${
            isEditorExpanded ? 'flex-1 min-h-0' : ''
          }`}>
            {/* Left Column: Form Info / Actions */}
            <div className="flex flex-col space-y-6">
              <div className="bg-slate-50 border border-border rounded-lg p-4 text-foreground/ text-sm">
                <p>Submit your work for topic:</p>
                <p className="font-semibold text-foreground mt-1">"{selectedAssignment?.topicTitle}"</p>
                <p className="mt-3 text-foreground/ text-xs">Your tutor will review this document and provide evaluation feedback.</p>
              </div>

              <div className="flex-1" />

              <DialogFooter className="flex-col sm:flex-row gap-2 mt-auto">
                <Button type="button" variant="outline" onClick={() => setIsSubmitOpen(false)} className="border-border text-foreground/ hover:bg-slate-50 w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-5 py-2.5 rounded-lg w-full sm:w-auto">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Assignment
                </Button>
              </DialogFooter>
            </div>

            {/* Right Column: Editor */}
            <div className={`flex flex-col min-h-[400px] ${isEditorExpanded ? 'h-full' : ''}`}>
              <CollaborativeEditor 
                roomId={`student-assignment-${profile?.id || 'guest'}-${selectedAssignment?.topicId || 'default'}-${selectedAssignment?.assignmentNum || 1}`}
                onChange={(html) => setSubmissionText(html)}
                initialContent=""
                placeholder="Type or paste your homework, essay, or exercises here..."
                expanded={isEditorExpanded}
              />
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tutor Feedback Preview Dialog (Gold theme) */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[600px] border-gold/30 bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-gold text-lg flex items-center gap-2 font-bold">
              <Award className="w-5 h-5 text-gold" />
              <span>Assignment {selectedAssignment?.assignmentNum} - Evaluation Feedback</span>
            </DialogTitle>
            <DialogDescription className="text-gold/60">
              Review tutor's grade, corrections, and comments on your submitted work.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gold/80 uppercase tracking-wider block">Your Submission:</span>
              <div 
                className="bg-background/50 border border-border rounded-lg p-4 max-h-[200px] overflow-y-auto text-sm text-foreground/ prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedAssignment?.submission || '' }}
              />
            </div>

            <div className="space-y-1.5 p-4 rounded-lg bg-gold/5 border border-gold/25">
              <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-1">Tutor Feedback & Corrections:</span>
              <div className="text-sm text-gold/90 leading-relaxed font-sans whitespace-pre-wrap">
                {selectedAssignment?.feedback || "No feedback comments provided."}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsPreviewOpen(false)} className="border-gold/20 text-gold hover:bg-gold/10 bg-gold/5">
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
