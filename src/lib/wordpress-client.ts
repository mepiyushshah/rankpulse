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
   * Create a new post on WordPress
   */
  async createPost(post: WordPressPost): Promise<WordPressResponse> {
    try {
      console.log(`Creating WordPress post: ${post.title}`);

      const result = await this.request('/posts', {
        method: 'POST',
        body: JSON.stringify(post),
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

      const result = await this.request(`/posts/${postId}`, {
        method: 'POST',
        body: JSON.stringify(post),
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
        body: file,
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
