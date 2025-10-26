'use client';

import { useRef, useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized && value) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };

  const createLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter the image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const toolbarButtons = [
    {
      icon: Undo,
      label: 'Undo',
      action: () => execCommand('undo'),
    },
    {
      icon: Redo,
      label: 'Redo',
      action: () => execCommand('redo'),
    },
    { divider: true },
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => insertHeading(1),
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => insertHeading(2),
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      action: () => insertHeading(3),
    },
    { divider: true },
    {
      icon: Bold,
      label: 'Bold',
      action: () => execCommand('bold'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => execCommand('italic'),
    },
    {
      icon: Underline,
      label: 'Underline',
      action: () => execCommand('underline'),
    },
    { divider: true },
    {
      icon: AlignLeft,
      label: 'Align Left',
      action: () => execCommand('justifyLeft'),
    },
    {
      icon: AlignCenter,
      label: 'Align Center',
      action: () => execCommand('justifyCenter'),
    },
    {
      icon: AlignRight,
      label: 'Align Right',
      action: () => execCommand('justifyRight'),
    },
    {
      icon: AlignJustify,
      label: 'Justify',
      action: () => execCommand('justifyFull'),
    },
    { divider: true },
    {
      icon: List,
      label: 'Bullet List',
      action: () => execCommand('insertUnorderedList'),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => execCommand('insertOrderedList'),
    },
    { divider: true },
    {
      icon: Link,
      label: 'Insert Link',
      action: createLink,
    },
    {
      icon: Image,
      label: 'Insert Image',
      action: insertImage,
    },
    {
      icon: Quote,
      label: 'Blockquote',
      action: () => execCommand('formatBlock', 'blockquote'),
    },
    {
      icon: Code,
      label: 'Code Block',
      action: () => execCommand('formatBlock', 'pre'),
    },
  ];

  return (
    <div className="bg-white overflow-hidden">
      {/* Toolbar - WordPress Style */}
      <div className="bg-white border-b border-gray-200 p-3 flex flex-wrap items-center gap-2 sticky top-0 z-10 shadow-sm">
        {toolbarButtons.map((button, index) => {
          if ('divider' in button) {
            return (
              <div
                key={`divider-${index}`}
                className="w-px h-7 bg-gray-300 mx-1"
              />
            );
          }

          const Icon = button.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={button.action}
              className="p-2.5 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-all text-gray-600 hover:shadow-sm active:scale-95"
              title={button.label}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>

      {/* Editor Area - Premium Styling */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-16 py-10">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            onBlur={handleContentChange}
            className="min-h-[600px] focus:outline-none
              prose prose-xl prose-slate max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-4
              prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-8
              prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
              prose-a:text-indigo-600 prose-a:no-underline
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-ul:my-6 prose-ol:my-6
              prose-li:text-gray-700 prose-li:text-lg prose-li:leading-relaxed
              prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r
              prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-indigo-600
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4
            "
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
            data-placeholder={placeholder}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }

        [contenteditable]:focus {
          outline: none;
        }
      `}} />
    </div>
  );
}
