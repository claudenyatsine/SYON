import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, MoreVertical, ExternalLink } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

export interface Annotation {
  id: string;
  type: 'highlight' | 'comment' | 'strikeout' | 'insert' | 'replace' | 'resource' | 'strikethrough';
  selected_text?: string;
  content?: string;
  marker_number?: number;
}

interface RightPanelProps {
  activeAnnotationId: string | null;
  onCommentClick: (id: string) => void;
  overallFeedback?: string;
  onFeedbackChange?: (feedback: string) => void;
  annotations?: Annotation[];
  onEditAnnotation?: (id: string, newContent: string) => void;
}

export default function RightPanel({ activeAnnotationId, onCommentClick, overallFeedback = '', onFeedbackChange, annotations = [], onEditAnnotation }: RightPanelProps) {
  const comments = annotations.filter(a => a.type === 'comment' || a.type === 'highlight');
  const corrections = annotations.filter(a => a.type === 'replace' || a.type === 'strikeout' || a.type === 'insert' || a.type === 'strikethrough');
  const resources = annotations.filter(a => a.type === 'resource');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSaveEdit = (id: string) => {
    if (onEditAnnotation && editContent.trim() !== '') {
      onEditAnnotation(id, editContent);
    }
    setEditingId(null);
  };

  return (
    <div className="w-[280px] bg-background border-l border-border h-full flex flex-col flex-shrink-0">
      
      <Tabs defaultValue="comments" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full bg-background border-b border-border rounded-none h-12 justify-start px-2">
          <TabsTrigger value="comments" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-gold rounded-none h-full px-4 text-foreground/ data-[state=active]:text-gold">
            Comments
          </TabsTrigger>
          <TabsTrigger value="corrections" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-gold rounded-none h-full px-4 text-foreground/ data-[state=active]:text-gold">
            Corrections
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-gold rounded-none h-full px-4 text-foreground/ data-[state=active]:text-gold">
            Resources
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-5">
          <TabsContent value="comments" className="m-0 space-y-4">
            <h3 className="text-[10px] font-bold text-foreground/ uppercase tracking-wider mb-2">Areas to Improve</h3>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div 
                  key={comment.id} 
                  onClick={() => onCommentClick(comment.id.toString())}
                  className={`flex gap-3 bg-muted p-3 rounded-lg transition-colors cursor-pointer border ${
                    activeAnnotationId === comment.id.toString() 
                      ? 'border-gold ring-1 ring-gold' 
                      : 'border-border hover:border-border'
                  }`}
                >
                  <div className={`flex items-center justify-center w-5 h-5 rounded ${comment.type === 'highlight' ? 'bg-gold' : 'bg-gold text-obsidian'} text-foreground font-bold text-xs flex-shrink-0 mt-0.5`}>
                    {comment.marker_number || '*'}
                  </div>
                  {editingId === comment.id.toString() ? (
                    <Textarea 
                      autoFocus
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onBlur={() => handleSaveEdit(comment.id.toString())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveEdit(comment.id.toString());
                        }
                      }}
                      className="text-sm flex-1 min-h-[60px] p-2 bg-background focus-visible:ring-gold border-none"
                    />
                  ) : (
                    <p 
                      className="text-sm text-foreground/ flex-1 leading-snug cursor-text hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(comment.id.toString());
                        setEditContent(comment.content || '');
                        onCommentClick(comment.id.toString());
                      }}
                    >
                      {comment.content}
                    </p>
                  )}
                  <button className="text-foreground/ hover:text-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="corrections" className="m-0 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-foreground/ uppercase tracking-wider">Corrections</h3>
              <button className="text-xs text-gold font-medium hover:underline">View all</button>
            </div>
            <div className="bg-muted border border-border rounded-lg overflow-hidden divide-y divide-white/10">
              {corrections.length === 0 && <p className="p-3 text-sm text-foreground/">No corrections yet.</p>}
              {corrections.map((corr, i) => (
                <div key={corr.id} className="flex items-center justify-between p-3 text-sm">
                  <span className="text-foreground/ line-through truncate w-[40%]">{corr.selected_text || '...'}</span>
                  <span className="text-foreground/">→</span>
                  <span className="text-gold font-medium truncate w-[45%]">{corr.content}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="m-0 space-y-4">
            <h3 className="text-[10px] font-bold text-foreground/ uppercase tracking-wider mb-2">Recommended Reading</h3>
            <div className="space-y-3">
              {resources.length === 0 && <p className="text-sm text-foreground/">No resources linked yet.</p>}
              {resources.map(res => (
                <a key={res.id} href={res.content} target="_blank" rel="noreferrer" className="flex items-start gap-3 bg-muted border border-border p-3 rounded-lg hover:border-gold/50 transition-colors group">
                  <div className="w-6 h-6 rounded bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold">LINK</span>
                  </div>
                  <span className="text-sm font-medium text-foreground/ flex-1 group-hover:text-gold">{res.selected_text || res.content}</span>
                  <ExternalLink className="w-4 h-4 text-foreground/ group-hover:text-gold" />
                </a>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Overall Feedback */}
      <div className="p-5 border-t border-border bg-muted">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <h3 className="text-[10px] font-bold text-foreground/ uppercase tracking-wider">Overall Feedback</h3>
        </div>
        <Textarea 
          placeholder="Write your overall feedback for the student here..."
          value={overallFeedback}
          onChange={(e) => onFeedbackChange?.(e.target.value)}
          className="min-h-[100px] text-sm resize-none focus-visible:ring-gold bg-muted border-border text-foreground placeholder:text-foreground/"
        />
      </div>
      
    </div>
  );
}


