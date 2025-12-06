/**
 * AI Tools Registry
 * Central registry for all AI tools with logging and execution
 */

import { createBmcTools } from './bmc.tools.js';
import { createSearchTools } from './search.tools.js';

/**
 * Get all available tools for a user
 * @param {string} userId - The user ID for tool execution context
 * @returns {Object} - Combined object of all available tools
 */
export function getTools(userId) {
  const bmcTools = createBmcTools(userId);
  const searchTools = createSearchTools();
  
  return {
    ...bmcTools,
    ...searchTools,
  };
}

/**
 * Execute a tool by name with logging
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Arguments to pass to the tool
 * @param {string} userId - The user ID for tool execution context
 * @returns {Promise<Object>} - Tool execution result
 */
export async function executeTool(toolName, args, userId) {
  const startTime = Date.now();
  console.log(`[TOOL] ▶️ Executing: ${toolName}`);
  console.log(`[TOOL] 📥 Args:`, JSON.stringify(args));
  
  try {
    const tools = getTools(userId);
    const tool = tools[toolName];
    
    if (!tool) {
      const error = `Tool "${toolName}" not found`;
      console.error(`[TOOL] ❌ ${error}`);
      return { status: 'error', message: error };
    }
    
    const result = await tool.execute(args);
    const duration = Date.now() - startTime;
    
    console.log(`[TOOL] ✅ ${toolName} completed in ${duration}ms`);
    console.log(`[TOOL] 📤 Result:`, JSON.stringify(result));
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[TOOL] ❌ ${toolName} failed after ${duration}ms:`, error.message);
    return { status: 'error', message: error.message };
  }
}

// Re-export tool creators for direct access if needed
export { createBmcTools } from './bmc.tools.js';
export { createSearchTools } from './search.tools.js';
