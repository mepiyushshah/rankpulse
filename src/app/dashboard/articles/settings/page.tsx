'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Settings, Sparkles, Target, Calendar, Zap, ChevronRight, Save, RotateCcw } from 'lucide-react'

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
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const tabs = [
    { id: 'content', label: 'Content & AI', icon: Sparkles, color: 'text-purple-600' },
    { id: 'seo', label: 'SEO & Optimization', icon: Target, color: 'text-blue-600' },
    { id: 'automation', label: 'Automation', icon: Zap, color: 'text-green-600' },
    { id: 'structure', label: 'Structure', icon: Settings, color: 'text-orange-600' },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00AA45] to-green-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                Article Preferences
              </h1>
              <p className="mt-2 text-gray-600">
                Configure how AI generates your content - quality, style, SEO, and automation settings
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-[#00AA45] to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

          {/* Save Status */}
          {saveStatus === 'success' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              ✓ Settings saved successfully!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ✗ Failed to save settings. Please try again.
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? `${tab.color} border-b-2 border-current`
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
        <div className="space-y-6">
          {/* Content & AI Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Brand Voice */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Brand Voice & Tone
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {brandVoices.map((voice) => (
                    <button
                      key={voice.value}
                      onClick={() => setSettings({ ...settings, brandVoice: voice.value })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        settings.brandVoice === voice.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{voice.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{voice.desc}</div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tone Attributes (Select multiple)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {toneOptions.map((tone) => (
                      <button
                        key={tone.value}
                        onClick={() => toggleTone(tone.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          settings.toneAttributes.includes(tone.value)
                            ? 'bg-purple-600 text-white'
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Writing Style</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Writing Perspective
                    </label>
                    <select
                      value={settings.writingPerspective}
                      onChange={(e) => setSettings({ ...settings, writingPerspective: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="first_person">First Person (We/I)</option>
                      <option value="second_person">Second Person (You)</option>
                      <option value="third_person">Third Person (They/It)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complexity Level
                    </label>
                    <select
                      value={settings.complexityLevel}
                      onChange={(e) => setSettings({ ...settings, complexityLevel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner - Simple language</option>
                      <option value="intermediate">Intermediate - Balanced</option>
                      <option value="expert">Expert - Technical depth</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Word Count Range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        value={settings.minWordCount}
                        onChange={(e) => setSettings({ ...settings, minWordCount: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Min"
                      />
                      <span className="text-xs text-gray-500 mt-1 block">Minimum words</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={settings.maxWordCount}
                        onChange={(e) => setSettings({ ...settings, maxWordCount: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Max"
                      />
                      <span className="text-xs text-gray-500 mt-1 block">Maximum words</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Configuration */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Creativity Level
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Temperature: {settings.temperature}
                      </label>
                      <span className="text-xs text-gray-500">
                        {settings.temperature < 0.4 ? 'Focused' : settings.temperature < 0.7 ? 'Balanced' : 'Creative'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Predictable</span>
                      <span>Creative</span>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      These instructions will be applied to every article generated
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEO & Optimization Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Keyword Optimization
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Keyword Density Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="number"
                          step="0.1"
                          value={settings.keywordDensityMin}
                          onChange={(e) => setSettings({ ...settings, keywordDensityMin: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <span className="text-xs text-gray-500 mt-1 block">Min %</span>
                      </div>
                      <div>
                        <input
                          type="number"
                          step="0.1"
                          value={settings.keywordDensityMax}
                          onChange={(e) => setSettings({ ...settings, keywordDensityMax: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <span className="text-xs text-gray-500 mt-1 block">Max %</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Auto-generate Meta Description</div>
                      <div className="text-sm text-gray-600 mt-1">AI creates SEO-optimized meta descriptions</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoGenerateMeta}
                        onChange={(e) => setSettings({ ...settings, autoGenerateMeta: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Linking</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Automatic Internal Links</div>
                      <div className="text-sm text-gray-600 mt-1">AI suggests links to related articles</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoInternalLinks}
                        onChange={(e) => setSettings({ ...settings, autoInternalLinks: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {settings.autoInternalLinks && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-blue-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Links
                        </label>
                        <input
                          type="number"
                          value={settings.minInternalLinks}
                          onChange={(e) => setSettings({ ...settings, minInternalLinks: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Links
                        </label>
                        <input
                          type="number"
                          value={settings.maxInternalLinks}
                          onChange={(e) => setSettings({ ...settings, maxInternalLinks: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Schema Markup & SEO</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Enable Schema Markup</div>
                      <div className="text-sm text-gray-600 mt-1">Add structured data for better SEO</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableSchemaMarkup}
                        onChange={(e) => setSettings({ ...settings, enableSchemaMarkup: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Automation Tab */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  Automated Content Generation
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Enable Auto-Generation</div>
                      <div className="text-sm text-gray-600 mt-1">Automatically generate and schedule articles</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoGenerate}
                        onChange={(e) => setSettings({ ...settings, autoGenerate: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  {settings.autoGenerate && (
                    <div className="space-y-6 pl-4 border-l-2 border-green-200">
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
                          className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1/week</span>
                          <span>7/week</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Preferred Publishing Days
                        </label>
                        <div className="flex gap-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                            <button
                              key={day}
                              onClick={() => {
                                const days = settings.preferredDays.includes(index)
                                  ? settings.preferredDays.filter(d => d !== index)
                                  : [...settings.preferredDays, index]
                                setSettings({ ...settings, preferredDays: days.sort() })
                              }}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                settings.preferredDays.includes(index)
                                  ? 'bg-green-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Publish Time
                          </label>
                          <input
                            type="time"
                            value={settings.publishTime}
                            onChange={(e) => setSettings({ ...settings, publishTime: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <span className="text-xs text-gray-500 mt-1 block">Days in advance</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Auto-Publish to CMS</div>
                          <div className="text-sm text-gray-600 mt-1">Automatically publish to WordPress/Webflow</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.autoPublish}
                            onChange={(e) => setSettings({ ...settings, autoPublish: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Mix Strategy */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Type Distribution</h3>
                <p className="text-sm text-gray-600 mb-4">Set the percentage of each content type in your calendar</p>

                <div className="space-y-4">
                  {Object.entries(settings.contentMix).map(([type, value]) => (
                    <div key={type}>
                      <div className="flex justify-between mb-2">
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
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  Total: {Object.values(settings.contentMix).reduce((a, b) => a + b, 0)}%
                  {Object.values(settings.contentMix).reduce((a, b) => a + b, 0) !== 100 && ' (Should equal 100%)'}
                </div>
              </div>

              {/* Difficulty Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Difficulty Balance</h3>

                <div className="space-y-4">
                  {Object.entries(settings.difficultyDistribution).map(([level, value]) => (
                    <div key={level}>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 capitalize flex items-center gap-2">
                          {level === 'easy' && <span className="w-3 h-3 bg-green-500 rounded-full"></span>}
                          {level === 'medium' && <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>}
                          {level === 'hard' && <span className="w-3 h-3 bg-red-500 rounded-full"></span>}
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
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Structure Tab */}
          {activeTab === 'structure' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-600" />
                  Article Structure
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
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
                        <label key={section.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.includeSections.includes(section.value)}
                            onChange={(e) => {
                              const sections = e.target.checked
                                ? [...settings.includeSections, section.value]
                                : settings.includeSections.filter(s => s !== section.value)
                              setSettings({ ...settings, includeSections: sections })
                            }}
                            className="w-5 h-5 text-orange-600 rounded"
                          />
                          <span className="font-medium text-gray-900">{section.label}</span>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="hierarchical">Hierarchical (H2 → H3 → H4)</option>
                      <option value="flat">Flat (H2 only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
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
                        <label key={element.value} className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.includeElements.includes(element.value)}
                            onChange={(e) => {
                              const elements = e.target.checked
                                ? [...settings.includeElements, element.value]
                                : settings.includeElements.filter(el => el !== element.value)
                              setSettings({ ...settings, includeElements: elements })
                            }}
                            className="w-4 h-4 text-orange-600 rounded"
                          />
                          <span className="text-sm text-gray-900">{element.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Control */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Assurance</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Grammar Check</div>
                      <div className="text-sm text-gray-600 mt-1">AI checks for grammar and spelling errors</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableGrammarCheck}
                        onChange={(e) => setSettings({ ...settings, enableGrammarCheck: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Plagiarism Detection</div>
                      <div className="text-sm text-gray-600 mt-1">Check content originality before publishing</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enablePlagiarismCheck}
                        onChange={(e) => setSettings({ ...settings, enablePlagiarismCheck: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Readability Score: {settings.targetReadabilityScore}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.targetReadabilityScore}
                      onChange={(e) => setSettings({ ...settings, targetReadabilityScore: parseInt(e.target.value) })}
                      className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Difficult</span>
                      <span>Easy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-gradient-to-r from-[#00AA45] to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 text-lg font-medium"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving Changes...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
