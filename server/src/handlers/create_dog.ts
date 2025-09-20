import { db } from '../db';
import { dogsTable } from '../db/schema';
import { type CreateDogInput, type Dog } from '../schema';

export const createDog = async (input: CreateDogInput): Promise<Dog> => {
  try {
    // Insert dog record
    const result = await db.insert(dogsTable)
      .values({
        name: input.name,
        breed: input.breed,
        description: input.description,
        logo_url: input.logo_url,
        photo_url: input.photo_url,
        age: input.age,
        is_featured: input.is_featured
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Dog creation failed:', error);
    throw error;
  }
};