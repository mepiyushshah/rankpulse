'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KeywordModal } from '@/components/keywords/KeywordModal';
import { GenerateContentModal, GenerationConfig } from '@/components/planner/GenerateContentModal';
import { TipTapArticleEditor } from '@/components/planner/TipTapArticleEditor';
import { ArticleViewer } from '@/components/planner/ArticleViewer';
import { supabase } from '@/lib/supabase';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Calendar as CalendarIcon,
  ArrowLeft,
  Edit2,
  Save,
  X,
  Loader2,
  Send,
} from 'lucide-react';
import { marked } from 'marked';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

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
  slug?: string;
  meta_description?: string;
  published_url?: string;
}

export default function ContentPlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [keywordModalOpen, setKeywordModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Load project and articles on mount and when month changes
  useEffect(() => {
    loadProject();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadArticles();
    }
  }, [projectId, currentDate]);

  const loadProject = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: projectsData, error } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (projectsData) {
      setProjectId(projectsData.id);
    } else if (error?.code === 'PGRST116') {
      // No project found - create a default one
      const { data: newProject } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: 'My Project',
          description: 'Default project',
        })
        .select('id')
        .single();

      if (newProject) {
        setProjectId(newProject.id);
      }
    }
  };

  // Load articles for the current month
  const loadArticles = async () => {
    if (!projectId) return;

    const { year, month } = getCalendarData(currentDate);
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('project_id', projectId)
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString())
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error loading articles:', error);
      setArticles([]); // Set empty array on error
    } else {
      // Map data and provide defaults for new columns if they don't exist
      const mappedArticles = (data || []).map((article: any) => ({
        id: article.id,
        title: article.title,
        content: article.content || '',
        target_keyword: article.target_keyword || '',
        content_type: article.content_type || 'Article',
        search_volume: article.search_volume || 0,
        keyword_difficulty: article.keyword_difficulty || 0,
        scheduled_at: article.scheduled_at,
        status: article.status || 'scheduled',
        slug: article.slug || '',
        meta_description: article.meta_description || '',
      }));
      setArticles(mappedArticles);
    }
  };

  // Handle keyword addition
  const handleAddKeywords = async (keywords: { keyword: string; volume?: number; difficulty?: number }[]) => {
    if (!projectId) {
      alert('No project selected');
      return;
    }

    try {
      // First, save keywords to database
      const keywordResponse = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, keywords }),
      });

      if (!keywordResponse.ok) throw new Error('Failed to save keywords');

      const { keywords: savedKeywords } = await keywordResponse.json();

      // Get all existing articles to find occupied dates
      const { data: existingArticles } = await supabase
        .from('articles')
        .select('scheduled_at')
        .eq('project_id', projectId);

      const occupiedDates = new Set(
        (existingArticles || []).map((article: any) => {
          const date = new Date(article.scheduled_at);
          return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        })
      );

      // Now assign keywords to calendar dates (1 keyword per date)
      // Start from TOMORROW (actual today + 1 day, regardless of calendar month)
      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow
      currentDate.setHours(12, 0, 0, 0); // Set to noon

      const articlesToCreate = [];

      // Function to intelligently detect content type from keyword
      const detectContentType = (keyword: string): string => {
        const lowerKeyword = keyword.toLowerCase();

        // How-to Guide patterns
        if (lowerKeyword.match(/\b(how to|how do|step by step|guide to)\b/)) {
          return 'How-to Guide';
        }

        // Listicle patterns
        if (lowerKeyword.match(/\b(best|top|ways to|tips|ideas|examples|\d+)\b/)) {
          return 'Listicle';
        }

        // Tutorial patterns
        if (lowerKeyword.match(/\b(tutorial|learn|beginner|course|training|basics)\b/)) {
          return 'Tutorial';
        }

        // Comparison patterns
        if (lowerKeyword.match(/\b(vs|versus|comparison|compare|difference between|\bor\b)\b/)) {
          return 'Comparison';
        }

        // Case Study patterns
        if (lowerKeyword.match(/\b(case study|success story|results|example of|analysis)\b/)) {
          return 'Case Study';
        }

        // Intelligent default based on keyword type
        // Question-type keywords → Guide
        if (lowerKeyword.match(/\b(what is|what are|why|when|where|which)\b/)) {
          return 'Guide';
        }

        // Simple noun/topic → Article
        return 'Article';
      };

      for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];
        const savedKeyword = savedKeywords[i];

        // Find next available date (skip occupied dates)
        while (true) {
          const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
          if (!occupiedDates.has(dateKey)) {
            // This date is free, use it
            break;
          }
          // Date is occupied, move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Detect content type from keyword
        const contentType = detectContentType(keyword.keyword);

        articlesToCreate.push({
          project_id: projectId,
          title: `Article: ${keyword.keyword}`,
          content: '',
          status: 'scheduled',
          scheduled_at: currentDate.toISOString(),
          keyword_id: savedKeyword.id,
          target_keyword: keyword.keyword,
          content_type: contentType,
          search_volume: keyword.volume || 0,
          keyword_difficulty: keyword.difficulty || 0,
          language: 'en',
        });

        // Mark this date as occupied for next iteration
        const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
        occupiedDates.add(dateKey);

        // Move to next day for next keyword
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Create articles in database
      if (articlesToCreate.length > 0) {
        const articleResponse = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articles: articlesToCreate }),
        });

        if (!articleResponse.ok) throw new Error('Failed to create articles');
      }

      alert(`Successfully added ${keywords.length} keyword(s) to calendar!`);
      await loadArticles(); // Reload calendar to show new articles
    } catch (error) {
      console.error('Error saving keywords:', error);
      alert('Failed to save keywords. Please try again.');
    }
  };

  // Handle clearing current month's articles
  const handleClearMonth = async () => {
    if (!projectId) {
      alert('No project selected');
      return;
    }

    const confirmed = confirm('Are you sure you want to delete all articles from this month?');
    if (!confirmed) return;

    setLoading(true);
    try {
      const { year, month } = getCalendarData(currentDate);
      const response = await fetch(`/api/articles/delete?projectId=${projectId}&month=${month}&year=${year}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete articles');

      alert('Successfully cleared all articles from this month!');
      await loadArticles();
    } catch (error) {
      console.error('Error clearing articles:', error);
      alert('Failed to clear articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle content plan generation (now handles selected keywords)
  const handleGenerateContentPlan = async (config: GenerationConfig) => {
    if (!projectId) {
      alert('No project selected');
      return;
    }

    // If selectedKeywords exists, use the new flow (add keywords directly to calendar)
    if (config.selectedKeywords && config.selectedKeywords.length > 0) {
      await handleAddKeywords(config.selectedKeywords);
      return;
    }

    // Otherwise, fallback to old flow (shouldn't happen with new UI, but keeping for safety)
    setLoading(true);
    try {
      const { year, month } = getCalendarData(currentDate);
      const response = await fetch('/api/generate-content-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, month, year, config }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to generate content plan');

      alert(`Success! Generated ${data.count} articles for the month.`);
      await loadArticles(); // Reload articles to show new content
    } catch (error: any) {
      console.error('Error generating content plan:', error);
      alert(error.message || 'Failed to generate content plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get calendar data
  const { year, month, monthName, daysInMonth, firstDayOfMonth } = getCalendarData(currentDate);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle article click
  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsEditing(false);
    setEditedContent('');
  };

  // Handle back to calendar
  const handleBackToCalendar = () => {
    setSelectedArticle(null);
    setIsEditing(false);
    setEditedContent('');
  };

  // Handle generate content
  const handleGenerateContent = async () => {
    if (!projectId || !selectedArticle) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
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
      await loadArticles(); // Reload the article data
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
    setEditedTitle(selectedArticle.title || selectedArticle.target_keyword);

    // Set slug (default to target_keyword if not set)
    setEditedSlug(selectedArticle.slug || selectedArticle.target_keyword.toLowerCase().replace(/\s+/g, '-'));

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
      await loadArticles(); // Reload the article data
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
    setEditedSlug(selectedArticle.slug || selectedArticle.target_keyword.toLowerCase().replace(/\s+/g, '-'));
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
      await loadArticles();
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
    if (!selectedArticle || !projectId) return;

    // Check if article has content
    if (!selectedArticle.content || selectedArticle.content.trim().length === 0) {
      alert('Cannot publish an empty article. Please generate content first.');
      return;
    }

    setIsPublishing(true);
    try {
      // First, fetch the WordPress integration for this project
      const integrationsResponse = await fetch(`/api/integrations?project_id=${projectId}`);
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish article');
      }

      alert(`Article published successfully!\n\nPost ID: ${data.data.post_id}\nURL: ${data.data.url || 'N/A'}`);
      await loadArticles();
      const updatedArticle = articles.find(a => a.id === selectedArticle.id);
      if (updatedArticle) {
        setSelectedArticle(updatedArticle);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to publish article. Please check your WordPress connection.');
      console.error('Publish error:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-600 bg-green-50';
    if (difficulty < 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Generate calendar days
  const calendarDays = generateCalendarDays(year, month, firstDayOfMonth, daysInMonth);

  // If an article is selected, show article detail view
  if (selectedArticle) {
    const hasContent = selectedArticle.content && selectedArticle.content.trim().length > 0;
    const scheduledDate = new Date(selectedArticle.scheduled_at);

    return (
      <div className="px-6 pb-6">
        {/* Back Button */}
        <div className="mb-4 py-4 border-b border-gray-200 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToCalendar}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Calendar
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
                  {selectedArticle.status === 'published' && (
                    <div className="pb-4 border-b border-gray-200">
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
                    </div>
                  )}

                  {/* Target Keyword */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Target Keyword</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedArticle.target_keyword}
                    </p>
                  </div>

                  {/* Content Type */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Content Type</p>
                    <span className="inline-block px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg">
                      {selectedArticle.content_type}
                    </span>
                  </div>
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
                        {selectedArticle.slug || selectedArticle.target_keyword.toLowerCase().replace(/\s+/g, '-')}
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

  // Otherwise show calendar view
  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Content Planner</h1>
          <p className="text-sm text-gray-500">
            AI-powered monthly content calendar for your business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => setKeywordModalOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Manually
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => setGenerateModalOpen(true)}
            loading={loading}
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Generate with AI
          </Button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg p-1 gap-1">
          <button
            onClick={goToPreviousMonth}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <span className="text-base font-semibold text-gray-900 px-3 min-w-[140px] text-center">
            {monthName} {year}
          </span>
          <button
            onClick={goToNextMonth}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {articles.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearMonth}
            loading={loading}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Clear Month
          </Button>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {calendarDays.map((day, index) => (
          <CalendarDayCell
            key={index}
            day={day}
            onArticleClick={handleArticleClick}
            articles={articles.filter((article) => {
              const articleDate = new Date(article.scheduled_at);
              return (
                articleDate.getDate() === day.date.getDate() &&
                articleDate.getMonth() === day.date.getMonth() &&
                articleDate.getFullYear() === day.date.getFullYear()
              );
            })}
          />
        ))}
      </div>

      {/* Keyword Modal */}
      <KeywordModal
        open={keywordModalOpen}
        onClose={() => setKeywordModalOpen(false)}
        onAddKeywords={handleAddKeywords}
      />

      {/* Generate Content Modal */}
      <GenerateContentModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        onGenerate={handleGenerateContentPlan}
        currentMonth={currentDate}
        projectId={projectId}
      />
    </div>
  );
}

// Calendar Day Cell Component
function CalendarDayCell({
  day,
  articles,
  onArticleClick
}: {
  day: CalendarDay;
  articles: Article[];
  onArticleClick: (article: Article) => void;
}) {
  const dayNumber = day.date.getDate();
  const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' });
  const isToday = day.isToday;
  const isCurrentMonth = day.isCurrentMonth;

  // Get content type emoji
  const getContentTypeEmoji = (contentType: string) => {
    if (contentType.includes('How-to') || contentType.includes('Guide')) return '📝';
    if (contentType.includes('Listicle')) return '📋';
    if (contentType.includes('Tutorial')) return '🎓';
    if (contentType.includes('Comparison')) return '⚖️';
    if (contentType.includes('Case Study')) return '📊';
    return '📄';
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'bg-green-50 border-green-200';
    if (difficulty < 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div
      className={`
        min-h-[140px] bg-white border rounded-lg p-3
        transition-all duration-200 hover:shadow-md cursor-pointer
        ${isToday ? 'ring-2 ring-primary shadow-md' : 'border-gray-200'}
        ${!isCurrentMonth ? 'opacity-40' : ''}
      `}
    >
      {/* Date Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={`text-2xl font-bold ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
          {dayNumber}
        </span>
        <span className={`text-xs font-medium ${isCurrentMonth ? 'text-gray-600' : 'text-gray-400'}`}>
          {dayName}
        </span>
      </div>

      {/* Content Area */}
      <div className="space-y-2">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div
              key={article.id}
              onClick={() => onArticleClick(article)}
              className={`${getDifficultyColor(article.keyword_difficulty)} border rounded-md p-2 cursor-pointer hover:shadow-md transition-shadow`}
            >
              {/* Title or Keyword */}
              <p className="text-xs font-bold text-gray-900 break-words">
                {article.title && !article.title.startsWith('Article:') ? article.title : article.target_keyword}
              </p>

              {/* Volume and Difficulty */}
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-600">
                <span className="font-medium">Vol: {article.search_volume >= 1000 ? `${(article.search_volume / 1000).toFixed(1)}K` : article.search_volume}</span>
                <span>•</span>
                <span className="font-medium">Diff: {article.keyword_difficulty}</span>
              </div>

              {/* Content Type and Status */}
              <div className="flex items-center justify-between gap-1 mt-1">
                <span className="text-[10px] text-gray-500">
                  {getContentTypeEmoji(article.content_type)} {article.content_type}
                </span>
                {article.status === 'published' && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                    ✓ Published
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          isCurrentMonth && (
            <p className="text-xs text-gray-400 italic">No article scheduled</p>
          )
        )}
      </div>
    </div>
  );
}

// Utility Functions
function getCalendarData(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthName = date.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  return { year, month, monthName, daysInMonth, firstDayOfMonth };
}

function generateCalendarDays(
  year: number,
  month: number,
  firstDayOfMonth: number,
  daysInMonth: number
): CalendarDay[] {
  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Only current month days - no previous or next month dates
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  return days;
}
