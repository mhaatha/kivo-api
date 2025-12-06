# Implementation Plan

- [ ] 1. Setup AI config module
  - [x] 1.1 Create `src/app/config/ai.config.js` with centralized provider configuration
    - Export `aiConfig` object with provider, model, apiKey, maxSteps, toolChoice
    - Export `createAIProvider()` function that returns configured OpenRouter provider
    - Remove provider configuration from controller and service files
    - _Requirements: 1.1, 1.2, 1.3_
  - [ ]* 1.2 Write unit tests for AI config module
    - Test that config exports expected properties
    - Test that createAIProvider returns valid provider instance
    - _Requirements: 1.1_

- [-] 2. Create BMC utils module
  - [x] 2.1 Create `src/app/utils/bmc.utils.js` with tag normalization helpers
    - Export `VALID_BMC_TAGS` array
    - Export `normalizeTag(tag)` function for snake_case conversion
    - Export `normalizeBmcData(bmcData)` function for array normalization
    - Export `validateBmcData(bmcData)` function for data validation
    - _Requirements: 6.2, 6.3_
  - [ ]* 2.2 Write property test for tag normalization idempotence
    - **Property 5: Tag normalization idempotence**
    - **Validates: Requirements 6.3**
  - [ ]* 2.3 Write property test for tag normalization to snake_case
    - **Property 6: Tag normalization to snake_case**
    - **Validates: Requirements 6.3**
  - [ ]* 2.4 Write property test for BMC data validation
    - **Property 4: BMC data validation correctness**
    - **Validates: Requirements 6.2**

- [x] 3. Create AI prompts module
  - [x] 3.1 Create `src/app/ai/prompts/bmc.prompts.js` with system prompts
    - Move `BMC_SYSTEM_PROMPT` from ai.service.js
    - Export `buildDynamicPrompt(context)` function that adds BMC ID context
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ]* 3.2 Write property test for dynamic prompt builder
    - **Property 2: Dynamic prompt contains BMC ID**
    - **Validates: Requirements 3.3**

- [x] 4. Create AI tools modules
  - [x] 4.1 Create `src/app/ai/tools/bmc.tools.js` with BMC tool definitions
    - Export `createBmcTools(userId)` function returning getUserCoordinates, postBmcToDatabase, updateBmcToDatabase tools
    - Use Zod schemas for parameter validation
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 4.2 Create `src/app/ai/tools/search.tools.js` with search tool definition
    - Export `createSearchTools()` function returning performWebSearch tool
    - Use Zod schema for parameter validation
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 4.3 Create `src/app/ai/tools/index.js` as tool registry
    - Export `getTools(userId)` function that combines all tools
    - Export `executeTool(toolName, args, userId)` function with logging
    - _Requirements: 2.1, 2.4_
  - [ ]* 4.4 Write property test for tool parameter validation
    - **Property 1: Tool parameter validation consistency**
    - **Validates: Requirements 2.3**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Refactor AI service
  - [ ] 6.1 Refactor `src/app/services/ai.service.js`
    - Import provider from ai.config.js
    - Import tools from ai/tools/index.js
    - Import prompts from ai/prompts/bmc.prompts.js
    - Remove legacy OpenAI client and unused exports (AVAILABLE_TOOLS, getChatCompletion, getStreamingCompletion)
    - Remove BMC helper functions (moved to bmc.utils.js)
    - Keep only `processStreamChat` and `buildSystemPrompt` functions
    - _Requirements: 5.1, 5.2, 5.3, 6.1_
  - [ ]* 6.2 Update existing AI service tests
    - Update tests to reflect new module structure
    - _Requirements: 5.1_

- [ ] 7. Refactor AI controller
  - [ ] 7.1 Refactor `src/app/controllers/ai.controller.js`
    - Remove tool definitions (moved to ai/tools)
    - Remove provider configuration (moved to ai.config.js)
    - Delegate streaming logic to AI service
    - Keep only HTTP request/response handling
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2_
  - [ ]* 7.2 Write property test for error response format
    - **Property 3: Error response format consistency**
    - **Validates: Requirements 4.3**

- [ ] 8. Cleanup and consolidate routes
  - [ ] 8.1 Rename `src/app/routes/ai.js` to `src/app/routes/ai.route.js`
    - Follow consistent naming convention
    - Update import in server.js
    - _Requirements: 7.1, 7.2_
  - [ ] 8.2 Remove duplicate route files
    - Consolidate bmc.js and bmc.route.js if duplicated
    - _Requirements: 7.3_

- [ ] 9. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
