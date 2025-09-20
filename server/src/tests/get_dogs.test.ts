import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dogsTable } from '../db/schema';
import { getDogs } from '../handlers/get_dogs';

describe('getDogs', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no dogs exist', async () => {
    const result = await getDogs();
    
    expect(result).toEqual([]);
  });

  it('should return all dogs ordered by creation date (newest first)', async () => {
    // Insert test dogs with slight delays to ensure different timestamps
    const firstDog = await db.insert(dogsTable)
      .values({
        name: 'First Dog',
        breed: 'Golden Retriever',
        description: 'The first dog created',
        age: 3,
        is_featured: false
      })
      .returning()
      .execute();

    // Add a small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondDog = await db.insert(dogsTable)
      .values({
        name: 'Second Dog',
        breed: 'Labrador',
        description: 'The second dog created',
        age: 5,
        is_featured: true
      })
      .returning()
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    const thirdDog = await db.insert(dogsTable)
      .values({
        name: 'Third Dog',
        breed: 'Beagle',
        description: null,
        age: null,
        is_featured: false
      })
      .returning()
      .execute();

    const result = await getDogs();

    expect(result).toHaveLength(3);
    
    // Verify ordering - newest first (third, second, first)
    expect(result[0].name).toEqual('Third Dog');
    expect(result[1].name).toEqual('Second Dog');
    expect(result[2].name).toEqual('First Dog');

    // Verify all fields are properly returned
    expect(result[0].breed).toEqual('Beagle');
    expect(result[0].description).toBeNull();
    expect(result[0].age).toBeNull();
    expect(result[0].is_featured).toBe(false);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);

    expect(result[1].breed).toEqual('Labrador');
    expect(result[1].description).toEqual('The second dog created');
    expect(result[1].age).toEqual(5);
    expect(result[1].is_featured).toBe(true);
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
  });

  it('should handle dogs with all fields populated', async () => {
    await db.insert(dogsTable)
      .values({
        name: 'Complete Dog',
        breed: 'German Shepherd',
        description: 'A dog with all fields filled',
        logo_url: 'https://example.com/logo.jpg',
        photo_url: 'https://example.com/photo.jpg',
        age: 4,
        is_featured: true
      })
      .execute();

    const result = await getDogs();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Complete Dog');
    expect(result[0].breed).toEqual('German Shepherd');
    expect(result[0].description).toEqual('A dog with all fields filled');
    expect(result[0].logo_url).toEqual('https://example.com/logo.jpg');
    expect(result[0].photo_url).toEqual('https://example.com/photo.jpg');
    expect(result[0].age).toEqual(4);
    expect(result[0].is_featured).toBe(true);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle dogs with minimal required fields only', async () => {
    await db.insert(dogsTable)
      .values({
        name: 'Minimal Dog',
        breed: 'Mixed'
      })
      .execute();

    const result = await getDogs();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Minimal Dog');
    expect(result[0].breed).toEqual('Mixed');
    expect(result[0].description).toBeNull();
    expect(result[0].logo_url).toBeNull();
    expect(result[0].photo_url).toBeNull();
    expect(result[0].age).toBeNull();
    expect(result[0].is_featured).toBe(false); // Default value
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should maintain proper date ordering with multiple dogs', async () => {
    const timestamps: Date[] = [];

    // Insert dogs with known order
    for (let i = 1; i <= 5; i++) {
      const result = await db.insert(dogsTable)
        .values({
          name: `Dog ${i}`,
          breed: 'Test Breed',
          is_featured: i % 2 === 0 // Alternate featured status
        })
        .returning()
        .execute();
      
      timestamps.push(result[0].created_at);
      
      // Small delay to ensure different timestamps
      if (i < 5) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    const result = await getDogs();

    expect(result).toHaveLength(5);

    // Verify that each dog's created_at is newer than or equal to the next one
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].created_at >= result[i + 1].created_at).toBe(true);
    }

    // Verify the actual order (Dog 5 should be first, Dog 1 should be last)
    expect(result[0].name).toEqual('Dog 5');
    expect(result[4].name).toEqual('Dog 1');
  });
});