/**
 * YouTube Video Search and Embedding Service
 * Automatically finds and embeds relevant YouTube videos
 */

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

interface YouTubeSearchResult {
  success: boolean;
  video?: YouTubeVideo;
  embedCode?: string;
  error?: string;
}

/**
 * Search for the most relevant YouTube video
 */
export async function findRelevantVideo(
  keyword: string,
  articleContent: string
): Promise<YouTubeSearchResult> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      console.log('YouTube API key not configured, skipping video search');
      return {
        success: false,
        error: 'YouTube API key not configured',
      };
    }

    // Build search query from keyword
    const searchQuery = encodeURIComponent(keyword);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&videoDuration=medium&videoEmbeddable=true&maxResults=5&order=relevance&key=${apiKey}`;

    console.log(`Searching YouTube for: ${keyword}`);

    const response = await fetch(searchUrl);

    if (!response.ok) {
      console.error(`YouTube API error: ${response.status}`);
      return {
        success: false,
        error: `YouTube API returned ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log('No YouTube videos found');
      return {
        success: false,
        error: 'No videos found',
      };
    }

    // Get the first result (most relevant)
    const item = data.items[0];
    const video: YouTubeVideo = {
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    };

    // Use WordPress oEmbed URL format instead of iframe
    // WordPress automatically converts YouTube URLs to embeds
    // This avoids HTML attribute encoding issues
    const embedCode = `https://www.youtube.com/watch?v=${video.videoId}`;

    console.log(`Found video: ${video.title} by ${video.channelTitle}`);

    return {
      success: true,
      video,
      embedCode,
    };
  } catch (error: any) {
    console.error('Error searching YouTube:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Find the best position to insert video in the article
 * Returns the position index where video should be inserted
 */
export function findVideoInsertionPoint(content: string): number {
  // Split content into sections
  const sections = content.split(/\n## /);

  // Find the first major section (after introduction)
  // Usually after the first H2 heading
  if (sections.length > 1) {
    // Insert after first section (introduction + first H2)
    const firstSectionEnd = content.indexOf('\n## ', content.indexOf('\n## ') + 1);
    if (firstSectionEnd !== -1) {
      return firstSectionEnd;
    }
  }

  // Fallback: Insert after first paragraph
  const firstParagraphEnd = content.indexOf('\n\n');
  return firstParagraphEnd !== -1 ? firstParagraphEnd + 2 : 0;
}

/**
 * Insert YouTube video into article content at the best position
 */
export function embedVideoInContent(
  content: string,
  embedCode: string,
  videoTitle: string
): string {
  const insertPosition = findVideoInsertionPoint(content);

  // Sanitize video title for safe embedding
  const safeTitle = videoTitle
    .replace(/[<>"]/g, '') // Remove HTML characters
    .replace(/&quot;/g, '')
    .replace(/&#39;/g, '')
    .trim();

  // Create markdown-friendly video section with WordPress oEmbed URL
  // WordPress automatically converts YouTube URLs to embeds
  const videoSection = `

## 📺 Watch: ${safeTitle}

${embedCode}

`;

  // Insert video into content
  return (
    content.slice(0, insertPosition) +
    videoSection +
    content.slice(insertPosition)
  );
}
