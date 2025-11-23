// Comprehensive vocabulary expansion library
// Maps terms to their expanded synonyms and related terms

export interface VocabularyExpansion {
  [key: string]: string[];
}

// Animal/Meat vocabulary expansions
export const animalVocabulary: VocabularyExpansion = {
  // Bovine/Cattle
  'bovine': ['cattle', 'cow', 'cows', 'beef', 'bull', 'bulls', 'ox', 'oxen', 'steer', 'steers', 'heifer', 'heifers', 'calf', 'calves', 'veal', 'beef cattle', 'dairy cattle', 'bos taurus'],
  'cattle': ['bovine', 'cow', 'cows', 'beef', 'bull', 'bulls', 'ox', 'oxen', 'steer', 'steers', 'heifer', 'heifers', 'calf', 'calves', 'veal'],
  'cow': ['bovine', 'cattle', 'beef', 'bull', 'heifer', 'calf', 'veal'],
  'beef': ['bovine', 'cattle', 'cow', 'steer', 'bull', 'ox', 'meat'],
  
  // Porcine/Pig
  'porcine': ['pig', 'pigs', 'swine', 'pork', 'hog', 'hogs', 'boar', 'sow', 'piglet', 'piglets', 'sus scrofa'],
  'pig': ['porcine', 'swine', 'pork', 'hog', 'boar', 'sow', 'piglet'],
  'swine': ['pig', 'pigs', 'porcine', 'pork', 'hog', 'hogs'],
  'pork': ['pig', 'swine', 'porcine', 'hog'],
  
  // Ovine/Sheep
  'ovine': ['sheep', 'lamb', 'lambs', 'mutton', 'ewe', 'ewes', 'ram', 'rams', 'wool'],
  'sheep': ['ovine', 'lamb', 'mutton', 'ewe', 'ram'],
  'lamb': ['sheep', 'ovine', 'mutton', 'ewe'],
  'mutton': ['sheep', 'ovine', 'lamb'],
  
  // Caprine/Goat
  'caprine': ['goat', 'goats', 'kid', 'kids', 'billy', 'nanny', 'chevon'],
  'goat': ['caprine', 'kid', 'billy', 'nanny', 'chevon'],
  
  // Poultry
  'poultry': ['chicken', 'chickens', 'hen', 'hens', 'rooster', 'cock', 'chick', 'chicks', 'turkey', 'turkeys', 'duck', 'ducks', 'goose', 'geese', 'quail', 'pheasant'],
  'chicken': ['poultry', 'hen', 'rooster', 'cock', 'chick', 'fowl'],
  'turkey': ['poultry', 'fowl'],
  'duck': ['poultry', 'fowl'],
  'goose': ['poultry', 'fowl'],
  
  // Fish
  'fish': ['seafood', 'finfish', 'salmon', 'tuna', 'cod', 'mackerel', 'sardine', 'herring', 'trout', 'bass', 'tilapia', 'catfish', 'halibut', 'snapper', 'grouper', 'swordfish'],
  'salmon': ['fish', 'seafood', 'salmonid'],
  'tuna': ['fish', 'seafood', 'tunny'],
  'cod': ['fish', 'seafood', 'gadoid'],
  
  // Shellfish/Crustaceans
  'crustacean': ['shrimp', 'prawn', 'prawns', 'lobster', 'lobsters', 'crab', 'crabs', 'crayfish', 'crawfish'],
  'shrimp': ['crustacean', 'prawn', 'seafood'],
  'prawn': ['crustacean', 'shrimp', 'seafood'],
  'lobster': ['crustacean', 'seafood'],
  'crab': ['crustacean', 'seafood'],
  
  // Molluscs
  'mollusc': ['mollusk', 'oyster', 'oysters', 'mussel', 'mussels', 'clam', 'clams', 'scallop', 'scallops', 'squid', 'octopus', 'snail', 'snails'],
  'mollusk': ['mollusc', 'oyster', 'mussel', 'clam', 'scallop', 'squid', 'octopus'],
  'oyster': ['mollusc', 'mollusk', 'bivalve', 'seafood'],
  'mussel': ['mollusc', 'mollusk', 'bivalve', 'seafood'],
  'clam': ['mollusc', 'mollusk', 'bivalve', 'seafood'],
  
  // Dairy
  'dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'whey', 'casein', 'lactose', 'buttermilk', 'ghee', 'curd'],
  'milk': ['dairy', 'cow milk', 'goat milk', 'sheep milk', 'buffalo milk'],
  'cheese': ['dairy', 'cheddar', 'mozzarella', 'parmesan', 'gouda', 'brie', 'feta', 'ricotta'],
  
  // Fruits
  'fruit': ['apple', 'banana', 'orange', 'grape', 'strawberry', 'mango', 'pineapple', 'watermelon', 'melon', 'berry', 'cherry', 'peach', 'pear', 'plum'],
  'apple': ['fruit', 'pome', 'malus'],
  'banana': ['fruit', 'plantain', 'musa'],
  'orange': ['fruit', 'citrus', 'citrus fruit'],
  'grape': ['fruit', 'vine', 'vitis'],
  
  // Vegetables
  'vegetable': ['tomato', 'potato', 'onion', 'carrot', 'lettuce', 'cabbage', 'broccoli', 'cauliflower', 'spinach', 'pepper', 'cucumber', 'garlic'],
  'tomato': ['vegetable', 'fruit', 'solanum'],
  'potato': ['vegetable', 'tuber', 'solanum'],
  'onion': ['vegetable', 'allium', 'bulb'],
  
  // Grains/Cereals
  'cereal': ['grain', 'wheat', 'rice', 'corn', 'barley', 'oats', 'rye', 'maize', 'millet', 'sorghum', 'quinoa'],
  'wheat': ['cereal', 'grain', 'triticum'],
  'rice': ['cereal', 'grain', 'oryza'],
  'corn': ['cereal', 'grain', 'maize', 'zea'],
  'maize': ['corn', 'cereal', 'grain'],
  
  // Nuts
  'nut': ['almond', 'walnut', 'cashew', 'peanut', 'pecan', 'pistachio', 'hazelnut', 'macadamia'],
  'almond': ['nut', 'prunus'],
  'walnut': ['nut', 'juglans'],
  'peanut': ['nut', 'groundnut', 'legume', 'arachis'],
  
  // Oils
  'oil': ['fat', 'grease', 'olive oil', 'vegetable oil', 'coconut oil', 'palm oil', 'sunflower oil', 'canola oil', 'sesame oil', 'soybean oil'],
  'vegetable oil': ['oil', 'plant oil', 'edible oil'],
  'olive oil': ['oil', 'olea'],
  
  // Spices
  'spice': ['pepper', 'salt', 'cinnamon', 'turmeric', 'cumin', 'coriander', 'cardamom', 'clove', 'nutmeg', 'ginger', 'paprika', 'chili', 'cayenne'],
  'pepper': ['spice', 'black pepper', 'white pepper', 'piper'],
  'salt': ['sodium chloride', 'table salt', 'sea salt'],
  
  // Beverages
  'beverage': ['drink', 'wine', 'beer', 'spirits', 'juice', 'coffee', 'tea', 'soda', 'water', 'liquor'],
  'wine': ['beverage', 'alcohol', 'vitis'],
  'beer': ['beverage', 'alcohol', 'brew', 'ale', 'lager'],
  'coffee': ['beverage', 'caffeine', 'coffea'],
  'tea': ['beverage', 'caffeine', 'camellia'],
};

// HS Chapter mappings with expanded vocabulary
export const hsChapterVocabulary: Record<string, VocabularyExpansion> = {
  '01': { // Live Animals
    'live': ['living', 'alive', 'animal'],
    'animal': ['livestock', 'beast', 'creature'],
    ...animalVocabulary
  },
  '02': { // Meat and Edible Meat Offal
    'meat': ['flesh', 'protein', 'muscle'],
    'edible': ['eatable', 'consumable', 'food'],
    'offal': ['organ', 'viscera', 'innards', 'entrails'],
    ...animalVocabulary
  },
  '03': { // Fish, Crustaceans, Molluscs
    'fish': animalVocabulary['fish'] || [],
    'crustacean': animalVocabulary['crustacean'] || [],
    'mollusc': animalVocabulary['mollusc'] || [],
    'mollusk': animalVocabulary['mollusk'] || [],
    ...animalVocabulary
  },
  '04': { // Dairy Produce; Eggs; Honey
    'dairy': animalVocabulary['dairy'] || [],
    'egg': ['eggs', 'ovum', 'yolk', 'white'],
    'honey': ['bee honey', 'nectar', 'sweetener'],
    ...animalVocabulary
  },
  '07': { // Edible Vegetables
    'vegetable': animalVocabulary['vegetable'] || [],
    'edible': ['eatable', 'consumable'],
    ...animalVocabulary
  },
  '08': { // Edible Fruit and Nuts
    'fruit': animalVocabulary['fruit'] || [],
    'nut': animalVocabulary['nut'] || [],
    'edible': ['eatable', 'consumable'],
    ...animalVocabulary
  },
  '09': { // Coffee, Tea, Maté and Spices
    'coffee': animalVocabulary['coffee'] || [],
    'tea': animalVocabulary['tea'] || [],
    'spice': animalVocabulary['spice'] || [],
    ...animalVocabulary
  },
  '10': { // Cereals
    'cereal': animalVocabulary['cereal'] || [],
    'grain': ['cereal', 'seed'],
    ...animalVocabulary
  },
  '15': { // Animal or Vegetable Fats and Oils
    'fat': ['oil', 'grease', 'lipid'],
    'oil': animalVocabulary['oil'] || [],
    'vegetable': animalVocabulary['vegetable'] || [],
    'animal': ['livestock', 'beast'],
    ...animalVocabulary
  },
  '16': { // Preparations of Meat, Fish, or Crustaceans
    'preparation': ['prepared', 'processed', 'cooked', 'canned', 'preserved'],
    'meat': animalVocabulary['meat'] || [],
    'fish': animalVocabulary['fish'] || [],
    'crustacean': animalVocabulary['crustacean'] || [],
    ...animalVocabulary
  },
  '17': { // Sugars and Sugar Confectionery
    'sugar': ['sucrose', 'sweetener', 'sweet'],
    'confectionery': ['candy', 'sweets', 'chocolate'],
    ...animalVocabulary
  },
  '19': { // Preparations of Cereals, Flour, Starch or Milk
    'preparation': ['prepared', 'processed'],
    'cereal': animalVocabulary['cereal'] || [],
    'flour': ['meal', 'powder', 'ground'],
    'starch': ['carbohydrate', 'amylose'],
    'milk': animalVocabulary['milk'] || [],
    ...animalVocabulary
  },
  '20': { // Preparations of Vegetables, Fruit, Nuts
    'preparation': ['prepared', 'processed', 'canned', 'preserved'],
    'vegetable': animalVocabulary['vegetable'] || [],
    'fruit': animalVocabulary['fruit'] || [],
    'nut': animalVocabulary['nut'] || [],
    ...animalVocabulary
  },
  '21': { // Miscellaneous Edible Preparations
    'preparation': ['prepared', 'processed'],
    'edible': ['eatable', 'consumable'],
    ...animalVocabulary
  },
  '22': { // Beverages, Spirits and Vinegar
    'beverage': animalVocabulary['beverage'] || [],
    'spirits': ['alcohol', 'liquor', 'distilled'],
    'vinegar': ['acetic acid', 'sour'],
    ...animalVocabulary
  }
};

// Function to expand a term using the vocabulary library
export function expandTerm(term: string, chapter?: string): string[] {
  const normalized = term.toLowerCase().trim();
  const expansions: Set<string> = new Set([normalized]); // Always include original term
  
  // Check chapter-specific vocabulary first
  if (chapter && hsChapterVocabulary[chapter]) {
    const chapterVocab = hsChapterVocabulary[chapter];
    if (chapterVocab[normalized]) {
      chapterVocab[normalized].forEach(exp => expansions.add(exp.toLowerCase()));
    }
  }
  
  // Check general animal vocabulary
  if (animalVocabulary[normalized]) {
    animalVocabulary[normalized].forEach(exp => expansions.add(exp.toLowerCase()));
  }
  
  // Also check if any vocabulary term contains or is contained in the input
  Object.entries(animalVocabulary).forEach(([key, values]) => {
    if (normalized.includes(key) || key.includes(normalized)) {
      expansions.add(key);
      values.forEach(exp => expansions.add(exp.toLowerCase()));
    }
  });
  
  // Check chapter vocab similarly
  if (chapter && hsChapterVocabulary[chapter]) {
    Object.entries(hsChapterVocabulary[chapter]).forEach(([key, values]) => {
      if (normalized.includes(key) || key.includes(normalized)) {
        expansions.add(key);
        values.forEach(exp => expansions.add(exp.toLowerCase()));
      }
    });
  }
  
  return Array.from(expansions);
}

// Function to expand all terms in a text
export function expandText(text: string, chapter?: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  const expanded: Set<string> = new Set();
  
  words.forEach(word => {
    const expansions = expandTerm(word, chapter);
    expansions.forEach(exp => expanded.add(exp));
  });
  
  return Array.from(expanded);
}

