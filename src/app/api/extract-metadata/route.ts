import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Ensure URL has protocol
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    // Fetch website HTML from server-side (no CORS issues)
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RankPulse/1.0; +https://rankpulse.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();

    // Extract metadata and content using regex
    const metadata = {
      title: extractTitle(html),
      description: extractMetaDescription(html),
      language: extractLanguage(html),
      favicon: extractFavicon(html, normalizedUrl),
      content: extractMainContent(html), // Extract actual page content
    };

    return NextResponse.json({
      success: true,
      metadata,
    });
  } catch (error: any) {
    console.error('Error extracting metadata:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract metadata',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

function extractTitle(html: string): string | null {
  // Try to extract from <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();

  // Try og:title
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (ogTitleMatch) return ogTitleMatch[1].trim();

  return null;
}

function extractMetaDescription(html: string): string | null {
  // Try standard meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) return descMatch[1].trim();

  // Try og:description
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  if (ogDescMatch) return ogDescMatch[1].trim();

  return null;
}

function extractLanguage(html: string): string | null {
  // Try html lang attribute
  const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  if (langMatch) {
    // Convert full locale to language code (e.g., en-US -> en)
    return langMatch[1].split('-')[0].toLowerCase();
  }

  // Try meta content-language
  const metaLangMatch = html.match(/<meta[^>]*http-equiv=["']content-language["'][^>]*content=["']([^"']+)["']/i);
  if (metaLangMatch) {
    return metaLangMatch[1].split('-')[0].toLowerCase();
  }

  return 'en'; // Default to English
}

function extractFavicon(html: string, baseUrl: string): string | null {
  // Try to find favicon link
  const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
  if (faviconMatch) {
    const href = faviconMatch[1];
    // Handle relative URLs
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return `https:${href}`;
    if (href.startsWith('/')) {
      const urlObj = new URL(baseUrl);
      return `${urlObj.origin}${href}`;
    }
    return `${baseUrl}/${href}`;
  }

  // Default favicon location
  try {
    const urlObj = new URL(baseUrl);
    return `${urlObj.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

function extractMainContent(html: string): string {
  // Remove script and style tags
  let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  content = content.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

  // Extract text from common content areas
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    content = bodyMatch[1];
  }

  // Remove HTML tags
  content = content.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  content = content
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean up whitespace
  content = content
    .replace(/\s+/g, ' ')
    .trim();

  // Limit to first 2000 characters for AI context
  return content.substring(0, 2000);
}
