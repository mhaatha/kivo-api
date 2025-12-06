import { createOpenRouter } from '@openrouter/ai-sdk-provider';

/**
 * Centralized AI provider configuration
 * Requirements: 1.1, 1.2, 1.3
 */
export const aiConfig = {
  provider: 'openrouter',
  model: process.env.OPENROUTER_MODEL_NAME || 'anthropic/claude-sonnet-4.5',
  apiKey: process.env.OPENROUTER_API_KEY,
  maxSteps: 10,
  toolChoice: 'auto',
};

/**
 * Create and return configured OpenRouter provider instance
 * @returns {ReturnType<typeof createOpenRouter>} Configured OpenRouter provider
 */
export function createAIProvider() {
  return createOpenRouter({
    apiKey: aiConfig.apiKey,
  });
}

/**
 * Get the configured AI model for use with streamText
 * @returns {ReturnType<ReturnType<typeof createOpenRouter>>} Configured model instance
 */
export function getAIModel() {
  const provider = createAIProvider();
  return provider(aiConfig.model);
}
