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

interface ButtonStates {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  h1: boolean;
  h2: boolean;
  h3: boolean;
  bulletList: boolean;
  orderedList: boolean;
  justifyLeft: boolean;
  justifyCenter: boolean;
  justifyRight: boolean;
  justifyFull: boolean;
  link: boolean;
  blockquote: boolean;
  pre: boolean;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [buttonStates, setButtonStates] = useState<ButtonStates>({
    bold: false,
    italic: false,
    underline: false,
    h1: false,
    h2: false,
    h3: false,
    bulletList: false,
    orderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    link: false,
    blockquote: false,
    pre: false,
  });

  useEffect(() => {
    if (editorRef.current && value) {
      // Only update if content is different to avoid cursor issues
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }
  }, [value, isInitialized]);

  const updateButtonStates = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const newStates: ButtonStates = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      h1: false,
      h2: false,
      h3: false,
      bulletList: document.queryCommandState('insertUnorderedList'),
      orderedList: document.queryCommandState('insertOrderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      justifyFull: document.queryCommandState('justifyFull'),
      link: document.queryCommandState('createLink'),
      blockquote: false,
      pre: false,
    };

    // Check for headings and block-level elements
    let node = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName?.toLowerCase();

        if (tagName === 'h1') newStates.h1 = true;
        if (tagName === 'h2') newStates.h2 = true;
        if (tagName === 'h3') newStates.h3 = true;
        if (tagName === 'blockquote') newStates.blockquote = true;
        if (tagName === 'pre') newStates.pre = true;
      }
      node = node.parentNode;
    }

    setButtonStates(newStates);
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
    // Update button states after command execution
    setTimeout(updateButtonStates, 10);
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleSelectionChange = () => {
    updateButtonStates();
  };

  const handleKeyUp = () => {
    updateButtonStates();
  };

  const handleMouseUp = () => {
    updateButtonStates();
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
      isActive: false,
    },
    {
      icon: Redo,
      label: 'Redo',
      action: () => execCommand('redo'),
      isActive: false,
    },
    { divider: true },
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => insertHeading(1),
      isActive: buttonStates.h1,
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => insertHeading(2),
      isActive: buttonStates.h2,
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      action: () => insertHeading(3),
      isActive: buttonStates.h3,
    },
    { divider: true },
    {
      icon: Bold,
      label: 'Bold',
      action: () => execCommand('bold'),
      isActive: buttonStates.bold,
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => execCommand('italic'),
      isActive: buttonStates.italic,
    },
    {
      icon: Underline,
      label: 'Underline',
      action: () => execCommand('underline'),
      isActive: buttonStates.underline,
    },
    { divider: true },
    {
      icon: AlignLeft,
      label: 'Align Left',
      action: () => execCommand('justifyLeft'),
      isActive: buttonStates.justifyLeft,
    },
    {
      icon: AlignCenter,
      label: 'Align Center',
      action: () => execCommand('justifyCenter'),
      isActive: buttonStates.justifyCenter,
    },
    {
      icon: AlignRight,
      label: 'Align Right',
      action: () => execCommand('justifyRight'),
      isActive: buttonStates.justifyRight,
    },
    {
      icon: AlignJustify,
      label: 'Justify',
      action: () => execCommand('justifyFull'),
      isActive: buttonStates.justifyFull,
    },
    { divider: true },
    {
      icon: List,
      label: 'Bullet List',
      action: () => execCommand('insertUnorderedList'),
      isActive: buttonStates.bulletList,
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => execCommand('insertOrderedList'),
      isActive: buttonStates.orderedList,
    },
    { divider: true },
    {
      icon: Link,
      label: 'Insert Link',
      action: createLink,
      isActive: buttonStates.link,
    },
    {
      icon: Image,
      label: 'Insert Image',
      action: insertImage,
      isActive: false,
    },
    {
      icon: Quote,
      label: 'Blockquote',
      action: () => execCommand('formatBlock', 'blockquote'),
      isActive: buttonStates.blockquote,
    },
    {
      icon: Code,
      label: 'Code Block',
      action: () => execCommand('formatBlock', 'pre'),
      isActive: buttonStates.pre,
    },
  ];

  return (
    <div className="bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 flex flex-wrap items-center gap-2 bg-gray-50">
        {toolbarButtons.map((button, index) => {
          if ('divider' in button) {
            return (
              <div
                key={`divider-${index}`}
                className="w-px h-6 bg-gray-300"
              />
            );
          }

          const Icon = button.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={button.action}
              className={`p-2 rounded-lg transition-all ${
                button.isActive
                  ? 'bg-[#00AA45] text-white'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
              title={button.label}
            >
              <Icon className="h-4 w-4" />
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
            onKeyUp={handleKeyUp}
            onMouseUp={handleMouseUp}
            onClick={handleMouseUp}
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
