'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Settings, Sparkles, Target, Calendar, Zap, ChevronRight, Save, RotateCcw, Image, Link2 } from 'lucide-react'
import SitemapSettings from '@/components/settings/SitemapSettings'

export default function ArticlesSettingsPage() {
  const [activeTab, setActiveTab] = useState('content')

  const [settings, setSettings] = useState({
    // Content & AI Settings
    brandVoice: 'professional',
    toneAttributes: ['informative', 'engaging'],
    writingPerspective: 'first_person',
    complexityLevel: 'intermediate',
    minWordCount: 1500,
    maxWordCount: 2500,
    temperature: 0.7,
    customInstructions: '',

    // SEO Settings
    keywordDensityMin: 1.5,
    keywordDensityMax: 2.5,
    autoGenerateMeta: true,
    autoInternalLinks: true,
    minInternalLinks: 3,
    maxInternalLinks: 7,
    enableSchemaMarkup: true,

    // Structure Settings
    includeSections: ['introduction', 'key_takeaways', 'main_content', 'faq', 'conclusion'],
    headingStructure: 'hierarchical',
    includeElements: ['bullets', 'lists', 'blockquotes'],

    // Automation Settings
    autoGenerate: false,
    articlesPerWeek: 3,
    preferredDays: [1, 3, 5], // Mon, Wed, Fri
    publishTime: '09:00',
    autoPublish: false,
    generateAheadDays: 14,

    // Content Mix
    contentMix: {
      how_to: 30,
      listicle: 25,
      tutorial: 20,
      comparison: 15,
      case_study: 10
    },

    difficultyDistribution: {
      easy: 40,
      medium: 40,
      hard: 20
    },

    // Quality Control
    enableGrammarCheck: true,
    enablePlagiarismCheck: true,
    targetReadabilityScore: 60,
    autoFixIssues: false,

    // Featured Images
    featuredImageStyle: 'gradient_modern',
    featuredImagePrimaryColor: '#00AA45',
    featuredImageSecondaryColor: '#008837',
    featuredImageFontStyle: 'bold',
    featuredImageTextPosition: 'center',
    featuredImageDimensions: '1200x630',
    featuredImageIncludeLogo: false,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isLoading, setIsLoading] = useState(true)
  const [projectId, setProjectId] = useState<string | null>(null)

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get user's project
        const { data: projects } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        if (!projects || projects.length === 0) return

        const projectId = projects[0].id
        setProjectId(projectId)

        // Fetch saved settings
        const response = await fetch(`/api/article-settings?projectId=${projectId}`)
        if (!response.ok) return

        const data = await response.json()

        if (data.settings) {
          // Map database fields to state
          const dbSettings = data.settings
          setSettings({
            brandVoice: dbSettings.brand_voice || 'professional',
            toneAttributes: dbSettings.tone_attributes || ['informative', 'engaging'],
            writingPerspective: dbSettings.writing_perspective || 'first_person',
            complexityLevel: dbSettings.complexity_level || 'intermediate',
            minWordCount: dbSettings.min_word_count || 1500,
            maxWordCount: dbSettings.max_word_count || 2500,
            temperature: dbSettings.temperature || 0.7,
            customInstructions: dbSettings.custom_instructions || '',
            keywordDensityMin: dbSettings.keyword_density_min || 1.5,
            keywordDensityMax: dbSettings.keyword_density_max || 2.5,
            autoGenerateMeta: dbSettings.auto_generate_meta ?? true,
            autoInternalLinks: dbSettings.auto_internal_links ?? true,
            minInternalLinks: dbSettings.min_internal_links || 3,
            maxInternalLinks: dbSettings.max_internal_links || 7,
            enableSchemaMarkup: dbSettings.enable_schema_markup ?? true,
            includeSections: dbSettings.include_sections || ['introduction', 'key_takeaways', 'main_content', 'faq', 'conclusion'],
            headingStructure: dbSettings.heading_structure || 'hierarchical',
            includeElements: dbSettings.include_elements || ['bullets', 'lists', 'blockquotes'],
            autoGenerate: dbSettings.auto_generate ?? false,
            articlesPerWeek: dbSettings.articles_per_week || 3,
            preferredDays: dbSettings.preferred_days || [1, 3, 5],
            publishTime: dbSettings.publish_time ? dbSettings.publish_time.substring(0, 5) : '09:00',
            autoPublish: dbSettings.auto_publish ?? false,
            generateAheadDays: dbSettings.generate_ahead_days || 14,
            contentMix: dbSettings.content_mix || {
              how_to: 30,
              listicle: 25,
              tutorial: 20,
              comparison: 15,
              case_study: 10
            },
            difficultyDistribution: dbSettings.difficulty_distribution || {
              easy: 40,
              medium: 40,
              hard: 20
            },
            enableGrammarCheck: dbSettings.enable_grammar_check ?? true,
            enablePlagiarismCheck: dbSettings.enable_plagiarism_check ?? true,
            targetReadabilityScore: dbSettings.target_readability_score || 60,
            autoFixIssues: dbSettings.auto_fix_issues ?? false,
            featuredImageStyle: dbSettings.featured_image_style || 'gradient_modern',
            featuredImagePrimaryColor: dbSettings.featured_image_primary_color || '#00AA45',
            featuredImageSecondaryColor: dbSettings.featured_image_secondary_color || '#008837',
            featuredImageFontStyle: dbSettings.featured_image_font_style || 'bold',
            featuredImageTextPosition: dbSettings.featured_image_text_position || 'center',
            featuredImageDimensions: dbSettings.featured_image_dimensions || '1200x630',
            featuredImageIncludeLogo: dbSettings.featured_image_include_logo ?? false,
          })
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const tabs = [
    { id: 'content', label: 'Content & AI', icon: Sparkles },
    { id: 'seo', label: 'SEO & Optimization', icon: Target },
    { id: 'sitemap', label: 'Sitemap & Links', icon: Link2 },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'structure', label: 'Structure', icon: Settings },
    { id: 'featured_images', label: 'Featured Images', icon: Image },
  ]

  const brandVoices = [
    { value: 'professional', label: 'Professional', desc: 'Formal and authoritative tone' },
    { value: 'casual', label: 'Casual', desc: 'Friendly and conversational' },
    { value: 'technical', label: 'Technical', desc: 'Detailed and precise' },
    { value: 'conversational', label: 'Conversational', desc: 'Personal and engaging' },
  ]

  const toneOptions = [
    { value: 'informative', label: 'Informative' },
    { value: 'engaging', label: 'Engaging' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'inspiring', label: 'Inspiring' },
  ]

  const toggleTone = (tone: string) => {
    setSettings(prev => ({
      ...prev,
      toneAttributes: prev.toneAttributes.includes(tone)
        ? prev.toneAttributes.filter(t => t !== tone)
        : [...prev.toneAttributes, tone]
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Get user's project
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (!projects || projects.length === 0) {
        throw new Error('No project found')
      }

      const projectId = projects[0].id

      // Save settings (we'll create the API route next)
      const response = await fetch('/api/article-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, settings })
      })

      if (!response.ok) throw new Error('Failed to save settings')

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefaults = () => {
    if (confirm('Reset all settings to defaults?')) {
      window.location.reload()
    }
  }

  if (isLoading) {
    return (
      <div className="px-6 pb-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AA45] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Article Preferences</h1>
          <p className="text-sm text-gray-500">
            Configure how AI generates your content - quality, style, SEO, and automation settings
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
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 text-sm bg-[#00AA45] text-white rounded-lg hover:bg-[#008837] transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
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
          const Icon = tab.icon
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
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Content & AI Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Brand Voice */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00AA45]" />
                Brand Voice & Tone
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {brandVoices.map((voice) => (
                  <button
                    key={voice.value}
                    onClick={() => setSettings({ ...settings, brandVoice: voice.value })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      settings.brandVoice === voice.value
                        ? 'border-[#00AA45] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">{voice.label}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{voice.desc}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone Attributes (Select multiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {toneOptions.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => toggleTone(tone.value)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        settings.toneAttributes.includes(tone.value)
                          ? 'bg-[#00AA45] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tone.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Writing Style */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Writing Style</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Writing Perspective
                  </label>
                  <select
                    value={settings.writingPerspective}
                    onChange={(e) => setSettings({ ...settings, writingPerspective: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value="first_person">First Person (We/I)</option>
                    <option value="second_person">Second Person (You)</option>
                    <option value="third_person">Third Person (They/It)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Word Count Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        value={settings.minWordCount}
                        onChange={(e) => setSettings({ ...settings, minWordCount: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        placeholder="Min"
                      />
                      <span className="text-xs text-gray-500 mt-1 block">Minimum words</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={settings.maxWordCount}
                        onChange={(e) => setSettings({ ...settings, maxWordCount: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        placeholder="Max"
                      />
                      <span className="text-xs text-gray-500 mt-1 block">Maximum words</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Instructions (Optional)
                  </label>
                  <textarea
                    value={settings.customInstructions}
                    onChange={(e) => setSettings({ ...settings, customInstructions: e.target.value })}
                    rows={4}
                    placeholder="e.g., Always include practical examples, Cite sources when making claims, Use active voice..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    These instructions will be applied to every article generated
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sitemap & Links Tab */}
        {activeTab === 'sitemap' && projectId && (
          <div className="space-y-4">
            <SitemapSettings projectId={projectId} />
          </div>
        )}

        {/* SEO & Optimization Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#00AA45]" />
                SEO Optimization
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Auto-generate Meta Description</div>
                    <div className="text-xs text-gray-600 mt-0.5">AI creates SEO-optimized meta descriptions</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoGenerateMeta}
                      onChange={(e) => setSettings({ ...settings, autoGenerateMeta: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00AA45] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00AA45]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Automatic Internal Links</div>
                    <div className="text-xs text-gray-600 mt-0.5">AI suggests links to related articles</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoInternalLinks}
                      onChange={(e) => setSettings({ ...settings, autoInternalLinks: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00AA45] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00AA45]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Enable Schema Markup</div>
                    <div className="text-xs text-gray-600 mt-0.5">Add structured data for better SEO</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableSchemaMarkup}
                      onChange={(e) => setSettings({ ...settings, enableSchemaMarkup: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00AA45] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00AA45]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00AA45]" />
                Automated Content Generation
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Enable Auto-Generation</div>
                    <div className="text-xs text-gray-600 mt-0.5">Automatically generate and schedule articles</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoGenerate}
                      onChange={(e) => setSettings({ ...settings, autoGenerate: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00AA45] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00AA45]"></div>
                  </label>
                </div>

                {settings.autoGenerate && (
                  <div className="space-y-4 pl-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Articles Per Week: {settings.articlesPerWeek}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="7"
                        value={settings.articlesPerWeek}
                        onChange={(e) => setSettings({ ...settings, articlesPerWeek: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00AA45]"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1/week</span>
                        <span>7/week</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Publishing Days
                      </label>
                      <div className="flex gap-1.5">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <button
                            key={day}
                            onClick={() => {
                              const days = settings.preferredDays.includes(index)
                                ? settings.preferredDays.filter(d => d !== index)
                                : [...settings.preferredDays, index]
                              setSettings({ ...settings, preferredDays: days.sort() })
                            }}
                            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                              settings.preferredDays.includes(index)
                                ? 'bg-[#00AA45] text-white'
                                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Publish Time
                        </label>
                        <input
                          type="time"
                          value={settings.publishTime}
                          onChange={(e) => setSettings({ ...settings, publishTime: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Generate Ahead
                        </label>
                        <input
                          type="number"
                          value={settings.generateAheadDays}
                          onChange={(e) => setSettings({ ...settings, generateAheadDays: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                        <span className="text-xs text-gray-500 mt-1 block">Days in advance</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Auto-Publish to CMS</div>
                        <div className="text-xs text-gray-600 mt-0.5">Automatically publish to WordPress</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoPublish}
                          onChange={(e) => setSettings({ ...settings, autoPublish: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00AA45] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00AA45]"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Mix Strategy */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Content Type Distribution</h3>
              <p className="text-xs text-gray-600 mb-3">Set the percentage of each content type in your calendar</p>

              <div className="space-y-3">
                {Object.entries(settings.contentMix).map(([type, value]) => (
                  <div key={type}>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {type.replace('_', '-')}: {value}%
                      </label>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={value}
                      onChange={(e) => setSettings({
                        ...settings,
                        contentMix: { ...settings.contentMix, [type]: parseInt(e.target.value) }
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00AA45]"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                Total: {Object.values(settings.contentMix).reduce((a, b) => a + b, 0)}%
                {Object.values(settings.contentMix).reduce((a, b) => a + b, 0) !== 100 && ' (Should equal 100%)'}
              </div>
            </div>

            {/* Difficulty Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Keyword Difficulty Balance</h3>

              <div className="space-y-3">
                {Object.entries(settings.difficultyDistribution).map(([level, value]) => (
                  <div key={level}>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-sm font-medium text-gray-700 capitalize flex items-center gap-2">
                        {level === 'easy' && <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>}
                        {level === 'medium' && <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>}
                        {level === 'hard' && <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
                        {level} (0-{level === 'easy' ? '30' : level === 'medium' ? '60' : '100'}): {value}%
                      </label>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={value}
                      onChange={(e) => setSettings({
                        ...settings,
                        difficultyDistribution: { ...settings.difficultyDistribution, [level]: parseInt(e.target.value) }
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00AA45]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Structure Tab */}
        {activeTab === 'structure' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#00AA45]" />
                Article Structure
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Sections (in order)
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'introduction', label: 'Introduction' },
                      { value: 'key_takeaways', label: 'Key Takeaways Box' },
                      { value: 'main_content', label: 'Main Content' },
                      { value: 'faq', label: 'FAQ Section' },
                      { value: 'conclusion', label: 'Conclusion with CTA' },
                    ].map((section) => (
                      <label key={section.value} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border border-gray-200">
                        <input
                          type="checkbox"
                          checked={settings.includeSections.includes(section.value)}
                          onChange={(e) => {
                            const sections = e.target.checked
                              ? [...settings.includeSections, section.value]
                              : settings.includeSections.filter(s => s !== section.value)
                            setSettings({ ...settings, includeSections: sections })
                          }}
                          className="w-4 h-4 text-[#00AA45] rounded accent-[#00AA45]"
                        />
                        <span className="text-sm font-medium text-gray-900">{section.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heading Structure
                  </label>
                  <select
                    value={settings.headingStructure}
                    onChange={(e) => setSettings({ ...settings, headingStructure: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value="hierarchical">Hierarchical (H2 → H3 → H4)</option>
                    <option value="flat">Flat (H2 only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include Elements
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'bullets', label: 'Bullet Points' },
                      { value: 'lists', label: 'Numbered Lists' },
                      { value: 'blockquotes', label: 'Blockquotes' },
                      { value: 'code', label: 'Code Snippets' },
                      { value: 'tables', label: 'Tables' },
                      { value: 'internal_links', label: 'Internal Links' },
                    ].map((element) => (
                      <label key={element.value} className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer border border-gray-200">
                        <input
                          type="checkbox"
                          checked={settings.includeElements.includes(element.value)}
                          onChange={(e) => {
                            const elements = e.target.checked
                              ? [...settings.includeElements, element.value]
                              : settings.includeElements.filter(el => el !== element.value)
                            setSettings({ ...settings, includeElements: elements })
                          }}
                          className="w-4 h-4 text-[#00AA45] rounded accent-[#00AA45]"
                        />
                        <span className="text-xs text-gray-900">{element.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rich Media & Visual Elements
                  </label>
                  <p className="text-xs text-gray-600 mb-2">Automatically include relevant media to enhance article engagement</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'youtube_videos', label: 'YouTube Videos', desc: 'Auto-embed relevant videos' },
                      { value: 'stats_boxes', label: 'Statistics Boxes', desc: 'Highlighted key numbers' },
                      { value: 'expert_quotes', label: 'Expert Quotes', desc: 'Relevant testimonials' },
                    ].map((element) => (
                      <label key={element.value} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer border border-gray-200">
                        <input
                          type="checkbox"
                          checked={settings.includeElements.includes(element.value)}
                          onChange={(e) => {
                            const elements = e.target.checked
                              ? [...settings.includeElements, element.value]
                              : settings.includeElements.filter(el => el !== element.value)
                            setSettings({ ...settings, includeElements: elements })
                          }}
                          className="w-4 h-4 text-[#00AA45] rounded accent-[#00AA45] mt-0.5"
                        />
                        <div>
                          <div className="text-xs font-medium text-gray-900">{element.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{element.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Featured Images Tab - Split Screen Layout */}
        {activeTab === 'featured_images' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Settings (Scrollable) */}
            <div className="space-y-4 lg:max-h-[calc(100vh-280px)] lg:overflow-y-auto lg:pr-4">
              {/* Brand Color */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Brand Color</h3>
                <p className="text-xs text-gray-600 mb-4">
                  Choose your brand color - text color will automatically adjust for best contrast
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.featuredImagePrimaryColor || '#00AA45'}
                      onChange={(e) => setSettings({ ...settings, featuredImagePrimaryColor: e.target.value })}
                      className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.featuredImagePrimaryColor || ''}
                      onChange={(e) => setSettings({ ...settings, featuredImagePrimaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent"
                      placeholder="#00AA45"
                    />
                  </div>
                </div>
              </div>

              {/* Image Style Selection */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Image Style</h3>
                <p className="text-xs text-gray-600 mb-4">
                  Choose the visual style for your automatically generated featured images
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'gradient_modern', label: 'Gradient Modern', desc: 'Smooth gradient backgrounds with clean typography' },
                  ].map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setSettings({ ...settings, featuredImageStyle: style.value })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        settings.featuredImageStyle === style.value
                          ? 'border-[#00AA45] bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">{style.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography & Layout */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Typography & Layout</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Style
                    </label>
                    <select
                      value={settings.featuredImageFontStyle}
                      onChange={(e) => setSettings({ ...settings, featuredImageFontStyle: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent appearance-none bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="bold">Bold & Impactful</option>
                      <option value="modern">Modern & Clean</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Position
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'left', label: 'Left' },
                        { value: 'center', label: 'Center' },
                        { value: 'right', label: 'Right' },
                      ].map((position) => (
                        <button
                          key={position.value}
                          onClick={() => setSettings({ ...settings, featuredImageTextPosition: position.value })}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            settings.featuredImageTextPosition === position.value
                              ? 'bg-[#00AA45] text-white'
                              : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {position.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Side - Live Preview (Sticky) */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Live Preview</h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Real-time
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  See changes instantly as you customize
                </p>

                <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center">
                  <div
                    className="relative w-full rounded-lg overflow-hidden shadow-lg"
                    style={{
                      aspectRatio: '1.91/1',
                      background: settings.featuredImageStyle === 'gradient_modern'
                        ? `linear-gradient(135deg, ${settings.featuredImagePrimaryColor}, ${settings.featuredImagePrimaryColor}dd, ${settings.featuredImagePrimaryColor}bb)`
                        : `linear-gradient(135deg, ${settings.featuredImagePrimaryColor}15, ${settings.featuredImagePrimaryColor}25)`,
                    }}
                  >
                    {/* Text Content */}
                    <div className={`absolute inset-0 flex items-center ${
                      settings.featuredImageTextPosition === 'center' ? 'justify-center text-center' :
                      settings.featuredImageTextPosition === 'left' ? 'justify-start text-left pl-12' :
                      'justify-end text-right pr-12'
                    }`}>
                      <h2
                        className="font-bold px-8 text-white"
                        style={{
                          fontSize: settings.featuredImageFontStyle === 'bold' ? '2.5rem' : '2.25rem',
                          textShadow: '0 3px 8px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)',
                          maxWidth: '80%',
                          letterSpacing: settings.featuredImageFontStyle === 'modern' ? '-0.02em' : 'normal',
                        }}
                      >
                        How to Boost Your SEO Rankings in 2025
                      </h2>
                    </div>

                    {settings.featuredImageIncludeLogo && (
                      <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1.5 rounded-lg">
                        <span className="text-sm font-semibold" style={{ color: settings.featuredImagePrimaryColor }}>
                          RankPulse
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings Summary */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Style:</span>
                    <span className="font-medium text-gray-900 capitalize">{settings.featuredImageStyle.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="font-medium text-gray-900">{settings.featuredImageDimensions}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Font Style:</span>
                    <span className="font-medium text-gray-900 capitalize">{settings.featuredImageFontStyle}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Text Position:</span>
                    <span className="font-medium text-gray-900 capitalize">{settings.featuredImageTextPosition}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  💡 Featured images will be automatically generated when you create new articles
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Save Button */}
      <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-1.5 text-sm bg-[#00AA45] text-white rounded-lg hover:bg-[#008837] transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Changes...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
