'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/lib/supabase';
import {
  Settings,
  FileText,
  Zap,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  History,
  Plug,
  Sun,
  Moon,
} from 'lucide-react';

interface SubNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  subItems?: SubNavItem[];
}

const navigation: NavItem[] = [
  { name: 'General Settings', href: '/dashboard/settings', icon: Settings },
  {
    name: 'Articles',
    icon: FileText,
    subItems: [
      { name: 'Articles Settings', href: '/dashboard/articles/settings', icon: Settings },
      { name: 'Articles Planner', href: '/dashboard/planner', icon: CalendarDays },
      { name: 'Articles History', href: '/dashboard/articles/history', icon: History },
      { name: 'Integrations', href: '/dashboard/integrations', icon: Plug },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Articles']);
  const [isDark, setIsDark] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProject(data);
    }
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const handleSignOut = async () => {
    window.location.href = '/auth/logout';
  };

  // Get the first letter of business name for the avatar
  const getBusinessInitial = () => {
    if (!project?.name) return 'B';
    return project.name.charAt(0).toUpperCase();
  };

  // Get display name (fallback to "Your Business" if not set)
  const getBusinessName = () => {
    return project?.name || 'Your Business';
  };

  // Get display URL (fallback to "Add website URL" if not set)
  const getWebsiteUrl = () => {
    return project?.website_url || 'Add website URL';
  };

  return (
    <div className="flex h-screen w-72 flex-col bg-white border-r border-gray-200">
      {/* Logo/Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">RankPulse</span>
        </Link>
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5 text-gray-600" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>
      </div>

      {/* Project Selector */}
      {project && (
        <div className="px-4 py-3 border-b border-gray-200">
          <Link
            href="/dashboard/settings"
            className="w-full flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-white">{getBusinessInitial()}</span>
              </div>
              <div className="text-left min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{getBusinessName()}</p>
                <p className="text-xs text-gray-500 truncate">{getWebsiteUrl()}</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isExpanded = expandedItems.includes(item.name);
          const Icon = item.icon;

          if (item.subItems) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {isExpanded && (
                  <div className="mt-1 ml-4 space-y-1">
                    {item.subItems.map((subItem) => {
                      const isActive = pathname === subItem.href;
                      const SubIcon = subItem.icon;

                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`
                            flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors
                            ${
                              isActive
                                ? 'bg-gray-100 text-gray-900 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }
                          `}
                        >
                          <SubIcon className="w-4 h-4" />
                          <span>{subItem.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href!}
              className={`
                flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4">
        <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">P</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">piyush.shah2212</p>
            </div>
          </div>
        </button>
        <button
          onClick={handleSignOut}
          className="w-full mt-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
