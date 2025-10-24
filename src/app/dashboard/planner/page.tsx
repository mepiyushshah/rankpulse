'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KeywordModal } from '@/components/keywords/KeywordModal';
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

export default function ContentPlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [keywordModalOpen, setKeywordModalOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Load project on mount
  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: projectsData } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (projectsData) {
      setProjectId(projectsData.id);
    }
  };

  // Handle keyword addition
  const handleAddKeywords = async (keywords: { keyword: string; volume?: number; difficulty?: number }[]) => {
    if (!projectId) {
      alert('No project selected');
      return;
    }

    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, keywords }),
      });

      if (!response.ok) throw new Error('Failed to save keywords');

      alert(`Successfully added ${keywords.length} keyword(s)!`);
    } catch (error) {
      console.error('Error saving keywords:', error);
      alert('Failed to save keywords. Please try again.');
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
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Generate with AI
          </Button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center gap-3 mb-5">
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

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {calendarDays.map((day, index) => (
          <CalendarDayCell
            key={index}
            day={day}
          />
        ))}
      </div>

      {/* Keyword Modal */}
      <KeywordModal
        open={keywordModalOpen}
        onClose={() => setKeywordModalOpen(false)}
        onAddKeywords={handleAddKeywords}
      />
    </div>
  );
}

// Calendar Day Cell Component
function CalendarDayCell({ day }: { day: CalendarDay }) {
  const dayNumber = day.date.getDate();
  const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' });
  const isToday = day.isToday;
  const isCurrentMonth = day.isCurrentMonth;

  // Mock articles - replace with real data later
  const hasArticles = false;

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
        {hasArticles ? (
          // Article cards will go here
          <div className="bg-purple-50 border border-purple-200 rounded-md p-2">
            <div className="flex items-start gap-2">
              <span className="text-[10px] text-purple-600 font-medium">📝 Guide: How-to</span>
            </div>
            <p className="text-xs font-semibold text-gray-900 mt-1 line-clamp-2">
              Sample article title
            </p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
              <span>Volume: 590</span>
              <span>Difficulty: 21</span>
            </div>
          </div>
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
