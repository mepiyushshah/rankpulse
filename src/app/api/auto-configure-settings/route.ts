import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      )
    }

    // Verify project belongs to user and get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, target_audiences, competitors')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Use AI to analyze and configure settings
    const prompt = `You are an SEO and content strategy expert. Analyze the following business information and determine the optimal article generation settings.

Business Information:
- Name: ${project.name || 'Not specified'}
- Website: ${project.website_url || 'Not specified'}
- Description: ${project.description || 'Not specified'}
- Target Audiences: ${project.target_audiences?.join(', ') || 'Not specified'}
- Competitors: ${project.competitors?.join(', ') || 'Not specified'}
- Industry/Country: ${project.country || 'US'}

Based on this information, determine the BEST settings for:

1. Brand Voice (choose ONE): professional, casual, technical, conversational
2. Tone Attributes (choose 2-3): informative, engaging, humorous, authoritative, friendly, inspiring
3. Writing Perspective (choose ONE): first_person, second_person, third_person
4. Complexity Level (choose ONE): beginner, intermediate, advanced
5. Word Count Range: min and max (typical: 1500-2500)
6. Content Mix percentages (must total 100%): how_to, listicle, tutorial, comparison, case_study
7. Difficulty Distribution percentages (must total 100%): easy (0-30 difficulty), medium (31-60), hard (61-100)

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "brandVoice": "professional",
  "toneAttributes": ["informative", "engaging"],
  "writingPerspective": "first_person",
  "complexityLevel": "intermediate",
  "minWordCount": 1500,
  "maxWordCount": 2500,
  "contentMix": {
    "how_to": 30,
    "listicle": 25,
    "tutorial": 20,
    "comparison": 15,
    "case_study": 10
  },
  "difficultyDistribution": {
    "easy": 40,
    "medium": 45,
    "hard": 15
  },
  "reasoning": "Brief 1-2 sentence explanation of why these settings work for this business"
}`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO strategist. Always respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1000,
    })

    let aiResponse = completion.choices[0]?.message?.content || '{}'

    // Clean up response - remove markdown code blocks if present
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const aiSettings = JSON.parse(aiResponse)

    // Build complete settings with AI recommendations + smart defaults
    const autoSettings = {
      // AI-determined settings
      brandVoice: aiSettings.brandVoice || 'professional',
      toneAttributes: aiSettings.toneAttributes || ['informative', 'engaging'],
      writingPerspective: aiSettings.writingPerspective || 'first_person',
      complexityLevel: aiSettings.complexityLevel || 'intermediate',
      minWordCount: aiSettings.minWordCount || 1500,
      maxWordCount: aiSettings.maxWordCount || 2500,
      contentMix: aiSettings.contentMix || {
        how_to: 30,
        listicle: 25,
        tutorial: 20,
        comparison: 15,
        case_study: 10,
      },
      difficultyDistribution: aiSettings.difficultyDistribution || {
        easy: 40,
        medium: 45,
        hard: 15,
      },

      // Smart defaults (best practices)
      temperature: 0.7,
      customInstructions: '',

      // SEO - always enabled for best results
      keywordDensityMin: 1.5,
      keywordDensityMax: 2.5,
      autoGenerateMeta: true,
      autoInternalLinks: true,
      minInternalLinks: 3,
      maxInternalLinks: 7,
      enableSchemaMarkup: true,

      // Structure - best practices
      includeSections: ['introduction', 'key_takeaways', 'main_content', 'faq', 'conclusion'],
      headingStructure: 'hierarchical',
      includeElements: ['bullets', 'lists', 'blockquotes'],

      // Automation - user must configure
      autoGenerate: false,
      articlesPerWeek: 3,
      preferredDays: [1, 3, 5],
      publishTime: '09:00',
      autoPublish: false,
      generateAheadDays: 14,

      // Quality - always enabled
      enableGrammarCheck: true,
      enablePlagiarismCheck: true,
      targetReadabilityScore: 60,
      autoFixIssues: false,

      // Featured Images - extract primary color or use default
      featuredImageStyle: 'gradient_modern',
      featuredImagePrimaryColor: '#00AA45',
      featuredImageSecondaryColor: '#008837',
      featuredImageFontStyle: 'bold',
      featuredImageTextPosition: 'center',
      featuredImageDimensions: '1200x630',
      featuredImageIncludeLogo: false,
    }

    // Check if settings already exist
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
          brand_voice: autoSettings.brandVoice,
          tone_attributes: autoSettings.toneAttributes,
          writing_perspective: autoSettings.writingPerspective,
          complexity_level: autoSettings.complexityLevel,
          min_word_count: autoSettings.minWordCount,
          max_word_count: autoSettings.maxWordCount,
          temperature: autoSettings.temperature,
          custom_instructions: autoSettings.customInstructions,
          keyword_density_min: autoSettings.keywordDensityMin,
          keyword_density_max: autoSettings.keywordDensityMax,
          auto_generate_meta: autoSettings.autoGenerateMeta,
          auto_internal_links: autoSettings.autoInternalLinks,
          min_internal_links: autoSettings.minInternalLinks,
          max_internal_links: autoSettings.maxInternalLinks,
          enable_schema_markup: autoSettings.enableSchemaMarkup,
          include_sections: autoSettings.includeSections,
          heading_structure: autoSettings.headingStructure,
          include_elements: autoSettings.includeElements,
          content_mix: autoSettings.contentMix,
          difficulty_distribution: autoSettings.difficultyDistribution,
          enable_grammar_check: autoSettings.enableGrammarCheck,
          enable_plagiarism_check: autoSettings.enablePlagiarismCheck,
          target_readability_score: autoSettings.targetReadabilityScore,
          auto_fix_issues: autoSettings.autoFixIssues,
          featured_image_style: autoSettings.featuredImageStyle,
          featured_image_primary_color: autoSettings.featuredImagePrimaryColor,
          featured_image_secondary_color: autoSettings.featuredImageSecondaryColor,
          featured_image_font_style: autoSettings.featuredImageFontStyle,
          featured_image_text_position: autoSettings.featuredImageTextPosition,
          featured_image_include_logo: autoSettings.featuredImageIncludeLogo,
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
          brand_voice: autoSettings.brandVoice,
          tone_attributes: autoSettings.toneAttributes,
          writing_perspective: autoSettings.writingPerspective,
          complexity_level: autoSettings.complexityLevel,
          min_word_count: autoSettings.minWordCount,
          max_word_count: autoSettings.maxWordCount,
          temperature: autoSettings.temperature,
          custom_instructions: autoSettings.customInstructions,
          keyword_density_min: autoSettings.keywordDensityMin,
          keyword_density_max: autoSettings.keywordDensityMax,
          auto_generate_meta: autoSettings.autoGenerateMeta,
          auto_internal_links: autoSettings.autoInternalLinks,
          min_internal_links: autoSettings.minInternalLinks,
          max_internal_links: autoSettings.maxInternalLinks,
          enable_schema_markup: autoSettings.enableSchemaMarkup,
          include_sections: autoSettings.includeSections,
          heading_structure: autoSettings.headingStructure,
          include_elements: autoSettings.includeElements,
          auto_generate: autoSettings.autoGenerate,
          articles_per_week: autoSettings.articlesPerWeek,
          preferred_days: autoSettings.preferredDays,
          publish_time: autoSettings.publishTime,
          auto_publish: autoSettings.autoPublish,
          generate_ahead_days: autoSettings.generateAheadDays,
          content_mix: autoSettings.contentMix,
          difficulty_distribution: autoSettings.difficultyDistribution,
          enable_grammar_check: autoSettings.enableGrammarCheck,
          enable_plagiarism_check: autoSettings.enablePlagiarismCheck,
          target_readability_score: autoSettings.targetReadabilityScore,
          auto_fix_issues: autoSettings.autoFixIssues,
          featured_image_style: autoSettings.featuredImageStyle,
          featured_image_primary_color: autoSettings.featuredImagePrimaryColor,
          featured_image_secondary_color: autoSettings.featuredImageSecondaryColor,
          featured_image_font_style: autoSettings.featuredImageFontStyle,
          featured_image_text_position: autoSettings.featuredImageTextPosition,
          featured_image_include_logo: autoSettings.featuredImageIncludeLogo,
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      success: true,
      settings: autoSettings,
      reasoning: aiSettings.reasoning || 'Settings configured based on business analysis',
    })
  } catch (error) {
    console.error('Error auto-configuring settings:', error)
    return NextResponse.json(
      { error: 'Failed to auto-configure settings' },
      { status: 500 }
    )
  }
}
