import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, wordCount, tone, language } = body;

    // Validation
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Build the AI prompt
    const prompt = `You are an expert SEO content writer. Write a comprehensive, engaging blog post about: ${topic}

Requirements:
- Target word count: ${wordCount || 1500} words
- Tone: ${tone || 'Professional'}
- Language: ${language || 'English'}
- Include SEO best practices
- Use proper heading hierarchy (H2, H3)
- Include a meta description (150-160 characters)
- Make it engaging and informative
- Write in a natural, conversational style

Structure:
1. Write an engaging title (not including "Title:" prefix, just the title itself)
2. Write an engaging introduction paragraph
3. Write well-organized body with proper H2 and H3 subheadings
4. Write an actionable conclusion
5. At the very end, on a new line, write "META_DESCRIPTION: " followed by a 150-160 character meta description

Important formatting:
- Use ## for H2 headings
- Use ### for H3 headings
- Use **bold** for emphasis
- Use bullet points where appropriate
- Make paragraphs concise and scannable

Write the article now:`;

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile', // Fast and free model
      temperature: 0.7,
      max_tokens: 4000,
    });

    const generatedContent = chatCompletion.choices[0]?.message?.content || '';

    // Parse the response to extract title, content, and meta description
    const lines = generatedContent.split('\n');
    let title = '';
    let content = '';
    let metaDescription = '';

    // Extract title (first non-empty line)
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        title = trimmed.replace(/^["']|["']$/g, ''); // Remove quotes if present
        break;
      }
    }

    // Extract meta description (last line with META_DESCRIPTION:)
    const metaMatch = generatedContent.match(/META_DESCRIPTION:\s*(.+)$/im);
    if (metaMatch) {
      metaDescription = metaMatch[1].trim();
      // Remove meta description from content
      content = generatedContent.replace(/\n*META_DESCRIPTION:.+$/im, '').trim();
    } else {
      content = generatedContent;
      // Generate a fallback meta description
      metaDescription = content.slice(0, 160).trim() + '...';
    }

    // Remove title from content if it's repeated
    if (title) {
      content = content.replace(new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n*`, 'i'), '').trim();
    }

    // Count words
    const wordCountResult = content.split(/\s+/).length;

    return NextResponse.json({
      success: true,
      data: {
        title: title || 'Untitled Article',
        content,
        metaDescription,
        wordCount: wordCountResult,
      },
    });
  } catch (error: any) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate content',
        details: error.message
      },
      { status: 500 }
    );
  }
}
