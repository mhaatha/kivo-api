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

// Valid BMC tags (snake_case to match model enum)
export const BMC_TAGS = [
  'customer_segments',
  'value_propositions',
  'channels',
  'customer_relationships',
  'revenue_streams',
  'key_resources',
  'key_activities',
  'key_partnerships',
  'cost_structure',
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

// Sample BMC items for testing (snake_case tags to match model enum)
export const SAMPLE_BMC_ITEMS = [
  { tag: 'customer_segments', content: 'Young professionals aged 25-35 in urban areas' },
  { tag: 'value_propositions', content: 'Fast, affordable, and eco-friendly delivery service' },
  { tag: 'channels', content: 'Mobile app, website, and social media' },
  { tag: 'customer_relationships', content: 'Self-service with 24/7 customer support' },
  { tag: 'revenue_streams', content: 'Delivery fees, subscription plans, partnerships' },
  { tag: 'key_resources', content: 'Fleet of electric vehicles, mobile app, logistics network' },
  { tag: 'key_activities', content: 'Delivery operations, app development, marketing' },
  { tag: 'key_partnerships', content: 'Local restaurants, e-commerce platforms, vehicle suppliers' },
  { tag: 'cost_structure', content: 'Vehicle maintenance, salaries, app development, marketing' },
];

// Sample chat messages for testing
export const SAMPLE_CHAT_MESSAGES = [
  { role: 'user', content: 'Saya ingin membuat bisnis delivery makanan' },
  { role: 'assistant', content: 'Menarik! Ceritakan lebih lanjut target pasar yang kamu incar?' },
  { role: 'user', content: 'Target saya adalah anak muda usia 25-35 tahun di kota besar' },
];
