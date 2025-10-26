'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Edit2, Save, X } from 'lucide-react';

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
    setEditedContent(article.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  const handleSaveEdit = async () => {
    if (!article) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editedContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      alert('Changes saved successfully!');
      setIsEditing(false);
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
      title={article.target_keyword}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Article Metadata */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Content Type</p>
              <p className="text-base font-semibold text-gray-900">{article.content_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Scheduled Date</p>
              <p className="text-base font-semibold text-gray-900">
                {scheduledDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-gray-500">Search Volume</p>
              <p className="text-base font-semibold text-gray-900">
                {article.search_volume >= 1000
                  ? `${(article.search_volume / 1000).toFixed(1)}K`
                  : article.search_volume}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Difficulty</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(article.keyword_difficulty)}`}>
                {article.keyword_difficulty}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-base font-semibold text-gray-900 capitalize">{article.status}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Article Content</h3>
            <div className="flex gap-2">
              {hasContent && !isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartEdit}
                >
                  <Edit2 className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
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

          {!hasContent ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                No content generated yet
              </h4>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                Generate AI-powered article content optimized for the keyword "{article.target_keyword}"
              </p>
              <Button
                variant="primary"
                onClick={handleGenerateContent}
                loading={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Article...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Article with AI
                  </>
                )}
              </Button>
            </div>
          ) : isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
              placeholder="Write your article content here..."
            />
          ) : (
            <div className="prose max-w-none bg-white border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
              <div className="whitespace-pre-wrap text-gray-900">
                {article.content}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-3 pt-4 border-t">
          <div>
            {hasContent && !isEditing && (
              <Button
                variant="outline"
                onClick={handleGenerateContent}
                loading={isGenerating}
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
    </Dialog>
  );
}
