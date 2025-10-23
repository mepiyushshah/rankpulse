'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { COUNTRIES, LANGUAGES } from '@/lib/constants';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    websiteUrl: '',
    country: 'US',
    language: 'en',
    description: '',
  });
  const [audienceData, setAudienceData] = useState({
    targetAudiences: [] as string[],
    newAudience: '',
    competitors: [] as string[],
    newCompetitor: '',
  });
  const [generatingAudience, setGeneratingAudience] = useState(false);
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

      // Load audience data if exists
      if (data.target_audiences || data.competitors) {
        setAudienceData({
          targetAudiences: data.target_audiences ? JSON.parse(data.target_audiences) : [],
          newAudience: '',
          competitors: data.competitors ? JSON.parse(data.competitors) : [],
          newCompetitor: '',
        });
      }
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

  const handleSaveAudience = async () => {
    if (!project) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          target_audiences: JSON.stringify(audienceData.targetAudiences),
          competitors: JSON.stringify(audienceData.competitors),
        })
        .eq('id', project.id);

      if (error) throw error;

      setMessage('Audience settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAudience = () => {
    if (audienceData.newAudience.trim()) {
      setAudienceData({
        ...audienceData,
        targetAudiences: [...audienceData.targetAudiences, audienceData.newAudience.trim()],
        newAudience: '',
      });
    }
  };

  const handleRemoveAudience = (index: number) => {
    setAudienceData({
      ...audienceData,
      targetAudiences: audienceData.targetAudiences.filter((_, i) => i !== index),
    });
  };

  const handleGenerateAudiences = async () => {
    if (!formData.websiteUrl || !formData.description) {
      setMessage('Please fill in your website URL and business description first');
      return;
    }

    setGeneratingAudience(true);
    setMessage('');

    try {
      const response = await fetch('/api/generate-audiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: formData.websiteUrl,
          businessName: formData.name,
          description: formData.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Merge new audiences with existing ones
        const newAudiences = [...audienceData.targetAudiences];
        data.audiences.forEach((audience: string) => {
          if (!newAudiences.includes(audience)) {
            newAudiences.push(audience);
          }
        });
        setAudienceData({ ...audienceData, targetAudiences: newAudiences });
        setMessage('Audiences generated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to generate audiences');
      }
    } catch (error) {
      setMessage('Error generating audiences');
    } finally {
      setGeneratingAudience(false);
    }
  };

  const handleAddCompetitor = () => {
    if (audienceData.newCompetitor.trim()) {
      setAudienceData({
        ...audienceData,
        competitors: [...audienceData.competitors, audienceData.newCompetitor.trim()],
        newCompetitor: '',
      });
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    setAudienceData({
      ...audienceData,
      competitors: audienceData.competitors.filter((_, i) => i !== index),
    });
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
      <div className="p-8 max-w-5xl mx-auto">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('business')}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'business'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Business
              </button>
              <button
                onClick={() => setActiveTab('audience')}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'audience'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Audience and Competitors
              </button>
              <button
                onClick={() => setActiveTab('console')}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'console'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Google Search Console
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error')
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-green-50 text-green-600 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {activeTab === 'business' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            About your business
          </h2>
          <p className="text-gray-600 mb-8">
            Provide your business information to personalize content generation and SEO strategies
          </p>

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
        )}

        {activeTab === 'audience' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Target Audience & Competitors
          </h2>
          <p className="text-gray-600 mb-8">
            Define your target audience and competitors to optimize content strategy
          </p>

          <div className="space-y-6">
            {/* Target Audiences */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Target Audiences <span className="text-gray-400 text-xs ml-1">({audienceData.targetAudiences.length}/7)</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAudiences}
                  loading={generatingAudience}
                  disabled={generatingAudience}
                  className="text-sm"
                >
                  Autocomplete With AI
                </Button>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Define who your content is for. The more specific you are, the better AI can tailor content for them.
              </p>

              <div className="flex gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="e.g., SaaS founders looking to improve SEO, Marketing teams needing content automation"
                  value={audienceData.newAudience}
                  onChange={(e) => setAudienceData({ ...audienceData, newAudience: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAudience();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddAudience}
                  disabled={!audienceData.newAudience.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Add
                </button>
              </div>

              {audienceData.targetAudiences.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {audienceData.targetAudiences.map((audience, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="text-sm text-gray-700 flex-1">{audience}</span>
                      <button
                        onClick={() => handleRemoveAudience(index)}
                        className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Competitors */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Competitors <span className="text-gray-400 text-xs ml-1">({audienceData.competitors.length}/7)</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAudiences}
                  loading={false}
                  disabled={true}
                  className="text-sm opacity-50 cursor-not-allowed"
                >
                  Autocomplete With AI
                </Button>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Track what your competitors are ranking for. We'll analyze their top keywords to find content opportunities.
              </p>

              <div className="flex gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="e.g., semrush.com, ahrefs.com, moz.com"
                  value={audienceData.newCompetitor}
                  onChange={(e) => setAudienceData({ ...audienceData, newCompetitor: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCompetitor();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCompetitor}
                  disabled={!audienceData.newCompetitor.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Add
                </button>
              </div>

              {audienceData.competitors.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {audienceData.competitors.map((competitor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-semibold">
                            {competitor.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700 truncate">{competitor}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveCompetitor(index)}
                        className="ml-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="md"
              loading={loading}
              onClick={handleSaveAudience}
              className="min-w-[100px]"
            >
              Save
            </Button>
          </div>
        </div>
        )}

        {activeTab === 'console' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Google Search Console
          </h2>
          <p className="text-gray-600 mb-8">
            Connect your Google Search Console to track SEO performance
          </p>
          <div className="text-center py-12">
            <p className="text-gray-500">Coming soon...</p>
          </div>
        </div>
        )}
      </div>
  );
}
