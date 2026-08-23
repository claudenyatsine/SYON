'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2, ArrowLeft, CheckCircle2, MessageSquare, RefreshCw, BookOpen } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TutorAnnotation } from '@/components/Editor/extensions/TutorAnnotation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeftPanel from '@/components/TutorGrading/LeftPanel';

export default function StudentSubmissionPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.submissionId as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<any>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) return;

    const fetchSubmission = async () => {
      setLoading(true);

      if (submissionId === 'mock-assignment-id-1' || submissionId === 'mock-assignment-id-2') {
        const key = `drmax_submissions_mock-student-id_mock-subject-id`;
        const stored = localStorage.getItem(key);
        let status = 'completed';
        let feedback = 'A well-structured response with clear ideas. Focus on developing examples and formalising your language.';
        
        if (stored) {
          const parsed = JSON.parse(stored);
          const found = parsed.find((item: any) => item.id === submissionId);
          if (found) {
            status = found.status;
            feedback = found.tutor_feedback || feedback;
          }
        }

        setSubmission({
          id: submissionId,
          assignment_id: submissionId,
          raw_text: `France was on the brink of bankruptcy in 1789 due to its involvement in the American Revolutionary War and the extravagant spending of the royal court at Versailles. The tax system was regressive, exempting the nobility and clergy while placing the burden entirely on the Third Estate (peasants and bourgeoisie). This, coupled with poor harvests leading to high bread prices, triggered widespread famine and discontent, forcing King Louis XVI to summon the Estates-General.`,
          overall_feedback: feedback,
          status,
          component_scores: {
            contentMark: 8, contentMax: 10,
            commMark: 6, commMax: 7,
            orgMark: 6, orgMax: 7,
            langMark: 5, langMax: 6,
            totalMark: 25, totalMax: 30,
            grade: 'A'
          },
          profiles: { full_name: 'Pelaiah Tadiwanashe Tapera Ngarande' }
        });
        setAnnotations([
          { id: 'ann-1', marker_number: 1, type: 'comment', content: 'Good historical context', selected_text: 'involvement in the American Revolutionary War' }
        ]);
        setLoading(false);
        return;
      }

      const { data: subData } = await supabase
        .from('submissions')
        .select(`*, profiles(full_name)`)
        .eq('id', submissionId)
        .single();

      if (subData) {
        setSubmission(subData);
      }

      const { data: annData } = await supabase
        .from('annotations')
        .select('*')
        .eq('submission_id', submissionId)
        .order('start_offset', { ascending: true });

      if (annData) {
        setAnnotations(annData);
      }

      setLoading(false);
    };

    fetchSubmission();
  }, [submissionId]);

  const editor = useEditor({
    extensions: [StarterKit, Underline, TutorAnnotation],
    content: submission?.raw_text || '',
    editable: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && submission) {
      if (editor.getText() !== submission.raw_text) {
        editor.commands.setContent(submission.raw_text);
      }
      
      const handleEditorClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName.toLowerCase() === 'mark' && target.hasAttribute('data-annotation-id')) {
          const id = target.getAttribute('data-annotation-id');
          if (id) setActiveAnnotationId(id);
        } else {
          setActiveAnnotationId(null);
        }
      };
      
      editor.view.dom.addEventListener('click', handleEditorClick);
      return () => {
        editor.view.dom.removeEventListener('click', handleEditorClick);
      };
    }
  }, [editor, submission]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </div>
    );
  }

  const comments = annotations.filter(a => a.type === 'comment');
  const corrections = annotations.filter(a => a.type === 'replace' || a.type === 'correction');
  const resources = annotations.filter(a => a.type === 'resource');

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-foreground/ hover:text-foreground rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-bold text-sm tracking-wide">Assignment Feedback</h1>
            <span className="text-[10px] text-foreground/ uppercase tracking-wider">{submission?.profiles?.full_name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 text-gold rounded-full border border-gold/20">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold">Graded</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {submission?.component_scores && (
          <LeftPanel initialMarks={submission.component_scores} isReadOnly={true} />
        )}

        {/* Editor Center Panel */}
        <div className="flex-1 flex flex-col bg-background overflow-y-auto relative">
          <style>{`
            .ProseMirror { outline: none; padding: 2rem 4rem; color: #f1f5f9; font-size: 1rem; line-height: 2; font-family: system-ui, -apple-system, sans-serif; min-height: 100%; }
            .ProseMirror p { margin-bottom: 1.5rem; }
            mark[data-annotation-type="comment"] { background-color: rgba(59, 130, 246, 0.4); padding: 2px 4px; border-radius: 4px; cursor: pointer; transition: all 0.2s; color: white; }
            mark[data-annotation-type="highlight"] { background-color: rgba(245, 158, 11, 0.4); padding: 2px 4px; border-radius: 4px; cursor: pointer; transition: all 0.2s; color: white; }
            mark[data-annotation-type="replace"], mark[data-annotation-type="correction"] { background-color: rgba(255, 255, 255, 0.1); text-decoration: line-through; color: #94a3b8; padding: 0 2px; border-radius: 2px; cursor: pointer; transition: all 0.2s; }
            mark[data-annotation-type="resource"] { background-color: rgba(168, 85, 247, 0.4); padding: 2px 4px; border-radius: 4px; cursor: pointer; transition: all 0.2s; color: white; }
            mark[data-annotation-id="${activeAnnotationId}"] { box-shadow: 0 0 0 2px #D4AF37; outline: 2px solid #D4AF37; outline-offset: 1px; }
          `}</style>
          <div className="max-w-[800px] mx-auto pt-8 pb-20 w-full">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Right Panel Feedback */}
        <div className="w-[380px] bg-background border-l border-border flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.5)] z-10 shrink-0">
          <div className="p-5 border-b border-border bg-muted">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">Tutor Feedback</h2>
            <p className="text-xs text-foreground/">Click highlighted text in the document to see specific feedback.</p>
          </div>

          <Tabs defaultValue="comments" className="flex flex-col flex-1 min-h-0">
            <div className="px-5 pt-3 border-b border-border">
              <TabsList className="w-full bg-muted p-1 h-9 rounded-lg">
                <TabsTrigger value="comments" className="flex-1 text-[11px] font-bold tracking-wide rounded-md data-[state=active]:bg-muted data-[state=active]:text-gold data-[state=active]:shadow-sm transition-all h-7">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Comments ({comments.length})
                </TabsTrigger>
                <TabsTrigger value="corrections" className="flex-1 text-[11px] font-bold tracking-wide rounded-md data-[state=active]:bg-muted data-[state=active]:text-gold data-[state=active]:shadow-sm transition-all h-7">
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Corrections ({corrections.length})
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex-1 text-[11px] font-bold tracking-wide rounded-md data-[state=active]:bg-muted data-[state=active]:text-gold data-[state=active]:shadow-sm transition-all h-7">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Resources ({resources.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 bg-background">
              <div className="p-5">
                <TabsContent value="comments" className="m-0 space-y-3 outline-none">
                  {comments.length === 0 && <p className="text-xs text-foreground/ text-center py-4">No comments.</p>}
                  {comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      onClick={() => setActiveAnnotationId(comment.id)}
                      className={`flex gap-3 bg-muted p-3 rounded-lg shadow-sm transition-colors cursor-pointer border ${activeAnnotationId === comment.id ? 'border-gold ring-1 ring-gold ring-offset-1 ring-offset-obsidian' : 'border-border hover:border-border'}`}
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded bg-gold/20 text-gold font-bold text-[10px] flex-shrink-0 mt-0.5">{comment.marker_number || 1}</div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-foreground/ font-semibold bg-muted px-1.5 py-0.5 rounded truncate max-w-[200px]">"{comment.selected_text}"</span>
                        <p className="text-sm text-foreground/ leading-snug">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="corrections" className="m-0 space-y-3 outline-none">
                  {corrections.length === 0 && <p className="text-xs text-foreground/ text-center py-4">No corrections.</p>}
                  {corrections.map((corr) => (
                    <div 
                      key={corr.id} 
                      onClick={() => setActiveAnnotationId(corr.id)}
                      className={`flex gap-3 bg-muted p-3 rounded-lg shadow-sm transition-colors cursor-pointer border ${activeAnnotationId === corr.id ? 'border-gold ring-1 ring-gold ring-offset-1 ring-offset-obsidian' : 'border-border hover:border-border'}`}
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded bg-gold/20 text-gold font-bold text-[10px] flex-shrink-0 mt-0.5">{corr.marker_number || 1}</div>
                      <div className="flex flex-col gap-1 w-full">
                        <span className="text-[10px] text-foreground/ font-semibold line-through bg-muted px-1.5 py-0.5 rounded truncate max-w-[200px]">"{corr.selected_text}"</span>
                        <div className="flex items-start gap-1.5 text-sm text-foreground/ font-medium">
                          <span className="text-gold mt-0.5">↳</span> {corr.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="resources" className="m-0 space-y-3 outline-none">
                  {resources.length === 0 && <p className="text-xs text-foreground/ text-center py-4">No resources.</p>}
                  {resources.map((res) => (
                    <div 
                      key={res.id} 
                      onClick={() => setActiveAnnotationId(res.id)}
                      className={`flex gap-3 bg-muted p-3 rounded-lg shadow-sm transition-colors cursor-pointer border ${activeAnnotationId === res.id ? 'border-gold ring-1 ring-gold ring-offset-1 ring-offset-obsidian' : 'border-border hover:border-border'}`}
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded bg-gold/20 text-gold font-bold text-[10px] flex-shrink-0 mt-0.5">{res.marker_number || 1}</div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-foreground/ font-semibold bg-muted px-1.5 py-0.5 rounded truncate max-w-[200px]">"{res.selected_text}"</span>
                        <a href={res.content} target="_blank" rel="noopener noreferrer" className="text-sm text-gold hover:text-foreground font-medium leading-snug flex items-center gap-1 hover:underline">
                          <BookOpen className="w-3.5 h-3.5" /> View Resource
                        </a>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>

          {submission?.overall_feedback && (
            <div className="p-5 border-t border-border bg-muted">
              <h3 className="text-[10px] font-bold text-foreground/ uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                Overall Feedback
              </h3>
              <p className="text-sm text-foreground/ leading-relaxed bg-muted p-3 rounded-md border border-border shadow-sm">{submission.overall_feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


