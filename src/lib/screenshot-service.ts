import { createClient } from '@/lib/supabase-server';

interface ScreenshotResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

interface CachedScreenshot {
  url: string;
  cached_at: string;
  image_url: string;
}

/**
 * Search for the official website URL of a tool/platform
 */
async function findOfficialWebsite(toolName: string): Promise<string | null> {
  try {
    // Try Google Custom Search API first if configured
    if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
      const searchQuery = `${toolName} official website`;
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&num=1`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const url = data.items[0].link;
        console.log(`Found URL for ${toolName}: ${url}`);
        return url;
      }
    }

    // Fallback: Try common patterns
    const cleanName = toolName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const commonUrls = [
      `https://${cleanName}.com`,
      `https://www.${cleanName}.com`,
      `https://${cleanName}.io`,
      `https://get${cleanName}.com`,
    ];

    for (const url of commonUrls) {
      try {
        const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
        if (response.ok) {
          console.log(`Found URL via pattern matching for ${toolName}: ${url}`);
          return url;
        }
      } catch {
        continue;
      }
    }

    console.log(`Could not find URL for ${toolName}`);
    return null;
  } catch (error) {
    console.error(`Error finding URL for ${toolName}:`, error);
    return null;
  }
}

/**
 * Check if we have a cached screenshot for this URL
 */
async function getCachedScreenshot(url: string): Promise<string | null> {
  try {
    const supabase = await createClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('screenshot_cache')
      .select('image_url, cached_at')
      .eq('url', url)
      .gte('cached_at', thirtyDaysAgo.toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    console.log(`Using cached screenshot for ${url}`);
    return data.image_url;
  } catch (error) {
    console.error('Error checking cache:', error);
    return null;
  }
}

/**
 * Save screenshot to cache
 */
async function cacheScreenshot(url: string, imageUrl: string): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase
      .from('screenshot_cache')
      .upsert({
        url,
        image_url: imageUrl,
        cached_at: new Date().toISOString(),
      }, {
        onConflict: 'url'
      });

    console.log(`Cached screenshot for ${url}`);
  } catch (error) {
    console.error('Error caching screenshot:', error);
  }
}

/**
 * Capture screenshot using ScreenshotOne API
 */
async function captureScreenshot(url: string): Promise<string | null> {
  try {
    const apiKey = process.env.SCREENSHOTONE_API_KEY;
    if (!apiKey) {
      console.error('ScreenshotOne API key not configured');
      return null;
    }

    // Build ScreenshotOne API URL
    const screenshotUrl = new URL('https://api.screenshotone.com/take');
    screenshotUrl.searchParams.set('access_key', apiKey);
    screenshotUrl.searchParams.set('url', url);
    screenshotUrl.searchParams.set('viewport_width', '1920');
    screenshotUrl.searchParams.set('viewport_height', '1080');
    screenshotUrl.searchParams.set('device_scale_factor', '1');
    screenshotUrl.searchParams.set('format', 'jpg');
    screenshotUrl.searchParams.set('image_quality', '80');
    screenshotUrl.searchParams.set('block_ads', 'true');
    screenshotUrl.searchParams.set('block_cookie_banners', 'true');
    screenshotUrl.searchParams.set('block_banners_by_heuristics', 'false');
    screenshotUrl.searchParams.set('block_trackers', 'true');
    screenshotUrl.searchParams.set('delay', '3');
    screenshotUrl.searchParams.set('timeout', '30');

    console.log(`Capturing screenshot for ${url}...`);

    // Fetch the screenshot
    const response = await fetch(screenshotUrl.toString());

    if (!response.ok) {
      console.error(`Screenshot API error: ${response.status} ${response.statusText}`);
      return null;
    }

    // Get the image as a buffer
    const imageBuffer = await response.arrayBuffer();

    // Upload to Supabase Storage
    const supabase = await createClient();
    const fileName = `${Date.now()}-${url.replace(/[^a-z0-9]/gi, '-')}.jpg`;
    const filePath = `screenshots/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(filePath, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '31536000', // 1 year
      });

    if (uploadError) {
      console.error('Error uploading screenshot:', uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('article-images')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log(`Screenshot captured and uploaded: ${publicUrl}`);

    return publicUrl;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return null;
  }
}

/**
 * Main function to get screenshot for a tool
 * Handles caching and fallback logic
 */
export async function getToolScreenshot(toolName: string): Promise<ScreenshotResult> {
  try {
    console.log(`Getting screenshot for: ${toolName}`);

    // Step 1: Find the official website URL
    const url = await findOfficialWebsite(toolName);
    if (!url) {
      return {
        success: false,
        error: 'Could not find official website URL',
      };
    }

    // Step 2: Check cache first (30-day cache)
    const cachedImage = await getCachedScreenshot(url);
    if (cachedImage) {
      return {
        success: true,
        imageUrl: cachedImage,
      };
    }

    // Step 3: Capture new screenshot
    const imageUrl = await captureScreenshot(url);
    if (!imageUrl) {
      return {
        success: false,
        error: 'Failed to capture screenshot',
      };
    }

    // Step 4: Cache the screenshot
    await cacheScreenshot(url, imageUrl);

    return {
      success: true,
      imageUrl,
    };
  } catch (error: any) {
    console.error(`Error getting screenshot for ${toolName}:`, error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Extract tool names from listicle content
 */
export function extractToolNames(content: string): string[] {
  const tools: string[] = [];

  // Match numbered headings like "## 1. Tool Name - Description"
  const regex = /^##\s+\d+\.\s+([^-\n]+)/gm;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const toolName = match[1].trim();
    tools.push(toolName);
  }

  console.log(`Extracted ${tools.length} tool names:`, tools);
  return tools;
}
