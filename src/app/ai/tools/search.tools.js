/**
 * Search Tools Module
 * Tool definitions for web search AI operations
 */

import { z } from 'zod';
import axios from 'axios';

// Google Search Configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

// Zod schema for search query
const searchQuerySchema = z.object({
  query: z.string().min(3).describe('Search query - be specific for better results'),
});

/**
 * Perform web search using Google Custom Search API
 * @param {string} query - The search query
 * @returns {Promise<Object>} - Search results object
 */
async function performWebSearch(query) {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.log('[Search Tool] Google API not configured');
    return { status: 'error', message: 'Search not configured', results: [] };
  }
  
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`;
  try {
    console.log(`[Search Tool] 🔎 Searching: ${query}`);
    const response = await axios.get(url);
    const results = response.data.items
      ? response.data.items.slice(0, 4).map((item) => ({
          title: item.title,
          snippet: item.snippet,
          link: item.link,
        }))
      : [];
    return { status: 'success', query, results };
  } catch (error) {
    console.error('❌ Search API Error:', error.message);
    return { status: 'error', message: error.message, results: [] };
  }
}

/**
 * Create search tools
 * @returns {Object} - Object containing all search-related tools
 */
export function createSearchTools() {
  return {
    performWebSearch: {
      description: 'Search the web for market research, competitor analysis, industry data, or any factual information needed for BMC analysis.',
      parameters: searchQuerySchema,
      execute: async ({ query }) => {
        console.log(`[EXEC] ⚙️ performWebSearch: ${query}`);
        const result = await performWebSearch(query);
        console.log(`[EXEC] ⚙️ performWebSearch found ${result.results?.length || 0} results`);
        return result;
      },
    },
  };
}

// Export schema for testing
export { searchQuerySchema };
