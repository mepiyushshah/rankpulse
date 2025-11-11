interface WordPressConfig {
  apiUrl: string;
  username: string;
  applicationPassword: string;
}

interface WordPressPost {
  title: string;
  content: string;
  excerpt?: string;
  status?: 'draft' | 'publish' | 'future';
  slug?: string;
  date?: string;
  categories?: number[];
  tags?: number[];
  meta?: Record<string, any>;
  featured_media?: number;
}

interface WordPressResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode?: number;
}

interface MediaUploadResult {
  success: boolean;
  mediaId?: number;
  url?: string;
  error?: string;
}

/**
 * WordPress REST API client
 * Handles authentication and API calls to WordPress sites
 */
export class WordPressClient {
  private config: WordPressConfig;
  private authHeader: string;

  constructor(config: WordPressConfig) {
    this.config = config;
    // Create Basic Auth header
    const credentials = `${config.username}:${config.applicationPassword}`;
    this.authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  /**
   * Make authenticated request to WordPress REST API
   */
  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<WordPressResponse> {
    try {
      const url = `${this.config.apiUrl}/wp-json/wp/v2${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`WordPress API error: ${response.status}`, data);
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        };
      }

      return {
        success: true,
        data,
        statusCode: response.status,
      };
    } catch (error: any) {
      console.error('WordPress API request failed:', error);
      return {
        success: false,
        error: error.message || 'Network request failed',
      };
    }
  }

  /**
   * Test connection to WordPress site
   * Verifies credentials and API accessibility
   */
  async testConnection(): Promise<WordPressResponse> {
    try {
      console.log(`Testing WordPress connection to ${this.config.apiUrl}...`);

      // Try to fetch current user info - good test of authentication
      const result = await this.request('/users/me');

      if (result.success) {
        console.log('WordPress connection successful:', result.data?.name);
        return {
          success: true,
          data: {
            siteUrl: this.config.apiUrl,
            userName: result.data?.name,
            userEmail: result.data?.email,
          },
        };
      }

      return result;
    } catch (error: any) {
      console.error('WordPress connection test failed:', error);
      return {
        success: false,
        error: error.message || 'Connection test failed',
      };
    }
  }

  /**
   * Aggressively clean content for WordPress compatibility
   * Works with any WordPress database configuration (utf8 or utf8mb4)
   */
  private sanitizeContent(content: string): string {
    let sanitized = content;

    // Step 1: Decode ALL HTML entities using browser-like decoding
    const textarea = { value: '' };
    try {
      // Simple regex-based entity decoder that handles all cases
      sanitized = sanitized.replace(/&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-fA-F]{1,6});/gi, (match) => {
        // Common entities
        const entities: { [key: string]: string } = {
          'quot': '"', 'apos': "'", 'amp': '&', 'lt': '<', 'gt': '>',
          'nbsp': ' ', 'ndash': '-', 'mdash': '-', 'hellip': '...',
          'lsquo': "'", 'rsquo': "'", 'ldquo': '"', 'rdquo': '"'
        };

        const name = match.slice(1, -1);
        if (entities[name]) return entities[name];

        // Numeric entities like &#39;
        if (name[0] === '#') {
          const code = name[1] === 'x'
            ? parseInt(name.slice(2), 16)
            : parseInt(name.slice(1), 10);

          // Only decode basic ASCII range to avoid charset issues
          if (code > 0 && code < 128) {
            return String.fromCharCode(code);
          }
        }

        // Leave it as-is if we can't decode safely
        return match;
      });
    } catch (e) {
      console.warn('Entity decoding failed, continuing with raw content');
    }

    // Step 2: Remove or replace ALL problematic characters
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove control characters but preserve newlines, carriage returns, and tabs
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

    // Replace smart quotes with straight quotes
    sanitized = sanitized.replace(/[\u2018\u2019]/g, "'");
    sanitized = sanitized.replace(/[\u201C\u201D]/g, '"');

    // Replace dashes
    sanitized = sanitized.replace(/[\u2013\u2014]/g, '-');

    // Replace ellipsis
    sanitized = sanitized.replace(/\u2026/g, '...');

    // Remove zero-width characters
    sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // Step 3: For maximum compatibility, convert problematic non-ASCII to ASCII equivalents
    // But PRESERVE HTML structure (tags, attributes, etc.)
    // This regex preserves printable ASCII (0x20-0x7E) plus newlines, tabs
    sanitized = sanitized.replace(/[^\x20-\x7E\n\r\t]/g, '');

    // Step 4: Clean up any resulting double spaces or weird spacing
    sanitized = sanitized.replace(/  +/g, ' ');

    // Step 5: Size limit
    const maxLength = 1024 * 1024; // 1MB
    if (sanitized.length > maxLength) {
      console.warn(`Content length (${sanitized.length}) exceeds safe limit. Truncating...`);
      sanitized = sanitized.substring(0, maxLength);
    }

    // Debug: Check if we still have entities
    const hasEntities = sanitized.match(/&#?\w+;/);
    if (hasEntities) {
      console.warn('Warning: Content still contains HTML entities after sanitization:', hasEntities.slice(0, 5));
    }

    console.log('Content sanitized for WordPress compatibility');
    return sanitized;
  }

  /**
   * Create a new post on WordPress
   */
  async createPost(post: WordPressPost): Promise<WordPressResponse> {
    try {
      console.log(`Creating WordPress post: ${post.title}`);

      // Sanitize content before sending
      const sanitizedPost = {
        ...post,
        content: this.sanitizeContent(post.content),
        title: post.title?.substring(0, 1000) || '', // WordPress title limit
        excerpt: post.excerpt?.substring(0, 5000) || '', // Reasonable excerpt limit
      };

      // Log content size for debugging
      console.log(`Content size: ${sanitizedPost.content.length} characters`);

      const result = await this.request('/posts', {
        method: 'POST',
        body: JSON.stringify(sanitizedPost),
      });

      if (result.success) {
        console.log(`WordPress post created successfully: ${result.data?.id}`);
      }

      return result;
    } catch (error: any) {
      console.error('Failed to create WordPress post:', error);
      return {
        success: false,
        error: error.message || 'Failed to create post',
      };
    }
  }

  /**
   * Update an existing post on WordPress
   */
  async updatePost(postId: number, post: Partial<WordPressPost>): Promise<WordPressResponse> {
    try {
      console.log(`Updating WordPress post: ${postId}`);

      // Sanitize content if provided
      const sanitizedPost: Partial<WordPressPost> = { ...post };
      if (post.content) {
        sanitizedPost.content = this.sanitizeContent(post.content);
      }
      if (post.title) {
        sanitizedPost.title = post.title.substring(0, 1000);
      }
      if (post.excerpt) {
        sanitizedPost.excerpt = post.excerpt.substring(0, 5000);
      }

      const result = await this.request(`/posts/${postId}`, {
        method: 'POST',
        body: JSON.stringify(sanitizedPost),
      });

      if (result.success) {
        console.log(`WordPress post updated successfully: ${postId}`);
      }

      return result;
    } catch (error: any) {
      console.error('Failed to update WordPress post:', error);
      return {
        success: false,
        error: error.message || 'Failed to update post',
      };
    }
  }

  /**
   * Delete a post from WordPress
   */
  async deletePost(postId: number): Promise<WordPressResponse> {
    try {
      console.log(`Deleting WordPress post: ${postId}`);

      const result = await this.request(`/posts/${postId}`, {
        method: 'DELETE',
      });

      if (result.success) {
        console.log(`WordPress post deleted successfully: ${postId}`);
      }

      return result;
    } catch (error: any) {
      console.error('Failed to delete WordPress post:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete post',
      };
    }
  }

  /**
   * Get all categories from WordPress
   */
  async getCategories(): Promise<WordPressResponse> {
    try {
      const result = await this.request('/categories?per_page=100');
      return result;
    } catch (error: any) {
      console.error('Failed to fetch WordPress categories:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch categories',
      };
    }
  }

  /**
   * Get all tags from WordPress
   */
  async getTags(): Promise<WordPressResponse> {
    try {
      const result = await this.request('/tags?per_page=100');
      return result;
    } catch (error: any) {
      console.error('Failed to fetch WordPress tags:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch tags',
      };
    }
  }

  /**
   * Upload media to WordPress
   */
  async uploadMedia(
    file: Buffer,
    filename: string,
    mimeType: string
  ): Promise<MediaUploadResult> {
    try {
      console.log(`Uploading media to WordPress: ${filename}`);

      const url = `${this.config.apiUrl}/wp-json/wp/v2/media`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.authHeader,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Type': mimeType,
        },
        body: file as any,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('WordPress media upload error:', data);
        return {
          success: false,
          error: data.message || `Upload failed: ${response.statusText}`,
        };
      }

      console.log(`Media uploaded successfully: ${data.id}`);
      return {
        success: true,
        mediaId: data.id,
        url: data.source_url,
      };
    } catch (error: any) {
      console.error('Failed to upload media to WordPress:', error);
      return {
        success: false,
        error: error.message || 'Media upload failed',
      };
    }
  }

  /**
   * Process HTML content and upload embedded images to WordPress
   * Returns updated HTML with WordPress image URLs
   */
  async processContentImages(htmlContent: string): Promise<string> {
    try {
      // Extract all image URLs from HTML
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      const matches = [...htmlContent.matchAll(imgRegex)];

      if (matches.length === 0) {
        return htmlContent;
      }

      console.log(`Found ${matches.length} images to process`);
      let updatedContent = htmlContent;
      const imageUrlMap = new Map<string, string>();

      for (const match of matches) {
        const originalUrl = match[1];

        // Skip if already processed or is a WordPress URL
        if (imageUrlMap.has(originalUrl) || originalUrl.includes(this.config.apiUrl)) {
          continue;
        }

        try {
          // Download the image
          const imageResponse = await fetch(originalUrl);
          if (!imageResponse.ok) {
            console.warn(`Failed to download image: ${originalUrl}`);
            continue;
          }

          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

          // Generate filename from URL or use timestamp
          const urlParts = originalUrl.split('/');
          const originalFilename = urlParts[urlParts.length - 1].split('?')[0] || `image-${Date.now()}.jpg`;

          // Upload to WordPress
          const uploadResult = await this.uploadMedia(imageBuffer, originalFilename, contentType);

          if (uploadResult.success && uploadResult.url) {
            imageUrlMap.set(originalUrl, uploadResult.url);
            console.log(`Image uploaded: ${originalUrl} → ${uploadResult.url}`);
          }
        } catch (error) {
          console.error(`Error processing image ${originalUrl}:`, error);
          // Continue with other images even if one fails
        }
      }

      // Replace all image URLs in content
      for (const [originalUrl, newUrl] of imageUrlMap) {
        updatedContent = updatedContent.replace(new RegExp(originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
      }

      console.log(`Processed ${imageUrlMap.size} images successfully`);
      return updatedContent;
    } catch (error: any) {
      console.error('Error processing content images:', error);
      // Return original content if processing fails
      return htmlContent;
    }
  }
}

/**
 * Factory function to create WordPress client from database config
 */
export function createWordPressClient(integration: {
  api_url: string;
  api_key: string;
  api_secret?: string | null;
}): WordPressClient {
  return new WordPressClient({
    apiUrl: integration.api_url,
    username: integration.api_key, // Username stored in api_key
    applicationPassword: integration.api_secret || '', // App password in api_secret
  });
}
