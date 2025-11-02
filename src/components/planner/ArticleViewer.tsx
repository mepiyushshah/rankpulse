'use client';

import { useMemo } from 'react';
import { marked } from 'marked';

interface ArticleViewerProps {
  content: string;
}

export function ArticleViewer({ content }: ArticleViewerProps) {
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

  // Extract headings for table of contents
  const tableOfContents = useMemo(() => {
    const headingRegex = /^##\s+(.+)$/gm;
    const headings: { text: string; id: string }[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const text = match[1];
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      headings.push({ text, id });
    }

    return headings;
  }, [content]);

  return (
    <div className="bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Table of Contents */}
        {tableOfContents.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Table of Contents
            </h3>
            <ul className="space-y-2">
              {tableOfContents.map((heading, index) => (
                <li key={index}>
                  <a
                    href={`#${heading.id}`}
                    className="text-indigo-700 hover:text-indigo-900 hover:underline text-sm font-medium"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <article
            className="article-content px-8 py-10 md:px-12 md:py-12"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </div>

      <style jsx global>{`
        .article-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          color: #1f2937;
          line-height: 1.75;
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

        /* First paragraph styling */
        .article-content > p:first-of-type {
          font-size: 1.1875rem;
          line-height: 1.75;
          color: #1f2937;
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
      `}</style>
    </div>
  );
}
