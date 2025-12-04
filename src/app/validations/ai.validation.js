import { z } from 'zod';

// Stream chat request schema
export const streamChatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(10000),
  chatId: z.string().optional(),
});

export function validateStreamChatRequest(data) {
  return streamChatRequestSchema.safeParse(data);
}
