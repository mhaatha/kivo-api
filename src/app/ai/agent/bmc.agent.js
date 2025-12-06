/**
 * BMC Agent Module
 * Agent-based implementation using AI SDK Experimental_Agent
 * @see https://ai-sdk.dev/docs/agents/building-agents
 */

import { streamText, convertToModelMessages, Experimental_Agent as Agent } from 'ai';
import { withSupermemory } from '@supermemory/tools/ai-sdk';
import { getAIModel, aiConfig } from '../../config/ai.config.js';
import { getTools } from '../tools/index.js';
import { buildDynamicPrompt } from '../prompts/bmc.prompts.js';
import * as chatService from '../../services/chat.service.js';

/**
 * Create BMC Agent instance using AI SDK Experimental_Agent
 * @param {Object} options - Agent options
 * @param {string} options.userId - User ID for tools context
 * @param {string} options.chatId - Chat ID for tools context
 * @param {string|null} options.bmcId - Optional BMC ID for context
 * @returns {Agent} - AI SDK Agent instance
 */
export function createBmcAgent({ userId, chatId, bmcId = null }) {
  const model = getAIModel();
  const tools = getTools(userId, chatId);
  const systemPrompt = buildDynamicPrompt({ bmcId });

  return new Agent({
    model,
    system: systemPrompt,
    tools,
    maxSteps: aiConfig.maxSteps,
    toolChoice: aiConfig.toolChoice,
  });
}

/**
 * Run BMC agent stream with persistence
 * Handles the full flow: load context -> run agent -> save results
 *
 * @param {Object} params - Agent parameters
 * @param {string} params.userId - User ID
 * @param {string} params.chatId - Chat ID
 * @param {Array} params.messages - Conversation messages in UI format
 * @param {boolean} params.isNewChat - Whether this is a new chat
 * @returns {Object} - streamText result
 */
export async function runBmcAgent({ userId, chatId, messages, isNewChat = false }) {
  // Load existing BMC context if chat exists
  let bmcId = null;
  if (!isNewChat) {
    const historyResult = await chatService.buildAIMessageHistory(chatId);
    bmcId = historyResult.detectedBmcId;
  }

  // Get model and tools directly (Agent stores config, not callable model)
  const model = getAIModel();
  const tools = getTools(userId, chatId);
  const systemPrompt = buildDynamicPrompt({ bmcId });

  console.log(`[BMC Agent] Starting stream for user: ${userId}`);
  console.log(`[BMC Agent] BMC context: ${bmcId || 'None'}`);
  console.log(`[BMC Agent] Messages count: ${messages.length}`);

  // Debug: log last few messages
  const lastMessages = messages.slice(-3);
  for (const msg of lastMessages) {
    const content =
      typeof msg.content === 'string'
        ? msg.content.substring(0, 50)
        : JSON.stringify(msg.content || msg.parts)?.substring(0, 50);
    console.log(`[BMC Agent] - ${msg.role}: ${content}...`);
  }

  // Wrap model with supermemory
  const wrappedModel = withSupermemory(model, userId, {
    apiKey: process.env.SUPERMEMORY_API_KEY,
  });

  // Run agent stream
  const result = streamText({
    model: wrappedModel,
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    tools,
    maxSteps: aiConfig.maxSteps,
    toolChoice: aiConfig.toolChoice,

    onError: (error) => {
      console.error(`[BMC Agent] Stream error:`, error);
    },

    onStepFinish: async (step) => {
      console.log(`[BMC Agent] Step finished - Reason: ${step.finishReason}`);

      if (step.toolCalls && step.toolCalls.length > 0) {
        console.log(`[BMC Agent] Tool calls: ${step.toolCalls.map((tc) => tc.toolName).join(', ')}`);
        for (const tc of step.toolCalls) {
          console.log(`[BMC Agent] Tool args for ${tc.toolName}:`, JSON.stringify(tc.args));
        }
      }

      if (step.toolResults && step.toolResults.length > 0) {
        console.log(`[BMC Agent] Tool results: ${step.toolResults.length}`);
        for (const tr of step.toolResults) {
          const resultStr = tr.result ? JSON.stringify(tr.result).substring(0, 100) : 'undefined';
          console.log(`[BMC Agent] - ${tr.toolName || 'unknown'}: ${resultStr}`);
          if (tr.result?.bmcId) {
            console.log(`[BMC Agent] BMC created: ${tr.result.bmcId}`);
          }
        }
      }
    },

    onFinish: async ({ text, steps }) => {
      console.log(`[BMC Agent] Stream finished - Steps: ${steps.length}`);

      // Save all tool interactions to database
      for (const step of steps) {
        if (step.toolCalls && step.toolCalls.length > 0) {
          // Save assistant message with tool calls
          await chatService.createMessage(
            chatId,
            'assistant',
            step.text || '',
            step.toolCalls.map((tc) => ({
              id: tc.toolCallId,
              type: 'function',
              function: {
                name: tc.toolName,
                arguments: JSON.stringify(tc.args),
              },
            })),
          );

          // Save tool results
          if (step.toolResults) {
            for (const tr of step.toolResults) {
              await chatService.createMessage(
                chatId,
                'tool',
                JSON.stringify(tr.result),
                null,
                tr.toolCallId,
              );
            }
          }
        }
      }

      // Save final text response
      if (text) {
        await chatService.createMessage(chatId, 'assistant', text);
        await chatService.touchChat(chatId);
        console.log(`[BMC Agent] Response saved. Length: ${text.length}`);
      }
    },
  });

  return result;
}
