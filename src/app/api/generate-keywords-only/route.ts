import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { projectId, numKeywords, competitors, audiences } = await request.json();

    console.log('🔍 Generate Keywords - projectId received:', projectId);

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('name, description')
      .eq('id', projectId)
      .single();

    console.log('🔍 Project query result:', { project, error: projectError });

    if (projectError || !project) {
      console.error('❌ Project fetch error:', projectError);
      return NextResponse.json(
        { error: 'Project not found. Please create a project first or refresh the page.' },
        { status: 404 }
      );
    }

    console.log('✅ Project found:', project.name);

    const count = numKeywords || 8;

    // Create AI prompt for KEYWORD generation (not article titles)
    const prompt = `You are an expert SEO keyword researcher specializing in BLOG CONTENT and INFORMATIONAL keywords. Generate ${count} high-value SEO keywords for the following business:

**Business Context:**
- Company: ${project.name}
- Description: ${project.description || 'Not provided'}
${competitors && competitors.length > 0 ? `- Competitors: ${competitors.join(', ')}` : ''}
${audiences && audiences.length > 0 ? `- Target Audiences: ${audiences.join(', ')}` : ''}

**Requirements:**
1. Generate EXACTLY ${count} SEO keywords (NOT article titles, just pure keywords/phrases)
2. Focus on INFORMATIONAL/EDUCATIONAL keywords suitable for BLOG ARTICLES
3. Include a mix of:
   - Short-tail keywords (1-2 words, high volume, high difficulty)
   - Long-tail keywords (3-5 words, lower volume, lower difficulty)
   - Question-based keywords (how, what, why, when, etc.)
4. Keywords should be relevant to the business niche and target audience
5. Provide realistic search volume and difficulty estimates

**CRITICAL - EXCLUDE these keyword types (NOT suitable for blog content):**
❌ Local intent: "near me", "in [city]", "close to me", "[location] based", "local"
❌ Transactional: "buy", "purchase", "order", "shop", "price", "cost", "for sale"
❌ Service requests: "hire", "get quotes", "contact", "call now", "book", "schedule"
❌ Branded: specific company/product names (unless analyzing the business's own brand)

**ONLY INCLUDE informational/educational keywords:**
✅ How-to: "how to...", "ways to...", "steps to...", "process of..."
✅ Questions: "what is...", "why...", "when to...", "where to learn..."
✅ Comparisons: "vs", "compared to", "difference between", "alternatives to..."
✅ Educational: "guide", "tutorial", "learn", "tips", "best practices", "examples"
✅ Problem-solving: addressing pain points, solutions, troubleshooting

**Output Format (JSON array):**
Return ONLY a valid JSON array with this exact structure:
[
  {
    "keyword": "content marketing strategy",
    "volume": 12000,
    "difficulty": 65,
    "reason": "Informational keyword about marketing planning"
  },
  {
    "keyword": "how to create content calendar",
    "volume": 3400,
    "difficulty": 42,
    "reason": "How-to keyword with educational intent"
  }
]

**Important:**
- Each "keyword" must be a SEARCHABLE PHRASE suitable for a blog article
- Do NOT include local, transactional, or service request keywords
- Keywords should be what users type when seeking INFORMATION or EDUCATION
- Return ONLY the JSON array, no other text`;

    // Call AI to generate keywords
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Parse AI response
    let keywords;
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');
      keywords = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    return NextResponse.json({
      success: true,
      keywords,
    });
  } catch (error: any) {
    console.error('Error generating keywords:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate keywords' },
      { status: 500 }
    );
  }
}
