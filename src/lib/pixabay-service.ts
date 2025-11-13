/**
 * Pixabay Image Service
 * Fetches high-quality, free-to-use images for articles
 */

const PIXABAY_API_KEY = '53230868-998e3a49cbb6f8192d17510a4';
const PIXABAY_API_URL = 'https://pixabay.com/api/';

export interface PixabayImage {
  id: number;
  pageURL: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  tags: string;
  user: string;
}

export interface ImageSearchResult {
  success: boolean;
  imageUrl?: string;
  imageId?: string;
  altText?: string;
  error?: string;
  tags?: string;
}

/**
 * Search for images on Pixabay
 */
export async function searchPixabayImages(
  query: string,
  perPage: number = 20
): Promise<PixabayImage[]> {
  try {
    const params = new URLSearchParams({
      key: PIXABAY_API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal', // Only landscape/rectangle images
      per_page: perPage.toString(),
      min_width: '1200', // Minimum width for quality
      safesearch: 'true', // Family-friendly content
    });

    const response = await fetch(`${PIXABAY_API_URL}?${params}`);

    if (!response.ok) {
      console.error('Pixabay API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return data.hits || [];
  } catch (error) {
    console.error('Error fetching from Pixabay:', error);
    return [];
  }
}

/**
 * Check if image is relevant to the search query
 */
function isImageRelevant(image: PixabayImage, searchQuery: string): boolean {
  const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const imageTags = image.tags.toLowerCase();

  // Check if at least 1 query word appears in image tags
  const matches = queryWords.filter(word => imageTags.includes(word));

  // Consider relevant if at least 1 word matches
  // This prevents completely unrelated images like "car" in "yoga" articles
  return matches.length >= 1;
}

/**
 * Get a unique image that hasn't been used in this project
 */
export async function getUniqueImage(
  query: string,
  projectId: string,
  usedImageUrls: Set<string>
): Promise<ImageSearchResult> {
  try {
    // Clean up query for better results
    const cleanQuery = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log(`🖼️  Searching Pixabay for: "${cleanQuery}"`);

    // Fetch images from Pixabay
    const images = await searchPixabayImages(cleanQuery, 20);

    if (images.length === 0) {
      console.log(`⚠️  No images found for query: "${cleanQuery}"`);
      return {
        success: false,
        error: 'No images found',
      };
    }

    // Filter out already-used images AND irrelevant images
    const availableImages = images.filter(
      (img) => !usedImageUrls.has(img.largeImageURL) && isImageRelevant(img, cleanQuery)
    );

    console.log(`📊 Found ${images.length} images, ${availableImages.length} are unused & relevant`);

    if (availableImages.length === 0) {
      console.log(`⚠️  No relevant unused images found for: "${cleanQuery}"`);
      // Try with just relevance filter (ignore used status)
      const relevantImages = images.filter(img => isImageRelevant(img, cleanQuery));
      if (relevantImages.length > 0) {
        const selectedImage = relevantImages[0];
        const altText = selectedImage.tags
          .split(',')
          .slice(0, 3)
          .map((tag) => tag.trim())
          .join(', ');

        console.log(`✅ Selected relevant image (may be reused): ${selectedImage.id}`);

        return {
          success: true,
          imageUrl: selectedImage.largeImageURL,
          imageId: selectedImage.id.toString(),
          altText: altText || cleanQuery,
          tags: selectedImage.tags,
        };
      }

      return {
        success: false,
        error: 'No relevant images found',
      };
    }

    // Select best available image
    const selectedImage = availableImages[0];

    // Generate alt text from tags
    const altText = selectedImage.tags
      .split(',')
      .slice(0, 3)
      .map((tag) => tag.trim())
      .join(', ');

    console.log(`✅ Selected image: ${selectedImage.id} (tags: ${selectedImage.tags.substring(0, 50)}...)`);

    return {
      success: true,
      imageUrl: selectedImage.largeImageURL,
      imageId: selectedImage.id.toString(),
      altText: altText || cleanQuery,
      tags: selectedImage.tags,
    };
  } catch (error) {
    console.error('Error in getUniqueImage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate smart search queries based on article context
 * IMPROVED: Always combines main keyword with section to maintain relevance
 * Extracts more meaningful words for variety
 */
export function generateImageSearchQuery(
  mainKeyword: string,
  sectionHeading?: string,
  contextWords?: string[]
): string {
  // Extract core topic from main keyword (first 2-3 words)
  const keywordParts = mainKeyword.toLowerCase().split(/\s+/);
  const coreKeyword = keywordParts.slice(0, Math.min(3, keywordParts.length)).join(' ');

  // If we have a section heading, combine it with core keyword for better relevance
  if (sectionHeading) {
    // Remove numbers, special chars from heading
    const cleanHeading = sectionHeading
      .replace(/^#+\s*/, '') // Remove markdown heading markers
      .replace(/^\d+\.\s*/, '') // Remove list numbers
      .replace(/[^\w\s]/g, ' ')
      .toLowerCase()
      .trim();

    // Extract meaningful words from heading (skip common words)
    const skipWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'how', 'what', 'why', 'when', 'where', 'can', 'will', 'your', 'this', 'that']);
    const headingWords = cleanHeading
      .split(/\s+/)
      .filter(word => word.length > 3 && !skipWords.has(word)); // Increased from 2 to 3, and get ALL meaningful words

    if (headingWords.length > 0) {
      // Combine core keyword + ALL meaningful heading words for better context & variety
      // Example: "yoga" + "specific needs flexibility" = "yoga specific needs flexibility"
      // This creates more unique queries per section
      return `${coreKeyword} ${headingWords.slice(0, 3).join(' ')}`;
    }
  }

  // Fallback: use main keyword only
  return coreKeyword;
}

/**
 * Insert images into article content at strategic positions
 */
export async function addImagesToArticle(
  content: string,
  mainKeyword: string,
  projectId: string,
  articleId: string,
  usedImageUrls: Set<string>,
  supabase: any
): Promise<{ content: string; imagesAdded: number }> {
  try {
    // Calculate how many images to add based on word count
    const wordCount = content.split(/\s+/).length;
    const targetImageCount = Math.min(
      Math.max(2, Math.floor(wordCount / 800)), // Min 2, 1 per 800 words
      4 // Max 4
    );

    console.log(`📝 Article word count: ${wordCount}, target images: ${targetImageCount}`);

    // Split content into sections by H2 headings
    const sections = content.split(/(?=^## )/gm);

    if (sections.length < 2) {
      console.log('⚠️  Article has no H2 sections, skipping image insertion');
      return { content, imagesAdded: 0 };
    }

    let modifiedContent = content;
    let imagesAdded = 0;
    const newImageUrls: { url: string; id: string; query: string }[] = [];
    const usedQueriesInArticle = new Set<string>(); // Track queries used in THIS article

    // Strategy: Insert images at evenly distributed positions
    const positions = calculateImagePositions(sections.length, targetImageCount);

    for (const position of positions) {
      if (position >= sections.length) continue;

      // Generate search query based on section
      const sectionHeading = sections[position].split('\n')[0];
      let searchQuery = generateImageSearchQuery(mainKeyword, sectionHeading);

      // If this query was already used in this article, try to make it more unique
      let attempt = 0;
      while (usedQueriesInArticle.has(searchQuery) && attempt < 3) {
        // Add variation to the query
        const variations = ['pose', 'practice', 'class', 'studio', 'meditation', 'breathing'];
        const variation = variations[attempt % variations.length];
        searchQuery = `${searchQuery} ${variation}`;
        attempt++;
      }

      console.log(`🔍 Search query for position ${position}: "${searchQuery}"`);

      // Track this query to avoid repeating it in this article
      usedQueriesInArticle.add(searchQuery);

      // Get unique image (pass the image ID from previous iteration to exclude it)
      const imageResult = await getUniqueImage(searchQuery, projectId, usedImageUrls);

      if (imageResult.success && imageResult.imageUrl) {
        // CRITICAL: Check if this image was already used in THIS article
        if (newImageUrls.some(img => img.url === imageResult.imageUrl)) {
          console.log(`⚠️  Image ${imageResult.imageId} already used in this article, skipping this position`);
          continue; // Skip this position and don't add duplicate
        }

        // Add to used set to prevent duplicates within this article AND across articles
        usedImageUrls.add(imageResult.imageUrl);

        // Create image markdown
        const imageMarkdown = `\n\n![${imageResult.altText}](${imageResult.imageUrl})\n\n`;

        // Find the position to insert (after first paragraph of section)
        const sectionContent = sections[position];
        const paragraphs = sectionContent.split('\n\n');

        if (paragraphs.length > 1) {
          // Insert after first paragraph of section
          paragraphs.splice(1, 0, imageMarkdown.trim());
          sections[position] = paragraphs.join('\n\n');
        } else {
          // If only heading, insert after heading
          sections[position] = sectionContent + imageMarkdown;
        }

        imagesAdded++;

        // Track for database insert
        newImageUrls.push({
          url: imageResult.imageUrl,
          id: imageResult.imageId!,
          query: searchQuery,
        });

        console.log(`✅ Image ${imagesAdded}/${targetImageCount} added to section ${position}`);
      }
    }

    // Reconstruct content
    modifiedContent = sections.join('');

    // Save used images to database
    if (newImageUrls.length > 0) {
      const imagesToInsert = newImageUrls.map((img) => ({
        project_id: projectId,
        article_id: articleId,
        image_url: img.url,
        image_id: img.id,
        search_query: img.query,
        orientation: 'horizontal',
      }));

      const { error } = await supabase
        .from('used_images')
        .insert(imagesToInsert);

      if (error) {
        console.error('Error saving used images to database:', error);
      } else {
        console.log(`💾 Saved ${imagesToInsert.length} images to database`);
      }
    }

    console.log(`🎉 Successfully added ${imagesAdded} images to article`);

    return {
      content: modifiedContent,
      imagesAdded,
    };
  } catch (error) {
    console.error('Error adding images to article:', error);
    return { content, imagesAdded: 0 };
  }
}

/**
 * Calculate evenly distributed positions for images
 */
function calculateImagePositions(totalSections: number, imageCount: number): number[] {
  const positions: number[] = [];

  if (imageCount === 1) {
    // Single image: put in middle
    positions.push(Math.floor(totalSections / 2));
  } else if (imageCount === 2) {
    // Two images: 1/3 and 2/3 through
    positions.push(Math.floor(totalSections / 3));
    positions.push(Math.floor((2 * totalSections) / 3));
  } else {
    // Multiple images: distribute evenly
    const step = Math.floor(totalSections / (imageCount + 1));
    for (let i = 1; i <= imageCount; i++) {
      positions.push(i * step);
    }
  }

  return positions.filter((pos) => pos > 0 && pos < totalSections);
}
