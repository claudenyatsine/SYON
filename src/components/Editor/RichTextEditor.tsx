'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, Heading3, List, ListOrdered, Code2, RefreshCw,
  Highlighter
} from 'lucide-react';

interface RichTextEditorProps {
  onChange?: (html: string) => void;
  initialContent?: string;
  readOnly?: boolean;
  placeholder?: string;
  expanded?: boolean;
  isTutorMode?: boolean;
}

export default function RichTextEditor({
  onChange,
  initialContent = '',
  readOnly = false,
  placeholder = 'Write your submission here...',
  expanded = false,
  isTutorMode = false,
}: RichTextEditorProps) {

  const editor = useEditor({
    extensions: [
      StarterKit.configure({} as any),
      Underline,
      Highlight.configure({ HTMLAttributes: { class: 'tutor-highlight' } }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    immediatelyRender: false,
  });

  // Sync readOnly content changes
  useEffect(() => {
    if (editor && readOnly && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent, readOnly]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-12 text-foreground/">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Initializing editor...
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-border bg-white overflow-hidden flex flex-col shadow-sm">
      {/* Inline styles for ProseMirror */}
      <style>{`
        .tiptap-editor .ProseMirror {
          min-height: 150px;
          outline: none;
          padding: 1rem;
          color: rgba(15, 23, 42, 0.9);
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(148, 163, 184, 0.8);
          pointer-events: none;
          height: 0;
        }
        .tiptap-editor .ProseMirror h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f172a; }
        .tiptap-editor .ProseMirror h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: #0f172a; }
        .tiptap-editor .ProseMirror h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; color: #0f172a; }
        .tiptap-editor .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; color: #0f172a; }
        .tiptap-editor .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; color: #0f172a; }
        .tiptap-editor .ProseMirror code { background: rgba(0,0,0,0.05); padding: 0.1em 0.3em; border-radius: 3px; font-family: monospace; font-size: 0.85em; color: #0f172a; }
        .tiptap-editor .ProseMirror pre { background: rgba(248,250,252,1); border: 1px solid rgba(226,232,240,1); border-radius: 6px; padding: 0.75rem 1rem; overflow-x: auto; margin: 0.5rem 0; }
        .tiptap-editor .ProseMirror pre code { background: none; padding: 0; font-family: monospace; color: #0f172a; }
        .tiptap-editor .ProseMirror strong { font-weight: 700; color: #0f172a; }
        .tiptap-editor .ProseMirror em { font-style: italic; color: #0f172a; }
        .tiptap-editor .ProseMirror s { text-decoration: line-through; color: #64748b; }
        .tiptap-editor .ProseMirror u { text-decoration: underline; color: #0f172a; }
        .tiptap-editor .ProseMirror blockquote { border-left: 3px solid rgba(203,213,225,1); padding-left: 1rem; color: rgba(100,116,139,1); margin: 0.5rem 0; }
        .tiptap-editor .ProseMirror mark.tutor-highlight { background-color: #fef08a; border-radius: 2px; padding: 0.1em 0.2em; color: #1a202c; font-weight: 500; }
      `}</style>

      {/* Toolbar — only in edit mode */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 p-2 bg-slate-50 border-b border-border">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code2 className="w-4 h-4" />
          </ToolbarButton>

          {isTutorMode && (
            <>
              <Divider />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                active={editor.isActive('highlight')}
                title="Highlight Selection"
              >
                <Highlighter className="w-4 h-4 text-gold" />
              </ToolbarButton>
            </>
          )}
        </div>
      )}

      {/* Editor content */}
      <div className={`tiptap-editor overflow-y-auto bg-slate-50/50 ${
        expanded ? 'flex-1 min-h-0' : 'max-h-[300px] min-h-[160px]'
      }`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick, active, title, children
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active 
          ? 'bg-muted text-foreground' 
          : 'text-foreground/ hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-[1px] h-6 bg-muted mx-1" />;
}
