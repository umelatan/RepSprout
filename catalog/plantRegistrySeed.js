// ─────────────────────────────────────────────────────────────────────────
// RepSprout — Idempotent catalogue seed
// ─────────────────────────────────────────────────────────────────────────
// Upserts the in-code catalogue (plantRegistry.js) into Firebase RTDB under
// `catalog/plants/{plantId}` and `catalog/collections/{collectionId}`.
// Firebase is this project's real backend (see index.html's existing
// users/exercises/sessions paths) — this seeds the SAME database, just a
// new top-level path, not a separate store.
//
// Idempotent by construction: every plant is written to a path keyed by
// its own stable id (never push()'d), so re-running this can only ever
// overwrite that exact record — it cannot create a second copy. Stages
// live nested inside the plant record and are written atomically with it,
// so "duplicate stages" independent of the plant record isn't possible.
//
// This module takes its Firebase functions as arguments instead of
// importing firebase itself, so it can be loaded from catalog/seed-tool.html
// (a standalone dev page — see that file) without touching index.html or
// requiring a build step. It is NOT imported anywhere in the running app.
//
// Firebase RTDB rules must allow `catalog` reads/writes before this can run
// against production — see the `catalog` block added to database.rules.json.
// ─────────────────────────────────────────────────────────────────────────

import { PLANTS, COLLECTIONS, CATEGORIES } from './plantRegistry.js';
import { validatePlantRegistry } from './plantRegistryValidation.js';

/**
 * @param {{db: any, ref: Function, set: Function, get: Function}} firebase
 * @param {{onProgress?: (plant: object) => void}} [options]
 */
export async function seedPlantRegistry({ db, ref, set, get }, { onProgress } = {}) {
  const errors = validatePlantRegistry(PLANTS, CATEGORIES, COLLECTIONS);
  if (errors.length) {
    throw new Error(`Refusing to seed — registry has ${errors.length} validation issue(s):\n` + errors.map(e => ` - ${e}`).join('\n'));
  }

  const results = { collectionsWritten: 0, plantsCreated: 0, plantsUpdated: 0, plantsUnchanged: 0 };

  // Collections are small, static, and hold no user data — a plain upsert is safe.
  for (const collection of Object.values(COLLECTIONS)) {
    await set(ref(db, `catalog/collections/${collection.id}`), collection);
    results.collectionsWritten++;
  }

  for (const plant of PLANTS) {
    const path = `catalog/plants/${plant.id}`;
    const snap = await get(ref(db, path));
    const existing = snap.exists ? snap.exists() && snap.val() : snap.val();

    if (!existing) {
      await set(ref(db, path), plant);
      results.plantsCreated++;
    } else {
      // Preserve the original createdAt (and, implicitly, the record's stable
      // id/slug — those never change since `path` is keyed by `plant.id`).
      // Refresh everything else only if something actually changed.
      const merged = { ...plant, createdAt: existing.createdAt || plant.createdAt };
      if (JSON.stringify(merged) !== JSON.stringify(existing)) {
        await set(ref(db, path), merged);
        results.plantsUpdated++;
      } else {
        results.plantsUnchanged++;
      }
    }
    if (onProgress) onProgress(plant);
  }

  return results;
}
