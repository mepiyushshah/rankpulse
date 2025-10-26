import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get settings
    const { data: settings, error: settingsError } = await supabase
      .from('article_settings')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') {
      // PGRST116 = not found, which is ok (we'll use defaults)
      throw settingsError
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching article settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, settings } = body

    if (!projectId || !settings) {
      return NextResponse.json(
        { error: 'Project ID and settings required' },
        { status: 400 }
      )
    }

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('article_settings')
      .select('id')
      .eq('project_id', projectId)
      .single()

    let result

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('article_settings')
        .update({
          brand_voice: settings.brandVoice,
          tone_attributes: settings.toneAttributes,
          writing_perspective: settings.writingPerspective,
          complexity_level: settings.complexityLevel,
          min_word_count: settings.minWordCount,
          max_word_count: settings.maxWordCount,
          temperature: settings.temperature,
          custom_instructions: settings.customInstructions,
          keyword_density_min: settings.keywordDensityMin,
          keyword_density_max: settings.keywordDensityMax,
          auto_generate_meta: settings.autoGenerateMeta,
          auto_internal_links: settings.autoInternalLinks,
          min_internal_links: settings.minInternalLinks,
          max_internal_links: settings.maxInternalLinks,
          enable_schema_markup: settings.enableSchemaMarkup,
          include_sections: settings.includeSections,
          heading_structure: settings.headingStructure,
          include_elements: settings.includeElements,
          auto_generate: settings.autoGenerate,
          articles_per_week: settings.articlesPerWeek,
          preferred_days: settings.preferredDays,
          publish_time: settings.publishTime,
          auto_publish: settings.autoPublish,
          generate_ahead_days: settings.generateAheadDays,
          content_mix: settings.contentMix,
          difficulty_distribution: settings.difficultyDistribution,
          enable_grammar_check: settings.enableGrammarCheck,
          enable_plagiarism_check: settings.enablePlagiarismCheck,
          target_readability_score: settings.targetReadabilityScore,
          auto_fix_issues: settings.autoFixIssues,
        })
        .eq('project_id', projectId)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('article_settings')
        .insert({
          project_id: projectId,
          brand_voice: settings.brandVoice,
          tone_attributes: settings.toneAttributes,
          writing_perspective: settings.writingPerspective,
          complexity_level: settings.complexityLevel,
          min_word_count: settings.minWordCount,
          max_word_count: settings.maxWordCount,
          temperature: settings.temperature,
          custom_instructions: settings.customInstructions,
          keyword_density_min: settings.keywordDensityMin,
          keyword_density_max: settings.keywordDensityMax,
          auto_generate_meta: settings.autoGenerateMeta,
          auto_internal_links: settings.autoInternalLinks,
          min_internal_links: settings.minInternalLinks,
          max_internal_links: settings.maxInternalLinks,
          enable_schema_markup: settings.enableSchemaMarkup,
          include_sections: settings.includeSections,
          heading_structure: settings.headingStructure,
          include_elements: settings.includeElements,
          auto_generate: settings.autoGenerate,
          articles_per_week: settings.articlesPerWeek,
          preferred_days: settings.preferredDays,
          publish_time: settings.publishTime,
          auto_publish: settings.autoPublish,
          generate_ahead_days: settings.generateAheadDays,
          content_mix: settings.contentMix,
          difficulty_distribution: settings.difficultyDistribution,
          enable_grammar_check: settings.enableGrammarCheck,
          enable_plagiarism_check: settings.enablePlagiarismCheck,
          target_readability_score: settings.targetReadabilityScore,
          auto_fix_issues: settings.autoFixIssues,
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({ success: true, settings: result })
  } catch (error) {
    console.error('Error saving article settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
