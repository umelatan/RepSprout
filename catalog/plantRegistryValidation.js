// ─────────────────────────────────────────────────────────────────────────
// RepSprout — Collectible plant registry validation
// ─────────────────────────────────────────────────────────────────────────
// Pure, side-effect-free. Returns a list of clearly described problems
// rather than throwing, so a caller (a script, a future admin tool, a test)
// can print every issue at once instead of stopping at the first one.
// ─────────────────────────────────────────────────────────────────────────

// Every plant is expected to have this many stages (see plantRegistry.js's
// FORM_STAGE_NAMES — every form template is 6 entries). A plant with fewer
// stages is missing its final stage even if the stages it does have are
// internally well-ordered, so this is checked as its own explicit rule
// rather than only inferred from the last present stage's own stageNumber.
const REQUIRED_STAGE_COUNT = 6;

/**
 * @param {import('./plantRegistry.js').CollectiblePlant[]} plants
 * @param {Record<string, {name:string}>} categories
 * @param {Record<string, {id:string,name:string}>} collections
 * @returns {string[]} human-readable error strings; empty means the registry is valid
 */
export function validatePlantRegistry(plants, categories, collections) {
  const errors = [];
  const seenIds = new Set();
  const seenSlugs = new Set();
  const seenSpeciesKeys = new Set(); // displayName+scientificName, catches near-duplicate re-listings

  if (!Array.isArray(plants) || !plants.length) {
    return ['Registry is empty or not an array — nothing to validate.'];
  }

  for (const plant of plants) {
    const label = `Plant "${plant?.displayName || plant?.slug || plant?.id || '(unknown)'}"`;

    // ── Identity ──────────────────────────────────────────────────────────
    if (!plant.id) errors.push(`${label}: missing id.`);
    else if (seenIds.has(plant.id)) errors.push(`${label}: duplicate id "${plant.id}".`);
    else seenIds.add(plant.id);

    if (!plant.slug) errors.push(`${label}: missing slug.`);
    else if (seenSlugs.has(plant.slug)) errors.push(`${label}: duplicate slug "${plant.slug}".`);
    else seenSlugs.add(plant.slug);

    if (!plant.displayName || !plant.displayName.trim()) errors.push(`${label}: missing displayName.`);

    // ── Duplicate species guard ──────────────────────────────────────────
    const speciesKey = `${(plant.displayName || '').toLowerCase()}::${(plant.scientificName || '').toLowerCase()}`;
    if (seenSpeciesKeys.has(speciesKey)) errors.push(`${label}: appears to be an exact duplicate of another entry (same name + scientific name).`);
    else seenSpeciesKeys.add(speciesKey);

    // ── Rarity / category / collection ───────────────────────────────────
    if (!plant.rarity) errors.push(`${label}: missing rarity.`);
    if (!plant.category) errors.push(`${label}: missing category.`);
    else if (categories && !categories[plant.category]) errors.push(`${label}: category "${plant.category}" is not in the categories lookup table.`);
    if (!plant.collectionId) errors.push(`${label}: missing collectionId.`);
    else if (collections && !collections[plant.collectionId]) errors.push(`${label}: collectionId "${plant.collectionId}" is not in the collections lookup table.`);

    // ── Seasonal date range ───────────────────────────────────────────────
    if (plant.availableFrom && plant.availableUntil) {
      const from = new Date(plant.availableFrom).getTime();
      const until = new Date(plant.availableUntil).getTime();
      if (Number.isNaN(from) || Number.isNaN(until)) errors.push(`${label}: availableFrom/availableUntil is not a valid date.`);
      else if (from >= until) errors.push(`${label}: availableFrom must be before availableUntil.`);
    }

    // ── Evolution stages ──────────────────────────────────────────────────
    const stages = plant.evolutionStages;
    if (!Array.isArray(stages) || !stages.length) {
      errors.push(`${label}: has no evolutionStages.`);
      continue;
    }
    if (stages.length < REQUIRED_STAGE_COUNT) {
      errors.push(`${label}: missing required stages — has ${stages.length}, expected ${REQUIRED_STAGE_COUNT} (final stage is absent).`);
    }
    const finalStage = stages[stages.length - 1];
    if (!finalStage || finalStage.stageNumber !== stages.length) {
      errors.push(`${label}: final stage is missing or not the last stage.`);
    }
    stages.forEach((stage, i) => {
      const stageLabel = `${label} stage ${i + 1} ("${stage?.displayName || '?'}")`;
      if (stage.stageNumber !== i + 1) errors.push(`${stageLabel}: stages are not ordered (expected stageNumber ${i + 1}, got ${stage.stageNumber}).`);
      if (!stage.key) errors.push(`${stageLabel}: missing stage key.`);
      if (!stage.displayName) errors.push(`${stageLabel}: missing displayName.`);
      if (!stage.placeholderIcon) errors.push(`${stageLabel}: missing placeholder icon.`);
      if (!stage.artworkKey) errors.push(`${stageLabel}: missing artwork key.`);
      if (typeof stage.progressThreshold !== 'number' || stage.progressThreshold < 0 || stage.progressThreshold > 100) {
        errors.push(`${stageLabel}: progressThreshold must be a number between 0 and 100 (got ${stage.progressThreshold}).`);
      }
      if (i > 0 && stage.progressThreshold <= stages[i - 1].progressThreshold) {
        errors.push(`${stageLabel}: progressThreshold must increase from the previous stage.`);
      }
    });

    // ── Unlock metadata ────────────────────────────────────────────────────
    if (!plant.unlock || !plant.unlock.type) errors.push(`${label}: missing unlock rule type.`);
  }

  return errors;
}

/** Convenience — throws if the registry is invalid, with every problem listed. */
export function assertValidPlantRegistry(plants, categories, collections) {
  const errors = validatePlantRegistry(plants, categories, collections);
  if (errors.length) {
    throw new Error(`Plant registry validation failed with ${errors.length} issue(s):\n` + errors.map(e => ` - ${e}`).join('\n'));
  }
}
