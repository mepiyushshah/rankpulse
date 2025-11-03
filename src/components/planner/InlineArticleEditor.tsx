'use client';

import { useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code,
  Quote,
} from 'lucide-react';

interface InlineArticleEditorProps {
  title?: string;
  content: string;
  onChange: (content: string) => void;
}

export function InlineArticleEditor({ title, content, onChange }: InlineArticleEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

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
      icon: Heading1,
      label: 'H1',
      action: () => insertHeading(1),
    },
    {
      icon: Heading2,
      label: 'H2',
      action: () => insertHeading(2),
    },
    {
      icon: Heading3,
      label: 'H3',
      action: () => insertHeading(3),
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
    <div className="bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Toolbar */}
        <div className="bg-white border border-gray-200 rounded-t-xl p-3 flex flex-wrap items-center gap-2 sticky top-0 z-10 shadow-sm">
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
                className="p-2 hover:bg-gray-100 hover:text-gray-900 rounded transition-all text-gray-600"
                title={button.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        {/* Article Content - Editable */}
        <div className="bg-white border-x border-b border-gray-200 rounded-b-xl shadow-sm overflow-hidden">
          <article className="article-content px-8 py-10 md:px-12 md:py-12">
            {title && <h1 className="article-title">{title}</h1>}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              onBlur={handleContentChange}
              className="focus:outline-none min-h-[400px]"
              suppressContentEditableWarning
            />
          </article>
        </div>
      </div>

      <style jsx global>{`
        .article-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          color: #1f2937;
          line-height: 1.75;
        }

        /* Main Title */
        .article-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #111827;
          line-height: 1.2;
          margin-bottom: 2rem;
          letter-spacing: -0.025em;
        }

        /* Headings */
        .article-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 3px solid #e0e7ff;
          scroll-margin-top: 2rem;
        }

        .article-content h2:first-child {
          margin-top: 0;
        }

        .article-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }

        .article-content h4 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }

        /* Paragraphs */
        .article-content p {
          font-size: 1.0625rem;
          line-height: 1.8;
          color: #374151;
          margin-bottom: 1.25rem;
        }

        /* Links */
        .article-content a {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .article-content a:hover {
          color: #3730a3;
          text-decoration: underline;
        }

        /* Lists */
        .article-content ul,
        .article-content ol {
          margin: 1.5rem 0;
          padding-left: 1.75rem;
        }

        .article-content li {
          font-size: 1.0625rem;
          line-height: 1.75;
          color: #374151;
          margin-bottom: 0.625rem;
        }

        .article-content ul li {
          list-style-type: disc;
        }

        .article-content ul li::marker {
          color: #6366f1;
        }

        /* Blockquotes */
        .article-content blockquote {
          border-left: 4px solid #818cf8;
          background: linear-gradient(to right, #eef2ff, #ffffff);
          padding: 1.25rem 1.5rem;
          margin: 2rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: italic;
          color: #4b5563;
        }

        .article-content blockquote p {
          margin-bottom: 0;
        }

        /* Code */
        .article-content code {
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.9375rem;
          color: #4f46e5;
          font-family: 'Courier New', Courier, monospace;
        }

        .article-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1.25rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .article-content pre code {
          background-color: transparent;
          padding: 0;
          color: #f9fafb;
          font-size: 0.875rem;
        }

        /* Tables */
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          font-size: 1rem;
        }

        .article-content th {
          background-color: #eef2ff;
          color: #3730a3;
          font-weight: 600;
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 2px solid #c7d2fe;
        }

        .article-content td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }

        .article-content tr:hover {
          background-color: #f9fafb;
        }

        /* Strong/Bold */
        .article-content strong {
          font-weight: 600;
          color: #111827;
        }

        /* Images */
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        /* Horizontal Rule */
        .article-content hr {
          border: none;
          height: 2px;
          background: linear-gradient(to right, transparent, #e5e7eb, transparent);
          margin: 3rem 0;
        }

        /* Contenteditable focus state */
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
