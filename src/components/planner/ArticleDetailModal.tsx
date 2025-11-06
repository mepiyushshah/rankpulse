'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { ArticleViewer } from './ArticleViewer';
import PublishArticleDialog from './PublishArticleDialog';
import { Loader2, Sparkles, Edit2, Save, X, Send, ExternalLink } from 'lucide-react';
import { marked } from 'marked';

interface Article {
  id: string;
  title: string;
  content: string;
  target_keyword: string;
  content_type: string;
  search_volume: number;
  keyword_difficulty: number;
  scheduled_at: string;
  status: string;
  published_url?: string;
  cms_post_id?: string;
}

interface ArticleDetailModalProps {
  open: boolean;
  onClose: () => void;
  article: Article | null;
  projectId: string | null;
  onUpdate: () => void;
}

export function ArticleDetailModal({
  open,
  onClose,
  article,
  projectId,
  onUpdate,
}: ArticleDetailModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(article?.published_url || null);

  if (!article) return null;

  const hasContent = article.content && article.content.trim().length > 0;
  const scheduledDate = new Date(article.scheduled_at);

  const handleGenerateContent = async () => {
    if (!projectId || !article) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          articleId: article.id,
          keyword: article.target_keyword,
          contentType: article.content_type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate article');
      }

      const data = await response.json();
      alert('Article generated successfully!');
      onUpdate(); // Reload the article data
    } catch (error: any) {
      alert(error.message || 'Failed to generate article');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartEdit = () => {
    // Check if content is already HTML or markdown
    if (!article?.content) return;

    // Set the title for editing
    setEditedTitle(article.title || article.target_keyword);

    // Check if content is already HTML (contains HTML tags)
    const isHTML = /<[a-z][\s\S]*>/i.test(article.content);

    if (isHTML) {
      // Content is already HTML, use it directly
      setEditedContent(article.content);
      setIsEditing(true);
    } else {
      // Content is markdown, convert to HTML
      try {
        const html = marked(article.content, {
          breaks: true,
          gfm: true
        }) as string;
        setEditedContent(html);
        setIsEditing(true);
      } catch (error) {
        console.error('Error converting markdown:', error);
        setEditedContent(article.content);
        setIsEditing(true);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
    setEditedTitle('');
  };

  const handleSaveEdit = async () => {
    if (!article) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      alert('Changes saved successfully!');
      setIsEditing(false);
      setEditedTitle('');
      setEditedContent('');
      onUpdate(); // Reload the article data
    } catch (error: any) {
      alert(error.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-600 bg-green-50';
    if (difficulty < 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title=""
      maxWidth="6xl"
    >
      <div className="min-h-[80vh]">
        {/* Header Section - Magazine Style */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-12 py-10 -mx-6 -mt-4 mb-8 border-b border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                  {article.content_type}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getDifficultyColor(article.keyword_difficulty)}`}>
                  Difficulty: {article.keyword_difficulty}
                </span>
                <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  {article.search_volume >= 1000
                    ? `${(article.search_volume / 1000).toFixed(1)}K`
                    : article.search_volume} searches/mo
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3">
                {article.target_keyword}
              </h1>
              <p className="text-lg text-gray-600">
                Scheduled for {scheduledDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              {(publishedUrl || article.published_url) && (
                <a
                  href={publishedUrl || article.published_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-green-600 hover:text-green-700 font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on WordPress
                </a>
              )}
            </div>
            <div className="flex gap-2">
              {hasContent && !isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEdit}
                  >
                    <Edit2 className="mr-1.5 h-4 w-4" />
                    Edit Article
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowPublishDialog(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="mr-1.5 h-4 w-4" />
                    {article.cms_post_id ? 'Update on WordPress' : 'Publish to WordPress'}
                  </Button>
                </>
              )}
              {isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveEdit}
                    loading={isSaving}
                  >
                    <Save className="mr-1.5 h-4 w-4" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Area - Premium Article Style */}
        <div className="px-4">
          {!hasContent ? (
            <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-inner">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="h-10 w-10 text-indigo-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                Ready to Create Magic?
              </h4>
              <p className="text-base text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
                Generate professional, SEO-optimized content for "<span className="font-semibold text-gray-900">{article.target_keyword}</span>" powered by advanced AI
              </p>
              <Button
                variant="primary"
                onClick={handleGenerateContent}
                loading={isGenerating}
                className="px-8 py-3 text-base"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Your Article...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Article with AI
                  </>
                )}
              </Button>
            </div>
          ) : isEditing ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Editable Title */}
              <div className="px-16 pt-10 pb-4 border-b border-gray-200">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Article Title"
                  className="w-full text-4xl font-bold text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-[#00AA45] focus:ring-offset-2 rounded-lg px-4 py-2 border-2 border-transparent hover:border-gray-200 transition-colors"
                />
              </div>
              {/* Rich Text Editor for Content */}
              <RichTextEditor
                value={editedContent}
                onChange={setEditedContent}
                placeholder="Write your article content here..."
              />
            </div>
          ) : (
            <ArticleViewer title={article.title} content={article.content} />
          )}
        </div>

        {/* Action Footer */}
        <div className="flex justify-between items-center gap-3 pt-8 mt-8 border-t border-gray-200 px-4">
          <div>
            {hasContent && !isEditing && (
              <Button
                variant="outline"
                onClick={handleGenerateContent}
                loading={isGenerating}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Regenerate with AI
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Publish Dialog */}
      {showPublishDialog && projectId && (
        <PublishArticleDialog
          articleId={article.id}
          articleTitle={article.title || article.target_keyword}
          projectId={projectId}
          onClose={() => setShowPublishDialog(false)}
          onSuccess={(url) => {
            setPublishedUrl(url);
            onUpdate();
          }}
        />
      )}
    </Dialog>
  );
}
