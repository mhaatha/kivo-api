import { z } from 'zod';

// BMC item schema
const bmcItemSchema = z.object({
  tag: z.string().min(1),
  content: z.string().min(1),
});

// BMC update schema
export const bmcUpdateSchema = z.object({
  items: z.array(bmcItemSchema).min(1, 'BMC items cannot be empty'),
});

// BMC ID schema
export const bmcIdSchema = z.object({
  id: z.string().min(1),
});

export function validateBmcUpdate(data) {
  return bmcUpdateSchema.safeParse(data);
}

export function validateBmcId(data) {
  return bmcIdSchema.safeParse(data);
}
