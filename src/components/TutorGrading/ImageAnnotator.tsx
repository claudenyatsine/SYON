'use client';

import React, { useState, useRef, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import TextToolSelector from './TextToolSelector';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type AnnotationType = 'highlight' | 'strikethrough' | 'comment' | 'resource';

export interface ImageAnnotation {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  selected_text?: string;
  marker_number?: number;
  page?: number;
}

interface ImageAnnotatorProps {
  fileUrl: string;
  activeAnnotationId: string | null;
  annotations: ImageAnnotation[];
  onAnnotationClick: (id: string) => void;
  onAddAnnotation: (annotation: ImageAnnotation) => void;
  onRemoveAnnotation: (id: string) => void;
}

export default function ImageAnnotator({
  fileUrl,
  activeAnnotationId,
  annotations,
  onAnnotationClick,
  onAddAnnotation,
  onRemoveAnnotation
}: ImageAnnotatorProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDraw, setCurrentDraw] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [pendingDraw, setPendingDraw] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  
  const [showSelector, setShowSelector] = useState(false);
  const [selectorCoords, setSelectorCoords] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  const [draftComment, setDraftComment] = useState<{ x: number, y: number, actionType?: string } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [originalText, setOriginalText] = useState('');
  
  // PDF state
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  
  const isPdf = fileUrl.toLowerCase().includes('.pdf');
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter annotations for current page (or page 1 if not set)
  const currentAnnotations = annotations.filter(a => !a.page || a.page === pageNumber);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const getCoordinates = (e: MouseEvent<SVGElement>) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };

  const handlePointerDown = (e: MouseEvent<SVGElement>) => {
    // If clicking on an existing annotation, ignore
    if ((e.target as Element).tagName !== 'svg') return;
    
    // Close existing popups
    setShowSelector(false);
    setDraftComment(null);

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setCurrentDraw({ x, y, width: 0, height: 0 });
  };

  const handlePointerMove = (e: MouseEvent<SVGElement>) => {
    if (!isDrawing || !currentDraw) return;
    const { x, y } = getCoordinates(e);
    
    setCurrentDraw({
      x: currentDraw.x,
      y: currentDraw.y,
      width: x - currentDraw.x,
      height: y - currentDraw.y,
    });
  };

  const handlePointerUp = (e: MouseEvent<SVGElement>) => {
    if (!isDrawing || !currentDraw) return;
    setIsDrawing(false);

    let finalX = currentDraw.x;
    let finalY = currentDraw.y;
    let finalWidth = currentDraw.width;
    let finalHeight = currentDraw.height;

    if (finalWidth < 0) {
      finalX += finalWidth;
      finalWidth = Math.abs(finalWidth);
    }
    if (finalHeight < 0) {
      finalY += finalHeight;
      finalHeight = Math.abs(finalHeight);
    }

    setPendingDraw({ x: finalX, y: finalY, width: finalWidth, height: finalHeight });
    setSelectorCoords({ x: e.clientX, y: e.clientY });
    setShowSelector(true);
    setCurrentDraw(null);
  };

  const handleToolAction = (actionType: string) => {
    if (!pendingDraw) return;
    
    if (actionType === 'comment' || actionType === 'highlight' || actionType === 'strikethrough' || actionType === 'resource') {
      setDraftComment({ x: pendingDraw.x, y: pendingDraw.y, actionType });
    }
    
    setShowSelector(false);
  };

  const submitComment = () => {
    if (!draftComment || !pendingDraw) return;
    if (draftComment.actionType === 'strikethrough' && !originalText.trim()) return;
    if (draftComment.actionType === 'resource' && !originalText.trim()) return; // Needs title
    if (!commentText.trim()) return;

    const id = crypto.randomUUID();
    
    let type: AnnotationType = 'comment';
    if (draftComment.actionType === 'highlight') type = 'highlight';
    else if (draftComment.actionType === 'strikethrough') type = 'strikethrough';
    else if (draftComment.actionType === 'resource') type = 'resource';

    onAddAnnotation({
      id,
      type,
      x: pendingDraw.x,
      y: pendingDraw.y,
      width: pendingDraw.width,
      height: pendingDraw.height,
      content: commentText,
      selected_text: (type === 'strikethrough' || type === 'resource') ? originalText : undefined,
      page: isPdf ? pageNumber : 1
    });

    setDraftComment(null);
    setCommentText('');
    setOriginalText('');
    setPendingDraw(null);
  };

  return (
    <div className="flex flex-col h-full bg-muted/20 relative">
      <TextToolSelector 
        manualMode={true} 
        isVisible={showSelector} 
        coords={selectorCoords} 
        onAction={handleToolAction}
      />

      <div className="flex items-center justify-between p-2 bg-background border-b z-10 shadow-sm min-h-[48px]">
        <div className="text-sm font-medium text-muted-foreground px-2">
          Draw on the document to add annotations
        </div>
        
        {isPdf && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {pageNumber} {numPages ? `of ${numPages}` : ''}
            </span>
            <Button variant="outline" size="sm" onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))} disabled={!numPages || pageNumber >= numPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
        <div 
          className="relative inline-block shadow-lg border border-border bg-white cursor-crosshair"
          ref={containerRef}
        >
          {isPdf ? (
            <div className="select-none pointer-events-none">
              <Document 
                file={fileUrl} 
                onLoadSuccess={onDocumentLoadSuccess} 
                loading={<div className="p-10 text-muted-foreground text-sm font-medium">Loading PDF...</div>}
                error={<div className="p-10 text-destructive text-sm font-medium">Failed to load PDF.</div>}
              >
                <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} scale={pdfScale} />
              </Document>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={fileUrl} 
              alt="Student Submission" 
              className="max-w-[800px] h-auto block select-none pointer-events-none"
            />
          )}

          {/* Drawing Overlay */}
          <svg 
            className="absolute inset-0 w-full h-full z-10 touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {currentAnnotations.map((ann) => {
              const isActive = ann.id === activeAnnotationId;
              
              if (ann.type === 'highlight') {
                return (
                  <rect 
                    key={ann.id}
                    x={`${ann.x}%`} y={`${ann.y}%`} 
                    width={`${ann.width}%`} height={`${ann.height}%`}
                    fill="rgba(245, 158, 11, 0.4)"
                    stroke={isActive ? '#D4AF37' : 'transparent'}
                    strokeWidth="2"
                    className="cursor-pointer transition-colors pointer-events-auto"
                    onClick={(e) => { e.stopPropagation(); onAnnotationClick(ann.id); }}
                  />
                );
              }
              if (ann.type === 'strikethrough') {
                return (
                  <line 
                    key={ann.id}
                    x1={`${ann.x}%`} y1={`${ann.y + (ann.height || 0)/2}%`} 
                    x2={`${ann.x + (ann.width || 0)}%`} y2={`${ann.y + (ann.height || 0)/2}%`}
                    stroke="rgba(239, 68, 68, 0.8)"
                    strokeWidth="3"
                    className="cursor-pointer pointer-events-auto"
                    onClick={(e) => { e.stopPropagation(); onAnnotationClick(ann.id); }}
                    style={isActive ? { filter: 'drop-shadow(0px 0px 4px #D4AF37)' } : {}}
                  />
                );
              }
              if (ann.type === 'comment' || ann.type === 'resource') {
                const color = isActive ? '#D4AF37' : ann.type === 'resource' ? '#a855f7' : '#3b82f6';
                return (
                  <g 
                    key={ann.id} 
                    className="cursor-pointer transition-transform hover:scale-110 pointer-events-auto"
                    onClick={(e) => { e.stopPropagation(); onAnnotationClick(ann.id); }}
                  >
                    <circle cx={`${ann.x}%`} cy={`${ann.y}%`} r="12" fill={color} className="shadow-sm" />
                    <text x={`${ann.x}%`} y={`${ann.y}%`} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                      {ann.marker_number || (ann.type === 'resource' ? 'R' : '!')}
                    </text>
                  </g>
                );
              }
              return null;
            })}

            {isDrawing && currentDraw && (
              <rect 
                x={`${currentDraw.width < 0 ? currentDraw.x + currentDraw.width : currentDraw.x}%`} 
                y={`${currentDraw.height < 0 ? currentDraw.y + currentDraw.height : currentDraw.y}%`} 
                width={`${Math.abs(currentDraw.width)}%`} 
                height={`${Math.abs(currentDraw.height)}%`}
                fill="rgba(59, 130, 246, 0.2)"
                stroke="#3b82f6"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
            )}
          </svg>

          {/* Draft Comment UI */}
          {draftComment && (
            <div 
              className="absolute z-20 bg-background border shadow-xl rounded-xl p-3 w-[250px]"
              style={{ left: `calc(${draftComment.x}% + 10px)`, top: `calc(${draftComment.y}% + 10px)` }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">
                  {draftComment.actionType === 'strikethrough' ? 'Add Correction' : draftComment.actionType === 'highlight' ? 'Add Highlight' : draftComment.actionType === 'resource' ? 'Cite Resource' : 'Add Comment'}
                </span>
                <button onClick={() => { setDraftComment(null); setPendingDraw(null); }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {(draftComment.actionType === 'strikethrough' || draftComment.actionType === 'resource') && (
                <input 
                  type="text"
                  placeholder={draftComment.actionType === 'strikethrough' ? "Original word (crossed out)" : "Resource Title"}
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  className="w-full text-sm p-2 mb-2 bg-muted border border-border rounded focus-visible:ring-gold focus:outline-none"
                />
              )}

              <Textarea 
                autoFocus
                placeholder={draftComment.actionType === 'strikethrough' ? "Correction text..." : draftComment.actionType === 'resource' ? "Resource URL..." : "Type your comment..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px] text-sm resize-none focus-visible:ring-gold bg-muted border-border"
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={submitComment} disabled={!commentText.trim() || ((draftComment.actionType === 'strikethrough' || draftComment.actionType === 'resource') && !originalText.trim())} className="bg-gold hover:bg-gold/90 text-obsidian h-8 gap-1">
                  <Send className="w-3.5 h-3.5" /> Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
