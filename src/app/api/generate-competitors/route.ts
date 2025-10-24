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

    // Extract domain from URL
    const domain = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0];
    const serpApiKey = process.env.SERPAPI_KEY;

    if (!serpApiKey) {
      return NextResponse.json(
        { error: 'SerpApi key not configured' },
        { status: 500 }
      );
    }

    const competitors = new Set<string>();

    // STRATEGY 1: Use AI to identify industry and generate search queries
    const aiPrompt = `Based on this business:
Name: ${businessName || domain}
Website: ${websiteUrl}
Description: ${description}

Extract ONLY the industry category and primary service/product type in 2-3 words.
Example: "SEO tools", "Project management software", "Email marketing platform"
Return ONLY the category, nothing else.`;

    const aiResponse = await groq.chat.completions.create({
      messages: [{ role: 'user', content: aiPrompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 50,
    });

    const industryCategory = aiResponse.choices[0]?.message?.content?.trim() || '';

    // STRATEGY 2: Multiple targeted searches
    const searchQueries = [
      `best ${industryCategory} tools`,
      `${industryCategory} software comparison`,
      `top ${industryCategory} platforms`,
      `${industryCategory} alternatives to ${domain}`,
    ];

    // Helper function to extract clean domains
    const extractDomain = (url: string): string | null => {
      try {
        const urlObj = new URL(url);
        let hostname = urlObj.hostname.replace(/^www\./, '');

        // Filter out common non-competitor domains
        const blacklist = ['google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'linkedin.com',
                          'wikipedia.org', 'medium.com', 'reddit.com', 'quora.com', 'forbes.com',
                          'techcrunch.com', 'capterra.com', 'g2.com', 'trustpilot.com', 'softwareadvice.com'];

        if (blacklist.some(blocked => hostname.includes(blocked))) {
          return null;
        }

        if (hostname.includes(domain.replace('www.', ''))) {
          return null;
        }

        return hostname;
      } catch {
        return null;
      }
    };

    // Execute searches in parallel
    const searchPromises = searchQueries.slice(0, 2).map(async (query) => {
      try {
        const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=15`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.organic_results) {
          data.organic_results.forEach((result: any) => {
            if (result.link && competitors.size < 15) {
              const cleanDomain = extractDomain(result.link);
              if (cleanDomain) {
                competitors.add(cleanDomain);
              }
            }
          });
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    });

    await Promise.all(searchPromises);

    // STRATEGY 3: If still not enough, use AI to suggest well-known competitors
    if (competitors.size < 5) {
      const fallbackPrompt = `List 7 well-known competitor domains (just domain names) for this business:
Industry: ${industryCategory}
Business: ${businessName || domain}
Description: ${description}

Return ONLY a JSON array of domain names like ["example1.com", "example2.com"]. No explanations.`;

      const fallbackResponse = await groq.chat.completions.create({
        messages: [{ role: 'user', content: fallbackPrompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 200,
      });

      try {
        const aiCompetitors = JSON.parse(fallbackResponse.choices[0]?.message?.content || '[]');
        aiCompetitors.forEach((comp: string) => {
          const cleaned = comp.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
          if (cleaned && !cleaned.includes(domain)) {
            competitors.add(cleaned);
          }
        });
      } catch (e) {
        // Parsing failed, skip
      }
    }

    const finalCompetitors = Array.from(competitors).slice(0, 7);

    return NextResponse.json({
      competitors: finalCompetitors,
      debug: {
        industry: industryCategory,
        totalFound: competitors.size,
      }
    });
  } catch (error: any) {
    console.error('Error generating competitors:', error);
    return NextResponse.json(
      { error: 'Failed to generate competitors', details: error.message },
      { status: 500 }
    );
  }
}
