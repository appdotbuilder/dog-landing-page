import { db } from '../db';
import { dogsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteDog = async (id: number): Promise<boolean> => {
  try {
    const result = await db.delete(dogsTable)
      .where(eq(dogsTable.id, id))
      .returning({ id: dogsTable.id })
      .execute();

    // Return true if a row was deleted, false if no dog was found with that ID
    return result.length > 0;
  } catch (error) {
    console.error('Dog deletion failed:', error);
    throw error;
  }
};