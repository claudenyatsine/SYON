import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, BookOpenText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Loader2 } from 'lucide-react';

interface GradingHeaderProps {
  studentName?: string;
  submissionTitle?: string;
  assignmentTopic?: string;
  subjectName?: string;
  onClose: () => void;
  onSubmit: (e: any) => void;
  onSaveDraft?: () => void;
  isLoading: boolean;
  isDraftLoading?: boolean;
}

export default function GradingHeader({ studentName, submissionTitle, assignmentTopic, subjectName, onClose, onSubmit, onSaveDraft, isLoading, isDraftLoading }: GradingHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
      {/* Brand & Context */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
          <BookOpenText className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-foreground leading-tight max-w-[300px] truncate" title={assignmentTopic || 'Cambridge Tutor Editor'}>
            {assignmentTopic || 'Cambridge Tutor Editor'}
          </h1>
          <span className="text-xs text-foreground/ font-medium max-w-[300px] truncate" title={subjectName || 'IGCSE English – Paper 2'}>
            {subjectName || 'IGCSE English – Paper 2'}
          </span>
        </div>
      </div>

      {/* Selectors */}
      <div className="flex items-center gap-6 hidden md:flex">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground/">Student:</span>
          <Select defaultValue="aisha">
            <SelectTrigger className="w-[160px] h-8 text-sm font-semibold border-none shadow-none focus:ring-0 px-0 text-foreground">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border text-foreground">
              <SelectItem value="aisha">{studentName || "Aisha Khan"}</SelectItem>
              <SelectItem value="pelaiah">Pelaiah Tapera</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-px h-6 bg-muted" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground/">Submission:</span>
          <Select defaultValue="essay1">
            <SelectTrigger className="w-[200px] h-8 text-sm font-semibold border-none shadow-none focus:ring-0 px-0 text-foreground">
              <SelectValue placeholder="Select submission" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border text-foreground">
              <SelectItem value="essay1">{submissionTitle || "Essay – 21 May 2024"}</SelectItem>
              <SelectItem value="essay2">Essay – 14 May 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" className="h-9 px-4 text-sm font-semibold text-foreground/ hover:text-foreground" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="outline" 
          className="h-9 px-4 text-sm font-semibold text-foreground bg-muted hover:bg-muted border-border"
          onClick={onSaveDraft}
          disabled={isDraftLoading}
        >
          {isDraftLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-foreground" />}
          Save Draft
        </Button>
        <Button className="h-9 px-5 text-sm font-bold bg-gold hover:bg-gold/90 text-obsidian" onClick={onSubmit} disabled={isLoading || isDraftLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-obsidian" />}
          Publish Marks
        </Button>
      </div>
    </header>
  );
}


