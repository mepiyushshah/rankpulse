// Metadata extraction service for website scraping
// This service fetches website metadata for auto-filling business details

export type WebsiteMetadata = {
  title: string | null;
  description: string | null;
  language: string | null;
  favicon: string | null;
  error?: string;
};

export async function extractWebsiteMetadata(url: string): Promise<WebsiteMetadata> {
  try {
    // Call our API route to extract metadata (server-side to avoid CORS)
    const response = await fetch('/api/extract-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to extract metadata');
    }

    const data = await response.json();
    return data.metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      title: null,
      description: null,
      language: null,
      favicon: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
