import { z } from 'zod';

// Dog schema for the main dog entity
export const dogSchema = z.object({
  id: z.number(),
  name: z.string(),
  breed: z.string(),
  description: z.string().nullable(),
  logo_url: z.string().nullable(), // URL for dog logo/avatar
  photo_url: z.string().nullable(), // URL for main photo
  age: z.number().int().nullable(),
  is_featured: z.boolean(),
  created_at: z.coerce.date()
});

export type Dog = z.infer<typeof dogSchema>;

// Input schema for creating dogs
export const createDogInputSchema = z.object({
  name: z.string().min(1, "Dog name is required"),
  breed: z.string().min(1, "Breed is required"),
  description: z.string().nullable(),
  logo_url: z.string().url().nullable(),
  photo_url: z.string().url().nullable(),
  age: z.number().int().positive().nullable(),
  is_featured: z.boolean().optional().default(false)
});

export type CreateDogInput = z.infer<typeof createDogInputSchema>;

// Input schema for updating dogs
export const updateDogInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  breed: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  photo_url: z.string().url().nullable().optional(),
  age: z.number().int().positive().nullable().optional(),
  is_featured: z.boolean().optional()
});

export type UpdateDogInput = z.infer<typeof updateDogInputSchema>;

// Query schema for filtering dogs
export const getDogsByFilterSchema = z.object({
  breed: z.string().optional(),
  is_featured: z.boolean().optional(),
  limit: z.number().int().positive().optional().default(20),
  offset: z.number().int().nonnegative().optional().default(0)
});

export type GetDogsByFilterInput = z.infer<typeof getDogsByFilterSchema>;