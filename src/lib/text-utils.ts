/**
 * Converts text to Capitalized Case (First Letter of Each Word Capitalized)
 *
 * Examples:
 * - "how to make a landing page" → "How To Make A Landing Page"
 * - "BEST WEBSITE BUILDERS" → "Best Website Builders"
 * - "top 10 email tools: 2025 guide" → "Top 10 Email Tools: 2025 Guide"
 */
export function toCapitalizedCase(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Handle empty strings from multiple spaces
      if (!word) return word;

      // Capitalize the first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
