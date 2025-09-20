import { db } from '../db';
import { dogsTable } from '../db/schema';
import { type Dog } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getDogsByBreed = async (breed: string): Promise<Dog[]> => {
  try {
    // Query dogs filtered by breed, ordered by name
    const results = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.breed, breed))
      .orderBy(asc(dogsTable.name))
      .execute();

    // Return results directly - no numeric conversions needed for this schema
    return results;
  } catch (error) {
    console.error('Failed to get dogs by breed:', error);
    throw error;
  }
};