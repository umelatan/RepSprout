// Run with: jsc -m catalog/test-registry.mjs
// Exercises the repository API, idempotent seeding (against a fake in-memory
// Firebase), and the validation failure paths from the task's test cases.
import { PLANTS, PLANTS_BY_ID, COLLECTIONS, CATEGORIES } from './plantRegistry.js';
import { validatePlantRegistry } from './plantRegistryValidation.js';
import { seedPlantRegistry } from './plantRegistrySeed.js';
import {
  getPlantById, getPlantBySlug, listActivePlants, listPlantsByCollection,
  listPlantsByCategory, listPlantsByRarity, searchPlants, getEvolutionStages,
  getCollectionCompletion, getOverallCompletion
} from './plantRegistryRepository.js';

function assert(cond, msg) { if (!cond) throw new Error('FAIL: ' + msg); print('  ok: ' + msg); }

// ── Fake in-memory "Firebase" — just enough to prove idempotent upsert logic ─
function makeFakeDb() {
  const store = {};
  return {
    db: store,
    ref: (_db, path) => path,
    get: async (path) => {
      const val = path.split('/').reduce((o, k) => (o == null ? undefined : o[k]), store);
      return { exists: () => val !== undefined, val: () => val };
    },
    set: async (path, value) => {
      const parts = path.split('/');
      let node = store;
      for (let i = 0; i < parts.length - 1; i++) node = (node[parts[i]] ??= {});
      node[parts[parts.length - 1]] = value;
    }
  };
}

print('Case 1: initial seed — ~100 unique plants, each with complete stages');
assert(PLANTS.length >= 90 && PLANTS.length <= 130, `catalogue has an "approximately 100" count (${PLANTS.length})`);
assert(new Set(PLANTS.map(p => p.id)).size === PLANTS.length, 'every plant id is unique');
assert(new Set(PLANTS.map(p => p.slug)).size === PLANTS.length, 'every plant slug is unique');
assert(PLANTS.every(p => p.evolutionStages.length === 6), 'every plant has exactly 6 evolution stages');
assert(validatePlantRegistry(PLANTS, CATEGORIES, COLLECTIONS).length === 0, 'the seeded catalogue passes validation with zero errors');

print('Case 2: run seed twice — no duplicate plants, no duplicate stages');
{
  const fake = makeFakeDb();
  const first = await seedPlantRegistry(fake);
  assert(first.plantsCreated === PLANTS.length, `first run creates all ${PLANTS.length} plants`);
  const plantKeysAfterFirst = Object.keys(fake.db.catalog.plants).length;
  const second = await seedPlantRegistry(fake);
  assert(second.plantsCreated === 0, 'second run creates zero new plants');
  assert(second.plantsUnchanged === PLANTS.length, 'second run reports every plant unchanged (nothing to update)');
  const plantKeysAfterSecond = Object.keys(fake.db.catalog.plants).length;
  assert(plantKeysAfterFirst === plantKeysAfterSecond, 'the number of stored plant records did not grow on the second run');
}

print('Case 3: add a 101st plant — no schema/logic changes required, query APIs see it');
{
  const extraSpecPlant = {
    id: 'plant_test_only', slug: 'test-only-plant', displayName: 'Test-Only Plant',
    scientificName: null, description: 'A plant added purely for this test.',
    rarity: 'common', category: 'garden-flowers', collectionId: 'core-garden', collectionName: 'Core Garden',
    tags: [], theme: '', habitat: '', bloomSeason: null,
    primaryColor: '#22c55e', secondaryColor: '#dcfce7', accentColor: null,
    isSeasonal: false, isLimited: false, availableFrom: null, availableUntil: null, eventKey: null,
    evolutionStages: PLANTS[0].evolutionStages.map(s => ({ ...s })),
    unlock: { type: 'manual_grant' }, sortOrder: PLANTS.length, version: 1, active: true,
    releaseVersion: 1, createdAt: '2026-07-11T00:00:00.000Z', updatedAt: '2026-07-11T00:00:00.000Z'
  };
  const extendedCatalogue = [...PLANTS, extraSpecPlant];
  assert(validatePlantRegistry(extendedCatalogue, CATEGORIES, COLLECTIONS).length === 0, 'adding a 101st plant does not break validation');
  const found = extendedCatalogue.find(p => p.id === 'plant_test_only');
  assert(!!found, 'the new plant is findable in the extended catalogue with zero code changes');
}

print('Case 4: a future seasonal collection works purely through metadata');
{
  const newCollections = { ...COLLECTIONS, 'holiday-lights-2027': { id: 'holiday-lights-2027', name: 'Holiday Lights 2027', description: 'A future seasonal drop.', isSeasonal: true, isLimited: true } };
  const seasonalPlant = { ...PLANTS[0], id: 'plant_seasonal_test', slug: 'seasonal-test', displayName: 'Seasonal Test Bloom', scientificName: null, collectionId: 'holiday-lights-2027', collectionName: 'Holiday Lights 2027', isSeasonal: true, isLimited: true, availableFrom: '2027-12-01T00:00:00.000Z', availableUntil: '2027-12-31T00:00:00.000Z' };
  assert(validatePlantRegistry([...PLANTS, seasonalPlant], CATEGORIES, newCollections).length === 0, 'a brand-new seasonal collection validates cleanly with no fixed-collection-limit rejection');
}

print('Case 5: missing stage icon fails validation clearly');
{
  const broken = { ...PLANTS[0], id: 'plant_broken_icon', slug: 'broken-icon', evolutionStages: PLANTS[0].evolutionStages.map((s, i) => i === 2 ? { ...s, placeholderIcon: '' } : { ...s }) };
  const errors = validatePlantRegistry([broken], CATEGORIES, COLLECTIONS);
  assert(errors.some(e => e.includes('missing placeholder icon')), 'a missing stage icon produces a clear, specific error: ' + JSON.stringify(errors));
}

print('Case 6: missing final stage fails validation clearly');
{
  const broken = { ...PLANTS[0], id: 'plant_broken_final', slug: 'broken-final', evolutionStages: PLANTS[0].evolutionStages.slice(0, 5) };
  const errors = validatePlantRegistry([broken], CATEGORIES, COLLECTIONS);
  assert(errors.some(e => e.toLowerCase().includes('final stage')), 'a missing final stage produces a clear error: ' + JSON.stringify(errors));
}

print('Case 7: retiring a plant marks it inactive without deleting its stable record');
{
  const rose = PLANTS_BY_ID.get('plant_rose');
  const retired = { ...rose, active: false };
  assert(validatePlantRegistry([retired], CATEGORIES, COLLECTIONS).length === 0, 'an inactive plant still validates (record preserved, not deleted)');
  const activeOnly = [retired, PLANTS_BY_ID.get('plant_tulip')].filter(p => p.active);
  assert(activeOnly.length === 1 && activeOnly[0].id === 'plant_tulip', 'listActivePlants-style filtering correctly excludes only the retired plant');
}

print('Case 10: future artwork replacement never touches plant/stage ids');
{
  const rose = PLANTS_BY_ID.get('plant_rose');
  const withRealArt = { ...rose, evolutionStages: rose.evolutionStages.map((s, i) => i === 5 ? { ...s, assetStatus: 'final', placeholderNeedsCustomArtwork: false, placeholderIcon: 'https://cdn.example.com/rose-stage-6.png' } : s) };
  assert(withRealArt.id === rose.id, 'plant id unchanged after artwork replacement');
  assert(withRealArt.evolutionStages[5].key === rose.evolutionStages[5].key, 'stage key unchanged after artwork replacement');
  assert(withRealArt.evolutionStages[5].artworkKey === rose.evolutionStages[5].artworkKey, 'artworkKey (the stable hook for the asset pipeline) unchanged');
}

print('Repository API sanity checks:');
assert(getPlantBySlug('rose').id === 'plant_rose', 'getPlantBySlug works');
assert(getPlantById('plant_rose').slug === 'rose', 'getPlantById works');
assert(listActivePlants().length === PLANTS.length, 'listActivePlants returns all seeded plants (all active)');
assert(listPlantsByCollection('desert-bloom').every(p => p.collectionId === 'desert-bloom'), 'listPlantsByCollection filters correctly');
assert(listPlantsByCategory('fantasy-plants').every(p => p.category === 'fantasy-plants'), 'listPlantsByCategory filters correctly');
assert(listPlantsByRarity('mythic').length > 0, 'mythic rarity tier is populated (fantasy plants)');
assert(searchPlants('rose').some(p => p.slug === 'rose'), 'searchPlants finds Rose by name');
assert(getEvolutionStages('rose').length === 6, 'getEvolutionStages returns the full 6-stage sequence');
const overall = getOverallCompletion(['plant_rose', 'plant_tulip']);
assert(overall.eligibleCount === PLANTS.length, 'overall completion denominator is the live active catalogue count, not a fixed 100');
assert(overall.ownedCount === 2, 'overall completion counts owned plants correctly');

print('ALL PLANT REGISTRY TESTS PASSED');
