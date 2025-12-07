import User from '../models/user.model.js';

/**
 * Create a new user
 */
export async function createUser(userData) {
  return User.create(userData);
}

/**
 * Find user by ID and update
 */
export async function findByIdAndUpdate(userId, userData) {
  return User.findByIdAndUpdate(userId, userData, { upsert: true, new: true });
}

/**
 * Delete user by ID
 */
export async function deleteUserById(userId) {
  return User.findByIdAndDelete(userId);
}

/**
 * Find user by ID
 */
export async function findUserById(userId) {
  return User.findById(userId);
}
