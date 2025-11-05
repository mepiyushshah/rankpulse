import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import Groq from 'groq-sdk';
import { getToolScreenshot, extractToolNames } from '@/lib/screenshot-service';

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
      ? settings.include_sections.map((s: string) => sectionsMap[s]).filter(Boolean).join('\n')
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
      ? settings.include_elements.map((e: string) => elementsMap[e]).filter(Boolean).join(', ')
      : 'bullet points, numbered lists, and blockquotes';

    // Build heading structure instruction
    const headingInstruction = settings.heading_structure === 'hierarchical'
      ? 'Use hierarchical heading structure (H2 for main sections, H3 for subsections, H4 for details)'
      : 'Use flat heading structure (H2 only for all sections)';

    // Detect if this should be a listicle based on keyword patterns
    const listiclePatterns = [
      /^best\s+/i,
      /^top\s+\d+/i,
      /^top\s+/i,
      /\s+tools?\s*/i,
      /\s+software\s*/i,
      /\s+platforms?\s*/i,
      /\s+apps?\s*/i,
      /\s+services?\s*/i,
      /\s+vs\s+/i,
      /\s+comparison/i,
      /\s+alternatives?/i,
      /\s+review/i,
    ];

    const isListicle = listiclePatterns.some(pattern => pattern.test(keyword)) ||
                       (contentType && /listicle|comparison|review|tools|software/i.test(contentType));

    // Create detailed AI prompt for article generation
    let prompt = '';

    if (isListicle) {
      // LISTICLE-SPECIFIC PROMPT
      prompt = `You are an expert SEO content writer specializing in product reviews and comparisons. Write a comprehensive LISTICLE article based on the following requirements.

**Business Context:**
- Company: ${project.name}
- Description: ${project.description || 'Not provided'}
${project.competitors && Array.isArray(project.competitors) && project.competitors.length > 0 ? `- Competitors: ${project.competitors.join(', ')}` : ''}
${project.target_audiences && Array.isArray(project.target_audiences) && project.target_audiences.length > 0 ? `- Target Audience: ${project.target_audiences.join(', ')}` : ''}

**Article Requirements:**
- Target Keyword: "${keyword}"
- Content Type: LISTICLE (Tools/Software Comparison)
- Brand Voice: ${settings.brand_voice}
- Tone: ${toneDescription}
- Word Count: ${settings.min_word_count}-${settings.max_word_count} words
- Complexity: ${settings.complexity_level}

**Writing Style:**
- ${perspectiveInstruction}
- ${complexityInstruction}
${settings.custom_instructions ? `\n**Custom Instructions:**\n${settings.custom_instructions}\n` : ''}

**SEO Requirements:**
- Target keyword density: ${settings.keyword_density_min}%-${settings.keyword_density_max}%
- Use the target keyword naturally in the introduction, headings, and conclusion
- Include related keywords and semantic variations
- Write in a clear, scannable format with short paragraphs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MANDATORY LISTICLE FORMAT - YOU MUST FOLLOW THIS EXACTLY:**

Write the article in MARKDOWN format as a NUMBERED LISTICLE.

REQUIRED STRUCTURE:

[1-2 engaging introduction paragraphs with NO heading - explain what this list covers and why it matters]

## Quick Comparison Table

| Tool/Software | Best For | Pricing | Rating |
|---------------|----------|---------|--------|
| [Tool 1] | [Use case] | [Price] | ⭐⭐⭐⭐⭐ |
| [Tool 2] | [Use case] | [Price] | ⭐⭐⭐⭐ |
[Add 5-10 tools in table]

## 1. [Tool/Software Name 1] - [One-line Description]

[2-3 paragraphs describing the tool/software in detail]

**Key Features:**
- Feature 1 with brief explanation
- Feature 2 with brief explanation
- Feature 3 with brief explanation
- Feature 4 with brief explanation

**Pros:**
- ✅ Pro 1
- ✅ Pro 2
- ✅ Pro 3

**Cons:**
- ❌ Con 1
- ❌ Con 2

**Pricing:** [Detailed pricing information with tiers if available]

**Best For:** [Specific use cases or user types this tool is ideal for]

---

## 2. [Tool/Software Name 2] - [One-line Description]

[Continue the same structure for each tool - aim for 7-10 tools total]

**Key Features:**
[4-5 features]

**Pros:**
[3-4 pros]

**Cons:**
[2-3 cons]

**Pricing:**
[Details]

**Best For:**
[Use cases]

---

[Continue this pattern for tools 3-10]

## How to Choose the Right [Tool Type]

[2-3 paragraphs with guidance on selection criteria]

**Consider these factors:**
- Factor 1
- Factor 2
- Factor 3
- Factor 4

## Frequently Asked Questions

### [Question 1 about the tools/topic]
[Answer in 2-3 sentences]

### [Question 2]
[Answer]

### [Question 3]
[Answer]

### [Question 4]
[Answer]

## Conclusion

[Strong concluding paragraph summarizing the top picks and helping readers make a decision]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**CRITICAL LISTICLE RULES:**

✓ MUST use numbered headings: "## 1. Tool Name", "## 2. Tool Name", etc.
✓ Include 7-10 tools/items minimum in the listicle
✓ ALWAYS include comparison table at the beginning
✓ ALWAYS include Pros/Cons for each item
✓ ALWAYS include specific pricing information
✓ ALWAYS include "Best For" section for each item
✓ Use horizontal rules (---) between each numbered item
✓ Keep descriptions factual and specific
✓ Include "How to Choose" guidance section
✓ End with FAQ and Conclusion sections

✗ DO NOT use generic descriptions
✗ DO NOT skip pricing information
✗ DO NOT skip pros and cons
✗ DO NOT use regular H2 headings - use numbered format (## 1., ## 2., etc.)
✗ DO NOT include meta title or description in content
✗ DO NOT use # (H1) - only ##, ###, ####

Begin writing the LISTICLE article NOW in proper markdown format:`;
    } else {
      // REGULAR ARTICLE PROMPT (existing)
      prompt = `You are an expert SEO content writer. Write a comprehensive, high-quality article based on the following requirements.

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MANDATORY OUTPUT FORMAT - YOU MUST FOLLOW THIS EXACTLY:**

Write the article in MARKDOWN format. You MUST use proper markdown headings (##, ###, ####).

REQUIRED STRUCTURE - DO NOT SKIP ANY HEADINGS:

[1-2 engaging introduction paragraphs with NO heading - hook the reader immediately]

## [First Major H2 Section - MUST be present]
[2-3 short paragraphs explaining this section]

### [H3 Subsection under first H2]
[Content here with short paragraphs]

### [Another H3 Subsection]
[Content]

## [Second Major H2 Section - MUST be present]
[Content with short paragraphs]

### [H3 Subsection]
[Content]

## [Third Major H2 Section - MUST be present]
[Continue this pattern for 5-7 major H2 sections minimum]

## Frequently Asked Questions

### [Question 1 as H3]
[Answer in 2-3 sentences]

### [Question 2 as H3]
[Answer]

### [Question 3 as H3]
[Answer]

## Conclusion
[Strong concluding paragraph with call-to-action]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**CRITICAL FORMATTING RULES - FAILURE TO FOLLOW WILL RESULT IN REJECTION:**

✓ ALWAYS use ## for main section headings (H2) - minimum 5 sections
✓ ALWAYS use ### for subsections (H3)
✓ Use #### for detailed points (H4) if needed
✓ Keep paragraphs SHORT (2-4 sentences maximum)
✓ Add blank lines between ALL paragraphs
✓ Use bullet points (-) and numbered lists (1.) frequently
✓ Use blockquotes (>) for important insights
✓ Start with intro paragraphs (NO heading for intro)
✓ Include ## Frequently Asked Questions section with ### for each Q&A
✓ End with ## Conclusion section

✗ DO NOT write walls of text without headings
✗ DO NOT skip the heading hierarchy
✗ DO NOT write long paragraphs
✗ DO NOT include meta title or description
✗ DO NOT use # (H1) - only ##, ###, ####

Begin writing the article NOW in proper markdown format:`;
    }

    // Call AI to generate article content using saved temperature setting
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: Number(settings.temperature) || 0.7,
      max_tokens: 6000, // Increased for longer articles
    });

    let articleContent = completion.choices[0]?.message?.content || '';

    if (!articleContent) {
      throw new Error('Failed to generate article content');
    }

    // DEBUG: Log the first 500 characters to see what we got
    console.log('=== AI GENERATED CONTENT (first 500 chars) ===');
    console.log(articleContent.substring(0, 500));
    console.log('=== HAS H2 HEADINGS? ===', articleContent.includes('##'));
    console.log('=== HAS H3 HEADINGS? ===', articleContent.includes('###'));

    // If this is a listicle, add screenshots for each tool
    if (isListicle) {
      console.log('=== DETECTED LISTICLE - ADDING SCREENSHOTS ===');

      const toolNames = extractToolNames(articleContent);
      console.log(`Found ${toolNames.length} tools to screenshot`);

      // Process screenshots for each tool (limit to first 10 to avoid too many API calls)
      const toolsToProcess = toolNames.slice(0, 10);

      for (const toolName of toolsToProcess) {
        console.log(`Processing screenshot for: ${toolName}`);

        const screenshot = await getToolScreenshot(toolName);

        if (screenshot.success && screenshot.imageUrl) {
          // Find the tool's heading and insert image after the description paragraph
          const toolHeadingRegex = new RegExp(`(##\\s+\\d+\\.\\s+${toolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\n]*\\n\\n[^\\n]+(?:\\n[^\\n]+)*?)\\n\\n`, 'i');

          const match = articleContent.match(toolHeadingRegex);

          if (match) {
            const insertPosition = match.index! + match[0].length;
            const imageMarkdown = `![${toolName} Screenshot](${screenshot.imageUrl})\n\n`;

            articleContent =
              articleContent.slice(0, insertPosition) +
              imageMarkdown +
              articleContent.slice(insertPosition);

            console.log(`✅ Added screenshot for ${toolName}`);
          } else {
            console.log(`⚠️ Could not find insertion point for ${toolName}`);
          }
        } else {
          console.log(`❌ Failed to get screenshot for ${toolName}: ${screenshot.error}`);
        }
      }

      console.log('=== SCREENSHOT PROCESSING COMPLETE ===');
    }

    // Generate a proper title from the keyword
    const titlePrompt = `Create a descriptive, SEO-optimized title for: "${keyword}"

ABSOLUTE REQUIREMENTS (MUST FOLLOW):
- Title MUST be between 50-60 characters (aim for 53-58 for best results)
- Count every character including spaces before submitting
- Include the keyword "${keyword}" naturally
- Make it LONG and DESCRIPTIVE - add context like year, guide type, or scope
- Preferred formats: "[Topic]: 2025 Complete Guide" or "[Topic]: [Descriptor]"
- Use year (2025), guide descriptors (Complete Guide, Expert Tips, etc.)
- NO quotation marks, NO special characters
- Return ONLY the raw title text

EXCELLENT Examples (longer, descriptive, 50-60 chars):
- "How to Make a Landing Page Convert: 2025 Complete Guide" (55 chars) ← PERFECT
- "Best Website Builders for Startups: 2025 Expert Review" (56 chars)
- "Top Email Marketing Tools: Complete 2025 Comparison" (52 chars)

BAD Examples:
- Too short: "How to Make a Landing Page Convert Fast" (43 chars) ← needs more
- Too long: "Unlock Fast Landing Page Creation in 2025 Discover How to Build Pages" (71 chars)

Create ONE LONG, descriptive title NOW (50-60 characters):`;

    const titleCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: titlePrompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.85,
      max_tokens: 80,
    });

    let articleTitle = titleCompletion.choices[0]?.message?.content?.trim() || `${contentType}: ${keyword}`;

    // Remove any quotation marks that might be in the title
    articleTitle = articleTitle.replace(/^["']|["']$/g, '').replace(/[""'']/g, '');

    // STRICT: Enforce 60 character limit
    if (articleTitle.length > 60) {
      // Try to truncate at last complete word under 60 chars
      let truncated = articleTitle.substring(0, 60);
      const lastSpaceIndex = truncated.lastIndexOf(' ');

      if (lastSpaceIndex > 40) {
        // If we can fit a reasonable amount, truncate at last word
        articleTitle = truncated.substring(0, lastSpaceIndex).trim();
      } else {
        // Otherwise hard truncate at 60
        articleTitle = truncated.trim();
      }
    }

    console.log(`=== GENERATED TITLE (${articleTitle.length} chars) ===`, articleTitle);

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

    // Generate slug from keyword
    const slug = keyword.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/--+/g, '-')     // Replace multiple hyphens with single hyphen
      .trim();

    // Update article in database with all generated content
    const updateData: any = {
      title: articleTitle,
      content: articleContent,
      slug: slug,
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
      slug: slug,
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
