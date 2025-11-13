'use client';

import { useMemo } from 'react';
import { marked } from 'marked';
import { toCapitalizedCase } from '@/lib/text-utils';

interface ArticleViewerProps {
  title?: string;
  content: string;
}

export function ArticleViewer({ title, content }: ArticleViewerProps) {
  // Convert markdown to HTML
  const contentHtml = useMemo(() => {
    if (!content) return '';
    try {
      return marked(content, {
        breaks: true,
        gfm: true,
      }) as string;
    } catch (error) {
      console.error('Error converting markdown:', error);
      return content;
    }
  }, [content]);

  return (
    <div>
      {/* Article Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <article className="article-content px-8 py-10 md:px-12 md:py-12">
          {title && <h1 className="article-title">{toCapitalizedCase(title)}</h1>}
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </article>
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

        /* Tables */
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          border: 1px solid #e5e7eb;
        }

        .article-content th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.9375rem;
          color: #111827;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
        }

        .article-content td {
          padding: 0.75rem 1rem;
          font-size: 0.9375rem;
          color: #374151;
          border: 1px solid #e5e7eb;
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
      `}</style>
    </div>
  );
}
