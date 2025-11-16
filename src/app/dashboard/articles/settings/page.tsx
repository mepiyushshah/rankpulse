'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Settings, Sparkles, Zap, Save, RotateCcw, Info, Eye, Lock, Unlock, CheckCircle2, Loader2, Image } from 'lucide-react'
import SitemapSettings from '@/components/settings/SitemapSettings'
import confetti from 'canvas-confetti'

export default function ArticlesSettingsPage() {
  const [activeTab, setActiveTab] = useState('automation')

  const [settings, setSettings] = useState({
    // Content & AI Settings (AI-configured)
    brandVoice: 'professional',
    toneAttributes: ['informative', 'engaging'],
    writingPerspective: 'first_person',
    complexityLevel: 'intermediate',
    minWordCount: 1500,
    maxWordCount: 2500,
    temperature: 0.7,
    customInstructions: '',

    // SEO Settings (always optimal)
    keywordDensityMin: 1.5,
    keywordDensityMax: 2.5,
    autoGenerateMeta: true,
    autoInternalLinks: true,
    minInternalLinks: 3,
    maxInternalLinks: 7,
    enableSchemaMarkup: true,

    // Structure Settings (AI-configured)
    includeSections: ['introduction', 'key_takeaways', 'main_content', 'faq', 'conclusion'],
    headingStructure: 'hierarchical',
    includeElements: ['bullets', 'lists', 'blockquotes'],

    // Automation Settings (USER CONTROLS THESE)
    autoGenerate: false,
    articlesPerWeek: 3,
    preferredDays: [1, 3, 5],
    publishTime: '09:00',
    autoPublish: false,
    generateAheadDays: 14,

    // Content Mix (AI-configured)
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

    // Quality Control (always on)
    enableGrammarCheck: true,
    enablePlagiarismCheck: true,
    targetReadabilityScore: 60,
    autoFixIssues: false,

    // Featured Images (AI-configured)
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
  const [isAutoConfiguring, setIsAutoConfiguring] = useState(false)
  const [autoConfigStatus, setAutoConfigStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [aiReasoning, setAiReasoning] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(true)
  const [advancedUnlocked, setAdvancedUnlocked] = useState(false)

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

        // Check if auto-configure was requested via URL parameter
        const urlParams = new URLSearchParams(window.location.search)
        const shouldAutoConfig = urlParams.get('autoConfig') === 'true'

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

        // If auto-configure was requested, trigger it after loading
        if (shouldAutoConfig) {
          // Switch to AI config tab
          setActiveTab('ai_config')
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname)
          // Auto-trigger configuration after a brief delay
          setTimeout(() => {
            handleAutoConfiguration()
          }, 500)
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
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'ai_config', label: 'AI Configuration', icon: Sparkles },
    { id: 'featured_images', label: 'Featured Images', icon: Image },
  ]

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

      // Save settings
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

  const handleAutoConfiguration = async () => {
    if (!projectId) return

    setIsAutoConfiguring(true)
    setAutoConfigStatus('idle')
    setAiReasoning('')

    try {
      const response = await fetch('/api/auto-configure-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      })

      if (!response.ok) throw new Error('Failed to auto-configure')

      const data = await response.json()

      // Update settings with AI recommendations
      setSettings(prev => ({
        ...prev,
        ...data.settings
      }))

      setAiReasoning(data.reasoning || 'Settings configured based on your business analysis')
      setAutoConfigStatus('success')

      // Fire confetti! 🎉
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      setTimeout(() => setAutoConfigStatus('idle'), 5000)
    } catch (error) {
      console.error('Error auto-configuring:', error)
      setAutoConfigStatus('error')
      setTimeout(() => setAutoConfigStatus('idle'), 3000)
    } finally {
      setIsAutoConfiguring(false)
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
            AI automatically optimizes content settings - you control when and how articles are published
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
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Settings saved successfully!
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Failed to save settings. Please try again.
        </div>
      )}

      {/* Auto-config Error Status only */}
      {autoConfigStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Failed to auto-configure settings. Please try again.
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
                    <div className="text-xs text-gray-600 mt-0.5">Automatically generate and schedule articles based on your content calendar</div>
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
                  <div className="space-y-4 pl-3 border-l-2 border-green-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publish Time
                      </label>
                      <input
                        type="time"
                        value={settings.publishTime}
                        onChange={(e) => setSettings({ ...settings, publishTime: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Articles will be published daily at this time for scheduled dates
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Auto-Publish to WordPress</div>
                        <div className="text-xs text-gray-600 mt-0.5">Automatically publish generated articles to your WordPress site</div>
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

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">How Auto-Generation Works</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Articles are generated based on your content calendar schedule</li>
                    <li>• AI uses your business details and audience data to create relevant content</li>
                    <li>• All content follows SEO best practices automatically</li>
                    <li>• You can review and edit articles before they publish</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Configuration Tab */}
        {activeTab === 'ai_config' && (
          <div className="space-y-6">
            {/* How It Works - Trust Building Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#00AA45] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">How AI Configuration Works</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#00AA45] transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-[#00AA45]">1</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">Deep Business Analysis</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Examines your business description, target audience demographics, and competitor strategies to understand your market position
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#00AA45] transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-[#00AA45]">2</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">Smart Optimization</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Determines optimal brand voice, writing style, content types, and keyword difficulty balance based on your industry and goals
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#00AA45] transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                      <span className="text-base font-bold text-[#00AA45]">3</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">SEO Best Practices</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Applies proven SEO strategies including optimal article length, keyword density, and content structure for maximum rankings
                  </p>
                </div>
              </div>

              <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-800">
                    <span className="font-semibold">100% Transparent:</span> All AI decisions are explained and can be manually overridden if needed. You're always in control.
                  </p>
                </div>
              </div>
            </div>

            {/* Current AI Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Your Current AI Configuration</h3>
                  <p className="text-xs text-gray-500">These settings are optimized for your business</p>
                </div>
                <button
                  onClick={handleAutoConfiguration}
                  disabled={isAutoConfiguring || !projectId}
                  className="px-4 py-2 bg-[#00AA45] text-white rounded-lg hover:bg-[#008837] transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                >
                  {isAutoConfiguring ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Re-Configure
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand Voice */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <Sparkles className="w-4 h-4 text-[#00AA45]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Brand Voice</div>
                      <div className="text-sm font-semibold text-gray-900 capitalize">{settings.brandVoice}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {settings.brandVoice === 'professional' && 'Formal and authoritative tone for credibility'}
                    {settings.brandVoice === 'casual' && 'Friendly and conversational for relatability'}
                    {settings.brandVoice === 'technical' && 'Detailed and precise for expert audiences'}
                    {settings.brandVoice === 'conversational' && 'Personal and engaging for connection'}
                  </p>
                </div>

                {/* Tone Attributes */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <Settings className="w-4 h-4 text-[#00AA45]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Tone Attributes</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {settings.toneAttributes.map((tone) => (
                          <span key={tone} className="px-2 py-0.5 bg-[#00AA45] text-white text-xs rounded capitalize">
                            {tone}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Balanced approach to engage your target audience</p>
                </div>

                {/* Writing Perspective */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <Eye className="w-4 h-4 text-[#00AA45]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Writing Perspective</div>
                      <div className="text-sm font-semibold text-gray-900 capitalize">{settings.writingPerspective.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {settings.writingPerspective === 'first_person' && 'Uses "we/I" for personal connection'}
                    {settings.writingPerspective === 'second_person' && 'Uses "you" for direct engagement'}
                    {settings.writingPerspective === 'third_person' && 'Uses "they/it" for objectivity'}
                  </p>
                </div>

                {/* Word Count */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <Info className="w-4 h-4 text-[#00AA45]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Article Length</div>
                      <div className="text-sm font-semibold text-gray-900">{settings.minWordCount} - {settings.maxWordCount} words</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Optimized for SEO and reader engagement</p>
                </div>
              </div>
            </div>

            {/* Advanced Customization */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Advanced Customization</h3>
                  <p className="text-xs text-gray-500">Override AI settings with manual controls (optional)</p>
                </div>
                <button
                  onClick={() => setAdvancedUnlocked(!advancedUnlocked)}
                  className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all font-medium ${
                    advancedUnlocked
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {advancedUnlocked ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      Unlocked
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Unlock
                    </>
                  )}
                </button>
              </div>

              {advancedUnlocked && (
                <div className="space-y-4">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Manual changes will override AI recommendations. We recommend using "Re-Configure" to restore optimal settings.</span>
                    </p>
                  </div>

                  {/* Custom Instructions */}
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

                  {/* Word Count Override */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Word Count Range (Override)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          value={settings.minWordCount}
                          onChange={(e) => setSettings({ ...settings, minWordCount: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent"
                          placeholder="Min"
                        />
                        <span className="text-xs text-gray-500 mt-1 block">Minimum words</span>
                      </div>
                      <div>
                        <input
                          type="number"
                          value={settings.maxWordCount}
                          onChange={(e) => setSettings({ ...settings, maxWordCount: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent"
                          placeholder="Max"
                        />
                        <span className="text-xs text-gray-500 mt-1 block">Maximum words</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
