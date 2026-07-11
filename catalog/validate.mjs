// Run with: jsc -m catalog/validate.mjs   (or any ES-module-capable JS runtime)
// Prints a clear pass/fail report for the collectible plant registry.
import { PLANTS, CATEGORIES, COLLECTIONS } from './plantRegistry.js';
import { validatePlantRegistry } from './plantRegistryValidation.js';

const errors = validatePlantRegistry(PLANTS, CATEGORIES, COLLECTIONS);

print(`Catalogue: ${PLANTS.length} plants, ${Object.keys(COLLECTIONS).length} collections, ${Object.keys(CATEGORIES).length} categories.`);

if (!errors.length) {
  print('PASS: no validation errors.');
} else {
  print(`FAIL: ${errors.length} validation error(s):`);
  errors.forEach(e => print(' - ' + e));
  throw new Error('Registry validation failed.');
}
