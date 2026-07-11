// ─────────────────────────────────────────────────────────────────────────
// RepSprout — Collectible plant registry: query API
// ─────────────────────────────────────────────────────────────────────────
// Reusable, in-memory queries over the static catalogue (see
// "backend vs local data" in the implementation summary for why this is
// in-memory rather than a live Firebase query — the catalogue itself is
// intended to live in Firebase RTDB via plantRegistrySeed.js; this
// repository is the read-side API a future Garden feature would call,
// backed for now by the same PLANTS array the seed script uploads).
//
// Nothing here is wired into index.html. A future Garden feature would
// import this module directly, or re-fetch from `catalog/plants` in
// Firebase and run the same filter/sort logic client-side.
// ─────────────────────────────────────────────────────────────────────────

import { PLANTS, PLANTS_BY_ID, PLANTS_BY_SLUG, CATEGORIES, COLLECTIONS, RARITIES } from './plantRegistry.js';
import { validatePlantRegistry } from './plantRegistryValidation.js';

export function getPlantById(id) {
  return PLANTS_BY_ID.get(id) || null;
}

export function getPlantBySlug(slug) {
  return PLANTS_BY_SLUG.get(slug) || null;
}

/** Active plants only — this is the count a future "X discovered" UI should use, never a fixed 100. */
export function listActivePlants() {
  return PLANTS.filter(p => p.active);
}

export function listAllPlants({ includeInactive = false } = {}) {
  return includeInactive ? PLANTS.slice() : listActivePlants();
}

export function listPlantsByCollection(collectionId, { includeInactive = false } = {}) {
  return listAllPlants({ includeInactive }).filter(p => p.collectionId === collectionId);
}

export function listPlantsByCategory(category, { includeInactive = false } = {}) {
  return listAllPlants({ includeInactive }).filter(p => p.category === category);
}

export function listPlantsByRarity(rarity, { includeInactive = false } = {}) {
  return listAllPlants({ includeInactive }).filter(p => p.rarity === rarity);
}

export function listPlantsByTag(tag, { includeInactive = false } = {}) {
  return listAllPlants({ includeInactive }).filter(p => (p.tags || []).includes(tag));
}

export function listSeasonalPlants({ includeInactive = false } = {}) {
  return listAllPlants({ includeInactive }).filter(p => p.isSeasonal);
}

/** Simple case-insensitive search across name, scientific name and tags. */
export function searchPlants(query, { includeInactive = false } = {}) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  return listAllPlants({ includeInactive }).filter(p =>
    p.displayName.toLowerCase().includes(q) ||
    (p.scientificName || '').toLowerCase().includes(q) ||
    (p.tags || []).some(t => t.toLowerCase().includes(q))
  );
}

export function getEvolutionStages(plantIdOrSlug) {
  const plant = getPlantById(plantIdOrSlug) || getPlantBySlug(plantIdOrSlug);
  return plant ? plant.evolutionStages : [];
}

/**
 * Completion percentage for a collection, given a set of owned plant ids.
 * Denominator is always this collection's CURRENT active plant count —
 * never a fixed 100 — so it stays correct as more plants are added.
 */
export function getCollectionCompletion(collectionId, ownedPlantIds) {
  const owned = new Set(ownedPlantIds || []);
  const plants = listPlantsByCollection(collectionId);
  const ownedCount = plants.filter(p => owned.has(p.id)).length;
  return {
    collectionId,
    ownedCount,
    eligibleCount: plants.length,
    percent: plants.length ? Math.round((ownedCount / plants.length) * 100) : 0
  };
}

/** Same idea, across the whole active catalogue — "overall discovered count." */
export function getOverallCompletion(ownedPlantIds) {
  const owned = new Set(ownedPlantIds || []);
  const plants = listActivePlants();
  const ownedCount = plants.filter(p => owned.has(p.id)).length;
  return {
    ownedCount,
    eligibleCount: plants.length,
    percent: plants.length ? Math.round((ownedCount / plants.length) * 100) : 0
  };
}

export function listCategories() { return CATEGORIES; }
export function listCollections() { return COLLECTIONS; }
export function listRarities() { return RARITIES; }

export function validateRegistry() {
  return validatePlantRegistry(PLANTS, CATEGORIES, COLLECTIONS);
}
