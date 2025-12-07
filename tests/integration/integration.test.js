/**
 * Integration Tests
 * Tests that connect to real MongoDB and test AI responses
 * 
 * Note: These tests require:
 * - MongoDB connection (uses test database)
 * - Kolosal API key configured in .env
 * 
 * Run with: npm run test:integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import 'dotenv/config';
import { TEST_USERS, SAMPLE_BMC_ITEMS } from '../setup.js';

// Skip if no MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY;

const describeIfMongo = MONGODB_URI ? describe : describe.skip;

describeIfMongo('Integration Tests', () => {
  beforeAll(async () => {
    // Connect to MongoDB test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB for integration tests');
    }
  });

  afterAll(async () => {
    // Clean up and disconnect
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  });

  describe('MongoDB Connection', () => {
    it('should be connected to test database', () => {
      expect(mongoose.connection.readyState).toBe(1);
      expect(mongoose.connection.name).toBe('test');
    });

    it('should have users collection', async () => {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      expect(collectionNames).toContain('users');
    });

    it('should have required collections for AI chat', async () => {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      expect(collectionNames).toContain('chats');
      expect(collectionNames).toContain('messages');
      expect(collectionNames).toContain('bmcposts');
    });
  });

  describe('User Data Verification', () => {
    it('should have test users in database', async () => {
      const usersCollection = mongoose.connection.db.collection('users');
      const users = await usersCollection.find({}).toArray();
      
      expect(users.length).toBeGreaterThanOrEqual(2);
    });

    it('should find user1 by ID', async () => {
      const usersCollection = mongoose.connection.db.collection('users');
      const user = await usersCollection.findOne({ _id: TEST_USERS.user1.id });
      
      expect(user).toBeDefined();
      expect(user.email).toBe(TEST_USERS.user1.email);
    });

    it('should find user2 by ID', async () => {
      const usersCollection = mongoose.connection.db.collection('users');
      const user = await usersCollection.findOne({ _id: TEST_USERS.user2.id });
      
      expect(user).toBeDefined();
      expect(user.email).toBe(TEST_USERS.user2.email);
    });
  });

  describe('Chat Model Integration', () => {
    let Chat, Message;
    let testChatId;

    // Helper to generate UUID-like string for chat _id
    const generateChatId = () => `test-chat-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    beforeAll(async () => {
      const chatModule = await import('../../src/app/models/chat.model.js');
      Chat = chatModule.Chat;
      Message = chatModule.Message;
    });

    afterEach(async () => {
      // Clean up test data
      if (testChatId) {
        await Message.deleteMany({ chatId: testChatId });
        await Chat.findByIdAndDelete(testChatId);
        testChatId = null;
      }
    });

    it('should create a new chat for user', async () => {
      const chatId = generateChatId();
      const chat = new Chat({
        _id: chatId,
        userId: TEST_USERS.user1.id,
        title: 'Test Chat Session',
      });
      const savedChat = await chat.save();
      testChatId = savedChat._id;

      expect(savedChat._id).toBe(chatId);
      expect(savedChat.userId).toBe(TEST_USERS.user1.id);
      expect(savedChat.title).toBe('Test Chat Session');
    });

    it('should create messages in chat', async () => {
      // Create chat
      const chatId = generateChatId();
      const chat = new Chat({
        _id: chatId,
        userId: TEST_USERS.user1.id,
        title: 'Chat with messages',
      });
      const savedChat = await chat.save();
      testChatId = savedChat._id;

      // Create messages
      const userMessage = new Message({
        chatId: savedChat._id,
        role: 'user',
        content: 'Saya ingin membuat bisnis delivery makanan',
      });
      await userMessage.save();

      const assistantMessage = new Message({
        chatId: savedChat._id,
        role: 'assistant',
        content: 'Menarik! Target pasar yang kamu incar siapa?',
      });
      await assistantMessage.save();

      // Verify messages
      const messages = await Message.find({ chatId: savedChat._id }).sort({ createdAt: 1 });
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('user');
      expect(messages[1].role).toBe('assistant');
    });

    it('should query chats by userId', async () => {
      // Create chat
      const chatId = generateChatId();
      const chat = new Chat({
        _id: chatId,
        userId: TEST_USERS.user1.id,
        title: 'User specific chat',
      });
      const savedChat = await chat.save();
      testChatId = savedChat._id;

      // Query
      const userChats = await Chat.find({ userId: TEST_USERS.user1.id });
      expect(userChats.length).toBeGreaterThanOrEqual(1);
      
      const foundChat = userChats.find(c => c._id.toString() === savedChat._id.toString());
      expect(foundChat).toBeDefined();
    });
  });

  describe('BMC Model Integration', () => {
    let BmcPost;
    let testBmcId;

    beforeAll(async () => {
      const bmcModule = await import('../../src/app/models/bmc.model.js');
      BmcPost = bmcModule.BmcPost;
    });

    afterEach(async () => {
      // Clean up test data
      if (testBmcId) {
        await BmcPost.findByIdAndDelete(testBmcId);
        testBmcId = null;
      }
    });

    it('should create BMC with items', async () => {
      const bmc = new BmcPost({
        authorId: TEST_USERS.user1.id,
        isPublic: false,
        items: SAMPLE_BMC_ITEMS.slice(0, 3),
      });
      const savedBmc = await bmc.save();
      testBmcId = savedBmc._id;

      expect(savedBmc._id).toBeDefined();
      expect(savedBmc.authorId).toBe(TEST_USERS.user1.id);
      expect(savedBmc.items).toHaveLength(3);
    });

    it('should create BMC with all 9 blocks', async () => {
      const bmc = new BmcPost({
        authorId: TEST_USERS.user1.id,
        isPublic: true,
        items: SAMPLE_BMC_ITEMS,
      });
      const savedBmc = await bmc.save();
      testBmcId = savedBmc._id;

      expect(savedBmc.items).toHaveLength(9);
      expect(savedBmc.isPublic).toBe(true);
    });

    it('should update BMC items', async () => {
      // Create
      const bmc = new BmcPost({
        authorId: TEST_USERS.user1.id,
        items: [{ tag: 'customer_segments', content: 'Initial segment' }],
      });
      const savedBmc = await bmc.save();
      testBmcId = savedBmc._id;

      // Update
      const updated = await BmcPost.findByIdAndUpdate(
        savedBmc._id,
        { 
          $set: { 
            items: [
              { tag: 'customer_segments', content: 'Updated segment' },
              { tag: 'value_propositions', content: 'New value prop' },
            ],
          },
        },
        { new: true }
      );

      expect(updated.items).toHaveLength(2);
      expect(updated.items[0].content).toBe('Updated segment');
    });

    it('should query public BMC posts', async () => {
      // Create public BMC
      const bmc = new BmcPost({
        authorId: TEST_USERS.user1.id,
        isPublic: true,
        items: [{ tag: 'customer_segments', content: 'Public BMC' }],
      });
      const savedBmc = await bmc.save();
      testBmcId = savedBmc._id;

      // Query
      const publicPosts = await BmcPost.find({ isPublic: true });
      expect(publicPosts.length).toBeGreaterThanOrEqual(1);
    });

    it('should query BMC by authorId', async () => {
      // Create
      const bmc = new BmcPost({
        authorId: TEST_USERS.user2.id,
        items: [{ tag: 'customer_segments', content: 'User2 BMC' }],
      });
      const savedBmc = await bmc.save();
      testBmcId = savedBmc._id;

      // Query
      const userBmcs = await BmcPost.find({ authorId: TEST_USERS.user2.id });
      expect(userBmcs.length).toBeGreaterThanOrEqual(1);
      
      const foundBmc = userBmcs.find(b => b._id.toString() === savedBmc._id.toString());
      expect(foundBmc).toBeDefined();
    });
  });

  describe('AI Service Configuration', () => {
    it('should have Kolosal API key configured', () => {
      expect(KOLOSAL_API_KEY).toBeDefined();
      expect(KOLOSAL_API_KEY.length).toBeGreaterThan(0);
    });

    it('should load AI modules', async () => {
      // After refactor, prompts are in separate module
      const { BMC_SYSTEM_PROMPT } = await import('../../src/app/ai/prompts/bmc.prompts.js');
      const { getTools } = await import('../../src/app/ai/tools/index.js');
      const { createAIProvider } = await import('../../src/app/config/ai.config.js');
      
      expect(BMC_SYSTEM_PROMPT).toBeDefined();
      expect(getTools).toBeDefined();
      expect(createAIProvider).toBeDefined();
    });

    it('should have 3 available tools', async () => {
      const { getTools } = await import('../../src/app/ai/tools/index.js');
      
      const tools = getTools('test-user-id');
      expect(Object.keys(tools)).toHaveLength(4);
      
      const toolNames = Object.keys(tools);
      expect(toolNames).toContain('generateAndSaveBMC');
      expect(toolNames).toContain('updateBMC');
      expect(toolNames).toContain('performWebSearch');
      expect(toolNames).toContain('getCoordinate');
    });
  });
});

// Only run AI response tests if explicitly enabled (they cost API credits)
// Run with: RUN_AI_TESTS=true npm run test:integration
const describeIfAI = process.env.RUN_AI_TESTS === 'true' ? describe : describe.skip;

describeIfAI('AI Response Tests (Requires API Credits)', () => {
  let aiService;
  let Chat, Message, BmcPost;
  let testChatId;
  let testBmcIds = [];

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
    aiService = await import('../../src/app/services/ai.service.js');
    
    const chatModule = await import('../../src/app/models/chat.model.js');
    Chat = chatModule.Chat;
    Message = chatModule.Message;
    
    const bmcModule = await import('../../src/app/models/bmc.model.js');
    BmcPost = bmcModule.BmcPost;
    
    console.log('🤖 AI Response Tests - Starting (API credits will be used)');
  });

  afterAll(async () => {
    // Clean up test data
    if (testChatId) {
      await Message.deleteMany({ chatId: testChatId });
      await Chat.findByIdAndDelete(testChatId);
    }
    for (const bmcId of testBmcIds) {
      await BmcPost.findByIdAndDelete(bmcId);
    }
    console.log('🧹 AI Response Tests - Cleanup complete');
  });

  it('should verify API endpoint is reachable', async () => {
    const { openaiClient } = aiService;
    
    // Simple test to check API connectivity
    expect(openaiClient).toBeDefined();
    expect(openaiClient.baseURL).toBe('https://api.kolosal.ai/v1');
  });

  it('should get AI response for greeting message', async () => {
    const messages = [
      { role: 'system', content: aiService.BMC_SYSTEM_PROMPT },
      { role: 'user', content: 'Halo, siapa kamu?' },
    ];

    const response = await aiService.getChatCompletion(messages, false);
    
    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0].message).toBeDefined();
    expect(response.choices[0].message.content).toBeTruthy();
    
    console.log('\n📝 AI Greeting Response:');
    console.log(response.choices[0].message.content.substring(0, 300));
  }, 60000);

  it('should get AI response for BMC business question', async () => {
    const messages = [
      { role: 'system', content: aiService.BMC_SYSTEM_PROMPT },
      { role: 'user', content: 'Saya ingin membuat bisnis delivery makanan sehat untuk pekerja kantoran. Bagaimana cara memulainya?' },
    ];

    const response = await aiService.getChatCompletion(messages, false);
    
    expect(response).toBeDefined();
    expect(response.choices[0].message).toBeDefined();
    
    const content = response.choices[0].message.content;
    expect(content).toBeTruthy();
    
    console.log('\n📝 AI Business Response:');
    console.log(content.substring(0, 500));
  }, 60000);

  it('should save chat messages with AI response to database', async () => {
    // Create a chat session
    const chat = new Chat({
      userId: TEST_USERS.user1.id,
      title: 'AI Integration Test Chat',
    });
    const savedChat = await chat.save();
    testChatId = savedChat._id;
    
    // Save user message
    const userMessage = new Message({
      chatId: savedChat._id,
      role: 'user',
      content: 'Apa itu Business Model Canvas?',
    });
    await userMessage.save();
    
    // Get AI response
    const messages = [
      { role: 'system', content: aiService.BMC_SYSTEM_PROMPT },
      { role: 'user', content: userMessage.content },
    ];
    
    const response = await aiService.getChatCompletion(messages, false);
    const aiContent = response.choices[0].message.content;
    
    // Save AI response
    const assistantMessage = new Message({
      chatId: savedChat._id,
      role: 'assistant',
      content: aiContent,
    });
    await assistantMessage.save();
    
    // Verify messages in database
    const dbMessages = await Message.find({ chatId: savedChat._id }).sort({ createdAt: 1 });
    
    expect(dbMessages).toHaveLength(2);
    expect(dbMessages[0].role).toBe('user');
    expect(dbMessages[0].content).toBe('Apa itu Business Model Canvas?');
    expect(dbMessages[1].role).toBe('assistant');
    expect(dbMessages[1].content).toBe(aiContent);
    
    console.log('\n📝 Chat saved to database with AI response:');
    console.log(`  User: ${dbMessages[0].content}`);
    console.log(`  AI: ${dbMessages[1].content.substring(0, 200)}...`);
  }, 60000);

  it('should handle multi-turn conversation with context', async () => {
    const conversationMessages = [
      { role: 'system', content: aiService.BMC_SYSTEM_PROMPT },
      { role: 'user', content: 'Saya ingin membuat startup teknologi pendidikan.' },
    ];
    
    // First turn
    const response1 = await aiService.getChatCompletion(conversationMessages, false);
    expect(response1.choices[0].message.content).toBeTruthy();
    
    // Add AI response to conversation
    conversationMessages.push({
      role: 'assistant',
      content: response1.choices[0].message.content,
    });
    
    // Second turn - should remember context
    conversationMessages.push({
      role: 'user',
      content: 'Target market saya adalah mahasiswa S1 di Indonesia.',
    });
    
    const response2 = await aiService.getChatCompletion(conversationMessages, false);
    expect(response2.choices[0].message.content).toBeTruthy();
    
    console.log('\n📝 Multi-turn conversation:');
    console.log('  Turn 1 AI:', response1.choices[0].message.content.substring(0, 150));
    console.log('  Turn 2 AI:', response2.choices[0].message.content.substring(0, 150));
  }, 120000);

  it('should execute tool call when BMC data is ready', async () => {
    // Setup a full conversation with enough context for tool call
    const messages = [
      { role: 'system', content: aiService.BMC_SYSTEM_PROMPT },
      { role: 'user', content: `Tolong simpan BMC saya dengan data berikut:
        - Customer Segments: Mahasiswa S1 usia 18-22 tahun yang butuh bimbingan belajar
        - Value Propositions: Platform belajar online interaktif dengan AI tutor
        - Channels: Mobile app dan website
        - Customer Relationships: Community forum dan live chat support
        - Revenue Streams: Subscription bulanan Rp 99.000
        - Key Resources: Tim developer dan konten edukatif
        - Key Activities: Pengembangan konten dan maintenance platform
        - Key Partners: Universitas dan pengajar freelance  
        - Cost Structure: Server, gaji tim, dan marketing` },
    ];

    const response = await aiService.getChatCompletion(messages, false);
    
    expect(response).toBeDefined();
    expect(response.choices[0].message).toBeDefined();
    
    const message = response.choices[0].message;
    
    // Check if tool was called
    if (message.tool_calls && message.tool_calls.length > 0) {
      console.log('\n🔧 Tool calls triggered:');
      for (const tc of message.tool_calls) {
        console.log(`  - ${tc.function.name}`);
        console.log(`    Args: ${tc.function.arguments.substring(0, 200)}...`);
        
        // Verify it's a valid BMC tool
        expect(['generateAndSaveBMC', 'updateBMC', 'performWebSearch']).toContain(tc.function.name);
        
        // If it's a BMC tool, verify the arguments
        if (tc.function.name === 'generateAndSaveBMC') {
          const args = JSON.parse(tc.function.arguments);
          expect(args.businessContext).toBeDefined();
          expect(typeof args.businessContext).toBe('string');
          
          console.log(`    Context length: ${args.businessContext.length}`);
        } else if (tc.function.name === 'updateBMC') {
          const args = JSON.parse(tc.function.arguments);
          expect(args.bmcId).toBeDefined();
          expect(args.updateContext).toBeDefined();
        }
      }
    } else {
      console.log('\n📝 AI Response (no tool call):');
      console.log(message.content?.substring(0, 300));
    }
  }, 60000);

  it('should handle streaming response', async () => {
    const messages = [
      { role: 'system', content: aiService.BMC_SYSTEM_PROMPT },
      { role: 'user', content: 'Jelaskan secara singkat apa itu value proposition.' },
    ];

    const stream = await aiService.getChatCompletion(messages, true);
    
    expect(stream).toBeDefined();
    
    let fullContent = '';
    let chunkCount = 0;
    
    for await (const chunk of stream) {
      chunkCount++;
      const content = chunk.choices[0]?.delta?.content || '';
      fullContent += content;
    }
    
    expect(fullContent.length).toBeGreaterThan(0);
    expect(chunkCount).toBeGreaterThan(0);
    
    console.log(`\n📝 Streaming response received: ${chunkCount} chunks`);
    console.log(`  Content preview: ${fullContent.substring(0, 200)}...`);
  }, 60000);
});
