// ─────────────────────────────────────────────────────────────────────────
// RepSprout — Initial collectible-plant catalogue (seed data only)
// ─────────────────────────────────────────────────────────────────────────
// This is the ONLY place species are listed. plantRegistry.js expands each
// compact spec below into a full CollectiblePlant record (stages, artwork
// metadata, timestamps, etc). Adding plant #107 means adding one line here
// — no other file needs to change, and nothing about "how many plants
// exist" is hardcoded anywhere in this module or its consumers.
//
// None of these reuse an onboarding personality-plant display name (Cactus,
// Oak Tree, Bamboo, Lavender, Sunflower) — see specific species chosen
// instead (Saguaro, Willow, etc). See the implementation summary for the
// full naming-conflict note.
//
// p(...) fields, in order:
//   slug, displayName, scientificName, category, collectionId, rarity,
//   formType, finalIcon, finalIconAccurate, colors:[primary,secondary,accent?],
//   tags:[], theme, habitat, bloomSeason, extra:{} (unlock, budIcon, isSeasonal, etc.)
// ─────────────────────────────────────────────────────────────────────────

function p(slug, displayName, scientificName, category, collectionId, rarity, formType, finalIcon, finalIconAccurate, colors, tags, theme, habitat, bloomSeason, extra) {
  return { slug, displayName, scientificName, category, collectionId, rarity, formType, finalIcon, finalIconAccurate, colors, tags, theme, habitat, bloomSeason, ...extra };
}

export const PLANT_SPECS = [
  // ── Core Garden — classic garden flowers ─────────────────────────────────
  p('rose', 'Rose', 'Rosa spp.', 'garden-flowers', 'core-garden', 'common', 'flower', '🌹', true, ['#e11d48', '#fecdd3', '#be123c'], ['fragrant', 'classic'], 'romance', 'garden', 'summer'),
  p('tulip', 'Tulip', 'Tulipa spp.', 'garden-flowers', 'spring-bloom', 'common', 'flower', '🌷', true, ['#f43f5e', '#fda4af'], ['classic'], 'renewal', 'garden', 'spring'),
  p('peony', 'Peony', 'Paeonia spp.', 'garden-flowers', 'core-garden', 'uncommon', 'flower', '🌸', false, ['#f9a8d4', '#fce7f3'], ['lush', 'romantic'], 'abundance', 'garden', 'spring'),
  p('hydrangea', 'Hydrangea', 'Hydrangea macrophylla', 'garden-flowers', 'summer-garden', 'uncommon', 'flower', '🌸', false, ['#93c5fd', '#c4b5fd'], ['lush'], 'abundance', 'garden', 'summer'),
  p('dahlia', 'Dahlia', 'Dahlia pinnata', 'garden-flowers', 'summer-garden', 'uncommon', 'flower', '🌺', false, ['#f97316', '#fed7aa'], ['bold'], 'confidence', 'garden', 'summer'),
  p('carnation', 'Carnation', 'Dianthus caryophyllus', 'garden-flowers', 'core-garden', 'common', 'flower', '🌸', false, ['#fb7185', '#ffe4e6'], ['classic'], 'affection', 'garden', 'summer'),
  p('zinnia', 'Zinnia', 'Zinnia elegans', 'garden-flowers', 'summer-garden', 'common', 'flower', '🌼', false, ['#f59e0b', '#fef08a'], ['cheerful'], 'endurance', 'garden', 'summer'),
  p('ranunculus', 'Ranunculus', 'Ranunculus asiaticus', 'garden-flowers', 'spring-bloom', 'rare', 'flower', '🌺', false, ['#fb923c', '#fed7aa'], ['layered'], 'charm', 'garden', 'spring'),
  p('camellia', 'Camellia', 'Camellia japonica', 'garden-flowers', 'winter-greenhouse', 'uncommon', 'flower', '🌸', false, ['#f472b6', '#fbcfe8'], ['refined'], 'devotion', 'garden', 'winter'),
  p('daffodil', 'Daffodil', 'Narcissus spp.', 'garden-flowers', 'spring-bloom', 'common', 'flower', '🌼', false, ['#facc15', '#fef9c3'], ['classic'], 'new-beginnings', 'garden', 'spring'),
  p('chrysanthemum', 'Chrysanthemum', 'Chrysanthemum spp.', 'garden-flowers', 'autumn-harvest', 'common', 'flower', '🌼', false, ['#f59e0b', '#fde68a'], ['classic'], 'longevity', 'garden', 'autumn'),
  p('cosmos', 'Cosmos', 'Cosmos bipinnatus', 'garden-flowers', 'summer-garden', 'common', 'flower', '🌸', false, ['#f9a8d4', '#fce7f3'], ['airy'], 'harmony', 'garden', 'summer'),
  p('marigold', 'Marigold', 'Tagetes spp.', 'garden-flowers', 'autumn-harvest', 'common', 'flower', '🌼', false, ['#f97316', '#fed7aa'], ['cheerful'], 'warmth', 'garden', 'autumn'),
  p('iris', 'Iris', 'Iris germanica', 'garden-flowers', 'core-garden', 'uncommon', 'flower', '🌸', false, ['#6366f1', '#c7d2fe'], ['elegant'], 'wisdom', 'garden', 'spring'),
  p('snapdragon', 'Snapdragon', 'Antirrhinum majus', 'garden-flowers', 'core-garden', 'common', 'flower', '🌸', false, ['#ec4899', '#fbcfe8'], ['playful'], 'grace', 'garden', 'summer'),
  p('petunia', 'Petunia', 'Petunia spp.', 'garden-flowers', 'core-garden', 'common', 'flower', '🌸', false, ['#a855f7', '#e9d5ff'], ['classic'], 'comfort', 'garden', 'summer'),
  p('pansy', 'Pansy', 'Viola tricolor', 'garden-flowers', 'spring-bloom', 'common', 'flower', '🌸', false, ['#7c3aed', '#fef08a'], ['playful'], 'thoughtfulness', 'garden', 'spring'),
  p('snowdrop', 'Snowdrop', 'Galanthus nivalis', 'garden-flowers', 'winter-greenhouse', 'common', 'flower', '🌼', false, ['#f8fafc', '#e0f2fe'], ['delicate', 'first-of-season'], 'hope', 'woodland', 'winter'),
  p('freesia', 'Freesia', 'Freesia refracta', 'fragrant-flowers', 'spring-bloom', 'uncommon', 'flower', '🌼', false, ['#fef08a', '#fde68a'], ['fragrant'], 'trust', 'garden', 'spring'),
  p('gardenia', 'Gardenia', 'Gardenia jasminoides', 'fragrant-flowers', 'summer-garden', 'uncommon', 'flower', '🌸', false, ['#ffffff', '#f0fdf4'], ['fragrant'], 'purity', 'garden', 'summer'),

  // ── Wildflowers ───────────────────────────────────────────────────────────
  p('poppy', 'Poppy', 'Papaver rhoeas', 'wildflowers', 'summer-garden', 'common', 'flower', '🌺', false, ['#dc2626', '#fecaca'], ['wild'], 'remembrance', 'meadow', 'summer'),
  p('bluebell', 'Bluebell', 'Hyacinthoides non-scripta', 'wildflowers', 'spring-bloom', 'uncommon', 'flower', '🪻', false, ['#6366f1', '#c7d2fe'], ['woodland'], 'humility', 'woodland', 'spring'),
  p('forget-me-not', 'Forget-Me-Not', 'Myosotis spp.', 'wildflowers', 'core-garden', 'common', 'flower', '🌸', false, ['#60a5fa', '#dbeafe'], ['wild', 'sentimental'], 'remembrance', 'meadow', 'spring'),
  p('foxglove', 'Foxglove', 'Digitalis purpurea', 'wildflowers', 'core-garden', 'uncommon', 'flower', '🌸', false, ['#a855f7', '#e9d5ff'], ['wild', 'tall'], 'mystery', 'meadow', 'summer'),
  p('daisy', 'Daisy', 'Bellis perennis', 'wildflowers', 'core-garden', 'common', 'flower', '🌼', false, ['#fefce8', '#facc15'], ['wild', 'cheerful'], 'innocence', 'meadow', 'summer'),
  p('buttercup', 'Buttercup', 'Ranunculus acris', 'wildflowers', 'core-garden', 'common', 'flower', '🌼', false, ['#facc15', '#fef9c3'], ['wild'], 'cheer', 'meadow', 'summer'),
  p('cornflower', 'Cornflower', 'Centaurea cyanus', 'wildflowers', 'summer-garden', 'common', 'flower', '🌸', false, ['#3b82f6', '#bfdbfe'], ['wild'], 'delicacy', 'meadow', 'summer'),
  p('four-leaf-clover', 'Four-Leaf Clover', 'Trifolium repens', 'wildflowers', 'core-garden', 'rare', 'herb', '🍀', true, ['#16a34a', '#bbf7d0'], ['lucky', 'wild'], 'luck', 'meadow', null),
  p('black-eyed-susan', 'Black-Eyed Susan', 'Rudbeckia hirta', 'wildflowers', 'summer-garden', 'common', 'flower', '🌻', false, ['#f59e0b', '#78350f'], ['wild'], 'encouragement', 'meadow', 'summer'),

  // ── Fragrant & night bloomers ─────────────────────────────────────────────
  p('jasmine', 'Jasmine', 'Jasminum spp.', 'fragrant-flowers', 'midnight-garden', 'uncommon', 'vine', '🌸', false, ['#fefce8', '#ffffff'], ['fragrant', 'night-fragrant'], 'sensuality', 'garden', 'summer'),
  p('honeysuckle', 'Honeysuckle', 'Lonicera spp.', 'fragrant-flowers', 'summer-garden', 'common', 'vine', '🌼', false, ['#fde68a', '#fef3c7'], ['fragrant'], 'affection', 'garden', 'summer'),
  p('sweet-pea', 'Sweet Pea', 'Lathyrus odoratus', 'fragrant-flowers', 'spring-bloom', 'common', 'vine', '🌸', false, ['#f9a8d4', '#e9d5ff'], ['fragrant'], 'delicacy', 'garden', 'spring'),
  p('lily-of-the-valley', 'Lily of the Valley', 'Convallaria majalis', 'fragrant-flowers', 'spring-bloom', 'rare', 'flower', '🌸', false, ['#ffffff', '#dcfce7'], ['fragrant', 'woodland'], 'sweetness', 'woodland', 'spring'),
  p('moonflower', 'Moonflower', 'Ipomoea alba', 'night-bloomers', 'midnight-garden', 'rare', 'vine', '🌸', false, ['#f8fafc', '#e0e7ff'], ['night-bloomer'], 'mystery', 'garden', 'summer'),
  p('evening-primrose', 'Evening Primrose', 'Oenothera biennis', 'night-bloomers', 'midnight-garden', 'uncommon', 'flower', '🌼', false, ['#fde68a', '#fef9c3'], ['night-bloomer'], 'quiet', 'meadow', 'summer'),
  p('night-blooming-jasmine', 'Night-Blooming Jasmine', 'Cestrum nocturnum', 'night-bloomers', 'midnight-garden', 'rare', 'flower', '🌸', false, ['#f0fdf4', '#ffffff'], ['night-bloomer', 'fragrant'], 'mystery', 'garden', 'summer'),
  p('angels-trumpet', "Angel's Trumpet", 'Brugmansia spp.', 'night-bloomers', 'midnight-garden', 'epic', 'flower', '🌺', false, ['#fef08a', '#fef9c3'], ['night-bloomer', 'dramatic'], 'drama', 'garden', 'summer'),
  p('moon-cactus', 'Moon Cactus', 'Gymnocalycium mihanovichii', 'night-bloomers', 'midnight-garden', 'rare', 'cactus', '🌵', false, ['#f43f5e', '#fde68a'], ['unusual'], 'wonder', 'desert', null),

  // ── Trees ─────────────────────────────────────────────────────────────────
  p('cherry-blossom-tree', 'Cherry Blossom Tree', 'Prunus serrulata', 'trees', 'spring-bloom', 'uncommon', 'tree', '🌸', true, ['#f9a8d4', '#fce7f3'], ['seasonal'], 'renewal', 'forest', 'spring'),
  p('willow', 'Willow', 'Salix babylonica', 'trees', 'core-garden', 'common', 'tree', '🌳', false, ['#4d7c0f', '#d9f99d'], ['graceful'], 'flexibility', 'riverside', null),
  p('maple', 'Maple', 'Acer spp.', 'trees', 'autumn-harvest', 'common', 'tree', '🍁', true, ['#ea580c', '#fed7aa'], ['seasonal'], 'change', 'forest', 'autumn'),
  p('birch', 'Birch', 'Betula pendula', 'trees', 'core-garden', 'common', 'tree', '🌳', false, ['#e5e7eb', '#f8fafc'], ['hardy'], 'new-beginnings', 'forest', null),
  p('magnolia-tree', 'Magnolia Tree', 'Magnolia grandiflora', 'trees', 'spring-bloom', 'uncommon', 'tree', '🌸', false, ['#fdf2f8', '#f9a8d4'], ['classic'], 'dignity', 'forest', 'spring'),
  p('dogwood', 'Dogwood', 'Cornus florida', 'trees', 'spring-bloom', 'uncommon', 'tree', '🌸', false, ['#fecdd3', '#ffffff'], ['seasonal'], 'grace', 'forest', 'spring'),
  p('jacaranda', 'Jacaranda', 'Jacaranda mimosifolia', 'trees', 'summer-garden', 'rare', 'tree', '🌳', false, ['#818cf8', '#c7d2fe'], ['striking'], 'wonder', 'urban', 'summer'),
  p('ginkgo', 'Ginkgo', 'Ginkgo biloba', 'trees', 'autumn-harvest', 'rare', 'tree', '🍁', false, ['#eab308', '#fef9c3'], ['ancient'], 'resilience', 'forest', 'autumn'),
  p('bonsai-pine', 'Bonsai Pine', 'Pinus spp. (cultivated)', 'trees', 'core-garden', 'epic', 'tree', '🌲', true, ['#166534', '#bbf7d0'], ['miniature', 'art'], 'patience', 'garden', null),

  // ── Vines ─────────────────────────────────────────────────────────────────
  p('wisteria', 'Wisteria', 'Wisteria sinensis', 'vines', 'spring-bloom', 'rare', 'vine', '🌸', false, ['#a78bfa', '#ddd6fe'], ['cascading'], 'longevity', 'garden', 'spring'),
  p('morning-glory', 'Morning Glory', 'Ipomoea purpurea', 'vines', 'summer-garden', 'common', 'vine', '🌸', false, ['#6366f1', '#c7d2fe'], ['climbing'], 'affection', 'garden', 'summer'),
  p('clematis', 'Clematis', 'Clematis spp.', 'vines', 'summer-garden', 'uncommon', 'vine', '🌸', false, ['#a855f7', '#e9d5ff'], ['climbing'], 'ingenuity', 'garden', 'summer'),
  p('bougainvillea', 'Bougainvillea', 'Bougainvillea glabra', 'vines', 'tropical-escape', 'uncommon', 'vine', '🌺', false, ['#ec4899', '#fbcfe8'], ['vivid'], 'passion', 'tropical', 'summer'),
  p('passionflower', 'Passionflower', 'Passiflora incarnata', 'vines', 'tropical-escape', 'rare', 'vine', '🌸', false, ['#7c3aed', '#f472b6'], ['intricate'], 'faith', 'tropical', 'summer'),
  p('ivy', 'Ivy', 'Hedera helix', 'vines', 'core-garden', 'common', 'vine', '🌿', true, ['#166534', '#bbf7d0'], ['evergreen'], 'fidelity', 'garden', null),

  // ── Succulents & cacti (Desert Bloom) ─────────────────────────────────────
  p('echeveria', 'Echeveria', 'Echeveria elegans', 'succulents', 'desert-bloom', 'common', 'succulent', '🪴', false, ['#86efac', '#d9f99d'], ['rosette'], 'resilience', 'desert', null),
  p('jade-plant', 'Jade Plant', 'Crassula ovata', 'succulents', 'desert-bloom', 'common', 'succulent', '🪴', false, ['#16a34a', '#bbf7d0'], ['lucky'], 'prosperity', 'home', null),
  p('haworthia', 'Haworthia', 'Haworthia attenuata', 'succulents', 'desert-bloom', 'uncommon', 'succulent', '🪴', false, ['#15803d', '#86efac'], ['patterned'], 'protection', 'desert', null),
  p('string-of-pearls', 'String of Pearls', 'Senecio rowleyanus', 'succulents', 'desert-bloom', 'rare', 'succulent', '🪴', false, ['#22c55e', '#bbf7d0'], ['trailing'], 'delicacy', 'home', null),
  p('saguaro', 'Saguaro', 'Carnegiea gigantea', 'desert-plants', 'desert-bloom', 'uncommon', 'cactus', '🌵', true, ['#16a34a', '#86efac'], ['iconic'], 'endurance', 'desert', null),
  p('barrel-cactus', 'Barrel Cactus', 'Ferocactus spp.', 'desert-plants', 'desert-bloom', 'common', 'cactus', '🌵', true, ['#15803d', '#bbf7d0'], ['sturdy'], 'resilience', 'desert', null),
  p('prickly-pear', 'Prickly Pear', 'Opuntia spp.', 'desert-plants', 'desert-bloom', 'common', 'cactus', '🌵', true, ['#22c55e', '#fde68a'], ['fruiting'], 'endurance', 'desert', null),
  p('golden-barrel-cactus', 'Golden Barrel Cactus', 'Echinocactus grusonii', 'desert-plants', 'desert-bloom', 'rare', 'cactus', '🌵', true, ['#eab308', '#fef08a'], ['striking'], 'radiance', 'desert', null),
  p('christmas-cactus', 'Christmas Cactus', 'Schlumbergera spp.', 'desert-plants', 'winter-greenhouse', 'uncommon', 'cactus', '🌸', false, ['#ec4899', '#fbcfe8'], ['seasonal'], 'celebration', 'home', 'winter'),
  p('star-cactus', 'Star Cactus', 'Astrophytum asterias', 'desert-plants', 'desert-bloom', 'rare', 'cactus', '🌵', true, ['#4ade80', '#bbf7d0'], ['geometric'], 'wonder', 'desert', null),
  p('desert-marigold', 'Desert Marigold', 'Baileya multiradiata', 'desert-plants', 'desert-bloom', 'common', 'flower', '🌼', false, ['#fde047', '#fef9c3'], ['drought-tolerant'], 'brightness', 'desert', 'summer'),
  p('ocotillo', 'Ocotillo', 'Fouquieria splendens', 'desert-plants', 'desert-bloom', 'rare', 'tree', '🌳', false, ['#b91c1c', '#fecaca'], ['spiny'], 'adaptability', 'desert', 'spring'),
  p('yucca', 'Yucca', 'Yucca filamentosa', 'desert-plants', 'desert-bloom', 'uncommon', 'succulent', '🪴', false, ['#4d7c0f', '#d9f99d'], ['architectural'], 'protection', 'desert', null),

  // ── Aquatic (Water Garden) ────────────────────────────────────────────────
  p('lotus', 'Lotus', 'Nelumbo nucifera', 'aquatic-plants', 'water-garden', 'rare', 'aquatic', '🪷', true, ['#f472b6', '#fbcfe8'], ['symbolic'], 'purity', 'pond', 'summer'),
  p('water-lily', 'Water Lily', 'Nymphaea spp.', 'aquatic-plants', 'water-garden', 'uncommon', 'aquatic', '🪷', false, ['#f9a8d4', '#fce7f3'], ['floating'], 'tranquility', 'pond', 'summer'),
  p('water-hyacinth', 'Water Hyacinth', 'Eichhornia crassipes', 'aquatic-plants', 'water-garden', 'common', 'aquatic', '🌸', false, ['#a855f7', '#e9d5ff'], ['floating'], 'adaptability', 'pond', 'summer'),

  // ── Tropical (Tropical Escape) ────────────────────────────────────────────
  p('hibiscus', 'Hibiscus', 'Hibiscus rosa-sinensis', 'tropical-plants', 'tropical-escape', 'common', 'flower', '🌺', true, ['#ef4444', '#fecaca'], ['vivid'], 'delicate-beauty', 'tropical', 'summer'),
  p('orchid', 'Orchid', 'Orchidaceae', 'tropical-plants', 'tropical-escape', 'rare', 'flower', '🌺', false, ['#a855f7', '#f3e8ff'], ['exotic'], 'refinement', 'tropical', null),
  p('bird-of-paradise', 'Bird of Paradise', 'Strelitzia reginae', 'tropical-plants', 'tropical-escape', 'epic', 'flower', '🌺', false, ['#f97316', '#6366f1'], ['dramatic'], 'freedom', 'tropical', null),
  p('plumeria', 'Plumeria', 'Plumeria rubra', 'tropical-plants', 'tropical-escape', 'uncommon', 'flower', '🌸', false, ['#fef08a', '#ffffff'], ['fragrant'], 'charm', 'tropical', 'summer'),
  p('anthurium', 'Anthurium', 'Anthurium andraeanum', 'tropical-plants', 'tropical-escape', 'rare', 'flower', '🌺', false, ['#dc2626', '#fecaca'], ['glossy'], 'hospitality', 'tropical', null),

  // ── Ferns & mosses (Woodland) ──────────────────────────────────────────────
  p('boston-fern', 'Boston Fern', 'Nephrolepis exaltata', 'ferns', 'core-garden', 'common', 'fern', '🌿', false, ['#16a34a', '#bbf7d0'], ['lush'], 'shelter', 'woodland', null),
  p('maidenhair-fern', 'Maidenhair Fern', 'Adiantum spp.', 'ferns', 'core-garden', 'uncommon', 'fern', '🌿', false, ['#15803d', '#86efac'], ['delicate'], 'sincerity', 'woodland', null),
  p('staghorn-fern', 'Staghorn Fern', 'Platycerium spp.', 'ferns', 'tropical-escape', 'rare', 'fern', '🌿', false, ['#4d7c0f', '#d9f99d'], ['unusual'], 'resilience', 'tropical', null),
  p('birds-nest-fern', "Bird's Nest Fern", 'Asplenium nidus', 'ferns', 'tropical-escape', 'uncommon', 'fern', '🌿', false, ['#166534', '#bbf7d0'], ['glossy'], 'shelter', 'tropical', null),
  p('cushion-moss', 'Cushion Moss', 'Leucobryum glaucum', 'mosses', 'core-garden', 'uncommon', 'moss', '☘️', false, ['#166534', '#bbf7d0'], ['soft'], 'quiet', 'woodland', null),
  p('spanish-moss', 'Spanish Moss', 'Tillandsia usneoides', 'mosses', 'tropical-escape', 'rare', 'moss', '☘️', false, ['#a3a3a3', '#d4d4d4'], ['draping'], 'mystery', 'tropical', null),

  // ── Culinary herbs (Core Garden) ──────────────────────────────────────────
  p('basil', 'Basil', 'Ocimum basilicum', 'culinary-herbs', 'core-garden', 'common', 'herb', '🌿', false, ['#16a34a', '#bbf7d0'], ['culinary'], 'nourishment', 'kitchen-garden', 'summer'),
  p('mint', 'Mint', 'Mentha spp.', 'culinary-herbs', 'core-garden', 'common', 'herb', '🌿', false, ['#22c55e', '#bbf7d0'], ['culinary'], 'refreshment', 'kitchen-garden', 'summer'),
  p('rosemary', 'Rosemary', 'Salvia rosmarinus', 'culinary-herbs', 'core-garden', 'common', 'herb', '🌿', false, ['#4d7c0f', '#d9f99d'], ['culinary'], 'remembrance', 'kitchen-garden', null),
  p('thyme', 'Thyme', 'Thymus vulgaris', 'culinary-herbs', 'core-garden', 'common', 'herb', '🌿', false, ['#65a30d', '#d9f99d'], ['culinary'], 'courage', 'kitchen-garden', null),
  p('sage', 'Sage', 'Salvia officinalis', 'culinary-herbs', 'core-garden', 'common', 'herb', '🌿', false, ['#84cc16', '#ecfccb'], ['culinary'], 'wisdom', 'kitchen-garden', null),
  p('chamomile', 'Chamomile', 'Matricaria chamomilla', 'culinary-herbs', 'medicinal-garden', 'uncommon', 'herb', '🌼', false, ['#fef9c3', '#ffffff'], ['calming'], 'calm', 'kitchen-garden', 'summer'),

  // ── Medicinal plants (Medicinal Garden) ───────────────────────────────────
  p('aloe-vera', 'Aloe Vera', 'Aloe vera', 'medicinal-plants', 'medicinal-garden', 'common', 'succulent', '🪴', false, ['#4d7c0f', '#d9f99d'], ['medicinal'], 'healing', 'home', null),
  p('echinacea', 'Echinacea', 'Echinacea purpurea', 'medicinal-plants', 'medicinal-garden', 'uncommon', 'flower', '🌸', false, ['#c084fc', '#f3e8ff'], ['medicinal'], 'strength', 'meadow', 'summer'),
  p('st-johns-wort', "St. John's Wort", 'Hypericum perforatum', 'medicinal-plants', 'medicinal-garden', 'uncommon', 'flower', '🌼', false, ['#eab308', '#fef9c3'], ['medicinal'], 'brightness', 'meadow', 'summer'),
  p('calendula', 'Calendula', 'Calendula officinalis', 'medicinal-plants', 'medicinal-garden', 'common', 'flower', '🌼', false, ['#f97316', '#fed7aa'], ['medicinal'], 'comfort', 'kitchen-garden', 'summer'),
  p('valerian', 'Valerian', 'Valeriana officinalis', 'medicinal-plants', 'medicinal-garden', 'rare', 'herb', '🌸', false, ['#f9a8d4', '#fce7f3'], ['medicinal'], 'calm', 'meadow', 'summer'),

  // ── Mountain plants ────────────────────────────────────────────────────────
  p('edelweiss', 'Edelweiss', 'Leontopodium nivale', 'mountain-plants', 'core-garden', 'epic', 'flower', '🌼', false, ['#f8fafc', '#e2e8f0'], ['alpine', 'rare'], 'devotion', 'alpine', 'summer'),
  p('alpine-gentian', 'Alpine Gentian', 'Gentiana alpina', 'mountain-plants', 'core-garden', 'rare', 'flower', '🌸', false, ['#1d4ed8', '#bfdbfe'], ['alpine'], 'clarity', 'alpine', 'summer'),

  // ── Woodland plants ────────────────────────────────────────────────────────
  p('wood-anemone', 'Wood Anemone', 'Anemonoides nemorosa', 'woodland-plants', 'spring-bloom', 'uncommon', 'flower', '🌸', false, ['#ffffff', '#e5e7eb'], ['woodland'], 'anticipation', 'woodland', 'spring'),
  p('trillium', 'Trillium', 'Trillium grandiflorum', 'woodland-plants', 'spring-bloom', 'rare', 'flower', '🌸', false, ['#ffffff', '#f3e8ff'], ['woodland'], 'simplicity', 'woodland', 'spring'),

  // ── Rare botanicals (Legendary) ────────────────────────────────────────────
  p('ghost-orchid', 'Ghost Orchid', 'Dendrophylax lindenii', 'rare-botanicals', 'midnight-garden', 'legendary', 'flower', '🌺', false, ['#f8fafc', '#e2e8f0'], ['elusive', 'rare'], 'mystery', 'swamp', null),
  p('corpse-flower', 'Corpse Flower', 'Amorphophallus titanum', 'rare-botanicals', 'core-garden', 'legendary', 'flower', '🌺', false, ['#7f1d1d', '#450a0a'], ['rare', 'dramatic'], 'spectacle', 'tropical', null),
  p('jade-vine', 'Jade Vine', 'Strongylodon macrobotrys', 'rare-botanicals', 'tropical-escape', 'legendary', 'vine', '🌸', false, ['#2dd4bf', '#99f6e4'], ['rare', 'unusual-color'], 'wonder', 'tropical', null),
  p('middlemist-red', 'Middlemist Red', 'Camellia middlemistii', 'rare-botanicals', 'winter-greenhouse', 'legendary', 'flower', '🌸', false, ['#dc2626', '#fecaca'], ['one-of-a-kind', 'rare'], 'rarity', 'garden', 'winter'),
  p('kadupul-flower', 'Kadupul Flower', 'Epiphyllum oxypetalum', 'rare-botanicals', 'midnight-garden', 'legendary', 'cactus', '🌵', false, ['#f8fafc', '#e2e8f0'], ['night-bloomer', 'elusive'], 'fleeting-beauty', 'tropical', null),

  // ── Fantasy Grove (Mythic — clearly marked as fantasy, not real species) ──
  p('moonpetal-lily', 'Moonpetal Lily', null, 'fantasy-plants', 'fantasy-grove', 'mythic', 'fantasy', '🌸', false, ['#c7d2fe', '#818cf8'], ['fantasy', 'moonlit'], 'wonder', 'dreamscape', null, { eventKey: null }),
  p('starlight-iris', 'Starlight Iris', null, 'fantasy-plants', 'fantasy-grove', 'mythic', 'fantasy', '🪻', false, ['#6366f1', '#312e81'], ['fantasy', 'celestial'], 'wonder', 'dreamscape', null),
  p('dragonfire-bloom', 'Dragonfire Bloom', null, 'fantasy-plants', 'fantasy-grove', 'mythic', 'fantasy', '🌺', false, ['#f97316', '#7f1d1d'], ['fantasy', 'fiery'], 'power', 'dreamscape', null),
  p('frostglass-orchid', 'Frostglass Orchid', null, 'fantasy-plants', 'fantasy-grove', 'mythic', 'fantasy', '🌸', false, ['#bae6fd', '#e0f2fe'], ['fantasy', 'wintry'], 'stillness', 'dreamscape', 'winter'),
  p('whispering-willow', 'Whispering Willow', null, 'fantasy-plants', 'fantasy-grove', 'mythic', 'tree', '🌳', false, ['#a78bfa', '#312e81'], ['fantasy', 'mystical'], 'wisdom', 'dreamscape', null),
  p('emberleaf-rose', 'Emberleaf Rose', null, 'fantasy-plants', 'fantasy-grove', 'mythic', 'flower', '🌹', false, ['#f97316', '#fde68a'], ['fantasy', 'fiery'], 'passion', 'dreamscape', null)
];
