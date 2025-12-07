import * as authRepository from '../repositories/auth.repository.js';

/**
 * Handle user creation from webhook
 */
export async function handleUserCreated(webhookData) {
  const { id, email_addresses, first_name, last_name, image_url } = webhookData;
  const primaryEmail = email_addresses?.find(
    (e) => e.id === webhookData.primary_email_address_id,
  );

  const userData = {
    _id: id,
    name: [first_name, last_name].filter(Boolean).join(' ') || 'User',
    email: primaryEmail?.email_address,
    emailVerified: primaryEmail?.verification?.status === 'verified',
    image: image_url || null,
  };

  return authRepository.createUser(userData);
}

/**
 * Handle user update from webhook
 */
export async function handleUserUpdated(webhookData) {
  const { id, email_addresses, first_name, last_name, image_url } = webhookData;
  const primaryEmail = email_addresses?.find(
    (e) => e.id === webhookData.primary_email_address_id,
  );

  const userData = {
    name: [first_name, last_name].filter(Boolean).join(' ') || 'User',
    email: primaryEmail?.email_address,
    emailVerified: primaryEmail?.verification?.status === 'verified',
    image: image_url || null,
  };

  return authRepository.findByIdAndUpdate(id, userData);
}

/**
 * Handle user deletion from webhook
 */
export async function handleUserDeleted(userId) {
  return authRepository.deleteUserById(userId);
}
