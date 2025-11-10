'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Edit2, ExternalLink, Eye, FileText, Loader2, Save, Search, Send, Sparkles, Trash2, X } from 'lucide-react';
import { ArticleViewer } from '@/components/planner/ArticleViewer';
import { TipTapArticleEditor } from '@/components/planner/TipTapArticleEditor';
import { marked } from 'marked';

type Article = {
  id: string;
  project_id: string;
  title: string;
  content: string;
  meta_description: string | null;
  slug: string | null;
  word_count: number | null;
  language: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduled_at: string | null;
  published_at: string | null;
  cms_post_id: string | null;
  published_url: string | null;
  created_at: string;
  updated_at: string;
  target_keyword?: string;
  content_type?: string;
};

export default function ContentHistoryPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedSlug, setEditedSlug] = useState('');
  const [editedMetaDescription, setEditedMetaDescription] = useState('');
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/articles/history');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.target_keyword?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArticles(articles.filter((a) => a.id !== id));
        setSelectedArticle(null);
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  // Handle article click
  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsEditing(false);
    setEditedContent('');
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedArticle(null);
    setIsEditing(false);
    setEditedContent('');
  };

  // Handle generate content
  const handleGenerateContent = async () => {
    if (!selectedArticle) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedArticle.project_id,
          articleId: selectedArticle.id,
          keyword: selectedArticle.target_keyword,
          contentType: selectedArticle.content_type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate article');
      }

      const data = await response.json();
      alert('Article generated successfully!');
      await fetchArticles(); // Reload the article data
      // Update selected article with new content
      const updatedArticle = articles.find(a => a.id === selectedArticle.id);
      if (updatedArticle) {
        setSelectedArticle(updatedArticle);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to generate article');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle start edit
  const handleStartEdit = () => {
    if (!selectedArticle?.content) return;

    // Set the title for editing
    setEditedTitle(selectedArticle.title || selectedArticle.target_keyword || '');

    // Set slug (default to target_keyword if not set)
    setEditedSlug(selectedArticle.slug || selectedArticle.target_keyword?.toLowerCase().replace(/\s+/g, '-') || '');

    // Set meta description (default to empty if not set)
    setEditedMetaDescription(selectedArticle.meta_description || '');

    // Check if content is already HTML (contains HTML tags)
    const isHTML = /<[a-z][\s\S]*>/i.test(selectedArticle.content);

    if (isHTML) {
      // Content is already HTML, use it directly
      setEditedContent(selectedArticle.content);
      setIsEditing(true);
    } else {
      // Content is markdown, convert to HTML
      try {
        const html = marked(selectedArticle.content, {
          breaks: true,
          gfm: true
        }) as string;
        setEditedContent(html);
        setIsEditing(true);
      } catch (error) {
        console.error('Error converting markdown:', error);
        setEditedContent(selectedArticle.content);
        setIsEditing(true);
      }
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
    setEditedTitle('');
    setEditedSlug('');
    setEditedMetaDescription('');
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!selectedArticle) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/articles/${selectedArticle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent,
          slug: editedSlug,
          meta_description: editedMetaDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      alert('Changes saved successfully!');
      setIsEditing(false);
      await fetchArticles(); // Reload the article data
      // Update selected article with new content
      const updatedArticle = articles.find(a => a.id === selectedArticle.id);
      if (updatedArticle) {
        setSelectedArticle(updatedArticle);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle meta description edit
  const handleStartEditMeta = () => {
    if (!selectedArticle) return;
    setEditedSlug(selectedArticle.slug || selectedArticle.target_keyword?.toLowerCase().replace(/\s+/g, '-') || '');
    setEditedMetaDescription(selectedArticle.meta_description || '');
    setIsEditingMeta(true);
  };

  const handleCancelEditMeta = () => {
    setIsEditingMeta(false);
    setEditedSlug('');
    setEditedMetaDescription('');
  };

  const handleSaveMeta = async () => {
    if (!selectedArticle) return;

    setIsSavingMeta(true);
    try {
      const response = await fetch(`/api/articles/${selectedArticle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: editedSlug,
          meta_description: editedMetaDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save metadata');
      }

      alert('Metadata saved successfully!');
      setIsEditingMeta(false);
      await fetchArticles();
      const updatedArticle = articles.find(a => a.id === selectedArticle.id);
      if (updatedArticle) {
        setSelectedArticle(updatedArticle);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to save metadata');
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedArticle) return;

    // Check if article has content
    if (!selectedArticle.content || selectedArticle.content.trim().length === 0) {
      alert('Cannot publish an empty article. Please generate content first.');
      return;
    }

    setIsPublishing(true);
    try {
      // First, fetch the WordPress integration for this project
      const integrationsResponse = await fetch(`/api/integrations?project_id=${selectedArticle.project_id}`);
      const integrationsData = await integrationsResponse.json();

      if (!integrationsResponse.ok) {
        throw new Error('Failed to fetch integrations');
      }

      // Find the WordPress integration
      const wordpressIntegration = integrationsData.integrations?.find(
        (int: any) => int.platform === 'wordpress'
      );

      if (!wordpressIntegration) {
        alert('No WordPress integration found. Please connect WordPress first in the Integrations page.');
        return;
      }

      if (!confirm(`Are you sure you want to publish "${selectedArticle.title}" to WordPress?`)) {
        return;
      }

      // Publish the article
      const response = await fetch(`/api/articles/${selectedArticle.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_id: wordpressIntegration.id,
          status: 'publish', // Publish immediately
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish article');
      }

      const result = await response.json();
      alert('Article published successfully to WordPress!');

      // Reload articles to get updated status
      await fetchArticles();
      const updatedArticle = articles.find(a => a.id === selectedArticle.id);
      if (updatedArticle) {
        setSelectedArticle(updatedArticle);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to publish article');
    } finally {
      setIsPublishing(false);
    }
  };

  // If an article is selected, show the full-page detail view
  if (selectedArticle) {
    const hasContent = selectedArticle.content && selectedArticle.content.trim().length > 0;

    return (
      <div className="px-6 pb-6">
        {/* Back Button */}
        <div className="mb-4 py-4 border-b border-gray-200 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToList}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Content History
          </Button>
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
                {selectedArticle.status !== 'published' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handlePublish}
                    loading={isPublishing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="mr-1.5 h-4 w-4" />
                    Publish to WordPress
                  </Button>
                )}
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

        {/* Main Content with Sidebar Layout */}
        <div className="flex gap-6">
          {/* Main Article Content */}
          <div className="flex-1 min-w-0">
            {/* Content Area */}
            {!hasContent ? (
              <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-inner">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Sparkles className="h-10 w-10 text-indigo-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">
                  Ready to Create Magic?
                </h4>
                <p className="text-base text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
                  Generate professional, SEO-optimized content for "<span className="font-semibold text-gray-900">{selectedArticle.target_keyword}</span>" powered by advanced AI
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
              <TipTapArticleEditor
                title={editedTitle}
                content={editedContent}
                onChange={setEditedContent}
                onTitleChange={setEditedTitle}
              />
            ) : (
              <ArticleViewer title={selectedArticle.title} content={selectedArticle.content} />
            )}

            {/* Action Footer */}
            <div className="flex justify-between items-center gap-3 pt-8 mt-8 border-t border-gray-200">
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
            </div>
          </div>

          {/* Right Sidebar - Article Details */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              {/* Article Details Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                  Article Details
                </h3>

                <div className="space-y-4">
                  {/* Status */}
                  <div className="pb-4 border-b border-gray-200">
                    {selectedArticle.status === 'published' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold text-green-800">Published</span>
                          </div>
                          {selectedArticle.published_url && (
                            <a
                              href={selectedArticle.published_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-700 hover:text-green-900 underline font-medium"
                            >
                              View Post →
                            </a>
                          )}
                        </div>
                        <button
                          onClick={handlePublish}
                          disabled={isPublishing}
                          className="w-full px-3 py-1.5 text-xs font-medium text-green-700 bg-white border border-green-300 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
                        >
                          {isPublishing ? 'Updating...' : '🔄 Update on WordPress'}
                        </button>
                      </div>
                    )}

                    {selectedArticle.status === 'scheduled' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold text-blue-800">Scheduled</span>
                        </div>
                        {selectedArticle.scheduled_at && (
                          <div className="flex items-center gap-2 text-xs text-blue-700">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Will publish on {formatDate(selectedArticle.scheduled_at)}</span>
                          </div>
                        )}
                        <button
                          onClick={handlePublish}
                          disabled={isPublishing}
                          className="w-full px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
                        >
                          {isPublishing ? 'Publishing...' : 'Publish Now'}
                        </button>
                      </div>
                    )}

                    {selectedArticle.status === 'draft' && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-sm font-semibold text-gray-700">Draft</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          This article is saved as a draft and not published yet.
                        </p>
                        <button
                          onClick={handlePublish}
                          disabled={isPublishing}
                          className="w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {isPublishing ? 'Publishing...' : 'Publish to WordPress'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Target Keyword */}
                  {selectedArticle.target_keyword && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Target Keyword</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedArticle.target_keyword}
                      </p>
                    </div>
                  )}

                  {/* Content Type */}
                  {selectedArticle.content_type && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Content Type</p>
                      <span className="inline-block px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg">
                        {selectedArticle.content_type}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Metadata Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    SEO Metadata
                  </h3>
                  {!isEditing && !isEditingMeta && (
                    <button
                      onClick={handleStartEditMeta}
                      className="text-xs text-[#00AA45] hover:text-[#008936] font-medium"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Slug */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Slug</label>
                    {(isEditing || isEditingMeta) ? (
                      <input
                        type="text"
                        value={editedSlug}
                        onChange={(e) => setEditedSlug(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AA45] focus:border-transparent"
                        placeholder="article-slug"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900 break-words">
                        {selectedArticle.slug || selectedArticle.target_keyword?.toLowerCase().replace(/\s+/g, '-') || 'not-set'}
                      </p>
                    )}
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Meta Description {(isEditing || isEditingMeta) && `(${editedMetaDescription.length}/155)`}
                    </label>
                    {(isEditing || isEditingMeta) ? (
                      <textarea
                        value={editedMetaDescription}
                        onChange={(e) => setEditedMetaDescription(e.target.value.slice(0, 155))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AA45] focus:border-transparent resize-none"
                        placeholder="Enter meta description (max 155 characters)"
                        rows={3}
                        maxLength={155}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 break-words">
                        {selectedArticle.meta_description || <span className="italic text-gray-400">Not set</span>}
                      </p>
                    )}
                  </div>

                  {/* Edit Mode Actions */}
                  {isEditingMeta && !isEditing && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEditMeta}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveMeta}
                        loading={isSavingMeta}
                        className="flex-1"
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise show the list view
  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="mb-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Content History</h1>
        <p className="text-sm text-gray-500">
          View and manage all your published articles
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No published articles found</h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Publish articles from the Content Planner to see them here'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Word Count
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleArticleClick(article)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 mb-1">{article.title}</div>
                          {article.target_keyword && (
                            <div className="text-sm text-gray-500 mb-1">
                              <span className="font-medium">Keyword:</span> {article.target_keyword}
                            </div>
                          )}
                          {article.content_type && (
                            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {article.content_type}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {article.status === 'published' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Published
                        </span>
                      )}
                      {article.status === 'scheduled' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Scheduled
                        </span>
                      )}
                      {article.status === 'draft' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {article.word_count?.toLocaleString() || '0'} words
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-gray-600">
                        {article.status === 'published' && article.published_at && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(article.published_at)}
                          </div>
                        )}
                        {article.status === 'scheduled' && article.scheduled_at && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                            {formatDate(article.scheduled_at)}
                          </div>
                        )}
                        {article.status === 'draft' && (
                          <div className="flex items-center text-gray-500">
                            <Calendar className="w-4 h-4 mr-2 text-gray-300" />
                            Not scheduled
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArticleClick(article);
                          }}
                          className="p-2 text-primary hover:bg-primary-light rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {article.published_url && (
                          <a
                            href={article.published_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View Published Article"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteArticle(article.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
