'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { COUNTRIES, LANGUAGES } from '@/lib/constants';
import {
  Building2,
  Users,
  Globe,
  Sparkles,
  X,
  Save,
  RotateCcw,
  Info
} from 'lucide-react';

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
  const [generatingCompetitors, setGeneratingCompetitors] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

      if (data.target_audiences || data.competitors) {
        setAudienceData({
          targetAudiences: Array.isArray(data.target_audiences) ? data.target_audiences : [],
          newAudience: '',
          competitors: Array.isArray(data.competitors) ? data.competitors : [],
          newCompetitor: '',
        });
      }
    }
  };

  const handleSave = async () => {
    if (!project) return;

    setLoading(true);
    setSaveStatus('idle');

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

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAudience = async () => {
    if (!project) return;

    setLoading(true);
    setSaveStatus('idle');

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          target_audiences: audienceData.targetAudiences,
          competitors: audienceData.competitors,
        })
        .eq('id', project.id);

      if (error) throw error;

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
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
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setGeneratingAudience(true);
    setSaveStatus('idle');

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
        const newAudiences = [...audienceData.targetAudiences];
        data.audiences.forEach((audience: string) => {
          if (!newAudiences.includes(audience)) {
            newAudiences.push(audience);
          }
        });
        setAudienceData({ ...audienceData, targetAudiences: newAudiences });
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
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

  const handleGenerateCompetitors = async () => {
    if (!formData.websiteUrl || !formData.description) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setGeneratingCompetitors(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/generate-competitors', {
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
        const newCompetitors = [...audienceData.competitors];
        data.competitors.forEach((competitor: string) => {
          if (!newCompetitors.includes(competitor)) {
            newCompetitors.push(competitor);
          }
        });
        setAudienceData({ ...audienceData, competitors: newCompetitors });
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setGeneratingCompetitors(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.websiteUrl) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setGeneratingDescription(true);
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
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setGeneratingDescription(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Reset all settings to defaults?')) {
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building2 },
    { id: 'audience', label: 'Audience & Competitors', icon: Users },
  ];

  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">General Settings</h1>
          <p className="text-sm text-gray-500">
            Configure your business information and target audience for AI-powered content generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaults}
            className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 border border-gray-200"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={activeTab === 'business' ? handleSave : handleSaveAudience}
            disabled={loading}
            className="px-4 py-1.5 text-sm bg-[#00AA45] text-white rounded-lg hover:bg-[#008837] transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ Settings saved successfully!
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ✗ Failed to save settings. Please try again.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#00AA45] border-b-2 border-[#00AA45]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Business Info Tab */}
        {activeTab === 'business' && (
          <div className="space-y-4">
            {/* Business Details Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00AA45]" />
                Business Details
              </h3>

              <div className="space-y-4">
                {/* Website URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent"
                  />
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your business name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent"
                  />
                </div>

                {/* Language and Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      Language
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent appearance-none bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem',
                      }}
                    >
                      {LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      Country
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent appearance-none bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem',
                      }}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Description Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Business Description
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  loading={generatingDescription}
                  disabled={!formData.websiteUrl || generatingDescription}
                  className="text-xs"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  AI Generate
                </Button>
              </div>

              <textarea
                placeholder="Describe your business, target audience, and what makes you unique..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                This helps AI understand your business and create more relevant content
              </p>
            </div>
          </div>
        )}

        {/* Audience & Competitors Tab */}
        {activeTab === 'audience' && (
          <div className="space-y-4">
            {/* Target Audiences Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#00AA45]" />
                    Target Audiences
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Define who your content is for. The more specific, the better AI can tailor content.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAudiences}
                  loading={generatingAudience}
                  disabled={generatingAudience}
                  className="text-xs"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  AI Generate
                </Button>
              </div>

              <div className="space-y-4">
                {/* Add Audience Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., SaaS founders looking to improve SEO"
                    value={audienceData.newAudience}
                    onChange={(e) => setAudienceData({ ...audienceData, newAudience: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAudience();
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddAudience}
                    disabled={!audienceData.newAudience.trim()}
                    className="px-4 py-2 bg-[#00AA45] text-white rounded-lg text-sm font-medium hover:bg-[#008837] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>

                {/* Audiences List */}
                {audienceData.targetAudiences.length > 0 && (
                  <div className="space-y-2">
                    {audienceData.targetAudiences.map((audience, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <span className="text-sm text-gray-700 flex-1">{audience}</span>
                        <button
                          onClick={() => handleRemoveAudience(index)}
                          className="ml-3 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {audienceData.targetAudiences.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No target audiences added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Competitors Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#00AA45]" />
                    Competitors
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Track what your competitors are ranking for to find content opportunities.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCompetitors}
                  loading={generatingCompetitors}
                  disabled={generatingCompetitors}
                  className="text-xs"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  AI Generate
                </Button>
              </div>

              <div className="space-y-4">
                {/* Add Competitor Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., semrush.com, ahrefs.com"
                    value={audienceData.newCompetitor}
                    onChange={(e) => setAudienceData({ ...audienceData, newCompetitor: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCompetitor();
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddCompetitor}
                    disabled={!audienceData.newCompetitor.trim()}
                    className="px-4 py-2 bg-[#00AA45] text-white rounded-lg text-sm font-medium hover:bg-[#008837] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>

                {/* Competitors List */}
                {audienceData.competitors.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {audienceData.competitors.map((competitor, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {competitor.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-700 truncate">{competitor}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveCompetitor(index)}
                          className="ml-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {audienceData.competitors.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Globe className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No competitors added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Save Button */}
      <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
        <button
          onClick={activeTab === 'business' ? handleSave : handleSaveAudience}
          disabled={loading}
          className="px-4 py-1.5 text-sm bg-[#00AA45] text-white rounded-lg hover:bg-[#008837] transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving Changes...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
