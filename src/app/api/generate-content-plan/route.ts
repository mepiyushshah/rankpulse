import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { projectId, month, year, config } = await request.json();

    if (!projectId || !month || !year || !config) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 1. Fetch project details (business description, audiences, competitors)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('name, description, target_audiences, competitors')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error('Project not found');
    }

    // 2. Fetch saved keywords
    const { data: keywords, error: keywordsError } = await supabase
      .from('keywords')
      .select('id, keyword, priority')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (keywordsError) throw keywordsError;

    if (!keywords || keywords.length === 0) {
      return NextResponse.json(
        { error: 'No keywords found. Please add keywords first.' },
        { status: 400 }
      );
    }

    // 3. Calculate date range for the month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const daysInMonth = endDate.getDate();

    // 4. Calculate total articles and distribution
    const totalArticles = config.articlesPerWeek * 4; // Approximate 4 weeks per month
    const startWeekOffset = (config.startWeek - 1) * 7;

    // 5. Prepare AI prompt
    const contentTypePreference = {
      'balanced': 'a balanced mix of How-to Guides, Listicles, Tutorials, Comparisons, and Case Studies',
      'tutorial-heavy': 'mostly How-to Guides and Tutorials (70%), with some Listicles and Comparisons (30%)',
      'listicle-heavy': 'mostly Listicles and "Best of" articles (70%), with some How-to Guides (30%)',
    }[config.contentMix];

    const prompt = `You are an expert SEO content strategist. Generate a monthly content calendar for ${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}.

**Business Context:**
- Company: ${project.name}
- Description: ${project.description || 'Not provided'}
- Target Audiences: ${project.target_audiences?.join(', ') || 'Not specified'}
- Competitors: ${project.competitors?.join(', ') || 'Not specified'}

**Available Keywords (use these):**
${keywords.map((k, i) => `${i + 1}. "${k.keyword}" (Priority: ${k.priority})`).join('\n')}

**Requirements:**
- Generate exactly ${totalArticles} article ideas
- Start scheduling from day ${startWeekOffset + 1} onwards
- Distribute articles evenly: approximately ${config.articlesPerWeek} per week
- Content types: ${contentTypePreference}
- Each article should target ONE keyword from the list above
- Titles should be SEO-optimized, engaging, and actionable
- Vary the difficulty: mix easy (low competition) and challenging (high competition) keywords
- Spread high-value keywords throughout the month

**Output Format (JSON array):**
Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "SEO-optimized article title",
    "keyword": "exact keyword from the list",
    "keywordId": "reference the keyword by its position (1-${keywords.length})",
    "contentType": "How-to Guide|Listicle|Tutorial|Comparison|Case Study",
    "dayOfMonth": number between ${startWeekOffset + 1} and ${daysInMonth},
    "estimatedVolume": estimated monthly search volume (number),
    "estimatedDifficulty": SEO difficulty 0-100 (number),
    "reason": "Brief explanation why this keyword/date combo works"
  }
]

**Important:**
1. Use each keyword only ONCE
2. Don't schedule multiple articles on the same day
3. Prioritize high-priority keywords earlier in the month
4. Return ONLY the JSON array, no other text
5. Ensure valid JSON syntax`;

    // 6. Call AI to generate content plan
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // 7. Parse AI response
    let contentPlan;
    try {
      // Extract JSON from response (in case AI adds extra text)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');
      contentPlan = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // 8. Map keyword IDs and prepare articles for insertion
    const articlesData = contentPlan.map((article: any) => {
      const keywordIndex = parseInt(article.keywordId) - 1;
      const keyword = keywords[keywordIndex];

      // Calculate scheduled date
      const scheduledDate = new Date(year, month, article.dayOfMonth);
      scheduledDate.setHours(10, 0, 0, 0); // Default to 10 AM

      return {
        project_id: projectId,
        title: article.title,
        content: '', // Empty content initially (to be generated later)
        status: 'scheduled',
        scheduled_at: scheduledDate.toISOString(),
        keyword_id: keyword?.id || null,
        target_keyword: article.keyword,
        content_type: article.contentType,
        search_volume: article.estimatedVolume || 0,
        keyword_difficulty: article.estimatedDifficulty || 0,
        language: 'en',
      };
    });

    // 9. Insert articles into database
    const { data: insertedArticles, error: insertError } = await supabase
      .from('articles')
      .insert(articlesData)
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      articles: insertedArticles,
      count: insertedArticles?.length || 0,
    });
  } catch (error: any) {
    console.error('Error generating content plan:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content plan' },
      { status: 500 }
    );
  }
}
