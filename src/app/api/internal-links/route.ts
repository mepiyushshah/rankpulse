import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { content, keyword, projectId } = await request.json();

    if (!content || !projectId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch article settings
    const { data: settings } = await supabase
      .from('article_settings')
      .select('auto_internal_links, min_internal_links, max_internal_links')
      .eq('project_id', projectId)
      .single();

    if (!settings?.auto_internal_links) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        message: 'Internal linking is disabled'
      });
    }

    // Get all published/draft articles from this project to suggest links
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, keyword, content')
      .eq('project_id', projectId)
      .in('status', ['published', 'draft'])
      .limit(50);

    if (!articles || articles.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        message: 'No articles available for internal linking'
      });
    }

    // Build a list of available articles for the AI
    const availableArticles = articles.map(a => ({
      title: a.title,
      keyword: a.keyword,
      id: a.id
    }));

    const linkPrompt = `You are an SEO expert. Analyze this article content and suggest ${settings.min_internal_links}-${settings.max_internal_links} internal links to related articles.

Current Article Content:
${content.substring(0, 3000)}

Available Articles to Link To:
${availableArticles.map(a => `- "${a.title}" (keyword: ${a.keyword}, id: ${a.id})`).join('\n')}

Provide a JSON response with suggested internal links:
{
  "suggestions": [
    {
      "articleId": "article-id-here",
      "articleTitle": "Article Title",
      "anchorText": "suggested anchor text",
      "contextLocation": "where in the content this link would fit",
      "relevanceScore": 85
    }
  ]
}

Rules:
- Only suggest ${settings.min_internal_links}-${settings.max_internal_links} links
- Links must be highly relevant to the content
- Anchor text should be natural and contextual
- Sort by relevance score (highest first)

Return ONLY the JSON, no other text.`;

    const linkCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: linkPrompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 2000,
    });

    let suggestions = [];
    try {
      const result = JSON.parse(linkCompletion.choices[0]?.message?.content || '{}');
      suggestions = result.suggestions || [];
    } catch (e) {
      console.error('Failed to parse internal links results:', e);
    }

    return NextResponse.json({
      success: true,
      suggestions,
      totalArticles: articles.length,
    });
  } catch (error: any) {
    console.error('Error generating internal links:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate internal links' },
      { status: 500 }
    );
  }
}
