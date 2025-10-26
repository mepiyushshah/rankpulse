import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { projectId, articleId, keyword, contentType } = await request.json();

    if (!projectId || !articleId || !keyword) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('name, description, competitors, target_audiences')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch article settings
    const { data: settingsData } = await supabase
      .from('article_settings')
      .select('*')
      .eq('project_id', projectId)
      .single();

    // Use saved settings or defaults
    const settings = settingsData || {
      brand_voice: 'professional',
      tone_attributes: ['informative', 'engaging'],
      writing_perspective: 'first_person',
      complexity_level: 'intermediate',
      min_word_count: 1500,
      max_word_count: 2500,
      temperature: 0.7,
      custom_instructions: '',
      keyword_density_min: 1.5,
      keyword_density_max: 2.5,
      include_sections: ['introduction', 'key_takeaways', 'main_content', 'faq', 'conclusion'],
      heading_structure: 'hierarchical',
      include_elements: ['bullets', 'lists', 'blockquotes'],
      auto_generate_meta: true,
      enable_schema_markup: true,
    };

    // Build tone description
    const toneDescription = settings.tone_attributes && Array.isArray(settings.tone_attributes)
      ? settings.tone_attributes.join(', ')
      : 'informative, engaging';

    // Build perspective instruction
    const perspectiveMap: Record<string, string> = {
      'first_person': 'Use first person perspective (we/I) throughout the article',
      'second_person': 'Use second person perspective (you) to directly address the reader',
      'third_person': 'Use third person perspective (they/it) for an objective tone'
    };
    const perspectiveInstruction = perspectiveMap[settings.writing_perspective] || perspectiveMap['first_person'];

    // Build complexity instruction
    const complexityMap: Record<string, string> = {
      'beginner': 'Use simple language that anyone can understand. Avoid jargon and explain all technical terms.',
      'intermediate': 'Use balanced language with some industry terms. Explain complex concepts clearly.',
      'expert': 'Use advanced technical language. Assume the reader has deep domain knowledge.'
    };
    const complexityInstruction = complexityMap[settings.complexity_level] || complexityMap['intermediate'];

    // Build sections instruction
    const sectionsMap: Record<string, string> = {
      'introduction': '- Start with a compelling introduction that hooks the reader and introduces the topic',
      'key_takeaways': '- Include a "Key Takeaways" box early in the article with 3-5 bullet points',
      'main_content': '- Develop comprehensive main content with detailed explanations and examples',
      'faq': '- Add an FAQ section near the end addressing common questions',
      'conclusion': '- End with a strong conclusion that summarizes key points and includes a call-to-action'
    };
    const sectionsInstructions = settings.include_sections && Array.isArray(settings.include_sections)
      ? settings.include_sections.map(s => sectionsMap[s]).filter(Boolean).join('\n')
      : Object.values(sectionsMap).join('\n');

    // Build elements instruction
    const elementsMap: Record<string, string> = {
      'bullets': 'bullet points for lists',
      'lists': 'numbered lists for step-by-step instructions',
      'blockquotes': 'blockquotes to highlight important insights',
      'code': 'code snippets where relevant',
      'tables': 'tables to organize comparative data',
      'internal_links': 'suggestions for internal links (marked with [INTERNAL: anchor text])',
      'youtube_videos': 'suggestions for relevant YouTube videos (marked with [VIDEO: search query])',
      'infographics': 'suggestions for infographics (marked with [INFOGRAPHIC: description])',
      'images': 'suggestions for images (marked with [IMAGE: description])',
      'diagrams': 'suggestions for diagrams/charts (marked with [DIAGRAM: description])',
      'stats_boxes': 'highlighted statistics boxes with key numbers',
      'expert_quotes': 'expert quotes or testimonials where relevant'
    };
    const includeElements = settings.include_elements && Array.isArray(settings.include_elements)
      ? settings.include_elements.map(e => elementsMap[e]).filter(Boolean).join(', ')
      : 'bullet points, numbered lists, and blockquotes';

    // Build heading structure instruction
    const headingInstruction = settings.heading_structure === 'hierarchical'
      ? 'Use hierarchical heading structure (H2 for main sections, H3 for subsections, H4 for details)'
      : 'Use flat heading structure (H2 only for all sections)';

    // Create detailed AI prompt for article generation
    const prompt = `You are an expert SEO content writer. Write a comprehensive, high-quality article based on the following requirements:

**Business Context:**
- Company: ${project.name}
- Description: ${project.description || 'Not provided'}
${project.competitors && Array.isArray(project.competitors) && project.competitors.length > 0 ? `- Competitors: ${project.competitors.join(', ')}` : ''}
${project.target_audiences && Array.isArray(project.target_audiences) && project.target_audiences.length > 0 ? `- Target Audience: ${project.target_audiences.join(', ')}` : ''}

**Article Requirements:**
- Target Keyword: "${keyword}"
- Content Type: ${contentType || 'Article'}
- Brand Voice: ${settings.brand_voice}
- Tone: ${toneDescription}
- Word Count: ${settings.min_word_count}-${settings.max_word_count} words
- Complexity: ${settings.complexity_level}

**Writing Style:**
- ${perspectiveInstruction}
- ${complexityInstruction}
${settings.custom_instructions ? `\n**Custom Instructions:**\n${settings.custom_instructions}\n` : ''}

**Article Structure:**
${sectionsInstructions}

**Formatting & Elements:**
- ${headingInstruction}
- Include these elements: ${includeElements}

**SEO Requirements:**
- Target keyword density: ${settings.keyword_density_min}%-${settings.keyword_density_max}%
- Use the target keyword naturally in the introduction, headings, and conclusion
- Include related keywords and semantic variations
- Write in a clear, scannable format with short paragraphs
- Ensure the content provides genuine value and answers user intent

**Output Format:**
Write the article in markdown format with proper headings and formatting.
DO NOT include a meta title or description - just the article content itself.
Use the markers [INTERNAL:], [VIDEO:], [INFOGRAPHIC:], [IMAGE:], [DIAGRAM:] etc. where you suggest rich media.

Begin writing the article now:`;

    // Call AI to generate article content using saved temperature setting
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: Number(settings.temperature) || 0.7,
      max_tokens: 6000, // Increased for longer articles
    });

    const articleContent = completion.choices[0]?.message?.content || '';

    if (!articleContent) {
      throw new Error('Failed to generate article content');
    }

    // Generate a proper title from the keyword
    const titlePrompt = `Based on the keyword "${keyword}" and content type "${contentType || 'Article'}", generate a compelling, SEO-friendly article title.

Requirements:
- Should be engaging and click-worthy
- Include the target keyword naturally
- Keep it under 60 characters for SEO
- Match the content type (${contentType || 'Article'})

Return ONLY the title text, nothing else.`;

    const titleCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: titlePrompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 100,
    });

    const articleTitle = titleCompletion.choices[0]?.message?.content?.trim() || `${contentType}: ${keyword}`;

    // Generate meta description if enabled
    let metaDescription = '';
    if (settings.auto_generate_meta) {
      const metaPrompt = `Based on this article title "${articleTitle}" and keyword "${keyword}", write a compelling meta description.

Requirements:
- Keep it between 150-160 characters
- Include the target keyword naturally
- Make it enticing to encourage clicks
- Summarize what readers will learn

Return ONLY the meta description text, nothing else.`;

      const metaCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: metaPrompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 100,
      });

      metaDescription = metaCompletion.choices[0]?.message?.content?.trim() || '';
    }

    // Generate schema markup if enabled
    let schemaMarkup = null;
    if (settings.enable_schema_markup) {
      schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": articleTitle,
        "description": metaDescription,
        "keywords": keyword,
        "author": {
          "@type": "Organization",
          "name": project.name
        },
        "publisher": {
          "@type": "Organization",
          "name": project.name
        },
        "datePublished": new Date().toISOString(),
        "dateModified": new Date().toISOString()
      };
    }

    // Update article in database with all generated content
    const updateData: any = {
      title: articleTitle,
      content: articleContent,
      status: 'draft',
      updated_at: new Date().toISOString(),
    };

    if (metaDescription) {
      updateData.meta_description = metaDescription;
    }

    if (schemaMarkup) {
      updateData.schema_markup = schemaMarkup;
    }

    const { error: updateError } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', articleId);

    if (updateError) {
      console.error('Error updating article:', updateError);
      throw new Error('Failed to save article');
    }

    return NextResponse.json({
      success: true,
      title: articleTitle,
      content: articleContent,
      metaDescription,
      schemaMarkup,
    });
  } catch (error: any) {
    console.error('Error generating article:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate article' },
      { status: 500 }
    );
  }
}
