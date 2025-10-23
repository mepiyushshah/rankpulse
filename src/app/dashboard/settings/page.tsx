'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { COUNTRIES, LANGUAGES } from '@/lib/constants';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    websiteUrl: '',
    country: 'US',
    language: 'en',
    description: '',
  });
  const [message, setMessage] = useState('');

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
      setFormData({
        name: data.name || '',
        websiteUrl: data.website_url || '',
        country: data.country || 'US',
        language: data.language || 'en',
        description: data.description || '',
      });
    }
  };

  const handleSave = async () => {
    if (!project) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: formData.name,
          website_url: formData.websiteUrl,
          country: formData.country,
          language: formData.language,
          description: formData.description,
        })
        .eq('id', project.id);

      if (error) throw error;

      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.websiteUrl) {
      setMessage('Please enter website URL first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: formData.websiteUrl,
          businessName: formData.name,
          existingDescription: formData.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, description: data.description }));
      } else {
        setMessage('Failed to generate description');
      }
    } catch (error) {
      setMessage('Error generating description');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button className="pb-4 px-1 border-b-2 border-primary font-medium text-primary">
                Business
              </button>
              <button className="pb-4 px-1 text-gray-500 hover:text-gray-700">
                Audience and Competitors
              </button>
              <button className="pb-4 px-1 text-gray-500 hover:text-gray-700">
                Google Search Console
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            About your business
          </h2>
          <p className="text-gray-600 mb-8">
            Provide your business information to personalize content generation and SEO strategies
          </p>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('Error')
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-green-50 text-green-600 border border-green-200'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website to business
              </label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="bg-gray-50"
              />
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business name
              </label>
              <Input
                type="text"
                placeholder="Enter your business name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Language and Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Language
                  <span className="ml-1 text-gray-400 cursor-help" title="Primary language for content">ⓘ</span>
                </label>
                <Select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  options={LANGUAGES.map(l => ({
                    value: l.code,
                    label: l.name
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Country
                  <span className="ml-1 text-gray-400 cursor-help" title="Primary business location">ⓘ</span>
                </label>
                <Select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  options={COUNTRIES.map(c => ({
                    value: c.code,
                    label: c.name
                  }))}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  loading={loading}
                  disabled={!formData.websiteUrl || loading}
                  className="text-sm"
                >
                  Autocomplete With AI
                </Button>
              </div>
              <Textarea
                placeholder="Describe your business, target audience, and what makes you unique..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={8}
                className="resize-none"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="md"
              loading={loading}
              onClick={handleSave}
              className="min-w-[100px]"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
