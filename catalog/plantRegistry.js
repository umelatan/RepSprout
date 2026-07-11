// ─────────────────────────────────────────────────────────────────────────
// RepSprout — Collectible Plant Registry
// ─────────────────────────────────────────────────────────────────────────
// This is a SEPARATE system from the onboarding "personality plant"
// (PLANTS in index.html — cactus/oak/bamboo/lavender/sunflower, the user's
// main mascot). Nothing in this module reads or writes that constant, and
// nothing in index.html imports this module. This file is not wired into
// the running app yet — it is the data/architecture foundation for a
// future Garden collectible feature. See catalog/README.md for how to
// actually run the seed against Firebase when that feature is built.
//
// Two ideas are deliberately kept distinct throughout this file:
//   - a PLANT SPEC: the ~10 fields a catalogue author actually writes
//   - a PLANT RECORD: the ~25-field expanded shape (spec + generated
//     stages + timestamps + derived fields) that queries/persistence use
//
// No collectible in the initial seed reuses a personality-plant display
// name (Cactus, Oak Tree, Bamboo, Lavender, Sunflower) — see the "naming
// conflicts" note in the project README / final summary for specific
// species chosen instead (e.g. Saguaro instead of a generic "Cactus").
//
// Nothing here is a maximum. listActivePlants().length is whatever the
// catalogue currently contains — see plantRegistryRepository.js.
// ─────────────────────────────────────────────────────────────────────────

// ── Schema (JSDoc typedefs — this project has no TypeScript build step) ────
/**
 * @typedef {Object} EvolutionStage
 * @property {number} stageNumber        1-based, ordered, no gaps
 * @property {string} key                stable, e.g. "rose-stage-3"
 * @property {string} displayName        e.g. "Young Plant"
 * @property {string} description
 * @property {string} placeholderIcon    an emoji standing in for real art
 * @property {string} artworkKey         stable key a future asset pipeline maps to real art
 * @property {'placeholder'|'draft'|'final'|'deprecated'} assetStatus
 * @property {boolean} placeholderNeedsCustomArtwork  true when the emoji is a generic stand-in, not botanically exact
 * @property {number} progressThreshold  0-100, inclusive lower bound for this stage
 * @property {number} sortOrder          == stageNumber - 1, kept explicit per the requested shape
 */

/**
 * @typedef {Object} UnlockRule
 * @property {'workout_count'|'working_set_count'|'exercise_completion'|'rep_improvement'|
 *            'weight_increase'|'growth_points'|'level'|'calendar_month'|'collection_completion'|
 *            'seasonal_event'|'hidden_discovery'|'manual_grant'} type
 * @property {number} [threshold]
 * @property {string} [note]             human-readable hint for a future unlock service; not evaluated anywhere yet
 */

/**
 * @typedef {Object} CollectiblePlant
 * @property {string} id                 stable, permanent, never reused — e.g. "plant_rose"
 * @property {string} slug               stable, url/display-safe, unique — e.g. "rose"
 * @property {string} displayName
 * @property {string} [scientificName]
 * @property {string} description
 * @property {'common'|'uncommon'|'rare'|'epic'|'legendary'|'mythic'} rarity
 * @property {string} category           key into CATEGORIES — a lookup table, not a hardcoded enum
 * @property {string} collectionId       key into COLLECTIONS
 * @property {string} collectionName     denormalized for convenience; COLLECTIONS is still the source of truth
 * @property {string[]} tags
 * @property {string} theme
 * @property {string} habitat
 * @property {string} [bloomSeason]
 * @property {string} primaryColor
 * @property {string} secondaryColor
 * @property {string} [accentColor]
 * @property {boolean} isSeasonal
 * @property {boolean} isLimited
 * @property {string} [availableFrom]    ISO date
 * @property {string} [availableUntil]   ISO date
 * @property {string} [eventKey]
 * @property {EvolutionStage[]} evolutionStages   always a complete, ordered sequence
 * @property {UnlockRule} unlock
 * @property {number} sortOrder          display ordering only — NEVER used as identity
 * @property {number} version
 * @property {boolean} active            false for retired plants; record is kept, not deleted
 * @property {number} releaseVersion
 * @property {string} createdAt          ISO timestamp
 * @property {string} updatedAt          ISO timestamp
 */

/**
 * @typedef {Object} PlantCollection
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {boolean} isSeasonal
 * @property {boolean} isLimited
 */

/**
 * @typedef {Object} UserCollectibleRecord  (future — not created by this task)
 * @property {string} userId
 * @property {string} plantId
 * @property {'locked'|'discovered'|'growing'|'bloomed'|'mastered'} status
 * @property {number} currentStage
 * @property {number} stageProgress
 * @property {number} totalGrowth
 * @property {string} [discoveredAt]
 * @property {string} [startedGrowingAt]
 * @property {string} [bloomedAt]
 * @property {string} [masteredAt]
 * @property {boolean} selectedForDisplay
 * @property {number} [quantity]
 * @property {string} [lastGrowthAt]
 */

export const SEED_TIMESTAMP = '2026-07-11T00:00:00.000Z';
export const REGISTRY_RELEASE_VERSION = 1;

// ── Rarity tiers — catalogue metadata only, no gameplay/probability yet ────
export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

// ── Categories: a lookup table (extensible), not a rigid enum ──────────────
export const CATEGORIES = {
  'garden-flowers':    { name: 'Garden Flowers' },
  'wildflowers':        { name: 'Wildflowers' },
  'woodland-plants':    { name: 'Woodland Plants' },
  'mountain-plants':    { name: 'Mountain Plants' },
  'desert-plants':      { name: 'Desert Plants' },
  'tropical-plants':    { name: 'Tropical Plants' },
  'aquatic-plants':     { name: 'Aquatic Plants' },
  'medicinal-plants':   { name: 'Medicinal Plants' },
  'culinary-herbs':     { name: 'Culinary Herbs' },
  'fragrant-flowers':   { name: 'Fragrant Flowers' },
  'night-bloomers':     { name: 'Night Bloomers' },
  'trees':              { name: 'Trees' },
  'vines':               { name: 'Vines' },
  'ferns':               { name: 'Ferns' },
  'mosses':              { name: 'Mosses' },
  'succulents':          { name: 'Succulents' },
  'rare-botanicals':     { name: 'Rare Botanicals' },
  'fantasy-plants':      { name: 'Fantasy Plants' }
};

// ── Collections: themed groupings, future-seasonal-ready ───────────────────
export const COLLECTIONS = {
  'core-garden':        { id: 'core-garden',        name: 'Core Garden',        description: 'The everyday collectible garden — always available.',              isSeasonal: false, isLimited: false },
  'spring-bloom':       { id: 'spring-bloom',       name: 'Spring Bloom',       description: 'Early bloomers and fresh growth.',                                  isSeasonal: true,  isLimited: false },
  'summer-garden':      { id: 'summer-garden',      name: 'Summer Garden',      description: 'Bold color under long, warm days.',                                 isSeasonal: true,  isLimited: false },
  'autumn-harvest':     { id: 'autumn-harvest',     name: 'Autumn Harvest',     description: 'Late-season blooms and turning leaves.',                            isSeasonal: true,  isLimited: false },
  'winter-greenhouse':  { id: 'winter-greenhouse',  name: 'Winter Greenhouse',  description: 'What keeps growing when it is cold outside.',                       isSeasonal: true,  isLimited: false },
  'tropical-escape':    { id: 'tropical-escape',    name: 'Tropical Escape',    description: 'Warm-climate and rainforest species.',                              isSeasonal: false, isLimited: false },
  'midnight-garden':    { id: 'midnight-garden',    name: 'Midnight Garden',    description: 'Night bloomers and moonlit rarities.',                              isSeasonal: false, isLimited: false },
  'desert-bloom':       { id: 'desert-bloom',       name: 'Desert Bloom',       description: 'Cacti, succulents and arid survivors.',                             isSeasonal: false, isLimited: false },
  'water-garden':       { id: 'water-garden',       name: 'Water Garden',       description: 'Aquatic and pond-side species.',                                    isSeasonal: false, isLimited: false },
  'medicinal-garden':   { id: 'medicinal-garden',   name: 'Medicinal Garden',   description: 'Herbal and traditional medicinal plants.',                          isSeasonal: false, isLimited: false },
  'fantasy-grove':      { id: 'fantasy-grove',      name: 'Fantasy Grove',      description: 'Plants that only exist in RepSprout — clearly marked as fantasy.', isSeasonal: false, isLimited: false }
};

// ── Unlock rule types — structured metadata only; no service consumes these yet ─
export const UNLOCK_TYPES = [
  'workout_count', 'working_set_count', 'exercise_completion', 'rep_improvement',
  'weight_increase', 'growth_points', 'level', 'calendar_month',
  'collection_completion', 'seasonal_event', 'hidden_discovery', 'manual_grant'
];

// Structured placeholder defaults, applied when a spec doesn't set its own
// `unlock`. Purely catalogue metadata — nothing reads these to gate gameplay.
const DEFAULT_UNLOCK_BY_RARITY = {
  common:    { type: 'workout_count', threshold: 5 },
  uncommon:  { type: 'working_set_count', threshold: 40 },
  rare:      { type: 'rep_improvement', threshold: 5 },
  epic:      { type: 'weight_increase', threshold: 1 },
  legendary: { type: 'growth_points', threshold: 80 },
  mythic:    { type: 'hidden_discovery', note: 'Reserved for a future hidden-discovery mechanic.' }
};

// ── Evolution-stage name templates, by plant "form" ─────────────────────────
// Six stages always. Species differ mainly in naming flavor and in how
// convincing an existing Unicode emoji is for the later stages — see
// FORM_ICON_SETS below. Adding a new form later means adding one entry
// here; it never requires touching an existing plant record.
export const FORM_STAGE_NAMES = {
  flower:    ['Seed', 'Sprout', 'Seedling', 'Young Plant', 'Bud', 'Full Bloom'],
  cactus:    ['Seed', 'Tiny Sprout', 'Small Cactus', 'Young Cactus', 'Mature Cactus', 'Flowering Cactus'],
  tree:      ['Seed', 'Sprout', 'Sapling', 'Young Tree', 'Mature Tree', 'Flowering Tree'],
  fern:      ['Spore', 'Fiddlehead', 'Small Fern', 'Young Fern', 'Unfurling Fern', 'Full Fern'],
  succulent: ['Seed', 'Tiny Sprout', 'Small Rosette', 'Young Succulent', 'Maturing Rosette', 'Full Rosette'],
  vine:      ['Seed', 'Sprout', 'Young Vine', 'Climbing Vine', 'Budding Vine', 'Flowering Vine'],
  aquatic:   ['Seed', 'Sprout', 'Floating Leaf', 'Young Plant', 'Bud', 'Full Bloom'],
  moss:      ['Spore', 'Sprout', 'Patch', 'Spreading Moss', 'Dense Moss', 'Full Moss Carpet'],
  herb:      ['Seed', 'Sprout', 'Seedling', 'Young Herb', 'Budding Herb', 'Full Herb'],
  fantasy:   ['Seed', 'Sprout', 'Seedling', 'Young Plant', 'Bud', 'Full Bloom']
};

// Generic early-stage icons per form (stages 1-4 — real species differences
// mostly don't show yet at these stages in real life either). finalIcon
// (stage 6) and, when supplied, budIcon (stage 5) are provided per plant.
const FORM_ICON_SETS = {
  flower:    ['🌰', '🌱', '🌿', '🪴'],
  cactus:    ['🌰', '🌱', '🌵', '🌵'],
  tree:      ['🌰', '🌱', '🌿', '🌳'],
  fern:      ['🌰', '🌱', '🌿', '🌿'],
  succulent: ['🌰', '🌱', '🪴', '🪴'],
  vine:      ['🌰', '🌱', '🌿', '🌿'],
  aquatic:   ['🌰', '🌱', '🌿', '🪷'],
  moss:      ['🌰', '🌱', '☘️', '☘️'],
  herb:      ['🌰', '🌱', '🌿', '🌿'],
  fantasy:   ['🌰', '🌱', '🌿', '🪴']
};

// Stages 1-4 are genuinely reasonable generic placeholders (a seed looks
// like a seed regardless of species) — not flagged. Stage 5 (bud) reusing
// the final emoji, and any stage-6 emoji that isn't a true botanical match,
// ARE flagged, per the task's own worked example (Lavender bud/bloom both
// use 🪻 and neither claims to be exact at the bud stage).
const EARLY_STAGE_NEEDS_ARTWORK = [false, false, false, false];

// Generic nouns that a stage-4/5 name ends in across the FORM_STAGE_NAMES
// templates (e.g. "Young Plant", "Mature Cactus", "Budding Vine"). Replacing
// just the trailing noun with the species' own displayName is what turns a
// generic stage name into a species-recognizable one (task's own example:
// "Young Plant" -> "Young Lavender") without needing bespoke grammar per form.
const STAGE_NAME_GENERIC_NOUNS = ['Plant', 'Cactus', 'Tree', 'Fern', 'Vine', 'Rosette', 'Herb', 'Moss', 'Carpet'];
function speciesifyStageName(genericName, displayName) {
  const words = genericName.split(' ');
  const last = words[words.length - 1];
  if (words.length > 1 && STAGE_NAME_GENERIC_NOUNS.includes(last)) {
    return [...words.slice(0, -1), displayName].join(' ');
  }
  return `${displayName} ${genericName}`; // single-word generic, e.g. "Bud" -> "Rose Bud"
}

/**
 * Expands a compact plant spec into its full six-stage evolutionStages array.
 * Stages 1-3 stay fully generic (a seed looks like a seed regardless of
 * species). Stage 4-5 are species-ified via speciesifyStageName(). Stage 6
 * (the final form) is simply the plant's own displayName — the clearest
 * possible way to satisfy "the final stage must represent the species."
 * @param {string} slug
 * @param {string} displayName
 * @param {string} formType
 * @param {string} finalIcon
 * @param {boolean} finalIconAccurate  true only when finalIcon is a genuine botanical match
 * @param {string} [budIcon]           defaults to finalIcon, matching the task's own example
 * @returns {EvolutionStage[]}
 */
function buildEvolutionStages(slug, displayName, formType, finalIcon, finalIconAccurate, budIcon) {
  const names = FORM_STAGE_NAMES[formType] || FORM_STAGE_NAMES.flower;
  const earlyIcons = FORM_ICON_SETS[formType] || FORM_ICON_SETS.flower;
  const icons = [...earlyIcons, budIcon || finalIcon, finalIcon];
  const needsArtwork = [...EARLY_STAGE_NEEDS_ARTWORK, true, !finalIconAccurate];
  const stageNames = names.map((genericName, i) => {
    if (i === names.length - 1) return displayName; // stage 6 — always the species itself
    if (i === names.length - 2) return speciesifyStageName(genericName, displayName); // stage 5
    return genericName; // stages 1-4 (stage 4 is speciesified too — see below)
  });
  // Stage 4 (index 3) also gets species-ified, matching the "Young Lavender" example.
  stageNames[3] = speciesifyStageName(names[3], displayName);
  return names.map((genericName, i) => {
    const stageNumber = i + 1;
    return {
      stageNumber,
      key: `${slug}-stage-${stageNumber}`,
      displayName: stageNames[i],
      description: stageNumber === names.length
        ? `${displayName}, fully grown.`
        : `${displayName} at its "${genericName}" stage.`,
      placeholderIcon: icons[i],
      artworkKey: `${slug}-stage-${stageNumber}`,
      assetStatus: 'placeholder',
      placeholderNeedsCustomArtwork: needsArtwork[i],
      progressThreshold: Math.round((i / names.length) * 100),
      sortOrder: i
    };
  });
}

/**
 * Expands a compact PlantSpec into a full CollectiblePlant record.
 * @param {Object} spec
 * @param {number} sortOrder
 * @returns {CollectiblePlant}
 */
function buildPlant(spec, sortOrder) {
  const collection = COLLECTIONS[spec.collectionId];
  if (!collection) throw new Error(`Unknown collectionId "${spec.collectionId}" for plant "${spec.slug}"`);
  const [primaryColor, secondaryColor, accentColor] = spec.colors || [];
  return {
    id: `plant_${spec.slug.replace(/-/g, '_')}`,
    slug: spec.slug,
    displayName: spec.displayName,
    scientificName: spec.scientificName || null,
    description: spec.description || `${spec.displayName} is a ${spec.rarity} collectible from the ${collection.name} collection.`,
    rarity: spec.rarity,
    category: spec.category,
    collectionId: spec.collectionId,
    collectionName: collection.name,
    tags: spec.tags || [],
    theme: spec.theme || '',
    habitat: spec.habitat || '',
    bloomSeason: spec.bloomSeason || null,
    primaryColor: primaryColor || '#22c55e',
    secondaryColor: secondaryColor || '#dcfce7',
    accentColor: accentColor || null,
    isSeasonal: spec.isSeasonal ?? collection.isSeasonal,
    isLimited: spec.isLimited ?? collection.isLimited,
    availableFrom: spec.availableFrom || null,
    availableUntil: spec.availableUntil || null,
    eventKey: spec.eventKey || null,
    evolutionStages: buildEvolutionStages(spec.slug, spec.displayName, spec.formType, spec.finalIcon, !!spec.finalIconAccurate, spec.budIcon),
    unlock: spec.unlock || DEFAULT_UNLOCK_BY_RARITY[spec.rarity] || { type: 'manual_grant', note: 'Unlock rule not yet assigned.' },
    sortOrder,
    version: 1,
    active: spec.active !== false,
    releaseVersion: spec.releaseVersion || REGISTRY_RELEASE_VERSION,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP
  };
}

// ── Compact plant specs — the actual authored catalogue ─────────────────────
// This is intentionally the ONLY place species are listed. Each spec is the
// ~10 fields an author needs; buildPlant()/buildEvolutionStages() generate
// the rest. Adding plant #101 means adding one object to this array — no
// other file in this module (or the app) needs to change.
import { PLANT_SPECS } from './plantRegistrySpecs.js';

/** @type {CollectiblePlant[]} */
export const PLANTS = PLANT_SPECS.map((spec, i) => buildPlant(spec, i));

export const PLANTS_BY_ID = new Map(PLANTS.map(p => [p.id, p]));
export const PLANTS_BY_SLUG = new Map(PLANTS.map(p => [p.slug, p]));
