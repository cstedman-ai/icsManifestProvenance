import { v4 as uuidv4 } from 'uuid';
import { catalogItems } from '../data/cores/catalog';

export function generateSeedInventory() {
  const now = new Date().toISOString();
  const seed = [];

  for (const item of catalogItems) {
    for (const vendorId of item.vendorIds) {
      seed.push({
        id: uuidv4(),
        vendorId,
        catalogItemId: item.id,
        quantity: 10,
        updatedAt: now,
      });
    }
  }

  return seed;
}
