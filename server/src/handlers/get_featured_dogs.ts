import { db } from '../db';
import { dogsTable } from '../db/schema';
import { type Dog } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getFeaturedDogs = async (): Promise<Dog[]> => {
  try {
    // Query featured dogs ordered by creation date (newest first)
    const results = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.is_featured, true))
      .orderBy(desc(dogsTable.created_at))
      .execute();

    // Return the results directly since no numeric conversions are needed
    return results;
  } catch (error) {
    console.error('Failed to fetch featured dogs:', error);
    throw error;
  }
};