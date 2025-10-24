'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KeywordModal } from '@/components/keywords/KeywordModal';
import { GenerateContentModal, GenerationConfig } from '@/components/planner/GenerateContentModal';
import { supabase } from '@/lib/supabase';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Calendar as CalendarIcon,
} from 'lucide-react';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

interface Article {
  id: string;
  title: string;
  target_keyword: string;
  content_type: string;
  search_volume: number;
  keyword_difficulty: number;
  scheduled_at: string;
}

export default function ContentPlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [keywordModalOpen, setKeywordModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

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
        target_keyword: article.target_keyword || '',
        content_type: article.content_type || 'Article',
        search_volume: article.search_volume || 0,
        keyword_difficulty: article.keyword_difficulty || 0,
        scheduled_at: article.scheduled_at,
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

  // Generate calendar days
  const calendarDays = generateCalendarDays(year, month, firstDayOfMonth, daysInMonth);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-200">
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
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousMonth}
            className="h-10 w-10 flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg shadow-md hover:shadow-lg active:shadow-sm transition-all hover:scale-105 active:scale-95"
            style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 -2px 0 0 rgba(0, 0, 0, 0.05)' }}
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 min-w-[180px] text-center">
            {monthName} {year}
          </h2>
          <button
            onClick={goToNextMonth}
            className="h-10 w-10 flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg shadow-md hover:shadow-lg active:shadow-sm transition-all hover:scale-105 active:scale-95"
            style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 -2px 0 0 rgba(0, 0, 0, 0.05)' }}
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
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
function CalendarDayCell({ day, articles }: { day: CalendarDay; articles: Article[] }) {
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
              className={`${getDifficultyColor(article.keyword_difficulty)} border rounded-md p-2`}
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

              {/* Content Type */}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-gray-500">
                  {getContentTypeEmoji(article.content_type)} {article.content_type}
                </span>
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

  // Previous month days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  // Next month days to fill the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  return days;
}
