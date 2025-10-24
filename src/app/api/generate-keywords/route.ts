import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { seedKeyword } = await request.json();

    if (!seedKeyword) {
      return NextResponse.json(
        { error: 'Seed keyword is required' },
        { status: 400 }
      );
    }

    // Generate keyword suggestions using AI
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an SEO keyword research expert. Generate related keyword suggestions based on the seed keyword provided.

Return ONLY a valid JSON array with this exact structure, no additional text:
[
  {"keyword": "exact keyword phrase", "volume": estimated_monthly_searches_number, "difficulty": score_0_to_100},
  ...
]

Rules:
- Generate EXACTLY 7 highly relevant keyword variations
- Include long-tail variations and related terms
- Volume should be realistic estimates (100-50000 range)
- Difficulty score: 0-30 (easy), 31-60 (medium), 61-100 (hard)
- Return ONLY the JSON array, no markdown formatting or explanation`,
        },
        {
          role: 'user',
          content: `Generate keyword suggestions for: "${seedKeyword}"`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';

    // Extract JSON from response (in case it's wrapped in markdown)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const keywords = JSON.parse(jsonText);

    return NextResponse.json({ keywords });
  } catch (error: any) {
    console.error('Error generating keywords:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate keywords' },
      { status: 500 }
    );
  }
}
