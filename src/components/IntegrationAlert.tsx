'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, X, Plug, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface IntegrationAlertProps {
  className?: string;
}

export function IntegrationAlert({ className = '' }: IntegrationAlertProps) {
  const [hasIntegrations, setHasIntegrations] = useState<boolean | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIntegrations();
  }, []);

  const checkIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: projectsData } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!projectsData) {
        setHasIntegrations(false);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/integrations?project_id=${projectsData.id}`);
      const data = await response.json();

      if (response.ok) {
        const integrationCount = data.integrations?.length || 0;
        setHasIntegrations(integrationCount > 0);
      } else {
        setHasIntegrations(false);
      }
    } catch (error) {
      console.error('Error checking integrations:', error);
      setHasIntegrations(false);
    } finally {
      setLoading(false);
    }
  };

  // Don't show anything while loading
  if (loading) return null;

  // Don't show if user has integrations
  if (hasIntegrations) return null;

  // Don't show if dismissed
  if (isDismissed) return null;

  return (
    <div className={`relative bg-red-50 border-2 border-red-500 rounded-lg ${className}`}>
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3 p-4 pr-10">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <Plug className="w-4 h-4 text-red-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 font-medium mb-0.5">
            Connect your CMS to auto-publish articles
          </p>
          <p className="text-xs text-gray-600">
            Without an integration, articles will only be saved as drafts.
          </p>
        </div>

        <Link
          href="/dashboard/integrations"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          Connect
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
