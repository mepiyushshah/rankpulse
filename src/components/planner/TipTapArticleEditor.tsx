'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';
import { useEffect } from 'react';

interface TipTapArticleEditorProps {
  title?: string;
  content: string;
  onChange: (content: string) => void;
  onTitleChange?: (title: string) => void;
}

export function TipTapArticleEditor({ title, content, onChange, onTitleChange }: TipTapArticleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 hover:text-indigo-800 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'article-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your article...',
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[400px] article-content',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const url = window.prompt('Enter the URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter the image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const toolbarButtons = [
    {
      icon: Undo,
      label: 'Undo',
      action: () => editor.chain().focus().undo().run(),
      isActive: false,
      isDisabled: !editor.can().undo(),
    },
    {
      icon: Redo,
      label: 'Redo',
      action: () => editor.chain().focus().redo().run(),
      isActive: false,
      isDisabled: !editor.can().redo(),
    },
    { divider: true },
    {
      icon: Bold,
      label: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      icon: UnderlineIcon,
      label: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
    },
    { divider: true },
    {
      icon: Heading1,
      label: 'H1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
    },
    {
      icon: Heading2,
      label: 'H2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      icon: Heading3,
      label: 'H3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
    },
    { divider: true },
    {
      icon: AlignLeft,
      label: 'Align Left',
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' }),
    },
    {
      icon: AlignCenter,
      label: 'Align Center',
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive({ textAlign: 'center' }),
    },
    {
      icon: AlignRight,
      label: 'Align Right',
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' }),
    },
    {
      icon: AlignJustify,
      label: 'Justify',
      action: () => editor.chain().focus().setTextAlign('justify').run(),
      isActive: editor.isActive({ textAlign: 'justify' }),
    },
    { divider: true },
    {
      icon: List,
      label: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
    { divider: true },
    {
      icon: LinkIcon,
      label: 'Insert Link',
      action: setLink,
      isActive: editor.isActive('link'),
    },
    {
      icon: ImageIcon,
      label: 'Insert Image',
      action: addImage,
      isActive: false,
    },
    {
      icon: Quote,
      label: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
    },
    {
      icon: Code,
      label: 'Code Block',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
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
              disabled={button.isDisabled}
              className={`p-2 rounded-lg transition-all ${
                button.isActive
                  ? 'bg-[#00AA45] text-white'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              } ${button.isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
              title={button.label}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* Article Content - Editable */}
      <div className="bg-white">
        <article className="px-8 py-10 md:px-12 md:py-12">
          {/* Editable Title */}
          {onTitleChange ? (
            <input
              type="text"
              value={title || ''}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Article Title"
              className="article-title w-full focus:outline-none focus:ring-2 focus:ring-[#00AA45] focus:ring-offset-2 rounded-lg px-4 py-2 border-2 border-transparent hover:border-gray-200 transition-colors mb-6"
            />
          ) : (
            title && <h1 className="article-title mb-6">{title}</h1>
          )}
          <EditorContent editor={editor} />
        </article>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
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

        /* Placeholder */
        .article-content .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }

        /* Headings */
        .article-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          color: #111827;
          margin-top: 2.5rem;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .article-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 3px solid #E6F7EE;
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
          color: #00AA45;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .article-content a:hover {
          color: #008837;
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
          color: #00AA45;
        }

        /* Blockquotes */
        .article-content blockquote {
          border-left: 4px solid #00AA45;
          background: linear-gradient(to right, #E6F7EE, #ffffff);
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
          color: #00AA45;
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

        /* Tables */
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .article-content thead {
          background: linear-gradient(to right, #E6F7EE, #D4F1E3);
        }

        .article-content th {
          padding: 1rem 1.25rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.9375rem;
          color: #111827;
          border-bottom: 2px solid #00AA45;
        }

        .article-content td {
          padding: 1rem 1.25rem;
          font-size: 0.9375rem;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .article-content tbody tr:hover {
          background-color: #f9fafb;
          transition: background-color 0.2s;
        }

        .article-content tbody tr:last-child td {
          border-bottom: none;
        }

        /* Focus state */
        .ProseMirror:focus {
          outline: none;
        }

        /* Selection */
        .ProseMirror ::selection {
          background-color: #B8E6CE;
        }
      `}} />
    </div>
  );
}
