import { db } from '../db';
import { dogsTable } from '../db/schema';
import { type Dog } from '../schema';
import { desc } from 'drizzle-orm';

export const getDogs = async (): Promise<Dog[]> => {
  try {
    // Fetch all dogs ordered by creation date (newest first)
    const results = await db.select()
      .from(dogsTable)
      .orderBy(desc(dogsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch dogs:', error);
    throw error;
  }
};