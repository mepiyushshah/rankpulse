'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IntegrationAlert } from '@/components/IntegrationAlert';
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      console.log('User check:', { user: user?.id, userError });

      if (userError) {
        console.error('User error:', userError);
        router.push('/auth/login');
        return;
      }

      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/auth/login');
        return;
      }

      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      console.log('Projects fetch result:', { projects, error, count: projects?.length });

      if (error) {
        console.error('Error fetching projects:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        // On error, default to true to show dashboard instead of onboarding
        setHasProjects(true);
      } else {
        const hasProjectsValue = projects && projects.length > 0;
        console.log('Projects check final:', { hasProjectsValue, projectCount: projects?.length });
        setHasProjects(hasProjectsValue);
      }
    } catch (error) {
      console.error('Catch block - Error checking projects:', error);
      // On error, default to true to show dashboard
      setHasProjects(true);
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
  return <Content />;
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

  return (
    <div className="px-6 pb-6">
      {/* Header - Following settings page style */}
      <div className="flex items-center justify-between mb-6 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back! Here's what's happening with your content.
          </p>
        </div>
      </div>

      {/* Integration Alert */}
      <IntegrationAlert className="mb-6" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-4">
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
            </div>
          );
        })}
      </div>

      {/* Quick Actions - Following settings page card style */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/dashboard/generate">
            <button className="w-full px-4 py-2.5 bg-[#00AA45] text-white rounded-lg hover:bg-[#008837] transition-all flex items-center justify-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4" />
              Generate New Article
            </button>
          </Link>
          <Link href="/dashboard/projects">
            <button className="w-full px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm font-medium">
              Create New Project
            </button>
          </Link>
          <Link href="/dashboard/integrations">
            <button className="w-full px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm font-medium">
              Connect Platform
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
