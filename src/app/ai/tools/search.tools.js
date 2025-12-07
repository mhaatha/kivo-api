/**
 * Search Tools Module (Stabilized)
 * Uses AI-driven Deep Knowledge Retrieval with Concurrency Handling
 */

import { z } from 'zod';
import { generateText } from 'ai'; 
import { getAIModel } from '../../config/ai.config.js';

const searchQuerySchema = z.object({
  query: z.string().min(3).describe('Search query - focus on trends, regulations, or statistics'),
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function performWebSearch(query) {
  // Jitter untuk menghindari rate limit internal
  const waitTime = Math.floor(Math.random() * 1500) + 500;
  await delay(waitTime);

  console.log(`[Search Tool] 🧠 Deep Researching: "${query}"`);

  const maxRetries = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const { text } = await generateText({
        model: getAIModel(),
        prompt: `
          You are a Market Intelligence Analyst.
          User Query: "${query}"
          
          TASK:
          Provide 3-4 HIGH QUALITY factual search results based on your knowledge base.
          **PRIORITY:** Look for Hard Data, Statistics, Specific Law/Regulation Numbers (e.g., UU No. X, PMK No. Y), and Competitor Prices.
          
          OUTPUT FORMAT (Strict JSON Array):
          [
            {
              "title": "Title with Year/Data source",
              "snippet": "Contains specific numbers, percentages, or law articles...",
              "link": "Source Name / URL Simulation"
            }
          ]
          
          IMPORTANT: Return ONLY the JSON Array. No markdown formatting.
        `,
      });

      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      let results = [];
      
      try {
        results = JSON.parse(cleanJson);
      } catch (parseError) {
        console.warn(`[Search Tool] JSON Parse Warning, falling back to text.`);
        results = [{
            title: `Insight for: ${query}`,
            snippet: text.substring(0, 300),
            link: "AI Knowledge Base"
        }];
      }

      console.log(`[Search Tool] ✅ Found ${results.length} insights`);
      
      return { 
        status: 'success', 
        query, 
        results,
        source: 'internal_knowledge_base' 
      };

    } catch (error) {
      console.warn(`[Search Tool] ⚠️ Attempt ${attempt} failed: ${error.message}`);
      lastError = error;
      if (attempt <= maxRetries) await delay(1000 * attempt);
    }
  }

  console.error('❌ Search Simulation Exhausted');
  return { 
    status: 'partial_error', 
    message: 'Research data temporarily unavailable.',
    results: [{ title: "System Info", snippet: "Proceeding with general strategic analysis.", link: "system" }] 
  };
}

export function createSearchTools() {
  return {
    performWebSearch: {
      description: 'Melakukan riset mendalam untuk mencari Fakta Pasar, Regulasi, Harga Kompetitor, atau Statistik Tren.',
      parameters: searchQuerySchema,
      execute: async ({ query }) => {
        console.log(`[EXEC] ⚙️ performWebSearch called for: ${query}`);
        return await performWebSearch(query);
      },
    },
  };
}

export { searchQuerySchema };