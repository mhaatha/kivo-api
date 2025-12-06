/**
 * AI Service Module
 * Re-exports from modular AI components for backward compatibility
 * 
 * NOTE: This file is kept for backward compatibility.
 * Prefer importing directly from:
 * - '../ai/agent/bmc.agent.js' for agent
 * - '../ai/prompts/bmc.prompts.js' for prompts
 * - '../ai/tools/index.js' for tools
 */

// Re-export agent
export { createBmcAgent, runBmcAgent } from '../ai/agent/bmc.agent.js';

// Re-export prompts
export { BMC_SYSTEM_PROMPT, buildDynamicPrompt } from '../ai/prompts/bmc.prompts.js';

// Re-export tools registry
export { getTools } from '../ai/tools/index.js';
