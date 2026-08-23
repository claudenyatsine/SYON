import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, BookOpen, Layers, Video, FileQuestion, Calendar, Clock, FileText } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

export default async function CoursePage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params
  const supabase = await createClient()
  
  // 1. Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch enrollment status for THIS subject AND user
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('status, subjects(*)')
    .eq('student_id', user.id)
    .eq('subject_id', subjectId)
    .single()

  // 3. Authorization Logic: Deny access if not approved
  if (!enrollment || enrollment.status !== 'approved') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-card border rounded-2xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              {enrollment?.status === 'pending' 
                ? "Your enrollment is currently pending admin approval. You will gain access once approved."
                : "You do not have access to this course. Please enroll first."}
            </p>
          </div>
          <Link 
            href="/student/courses"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course Catalog
          </Link>
        </div>
      </div>
    )
  }

  const subject = enrollment.subjects as any

  // 4. Fetch Approved Curriculum Modules
  const { data: modules } = await supabase
    .from('curriculum_modules')
    .select(`
      *,
      items:curriculum_items(
        *,
        assignments:curriculum_assignments(*)
      )
    `)
    .eq('subject_id', subjectId)
    .eq('approval_status', 'approved')
    .order('sequence_order', { ascending: true })

  // 5. Fetch submissions to track assignment status
  const { data: submissions } = await supabase
    .from('submissions')
    .select('assignment_id, status, overall_grade')
    .eq('student_id', user.id)

  const submissionMap = new Map();
  if (submissions) {
    submissions.forEach(sub => {
      submissionMap.set(sub.assignment_id, sub);
    });
  }

  // 6. Render protected content
  return (
    <div className="space-y-6 font-sans pb-24">
      <Link href="/student/courses" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Catalog
      </Link>
      <div>
        <div className="flex items-center gap-3 text-primary mb-2">
          <BookOpen className="w-5 h-5" />
          <span className="font-semibold tracking-wide uppercase text-sm">
            {subject?.level} • {subject?.category}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{subject?.name}</h1>
        <p className="text-muted-foreground mt-2">Welcome to the protected course materials for {subject?.name}.</p>
      </div>

      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary" />
          Course Curriculum
        </h2>
        
        {modules && modules.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {modules.map((mod: any) => (
              <AccordionItem key={mod.id} value={mod.id} className="border rounded-xl bg-card shadow-sm px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between w-full pr-4 text-left gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">Module {mod.sequence_order}</span>
                        <Badge variant="outline">{mod.course_level}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold">{mod.title}</h3>
                      {mod.description && <p className="text-sm text-muted-foreground line-clamp-1">{mod.description}</p>}
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {mod.items?.length || 0} Content Items
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 border-t mt-2">
                  <div className="space-y-4">
                    {mod.items?.sort((a:any, b:any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()).map((item: any) => (
                      <div key={item.id} className="p-4 rounded-lg bg-muted/30 border space-y-3 relative group">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              {item.item_type === 'topic' ? (
                                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20"><BookOpen className="w-3 h-3 mr-1"/> Topic</Badge>
                              ) : item.item_type === 'test' ? (
                                <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/20"><FileQuestion className="w-3 h-3 mr-1"/> Test</Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gold/10 text-gold hover:bg-gold/20"><Video className="w-3 h-3 mr-1"/> Live Class</Badge>
                              )}
                              
                              {item.metadata?.exam_allocation_2026 && (
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border px-2 py-0.5 rounded">
                                  {item.metadata.exam_allocation_2026}
                               </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-base">{item.title}</h4>
                          </div>
                          
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2">
                            <div className="flex flex-row sm:flex-col gap-3 sm:gap-1 text-xs text-muted-foreground whitespace-nowrap bg-background p-2 rounded-md border sm:border-0 sm:bg-transparent sm:p-0">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(item.start_date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {item.duration_minutes} mins
                              </div>
                            </div>
                            {item.item_type === 'test' && (
                                <Link 
                                  href={`/student/quiz?topicId=${item.id}`}
                                  className="inline-flex items-center justify-center shrink-0 h-8 px-3 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                                >
                                  Start Test
                                </Link>
                            )}
                          </div>
                        </div>

                        {/* Key Questions */}
                        {item.metadata?.key_questions && item.metadata.key_questions.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-border/50">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Objectives</p>
                            <ul className="grid gap-1 pl-4 list-disc text-sm text-foreground/80">
                              {item.metadata.key_questions.map((q: string, i: number) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Assignments */}
                        {item.assignments && item.assignments.length > 0 && (
                          <div className="space-y-2 pt-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignments</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {item.assignments.map((assignment: any) => {
                                const sub = submissionMap.get(assignment.id);
                                const status = sub ? (sub.status === 'graded' ? 'marked' : 'pending_review') : 'not_submitted';
                                const grade = sub?.overall_grade || '';

                                let statusBadge = null;
                                if (status === 'pending_review') {
                                  statusBadge = <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-amber-500" title="Pending Review" /></div>;
                                } else if (status === 'marked') {
                                  statusBadge = <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-green-500" title="Marked" /></div>;
                                }

                                let buttonClass = "";
                                let buttonText = "";
                                if (status === 'not_submitted') {
                                  buttonClass = "border-primary text-primary hover:bg-primary/10";
                                  buttonText = "Submit";
                                } else if (status === 'pending_review') {
                                  buttonClass = "border-amber-500/30 text-amber-600 bg-amber-500/10";
                                  buttonText = "Pending Review";
                                } else if (status === 'marked') {
                                  buttonClass = "border-green-500 text-green-600 hover:bg-green-50";
                                  buttonText = grade ? `View Grade [${grade}]` : "View Grade";
                                }

                                return (
                                  <Link href={`/student/assignments/${assignment.id}`} key={assignment.id} className="group/assign flex items-center justify-between gap-2 p-3 rounded-md bg-background border hover:border-primary/50 transition-colors">
                                    <div className="flex items-start gap-2">
                                      <div className="mt-0.5 shrink-0">
                                        {statusBadge || <FileText className="w-4 h-4 text-primary shrink-0" />}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium group-hover/assign:text-primary transition-colors">#{assignment.assignment_number}: {assignment.title}</p>
                                        {assignment.description && <p className="text-xs text-muted-foreground line-clamp-1">{assignment.description}</p>}
                                      </div>
                                    </div>
                                    <div className={`shrink-0 flex items-center justify-center h-7 px-2 text-xs font-medium border rounded-md transition-colors ${buttonClass}`}>
                                      {buttonText}
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                      </div>
                    ))}
                    
                    {(!mod.items || mod.items.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">No content has been added to this module yet.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="py-12 text-center border border-dashed rounded-xl bg-muted/10">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium text-lg text-foreground/80">No Content Available Yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back later once the tutor's curriculum is approved.</p>
          </div>
        )}
      </div>
    </div>
  )
}
