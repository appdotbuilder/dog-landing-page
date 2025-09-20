import { db } from '../db';
import { dogsTable } from '../db/schema';
import { type UpdateDogInput, type Dog } from '../schema';
import { eq } from 'drizzle-orm';

export const updateDog = async (input: UpdateDogInput): Promise<Dog | null> => {
  try {
    // Extract id from input and create update object without id
    const { id, ...updateFields } = input;
    
    // Only update fields that are provided (not undefined)
    const fieldsToUpdate: any = {};
    Object.entries(updateFields).forEach(([key, value]) => {
      if (value !== undefined) {
        fieldsToUpdate[key] = value;
      }
    });

    // If no fields to update, just return the existing dog
    if (Object.keys(fieldsToUpdate).length === 0) {
      const existingDogs = await db.select()
        .from(dogsTable)
        .where(eq(dogsTable.id, id))
        .execute();
      
      return existingDogs.length > 0 ? existingDogs[0] : null;
    }

    // Update the dog and return the updated record
    const result = await db.update(dogsTable)
      .set(fieldsToUpdate)
      .where(eq(dogsTable.id, id))
      .returning()
      .execute();

    // Return the updated dog or null if not found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Dog update failed:', error);
    throw error;
  }
};