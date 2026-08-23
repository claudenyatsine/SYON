'use client';

import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';

// Dynamically import to avoid SSR hydration issues with ProseMirror
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl border border-border bg-background/60 flex items-center justify-center py-12 text-foreground/">
      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
      <span className="text-sm">Loading editor...</span>
    </div>
  ),
});

interface CollaborativeEditorProps {
  roomId?: string;
  onChange?: (html: string) => void;
  initialContent?: string;
  readOnly?: boolean;
  placeholder?: string;
  expanded?: boolean;
  isTutorMode?: boolean;
}

export default function CollaborativeEditor({
  onChange,
  initialContent = '',
  readOnly = false,
  placeholder,
  expanded = false,
  isTutorMode = false,
}: CollaborativeEditorProps) {
  return (
    <RichTextEditor
      onChange={onChange}
      initialContent={initialContent}
      readOnly={readOnly}
      placeholder={placeholder}
      expanded={expanded}
      isTutorMode={isTutorMode}
    />
  );
}
