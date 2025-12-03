import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { openAPI } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { client, db } from './mongodb.js';

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),

  experimental: {
    joins: true,
  },

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  basePath: '/api/v1/auth',

  plugins: [openAPI(), nextCookies()],

  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL1,
  ],
});
