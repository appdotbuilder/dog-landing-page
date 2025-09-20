import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dogsTable } from '../db/schema';
import { getDogsByBreed } from '../handlers/get_dogs_by_breed';

describe('getDogsByBreed', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return dogs filtered by breed', async () => {
    // Create test dogs with different breeds
    await db.insert(dogsTable)
      .values([
        {
          name: 'Buddy',
          breed: 'Golden Retriever',
          description: 'Friendly golden retriever',
          age: 3,
          is_featured: false
        },
        {
          name: 'Max',
          breed: 'Labrador',
          description: 'Energetic lab',
          age: 2,
          is_featured: true
        },
        {
          name: 'Charlie',
          breed: 'Golden Retriever',
          description: 'Another golden retriever',
          age: 4,
          is_featured: false
        }
      ])
      .execute();

    const result = await getDogsByBreed('Golden Retriever');

    expect(result).toHaveLength(2);
    expect(result.every(dog => dog.breed === 'Golden Retriever')).toBe(true);
    
    // Verify all expected fields are present
    result.forEach(dog => {
      expect(dog.id).toBeDefined();
      expect(dog.name).toBeDefined();
      expect(dog.breed).toEqual('Golden Retriever');
      expect(dog.created_at).toBeInstanceOf(Date);
      expect(typeof dog.is_featured).toBe('boolean');
    });
  });

  it('should return dogs ordered by name', async () => {
    // Create dogs with same breed but different names
    await db.insert(dogsTable)
      .values([
        {
          name: 'Zeus',
          breed: 'German Shepherd',
          description: 'Strong shepherd',
          age: 5,
          is_featured: false
        },
        {
          name: 'Apollo',
          breed: 'German Shepherd',
          description: 'Loyal shepherd',
          age: 3,
          is_featured: true
        },
        {
          name: 'Max',
          breed: 'German Shepherd',
          description: 'Smart shepherd',
          age: 4,
          is_featured: false
        }
      ])
      .execute();

    const result = await getDogsByBreed('German Shepherd');

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('Apollo'); // Alphabetically first
    expect(result[1].name).toEqual('Max');
    expect(result[2].name).toEqual('Zeus'); // Alphabetically last
  });

  it('should return empty array for non-existent breed', async () => {
    // Create a dog with a different breed
    await db.insert(dogsTable)
      .values({
        name: 'Buddy',
        breed: 'Golden Retriever',
        description: 'Friendly dog',
        age: 3,
        is_featured: false
      })
      .execute();

    const result = await getDogsByBreed('Poodle');

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should handle breed names with special characters and spaces', async () => {
    // Create dogs with breed names containing spaces and special characters
    await db.insert(dogsTable)
      .values([
        {
          name: 'Fancy',
          breed: 'French Bulldog',
          description: 'Cute French bulldog',
          age: 2,
          is_featured: true
        },
        {
          name: 'Princess',
          breed: 'Cavalier King Charles Spaniel',
          description: 'Royal spaniel',
          age: 1,
          is_featured: false
        }
      ])
      .execute();

    const frenchBulldogResult = await getDogsByBreed('French Bulldog');
    expect(frenchBulldogResult).toHaveLength(1);
    expect(frenchBulldogResult[0].name).toEqual('Fancy');

    const cavalierResult = await getDogsByBreed('Cavalier King Charles Spaniel');
    expect(cavalierResult).toHaveLength(1);
    expect(cavalierResult[0].name).toEqual('Princess');
  });

  it('should handle nullable fields correctly', async () => {
    // Create dogs with some nullable fields set to null
    await db.insert(dogsTable)
      .values([
        {
          name: 'Mystery Dog',
          breed: 'Mixed',
          description: null,
          logo_url: null,
          photo_url: null,
          age: null,
          is_featured: false
        },
        {
          name: 'Complete Dog',
          breed: 'Mixed',
          description: 'Fully documented dog',
          logo_url: 'https://example.com/logo.jpg',
          photo_url: 'https://example.com/photo.jpg',
          age: 5,
          is_featured: true
        }
      ])
      .execute();

    const result = await getDogsByBreed('Mixed');

    expect(result).toHaveLength(2);
    
    // Check dog with null fields
    const mysteryDog = result.find(dog => dog.name === 'Mystery Dog');
    expect(mysteryDog).toBeDefined();
    expect(mysteryDog?.description).toBeNull();
    expect(mysteryDog?.logo_url).toBeNull();
    expect(mysteryDog?.photo_url).toBeNull();
    expect(mysteryDog?.age).toBeNull();
    expect(mysteryDog?.is_featured).toBe(false);

    // Check dog with all fields populated
    const completeDog = result.find(dog => dog.name === 'Complete Dog');
    expect(completeDog).toBeDefined();
    expect(completeDog?.description).toEqual('Fully documented dog');
    expect(completeDog?.logo_url).toEqual('https://example.com/logo.jpg');
    expect(completeDog?.photo_url).toEqual('https://example.com/photo.jpg');
    expect(completeDog?.age).toEqual(5);
    expect(completeDog?.is_featured).toBe(true);
  });

  it('should be case-sensitive for breed matching', async () => {
    // Create dog with specific case breed
    await db.insert(dogsTable)
      .values({
        name: 'Buddy',
        breed: 'Golden Retriever',
        description: 'Friendly dog',
        age: 3,
        is_featured: false
      })
      .execute();

    // Test exact match
    const exactResult = await getDogsByBreed('Golden Retriever');
    expect(exactResult).toHaveLength(1);

    // Test case mismatch
    const lowercaseResult = await getDogsByBreed('golden retriever');
    expect(lowercaseResult).toHaveLength(0);

    const uppercaseResult = await getDogsByBreed('GOLDEN RETRIEVER');
    expect(uppercaseResult).toHaveLength(0);
  });
});