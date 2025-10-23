import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { extractWebsiteMetadata } from '@/lib/metadata-extractor';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { websiteUrl, businessName, existingDescription } = body;

    if (!websiteUrl) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    // Extract metadata and content from website for in-depth analysis
    const metadataResponse = await fetch(`${request.nextUrl.origin}/api/extract-metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: websiteUrl }),
    });

    let websiteContent = '';
    let metadata: any = {};

    if (metadataResponse.ok) {
      const data = await metadataResponse.json();
      metadata = data.metadata || {};
      websiteContent = metadata.content || '';
    }

    // Build context for AI with in-depth content
    let context = `Business Name: ${businessName}\nWebsite: ${websiteUrl}\n`;

    if (metadata.title) {
      context += `Website Title: ${metadata.title}\n`;
    }

    if (metadata.description) {
      context += `Meta Description: ${metadata.description}\n`;
    }

    if (websiteContent) {
      context += `\nWebsite Content Analysis:\n${websiteContent}\n`;
    }

    if (existingDescription) {
      context += `\nExisting Description: ${existingDescription}\n`;
    }

    // Create AI prompt with in-depth analysis instructions
    const prompt = existingDescription
      ? `Based on the comprehensive business information below (including in-depth website content analysis), improve and expand the business description. Analyze the website content carefully to understand the business's offerings, target audience, and unique value propositions. Make it more compelling, detailed, and SEO-friendly. Keep it between 100-200 words.

${context}

Write an improved business description that:
1. Clearly explains what the business does based on actual website content
2. Highlights specific unique value propositions found on the website
3. Identifies the specific target audience mentioned or implied on the website
4. Incorporates key offerings and services from the website content
5. Is engaging, professional, and optimized for SEO
6. Uses specific details from the website rather than generic statements

Write only the description, nothing else:`
      : `Based on the comprehensive business information below (including in-depth website content analysis), write a detailed business description. Analyze the website content carefully to understand the business's offerings, target audience, and unique value propositions. Make it compelling, detailed, and SEO-friendly. Keep it between 100-200 words.

${context}

Write a business description that:
1. Clearly explains what the business does based on actual website content
2. Highlights specific unique value propositions found on the website
3. Identifies the specific target audience mentioned or implied on the website
4. Incorporates key offerings and services from the website content
5. Is engaging, professional, and optimized for SEO
6. Uses specific details from the website rather than generic statements

Write only the description, nothing else:`;

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert business analyst and copywriter specializing in creating compelling business descriptions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 500,
    });

    const description = chatCompletion.choices[0]?.message?.content?.trim() || '';

    if (!description) {
      throw new Error('Failed to generate description');
    }

    return NextResponse.json({
      success: true,
      description,
      metadata: {
        title: metadata.title,
        hasMetaDescription: !!metadata.description,
      },
    });
  } catch (error: any) {
    console.error('Error generating description:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate description',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
