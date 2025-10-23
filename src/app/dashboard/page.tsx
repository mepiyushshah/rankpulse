'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  FileText,
  TrendingUp,
  Calendar,
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  // Mock data - will be replaced with real data from Supabase
  const stats = [
    {
      title: 'Articles Generated',
      value: '12',
      change: '+3 this week',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Articles Published',
      value: '8',
      change: '+2 this week',
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary-light',
    },
    {
      title: 'Scheduled Posts',
      value: '4',
      change: 'Next: Tomorrow',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Words',
      value: '18.5K',
      change: '+4.2K this week',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const recentArticles = [
    {
      id: 1,
      title: 'How to Optimize Your Website for SEO in 2024',
      status: 'published',
      date: '2 hours ago',
      wordCount: 2500,
    },
    {
      id: 2,
      title: 'The Ultimate Guide to Content Marketing',
      status: 'draft',
      date: '5 hours ago',
      wordCount: 3000,
    },
    {
      id: 3,
      title: '10 Best Practices for Email Marketing',
      status: 'scheduled',
      date: 'Tomorrow at 9:00 AM',
      wordCount: 1800,
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/generate">
              <Button variant="primary" size="lg" className="w-full">
                <Zap className="mr-2 h-5 w-5" />
                Generate New Article
              </Button>
            </Link>
            <Link href="/dashboard/projects">
              <Button variant="outline" size="lg" className="w-full">
                Create New Project
              </Button>
            </Link>
            <Link href="/dashboard/integrations">
              <Button variant="outline" size="lg" className="w-full">
                Connect Platform
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Articles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Articles</CardTitle>
          <Link href="/dashboard/articles">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentArticles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.wordCount} words</span>
                  </div>
                </div>
                <div>
                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : article.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    `}
                  >
                    {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
