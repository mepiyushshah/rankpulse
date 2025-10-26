import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { content, projectId } = await request.json();

    if (!content || !projectId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch article settings to check if quality features are enabled
    const { data: settings } = await supabase
      .from('article_settings')
      .select('enable_grammar_check, target_readability_score, auto_fix_issues')
      .eq('project_id', projectId)
      .single();

    const results: any = {
      grammarChecked: false,
      readabilityScore: null,
      issues: [],
      suggestions: [],
    };

    // Grammar and style check
    if (settings?.enable_grammar_check) {
      const grammarPrompt = `You are a professional editor. Review this content for grammar, spelling, and style issues.

Content:
${content}

Provide a JSON response with this exact structure:
{
  "issues": [
    {"type": "grammar|spelling|style", "severity": "high|medium|low", "description": "Issue description", "suggestion": "How to fix"}
  ],
  "overallScore": 85
}

Return ONLY the JSON, no other text.`;

      const grammarCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: grammarPrompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 2000,
      });

      try {
        const grammarResult = JSON.parse(grammarCompletion.choices[0]?.message?.content || '{}');
        results.grammarChecked = true;
        results.issues = grammarResult.issues || [];
        results.grammarScore = grammarResult.overallScore || 85;
      } catch (e) {
        console.error('Failed to parse grammar check results:', e);
      }
    }

    // Readability analysis
    const readabilityPrompt = `Analyze the readability of this content. Calculate a readability score from 0-100 (higher is easier to read).

Content:
${content}

Consider:
- Average sentence length
- Word complexity
- Paragraph structure
- Use of transition words
- Overall clarity

Provide a JSON response:
{
  "score": 75,
  "grade": "Easy|Moderate|Difficult",
  "avgSentenceLength": 15,
  "complexWords": 20,
  "suggestions": ["Make sentences shorter", "Use simpler words"]
}

Return ONLY the JSON, no other text.`;

    const readabilityCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: readabilityPrompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1000,
    });

    try {
      const readabilityResult = JSON.parse(readabilityCompletion.choices[0]?.message?.content || '{}');
      results.readabilityScore = readabilityResult.score || 70;
      results.readabilityGrade = readabilityResult.grade || 'Moderate';
      results.avgSentenceLength = readabilityResult.avgSentenceLength;
      results.complexWords = readabilityResult.complexWords;
      results.suggestions = [...results.suggestions, ...(readabilityResult.suggestions || [])];
    } catch (e) {
      console.error('Failed to parse readability results:', e);
      // Fallback basic calculation
      const sentences = content.split(/[.!?]+/).length;
      const words = content.split(/\s+/).length;
      results.readabilityScore = Math.min(100, Math.max(0, 100 - (words / sentences)));
    }

    // Auto-fix if enabled and there are issues
    let fixedContent = null;
    if (settings?.auto_fix_issues && results.issues.length > 0) {
      const fixPrompt = `Fix the following issues in this content while maintaining its meaning and style:

Content:
${content}

Issues to fix:
${results.issues.map((issue: any) => `- ${issue.description}: ${issue.suggestion}`).join('\n')}

Return ONLY the corrected content, no explanations.`;

      const fixCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: fixPrompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 4000,
      });

      fixedContent = fixCompletion.choices[0]?.message?.content || null;
    }

    return NextResponse.json({
      success: true,
      ...results,
      fixedContent,
    });
  } catch (error: any) {
    console.error('Error in quality check:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform quality check' },
      { status: 500 }
    );
  }
}
