import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { websiteUrl, businessName, description } = body;

    if (!websiteUrl || !description) {
      return NextResponse.json(
        { error: 'Website URL and description are required' },
        { status: 400 }
      );
    }

    const prompt = `Based on this business information:
Business Name: ${businessName || 'N/A'}
Website: ${websiteUrl}
Description: ${description}

Generate 5-7 specific target audience groups for this business. Each audience group should be:
- Specific and actionable (e.g., "Startup founders and indie hackers needing fast, high-converting landing pages")
- Focused on who would benefit from this business
- Clear about their needs and pain points

Return ONLY a JSON array of audience strings, nothing else. Format: ["audience 1", "audience 2", ...]`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = chatCompletion.choices[0]?.message?.content || '[]';

    // Parse the JSON response
    let audiences: string[] = [];
    try {
      audiences = JSON.parse(content);
    } catch (e) {
      // If parsing fails, try to extract audiences from the text
      const lines = content.split('\n').filter(line => line.trim());
      audiences = lines
        .filter(line => line.includes('"'))
        .map(line => line.replace(/["\[\],]/g, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 7);
    }

    return NextResponse.json({
      audiences: audiences.slice(0, 7),
    });
  } catch (error: any) {
    console.error('Error generating audiences:', error);
    return NextResponse.json(
      { error: 'Failed to generate audiences', details: error.message },
      { status: 500 }
    );
  }
}
