import { db } from '../db';
import { dogsTable } from '../db/schema';
import { type Dog } from '../schema';
import { eq } from 'drizzle-orm';

export const getDogById = async (id: number): Promise<Dog | null> => {
  try {
    // Query for the specific dog by ID
    const results = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.id, id))
      .execute();

    // Return the dog if found, null otherwise
    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get dog by ID:', error);
    throw error;
  }
};