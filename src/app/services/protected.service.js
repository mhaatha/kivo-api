import { clerkClient } from '@clerk/express';

/**
 * Get authenticated user information from Clerk
 */
export async function getAuthenticatedUser(userId) {
  return clerkClient.users.getUser(userId);
}
