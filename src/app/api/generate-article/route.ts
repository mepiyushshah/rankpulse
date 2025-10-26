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
- Tone: Professional, engaging, and informative
- Length: 1500-2500 words

**Content Guidelines:**
1. Start with a compelling introduction that hooks the reader
2. Use the target keyword naturally throughout (aim for 1-2% density)
3. Include relevant subheadings (H2, H3) for better readability
4. Provide actionable insights and practical examples
5. Address common pain points of the target audience
6. Include data, statistics, or case studies where relevant
7. End with a strong conclusion and call-to-action

**SEO Best Practices:**
- Use the target keyword in the introduction and conclusion
- Include related keywords and semantic variations
- Write in a clear, scannable format with short paragraphs
- Ensure the content provides genuine value and answers user intent

**Output Format:**
Write the article in markdown format with proper headings and formatting.
DO NOT include a meta title or description - just the article content itself.

Begin writing the article now:`;

    // Call AI to generate article content
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 4000,
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

    // Update article in database
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        title: articleTitle,
        content: articleContent,
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', articleId);

    if (updateError) {
      console.error('Error updating article:', updateError);
      throw new Error('Failed to save article');
    }

    return NextResponse.json({
      success: true,
      title: articleTitle,
      content: articleContent,
    });
  } catch (error: any) {
    console.error('Error generating article:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate article' },
      { status: 500 }
    );
  }
}
