/**
 * AI Tools Registry
 * Central registry for all AI tools
 */

import { createBmcTools } from './bmc.tools.js';

/**
 * Get all available tools for a user
 * @param {string} userId - The user ID for tool execution context
 * @param {string} chatId - The chat ID for tool execution context
 * @returns {Object} - Combined object of all available tools
 */
export function getTools(userId, chatId) {
  return createBmcTools(userId, chatId);
}

// Re-export tool creators for direct access if needed
export { createBmcTools } from './bmc.tools.js';
export { createSearchTools } from './search.tools.js';
