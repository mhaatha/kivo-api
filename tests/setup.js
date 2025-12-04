/**
 * Test Setup File
 * Contains shared configuration and test helpers
 */

import 'dotenv/config';

// Real user data from MongoDB (for integration tests)
export const TEST_USERS = {
  user1: {
    id: 'user_36KxgJsnUEJlQuFxLmiO7sdpd91',
    name: 'Vito Andareas Manik',
    email: 'vitoandareas15@gmail.com',
  },
  user2: {
    id: 'user_36Ky8ltGX128yUvcJv8VbBcrPYk',
    name: 'Vito Andareas Manik',
    email: 'vitoandareas13@gmail.com',
  },
};

// Valid BMC tags
export const BMC_TAGS = [
  'CustomerSegments',
  'ValuePropositions',
  'Channels',
  'CustomerRelationships',
  'RevenueStreams',
  'KeyResources',
  'KeyActivities',
  'KeyPartnerships',
  'CostStructure',
];

// Mock Express request
export function createMockReq(overrides = {}) {
  return {
    body: {},
    params: {},
    query: {},
    user: { id: TEST_USERS.user1.id },
    headers: {},
    ...overrides,
  };
}

// Mock Express response
export function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    headers: {},
    headersSent: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    writeHead(code, headers) {
      this.statusCode = code;
      this.headers = headers;
      return this;
    },
    write(data) {
      if (!this.chunks) this.chunks = [];
      this.chunks.push(data);
      return true;
    },
    end() {
      this.ended = true;
    },
  };
  return res;
}

// Sample BMC items for testing
export const SAMPLE_BMC_ITEMS = [
  { tag: 'CustomerSegments', content: 'Young professionals aged 25-35 in urban areas' },
  { tag: 'ValuePropositions', content: 'Fast, affordable, and eco-friendly delivery service' },
  { tag: 'Channels', content: 'Mobile app, website, and social media' },
  { tag: 'CustomerRelationships', content: 'Self-service with 24/7 customer support' },
  { tag: 'RevenueStreams', content: 'Delivery fees, subscription plans, partnerships' },
  { tag: 'KeyResources', content: 'Fleet of electric vehicles, mobile app, logistics network' },
  { tag: 'KeyActivities', content: 'Delivery operations, app development, marketing' },
  { tag: 'KeyPartnerships', content: 'Local restaurants, e-commerce platforms, vehicle suppliers' },
  { tag: 'CostStructure', content: 'Vehicle maintenance, salaries, app development, marketing' },
];

// Sample chat messages for testing
export const SAMPLE_CHAT_MESSAGES = [
  { role: 'user', content: 'Saya ingin membuat bisnis delivery makanan' },
  { role: 'assistant', content: 'Menarik! Ceritakan lebih lanjut target pasar yang kamu incar?' },
  { role: 'user', content: 'Target saya adalah anak muda usia 25-35 tahun di kota besar' },
];
