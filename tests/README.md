# Kivo API Test Suite

## Overview

Comprehensive test suite for the Kivo API, covering validations, services, controllers, and integration with real MongoDB and AI (Kolosal API).

## Test Statistics

| Category | Tests | Status |
|----------|-------|--------|
| **Validation Tests** | 52 | ✅ 100% Coverage |
| **Service Tests** | 53 | ✅ Passing |
| **Controller Tests** | 35 | ✅ Passing |
| **Integration Tests** | 24 | ✅ Passing |
| **Total** | **164** | ✅ All Passing |

## Test Structure

```
tests/
├── setup.js                    # Shared test configuration & data
├── README.md                   # This file
├── validations/
│   ├── ai.validation.test.js   # 20 tests - AI request validation
│   └── bmc.validation.test.js  # 32 tests - BMC request validation
├── services/
│   ├── ai.service.test.js      # 20 tests - AI service functions
│   ├── chat.service.test.js    # 17 tests - Chat CRUD operations
│   └── bmc.service.test.js     # 16 tests - BMC CRUD operations
├── controllers/
│   ├── ai.controller.test.js   # 16 tests - AI/Chat endpoints
│   └── bmc.controller.test.js  # 19 tests - BMC endpoints
└── integration/
    └── integration.test.js     # 24 tests - Real MongoDB & AI
```

## Running Tests

### All Unit Tests (Fast)
```bash
npm test
```

### Tests with Coverage
```bash
npm run test:coverage
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Integration Tests Only
```bash
npm run test:integration
```

### With AI Response Tests (Uses API Credits)
```bash
# Windows PowerShell
$env:RUN_AI_TESTS='true'; npm run test:integration

# Unix/Mac
RUN_AI_TESTS=true npm run test:integration
```

## Test Users (Real MongoDB Data)

Tests use real user IDs from the MongoDB `test` database:

```javascript
TEST_USERS = {
  user1: {
    id: 'user_36KxgJsnUEJlQuFxLmiO7sdpd91',
    email: 'vitoandareas15@gmail.com',
    name: 'Vito Andareas Manik'
  },
  user2: {
    id: 'user_36Ky8ltGX128yUvcJv8VbBcrPYk',
    email: 'vitoandareas13@gmail.com', 
    name: 'Vito Andareas Manik'
  }
}
```

## Test Categories

### 1. Validation Tests (52 tests)

Tests Zod schemas for request validation:

**AI Validation (20 tests)**
- ✅ Valid chat requests with/without chatId
- ✅ Valid history requests (all params, minimal)
- ✅ Valid suggestions requests
- ✅ Valid delete requests
- ✅ Invalid: missing userId, message, invalid types
- ✅ Edge cases: empty strings, special characters

**BMC Validation (32 tests)**
- ✅ Valid create/update requests
- ✅ Valid public/user BMC requests
- ✅ Valid delete requests with authorId verification
- ✅ All 9 BMC block tags validated
- ✅ Invalid: empty arrays, missing items, invalid IDs
- ✅ Edge cases: maximum items, duplicate tags

### 2. Service Tests (53 tests)

Tests business logic with mocked dependencies:

**AI Service (20 tests)**
- ✅ BMC_SYSTEM_PROMPT defined with BMC context
- ✅ AVAILABLE_TOOLS has 3 tools (post/update BMC, web search)
- ✅ Tool function schemas defined correctly
- ✅ BMC tag constants and categories

**Chat Service (17 tests)**
- ✅ createChat, getChatById, getChatsByUserId
- ✅ Chat access authorization
- ✅ deleteChat, updateChat
- ✅ Message operations: create, get by chatId

**BMC Service (16 tests)**
- ✅ createBmc, getBmcById, updateBmc, deleteBmc
- ✅ Public BMC queries
- ✅ User BMC queries with authorId
- ✅ Authorization verification

### 3. Controller Tests (35 tests)

Tests HTTP endpoints with mocked services:

**AI Controller (16 tests)**
- ✅ `GET /api/ai/chats` - List user's chats
- ✅ `GET /api/ai/chats/:chatId/messages` - Get chat messages
- ✅ `DELETE /api/ai/chats/:chatId` - Delete chat
- ✅ `POST /api/ai/chat` - Stream chat (SSE)
- ✅ Error handling: 400, 404, 500 responses

**BMC Controller (19 tests)**
- ✅ `GET /api/bmc/public` - Get public BMCs
- ✅ `GET /api/bmc/:bmcId` - Get specific BMC
- ✅ `GET /api/bmc` - Get user's BMCs
- ✅ `POST /api/bmc` - Create BMC
- ✅ `PUT /api/bmc/:bmcId` - Update BMC
- ✅ `DELETE /api/bmc/:bmcId` - Delete BMC
- ✅ Error handling: 400, 403, 404, 500 responses

### 4. Integration Tests (24 tests)

Real database and AI API tests:

**MongoDB Connection (3 tests)**
- ✅ Connected to test database
- ✅ Required collections exist (users, chats, messages, bmcposts)

**User Data Verification (3 tests)**
- ✅ Test users exist in database
- ✅ Can find users by ID

**Chat Model Integration (3 tests)**
- ✅ Create chat for user
- ✅ Create/query messages in chat
- ✅ Query chats by userId

**BMC Model Integration (5 tests)**
- ✅ Create BMC with items
- ✅ Create BMC with all 9 blocks
- ✅ Update BMC items
- ✅ Query public BMC posts
- ✅ Query BMC by authorId

**AI Service Configuration (3 tests)**
- ✅ Kolosal API key configured
- ✅ AI service module loads
- ✅ 3 tools available

**AI Response Tests (7 tests, requires `RUN_AI_TESTS=true`)**
- ✅ API endpoint reachable
- ✅ Greeting response works
- ✅ BMC business questions answered
- ✅ Chat saved to database with AI response
- ✅ Multi-turn conversation with context
- ✅ Tool calls can be triggered
- ✅ Streaming response works

## BMC Block Tags

All 9 Business Model Canvas blocks are tested:

| Tag | Description |
|-----|-------------|
| `CustomerSegments` | Target customers |
| `ValuePropositions` | Value offered |
| `Channels` | Distribution channels |
| `CustomerRelationships` | Customer engagement |
| `RevenueStreams` | Revenue sources |
| `KeyResources` | Critical assets |
| `KeyActivities` | Key operations |
| `KeyPartners` | Strategic partners |
| `CostStructure` | Cost breakdown |

## Environment Variables

Required for tests:

```env
MONGODB_URI=mongodb+srv://...
KOLOSAL_API_KEY=sk-...
```

Optional:

```env
RUN_AI_TESTS=true  # Enable AI response tests
```

## Test Isolation

- Each test uses its own test data
- Tests clean up created documents after completion
- MongoDB connection is managed per test file
- Mocks are reset between tests
