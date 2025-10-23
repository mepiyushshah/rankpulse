'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  FileText,
  TrendingUp,
  Calendar,
  Zap,
  Rocket,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [hasProjects, setHasProjects] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProjects();
  }, []);

  const checkProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: projects, error } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) {
        console.error('Error fetching projects:', error);
        // If there's an error, assume no projects and show onboarding
        setHasProjects(false);
      } else {
        const hasProjectsValue = projects && projects.length > 0;
        console.log('Projects check:', { projects, hasProjectsValue });
        setHasProjects(hasProjectsValue);
      }
    } catch (error) {
      console.error('Error checking projects:', error);
      setHasProjects(false); // Default to showing onboarding on error
    } finally {
      setLoading(false);
    }
  };

  // Show onboarding banner if no projects
  if (!loading && hasProjects === false) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* Main Welcome Card */}
          <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl mb-8">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-accent/5"></div>

            <div className="relative px-8 py-12 md:px-12 md:py-16">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-3xl shadow-lg mb-6 transform hover:scale-105 transition-transform">
                  <Rocket className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Welcome to RankPulse!
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Let's create content that ranks. Set up your business profile in just 3 minutes to unlock AI-powered SEO content generation.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/onboarding" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Get Started Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setHasProjects(true)}
                  className="w-full sm:w-auto border-2 hover:bg-gray-50"
                >
                  I'll do this later
                </Button>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="group bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Business Details</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Tell us about your business and website to personalize content</p>
                </div>

                <div className="group bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Target Market</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Select your country and primary language for localized content</p>
                </div>

                <div className="group bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">AI Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Auto-generate your business description with AI assistance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center text-gray-500 text-sm">
            <p>Takes less than 3 minutes • No credit card required</p>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Regular dashboard content for users with projects
  return (
    <DashboardLayout>
      <Content />
    </DashboardLayout>
  );
}

function Content() {
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
