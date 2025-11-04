import React, { useState, useCallback } from 'react';
import { Upload, Download, Search, AlertCircle, CheckCircle, Eye, Info } from 'lucide-react';

const FuzzyMatchingApp = () => {
  const [tariffData, setTariffData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [minScore, setMinScore] = useState(0.3);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ tariff: {}, inventory: {} });
  // Types and indexing state
  type CsvRow = Record<string, string>;
  type TariffDoc = { id: number; description: string; hsCode: string };
  type Posting = { tariffId: number; weight: number };
  type InvertedIndex = Map<string, Posting[]>;
  type TariffMapping = { description?: string; hsCode?: string };
  type InventoryMapping = { name?: string };

  const [tariffIndex, setTariffIndex] = useState<InvertedIndex | null>(null);
  const [tariffDocs, setTariffDocs] = useState<TariffDoc[]>([]);

  // Expanded cross-domain keyword library for category detection
  const categoryLibraries: Record<string, string[]> = {
    fish: [
      'fish','salmon','tuna','cod','mackerel','sardine','herring','trout',
      'bass','tilapia','catfish','halibut','snapper','grouper','swordfish',
      'anchovy','carp','perch','pike','seafood','fillet','frozen fish',
      'haddock','pollock','mahi','barramundi','sole','flounder','mullet'
    ],
    shellfish: [
      'shrimp','prawn','lobster','crab','crayfish','oyster','mussel',
      'clam','scallop','squid','octopus','shellfish','crustacean','mollusc'
    ],
    meat: [
      'meat','beef','pork','chicken','lamb','mutton','veal','poultry',
      'turkey','duck','goose','venison','bacon','ham','sausage','steak',
      'ground meat','mince','chop','cutlet','breast','thigh','wing'
    ],
    dairy: [
      'milk','cheese','butter','cream','yogurt','dairy','cheddar','mozzarella',
      'parmesan','whey','casein','lactose','buttermilk','ghee','paneer',
      'gouda','brie','feta','ricotta','cottage cheese','sour cream'
    ],
    fruits: [
      'apple','banana','orange','grape','strawberry','mango','pineapple',
      'watermelon','melon','berry','cherry','peach','pear','plum','fruit',
      'lemon','lime','grapefruit','kiwi','papaya','guava','passion fruit',
      'blueberry','raspberry','blackberry','cranberry','apricot','fig','date'
    ],
    vegetables: [
      'tomato','potato','onion','carrot','lettuce','cabbage','broccoli',
      'cauliflower','spinach','pepper','cucumber','vegetable','garlic',
      'celery','zucchini','eggplant','pumpkin','squash','asparagus',
      'beet','radish','turnip','kale','chard','leek','shallot'
    ],
    grains: [
      'wheat','rice','corn','barley','oats','rye','grain','cereal',
      'flour','meal','groats','quinoa','millet','sorghum','bulgur',
      'couscous','semolina','bran','germ','maize'
    ],
    nuts: [
      'almond','walnut','cashew','peanut','pecan','pistachio','hazelnut',
      'macadamia','brazil nut','pine nut','chestnut','nut'
    ],
    oils: [
      'oil','olive oil','vegetable oil','coconut oil','palm oil','sunflower oil',
      'canola oil','sesame oil','soybean oil','corn oil','peanut oil'
    ],
    spices: [
      'pepper','salt','cinnamon','turmeric','cumin','coriander','cardamom',
      'clove','nutmeg','ginger','garlic powder','paprika','chili','cayenne',
      'oregano','basil','thyme','rosemary','sage','spice','seasoning'
    ],
    textiles: [
      'cotton','wool','silk','linen','polyester','fabric','textile',
      'cloth','yarn','fiber','fibre','thread','woven','knitted','nylon',
      'rayon','acrylic','fleece','denim','canvas','velvet','satin'
    ],
    leather: [
      'leather','hide','skin','suede','cowhide','sheepskin','pigskin'
    ],
    metals: [
      'iron','steel','aluminum','aluminium','copper','brass','bronze','metal',
      'alloy','zinc','nickel','tin','lead','gold','silver','platinum'
    ],
    plastics: [
      'plastic','polymer','resin','pvc','polyethylene','polypropylene',
      'polystyrene','acrylic','nylon','teflon'
    ],
    wood: [
      'wood','timber','lumber','oak','pine','maple','mahogany','teak',
      'cedar','birch','walnut','plywood','hardwood','softwood'
    ],
    chemicals: [
      'acid','alkali','solvent','alcohol','ether','ester','chemical',
      'compound','element','reagent','catalyst'
    ],
    beverages: [
      'wine','beer','spirits','juice','coffee','tea','soda','beverage',
      'drink','water','liquor','whiskey','vodka','rum','gin','brandy'
    ],
    machinery: [
      'machine','engine','motor','pump','compressor','turbine','generator',
      'equipment','apparatus','device','tool','instrument'
    ],
    electronics: [
      'electronic','computer','phone','tablet','monitor','screen','display',
      'circuit','semiconductor','transistor','chip','processor'
    ]
  };

  // HS Chapter categories (partial list provided)
  const hsChapterCategories: Record<string, string> = {
    '01': 'Live Animals',
    '02': 'Meat and Edible Meat Offal',
    '03': 'Fish, Crustaceans, Molluscs',
    '04': 'Dairy Produce; Eggs; Honey',
    '07': 'Edible Vegetables and Certain Roots and Tubers',
    '08': 'Edible Fruit and Nuts',
    '09': 'Coffee, Tea, Maté and Spices',
    '10': 'Cereals',
    '11': 'Products of the Milling Industry',
    '15': 'Animal or Vegetable Fats and Oils',
    '16': 'Preparations of Meat, Fish, or Crustaceans',
    '17': 'Sugars and Sugar Confectionery',
    '19': 'Preparations of Cereals, Flour, Starch or Milk',
    '20': 'Preparations of Vegetables, Fruit, Nuts',
    '21': 'Miscellaneous Edible Preparations',
    '22': 'Beverages, Spirits and Vinegar'
  };

  const getHsChapterCode = (hsCode: string | undefined) => {
    if (!hsCode) return '';
    const digits = String(hsCode).replace(/\D/g, '');
    if (digits.length < 2) return '';
    return digits.slice(0, 2).padStart(2, '0');
  };

  const getHsCategory = (hsCode: string | undefined) => {
    const chapter = getHsChapterCode(hsCode);
    return hsChapterCategories[chapter] || '';
  };
  // Enhanced CSV parsing with multiple delimiter support
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { data: [], originalHeaders: [], normalizedHeaders: [], delimiter: ',' };

    // Try different delimiters
    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxColumns = 0;

    for (const delimiter of delimiters) {
      const testColumns = lines[0].split(delimiter).length;
      if (testColumns > maxColumns) {
        maxColumns = testColumns;
        bestDelimiter = delimiter;
      }
    }

    // Keep original headers but also create normalized versions
    const originalHeaders = lines[0]
      .split(bestDelimiter)
      .map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    const normalizedHeaders = originalHeaders.map(h => h.toLowerCase());

    const data = lines.slice(1).map(line => {
      const values = line.split(bestDelimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
      const obj: Record<string, string> = {};
      originalHeaders.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    }).filter(row => Object.values(row).some(val => String(val).trim())); // Remove empty rows

    return { data, originalHeaders, normalizedHeaders, delimiter: bestDelimiter };
  };
  // Flexible column detection using original headers
  const detectColumns = (originalHeaders, type): TariffMapping | InventoryMapping => {
    const mapping: TariffMapping | InventoryMapping = {};
    
    if (type === 'tariff') {
      // Look for description column (case-insensitive)
      const descPatterns = ['description', 'product', 'commodity', 'item', 'goods', 'desc'];
      const descCol = originalHeaders.find(h => 
        descPatterns.some(pattern => h.toLowerCase().includes(pattern))
      );
      
      // Look for HS code column (case-insensitive)
      const hsPatterns = ['hs', 'code', 'tariff', 'classification'];
      const hsCol = originalHeaders.find(h => 
        hsPatterns.some(pattern => h.toLowerCase().includes(pattern))
      );
      
      (mapping as TariffMapping).description = descCol;
      (mapping as TariffMapping).hsCode = hsCol;
    } else {
      // Look for name/product column (case-insensitive)
      const namePatterns = ['name', 'product', 'item', 'title', 'description', 'inventory'];
      const nameCol = originalHeaders.find(h => 
        namePatterns.some(pattern => h.toLowerCase().includes(pattern))
      );
      
      (mapping as InventoryMapping).name = nameCol;
    }
    
    return mapping;
  };
  // Fuzzy matching utilities
  const levenshteinDistance = (str1, str2) => {
    const rows = str2.length + 1;
    const cols = str1.length + 1;
    const matrix: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

    for (let i = 0; i < rows; i++) matrix[i][0] = i;
    for (let j = 0; j < cols; j++) matrix[0][j] = j;

    for (let i = 1; i < rows; i++) {
      for (let j = 1; j < cols; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[rows - 1][cols - 1];
  };

  const normalizeString = (str) => {
    if (!str) return '';
    return str.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const extractKeywords = (text) => {
    if (!text) return [] as string[];
    const stopWords: Set<string> = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']);
    return normalizeString(text)
      .split(' ')
      .filter((word: string) => word.length > 2 && !stopWords.has(word)) as string[];
  };
  
  const checkCategoryMatch = (keywords: string[]): string[] => {
    const matched: Set<string> = new Set();
    for (const [category, terms] of Object.entries(categoryLibraries)) {
      for (const keyword of keywords) {
        const k = keyword.toLowerCase();
        if (terms.some(term => {
          const t = term.toLowerCase();
          return k.includes(t) || t.includes(k) || levenshteinDistance(k, t) <= 2;
        })) {
          matched.add(category);
          break;
        }
      }
    }
    return Array.from(matched);
  };
  // Inverted index utilities
  const toBigrams = (tokens: string[]): string[] => {
    const bigrams: string[] = [];
    for (let i = 0; i < tokens.length - 1; i++) {
      bigrams.push(tokens[i] + ' ' + tokens[i + 1]);
    }
    return bigrams;
  };

  const extractNumericUnitTokens = (text: string): string[] => {
    const tokens: string[] = [];
    const unitPattern = /(\d+(?:[\.,]\d+)?)(\s*)(mm|cm|m|inch|in|kg|g|l|ml|w|v|ah|hz|pcs|pc)\b/i;
    const normalized = normalizeString(text);
    const parts = normalized.split(' ');
    for (let i = 0; i < parts.length; i++) {
      const a = parts[i];
      const b = parts[i + 1] || '';
      const ab = `${a} ${b}`.trim();
      const m1 = a.match(unitPattern);
      const m2 = ab.match(unitPattern);
      if (m2) tokens.push(m2[0]); else if (m1) tokens.push(m1[0]);
    }
    return tokens;
  };

  const tokenize = (text: string): string[] => {
    const base = extractKeywords(text);
    const bigrams = toBigrams(base);
    const nu = extractNumericUnitTokens(text);
    return [...base, ...bigrams, ...nu];
  };

  const buildTariffIndex = (tariffRows, mapping: TariffMapping) => {
    const docs: TariffDoc[] = [];
    const termDocFreq: Map<string, number> = new Map();
    const docTermFreqs: Array<Map<string, number>> = [];

    for (let i = 0; i < tariffRows.length; i++) {
      const desc = String(tariffRows[i][mapping.description || ''] || '').trim();
      const hs = String(tariffRows[i][mapping.hsCode || ''] || '').trim();
      if (!desc) continue;
      const id = docs.length;
      docs.push({ id, description: desc, hsCode: hs });

      const tokens = tokenize(desc);
      const tf: Map<string, number> = new Map();
      for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
      docTermFreqs.push(tf);

      for (const term of new Set(tokens)) {
        termDocFreq.set(term, (termDocFreq.get(term) || 0) + 1);
      }
    }

    const N = docs.length;
    const termStats: Map<string, { df: number; idf: number }> = new Map();
    for (const [term, df] of termDocFreq.entries()) {
      const idf = Math.log((N + 1) / (df + 0.5));
      termStats.set(term, { df, idf });
    }

    const index: InvertedIndex = new Map();
    for (let d = 0; d < docs.length; d++) {
      const tf = docTermFreqs[d];
      const lengthNorm = Math.sqrt(Array.from(tf.values()).reduce((s, x) => s + x * x, 0)) || 1;
      for (const [term, freq] of tf.entries()) {
        const stats = termStats.get(term);
        const idf = stats ? stats.idf : 0;
        // Boost numeric/unit and bigrams
        const isBigram = term.includes(' ');
        const isNumUnit = /\d/.test(term) && /(mm|cm|m|inch|in|kg|g|l|ml|w|v|ah|hz|pcs|pc)\b/.test(term);
        const boost = (isBigram ? 1.2 : 1) * (isNumUnit ? 1.5 : 1);
        const weight = (freq / lengthNorm) * idf * boost;
        const postings = index.get(term) || [];
        postings.push({ tariffId: docs[d].id, weight });
        index.set(term, postings);
      }
    }

    for (const postings of index.values()) postings.sort((a, b) => b.weight - a.weight);

    return { index, docs };
  };

  const queryTariffIndex = (index, docs, queryText, topK) => {
    const qTokens = tokenize(queryText);
    const qTf: Map<string, number> = new Map();
    for (const t of qTokens) qTf.set(t, (qTf.get(t) || 0) + 1);
    const qLen = Math.sqrt(Array.from(qTf.values()).reduce((s, x) => s + x * x, 0)) || 1;

    const scores: Map<number, number> = new Map();
    for (const [term, qFreq] of qTf.entries()) {
      const postings = index.get(term);
      if (!postings) continue;
      // mirror boosts during query by simple term presence; TF already captured above
      const qWeight = qFreq / qLen;
      for (const { tariffId, weight } of postings) {
        scores.set(tariffId, (scores.get(tariffId) || 0) + qWeight * weight);
      }
    }

    const ranked = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([id]) => docs[id]);

    return ranked;
  };

  const calculateKeywordScore = (inventoryKeywords, tariffKeywords, inventoryCategories: string[]) => {
    if (inventoryKeywords.length === 0 || tariffKeywords.length === 0) return 0;
    
    let matches = 0;
    let partialMatches = 0;
    
    const tariffCategories = checkCategoryMatch(tariffKeywords);
    const categoryOverlap = inventoryCategories.filter(cat => tariffCategories.includes(cat)).length;
    const categoryBonus = categoryOverlap * 0.3; // modest boost per overlapping category
    
    for (const invWord of inventoryKeywords) {
      let bestWordScore = 0;
      for (const tarWord of tariffKeywords) {
        if (invWord === tarWord) {
          bestWordScore = Math.max(bestWordScore, 1);
        } else if (invWord.includes(tarWord) || tarWord.includes(invWord)) {
          bestWordScore = Math.max(bestWordScore, 0.5);
        } else {
          const distance = levenshteinDistance(invWord, tarWord);
          const maxLen = Math.max(invWord.length, tarWord.length);
          if (maxLen > 0 && distance / maxLen <= 0.3) {
            bestWordScore = Math.max(bestWordScore, 0.7);
          }
        }
      }
      if (bestWordScore >= 1) matches++; else if (bestWordScore > 0) partialMatches += bestWordScore;
    }
    
    const base = (matches + partialMatches) / Math.max(inventoryKeywords.length, tariffKeywords.length);
    return Math.min(1, base + categoryBonus);
  };

  const calculateSimilarityScore = (str1, str2) => {
    const norm1 = normalizeString(str1);
    const norm2 = normalizeString(str2);
    
    if (norm1 === norm2) return 1.0;
    if (!norm1 || !norm2) return 0;
    
    const distance = levenshteinDistance(norm1, norm2);
    const maxLen = Math.max(norm1.length, norm2.length);
    
    return 1 - (distance / maxLen);
  };

  const findBestMatch = (inventoryItem, tariffMapping: TariffMapping, inventoryMapping: InventoryMapping) => {
    const nameKey = inventoryMapping.name as string;
    const descKey = tariffMapping.description as string;
    const hsKey = tariffMapping.hsCode as string;
    const inventoryName = inventoryItem[nameKey];
    if (!inventoryName) return null;

    const inventoryKeywords = extractKeywords(inventoryName);
    const inventoryCategories = checkCategoryMatch(inventoryKeywords);
    let bestMatch: any = null;
    let bestScore = 0;

    // shortlist from index if available
    const shortlist = tariffIndex
      ? queryTariffIndex(tariffIndex, tariffDocs, inventoryName, 50)
      : tariffData;

    for (const tariffItem of shortlist) {
      let tariffDescription = '';
      let hsCodeValue = '';

      if (tariffIndex && tariffDocs.length && tariffItem && typeof tariffItem === 'object' && 'description' in tariffItem) {
        tariffDescription = tariffItem.description;
        hsCodeValue = tariffItem.hsCode || '';
      } else {
        tariffDescription = tariffItem[descKey];
        hsCodeValue = tariffItem[hsKey] || '';
      }

      if (!tariffDescription) continue;

      const tariffKeywords = extractKeywords(tariffDescription);
      
      // Calculate different similarity scores
      const keywordScore = calculateKeywordScore(inventoryKeywords, tariffKeywords, inventoryCategories);
      const stringScore = calculateSimilarityScore(inventoryName, tariffDescription);
      
      // Weight the scores (keyword matching is more important for this use case)
      const combinedScore = (keywordScore * 0.7) + (stringScore * 0.3);
      
      if (combinedScore > bestScore && combinedScore >= minScore) {
        bestScore = combinedScore;
        bestMatch = {
          description: tariffDescription,
          hsCode: hsCodeValue,
          category: getHsCategory(hsCodeValue),
          score: combinedScore,
          keywordScore,
          stringScore
        };
      }
    }

    return bestMatch;
  };

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = (e?.target as FileReader | null)?.result;
        if (typeof result !== 'string') {
          alert(`Error parsing ${type} file: could not read as text.`);
          return;
        }
        const { data, originalHeaders, delimiter } = parseCSV(result);
        
        console.log(`${type} headers:`, originalHeaders);
        console.log(`${type} sample data:`, data.slice(0, 3));
        
        const columnMapping = detectColumns(originalHeaders, type) as TariffMapping | InventoryMapping;
        console.log(`${type} column mapping:`, columnMapping);
        
        if (type === 'tariff') {
          setTariffData(data);
          setDebugInfo(prev => ({
            ...prev,
            tariff: {
              headers: originalHeaders,
              mapping: columnMapping,
              sampleData: data.slice(0, 3),
              delimiter,
              count: data.length
            }
          }));
          // Build inverted index from the uploaded tariff data
          const built = buildTariffIndex(data, columnMapping as TariffMapping);
          setTariffIndex(built.index);
          setTariffDocs(built.docs);
        } else {
          setInventoryData(data);
          setDebugInfo(prev => ({
            ...prev,
            inventory: {
              headers: originalHeaders,
              mapping: columnMapping,
              sampleData: data.slice(0, 3),
              delimiter,
              count: data.length
            }
          }));
        }
      } catch (error) {
        alert(`Error parsing ${type} file: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  const processMatching = useCallback(() => {
    if (tariffData.length === 0 || inventoryData.length === 0) {
      alert('Please upload both tariff and inventory files first.');
      return;
    }

    const tariffMapping = debugInfo.tariff.mapping as TariffMapping;
    const inventoryMapping = debugInfo.inventory.mapping as InventoryMapping;

    if (!tariffMapping.description || !inventoryMapping.name) {
      alert('Could not detect required columns. Please check your CSV files.');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      const nameKey = inventoryMapping.name as string;
      const results = inventoryData.map(item => {
        const match = findBestMatch(item, tariffMapping, inventoryMapping);
        return {
          inventory: item,
          inventoryName: item[nameKey],
          match,
          category: match?.category || '',
          status: match ? 'matched' : 'unmatched'
        };
      });
      
      setMatches(results);
      setIsProcessing(false);
    }, 100);
  }, [tariffData, inventoryData, minScore, debugInfo, tariffIndex, tariffDocs]);

  const exportResults = () => {
    const tariffMapping = debugInfo.tariff.mapping as TariffMapping;
    const inventoryMapping = debugInfo.inventory.mapping as InventoryMapping;

    const csvContent = [
      ['Inventory Name', 'Matched Description', 'HS Code', 'Category', 'Confidence Score', 'Status'],
      ...matches.map(m => [
        m.inventoryName || '',
        m.match?.description || 'No match found',
        m.match?.hsCode || '',
        m.match?.category || '',
        m.match?.score ? (m.match.score * 100).toFixed(1) + '%' : '0%',
        m.status
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fuzzy_matching_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Rule-based food classification utilities (no external libs)
  const buildStructuredLibrary = (tariffRows: CsvRow[], mapping: TariffMapping) => {
    const hsKey = mapping.hsCode as string;
    const descKey = mapping.description as string;

    const foodChapters = new Set(['01','02','03','04','07','08','09','10','11','12','15','16','20','21','22','23']);

    const extract = (descUpper: string, list: string[]) => list.filter(kw => descUpper.includes(kw));

    return tariffRows
      .map(r => {
        const hsCode = String(r[hsKey] || '').trim();
        const description = String(r[descKey] || '').trim();
        if (!description) return null;
        const chapter = getHsChapterCode(hsCode);
        const descriptionUpper = description.toUpperCase();
        return {
          hsCode,
          chapter,
          description,
          descriptionUpper,
          products: extract(descriptionUpper, [
            'CHICKEN','BEEF','PORK','LAMB','FISH','MEAT','POULTRY',
            'MILK','CHEESE','BUTTER','CREAM','YOGURT','DAIRY',
            'RICE','WHEAT','FLOUR','CORN','GRAIN','CEREAL',
            'ALMOND','CASHEW','NUT','WALNUT','PISTACHIO',
            'TOMATO','POTATO','ONION','GARLIC','CARROT','VEGETABLE',
            'FRUIT','APPLE','ORANGE','BANANA','MANGO','GRAPE',
            'OIL','FAT','SAUCE','JUICE','BEVERAGE','WATER',
            'SUGAR','SALT','PEPPER','SPICE','TEA','COFFEE','CHOCOLATE'
          ]),
          sources: extract(descriptionUpper, [
            'BOVINE','CATTLE','SWINE','PIG','POULTRY','FOWL',
            'MEAT','FISH','SEAFOOD',
            'WHEAT','RICE','CORN','GRAIN','CEREAL',
            'MILK','DAIRY','VEGETABLE','FRUIT'
          ]),
          states: extract(descriptionUpper, ['FRESH','FROZEN','CHILLED','DRIED','LIVE','RAW','COOKED']),
          processing: extract(descriptionUpper, [
            'POWDER','POWDERED','FLAKES','FLAKED','GROUND','ROASTED',
            'SLICED','PRESERVED','CANNED','SALTED','SMOKED','PICKLED'
          ])
        };
      })
      .filter(e => e && (foodChapters.has(String(e.chapter)) || e.products.length > 0));
  };

  const classifyProduct = (description: string, structuredLib: any[]) => {
    const input = String(description || '').toUpperCase();
    if (!input) {
      return {
        status: 'NO_MATCH', hsCode: '', chapter: '', tariffDescription: '',
        confidence: 'NONE', score: 0, matchReasons: '', alternatives: 'None', needsReview: true
      };
    }

    const detectSourceType = (inp: string) => {
      if (/(WHEAT|ATTA|MAIDA|RICE|CORN|MAIZE|GRAIN|CEREAL|BARLEY|OAT|RYE)\b/.test(inp)) return 'GRAIN';
      if (/(FISH|SEAFOOD|TUNA|SALMON|SHRIMP|PRAWN|CRAB|LOBSTER)\b/.test(inp)) return 'FISH';
      if (/(MEAT|BEEF|PORK|LAMB|MUTTON|VEAL|CHICKEN|POULTRY|TURKEY|DUCK|GOOSE)\b/.test(inp)) return 'MEAT';
      if (/(MILK|DAIRY|CHEESE|BUTTER|CREAM|YOGURT|YOGHURT|PANEER)\b/.test(inp)) return 'DAIRY';
      if (/(VEGETABLE|POTATO|TOMATO|ONION|CARROT|GARLIC|CABBAGE|LETTUCE)\b/.test(inp)) return 'VEGETABLE';
      if (/(FRUIT|APPLE|ORANGE|BANANA|MANGO|GRAPE|BERRY|MELON)\b/.test(inp)) return 'FRUIT';
      if (/(ALMOND|CASHEW|WALNUT|PISTACHIO|HAZELNUT|PEANUT|GROUNDNUT|NUT)\b/.test(inp)) return 'NUT';
      return null;
    };

    const sourceType = detectSourceType(input);

    const matches = structuredLib
      .map(entry => {
        let score = 0;
        const reasons: string[] = [];

        entry.products.forEach((product: string) => {
          if (input.includes(product)) { score += 30; reasons.push(`Product:${product}`); }
        });
        entry.sources.forEach((source: string) => {
          if (input.includes(source)) { score += 40; reasons.push(`Source:${source}`); }
        });

        if (sourceType) {
          const descUp = entry.descriptionUpper as string;
          const sourceTypeMatches: Record<string, RegExp> = {
            'GRAIN': /(WHEAT|RICE|CORN|MAIZE|GRAIN|CEREAL|BARLEY|OAT|RYE)\b/,
            'FISH': /(FISH|SEAFOOD)\b/,
            'MEAT': /(MEAT|BOVINE|SWINE|PORK|BEEF|POULTRY|CHICKEN|TURKEY)\b/,
            'DAIRY': /(MILK|DAIRY|CHEESE|BUTTER|CREAM)\b/,
            'VEGETABLE': /(VEGETABLE|POTATO|TOMATO|ONION|CARROT)\b/,
            'FRUIT': /(FRUIT|APPLE|ORANGE|BANANA|MANGO)\b/,
            'NUT': /(NUT|ALMOND|CASHEW|WALNUT|PISTACHIO)\b/
          };
          if (sourceTypeMatches[sourceType] && sourceTypeMatches[sourceType].test(descUp)) {
            score += 50; reasons.push(`SourceType:${sourceType}✓`);
          } else {
            const hasConflict = Object.entries(sourceTypeMatches).some(([type, pattern]) => type !== sourceType && pattern.test(descUp));
            if (hasConflict) { score -= 100; reasons.push('SourceType:MISMATCH'); }
          }
        }

        entry.states.forEach((state: string) => { if (input.includes(state)) { score += 10; reasons.push(`State:${state}`); } });
        entry.processing.forEach((proc: string) => { if (input.includes(proc)) { score += 8; reasons.push(`Processing:${proc}`); } });

        return score > 0 ? {
          hsCode: entry.hsCode,
          chapter: entry.chapter,
          tariffDescription: entry.description,
          score,
          reasons
        } : null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score);

    if (matches.length === 0) {
      return {
        status: 'NO_MATCH', hsCode: '', chapter: '', tariffDescription: '',
        confidence: 'NONE', score: 0, matchReasons: '', alternatives: 'None', needsReview: true
      };
    }

    const best: any = matches[0];
    let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (best.score >= 100) confidence = 'HIGH'; else if (best.score >= 60) confidence = 'MEDIUM';

    let status: 'MATCH' | 'AMBIGUOUS' | 'LOW_CONFIDENCE' = 'MATCH';
    if (matches.length > 1 && (matches[1] as any).score / best.score > 0.85) status = 'AMBIGUOUS';
    if (confidence === 'LOW') status = 'LOW_CONFIDENCE';

    const alternatives = matches.slice(1, 3).map((m: any) => `HS ${m.hsCode} (Score:${m.score})`).join(' | ');

    return {
      status,
      hsCode: best.hsCode,
      chapter: best.chapter,
      tariffDescription: best.tariffDescription,
      confidence,
      score: best.score,
      matchReasons: best.reasons.join(', '),
      alternatives: alternatives || 'None',
      needsReview: status !== 'MATCH' || confidence === 'LOW'
    };
  };

  const processAllItemsForFood = (inventoryRows: CsvRow[], structuredLib: any[], inventoryMapping: InventoryMapping) => {
    const nameKey = inventoryMapping.name as string;
    const results = inventoryRows.map(item => {
      const description = String(item[nameKey] || '').trim();
      const classification = classifyProduct(description, structuredLib);
      return {
        'Item ID': item['Item'] || item['ID'] || '',
        'Description': description,
        'Status': classification.status,
        'HS Code': classification.hsCode,
        'Chapter': classification.chapter,
        'Tariff Description': classification.tariffDescription,
        'Confidence': classification.confidence,
        'Score': classification.score,
        'Match Reasons': classification.matchReasons,
        'Alternatives': classification.alternatives,
        'Needs Review': classification.needsReview ? 'YES' : 'NO'
      };
    });
    return results;
  };

  const logClassificationStatistics = (results: any[]) => {
    const total = results.length;
    const count = (pred: (r: any) => boolean) => results.filter(pred).length;
    const matched = count(r => r['Status'] === 'MATCH');
    const ambiguous = count(r => r['Status'] === 'AMBIGUOUS');
    const lowConfidence = count(r => r['Status'] === 'LOW_CONFIDENCE');
    const noMatch = count(r => r['Status'] === 'NO_MATCH');
    const highConf = count(r => r['Confidence'] === 'HIGH');
    const mediumConf = count(r => r['Confidence'] === 'MEDIUM');
    const lowConf = count(r => r['Confidence'] === 'LOW');
    const needsReview = count(r => r['Needs Review'] === 'YES');

    // eslint-disable-next-line no-console
    console.log('CLASSIFICATION STATISTICS');
    // eslint-disable-next-line no-console
    console.log('='.repeat(60));
    // eslint-disable-next-line no-console
    console.log(`Total Items: ${total}`);
    // eslint-disable-next-line no-console
    console.log(`Match: ${matched} (${((matched/Math.max(total,1))*100).toFixed(1)}%)`);
    // eslint-disable-next-line no-console
    console.log(`Ambiguous: ${ambiguous} (${((ambiguous/Math.max(total,1))*100).toFixed(1)}%)`);
    // eslint-disable-next-line no-console
    console.log(`Low Confidence: ${lowConfidence} (${((lowConfidence/Math.max(total,1))*100).toFixed(1)}%)`);
    // eslint-disable-next-line no-console
    console.log(`No Match: ${noMatch} (${((noMatch/Math.max(total,1))*100).toFixed(1)}%)`);
    // eslint-disable-next-line no-console
    console.log(`HIGH: ${highConf} | MEDIUM: ${mediumConf} | LOW: ${lowConf}`);
    // eslint-disable-next-line no-console
    console.log(`Needs Review: ${needsReview} (${((needsReview/Math.max(total,1))*100).toFixed(1)}%)`);
  };

  const exportFoodClassification = () => {
    if (tariffData.length === 0 || inventoryData.length === 0) {
      alert('Please upload both tariff and inventory files first.');
      return;
    }
    const tariffMapping = debugInfo.tariff.mapping as TariffMapping;
    const inventoryMapping = debugInfo.inventory.mapping as InventoryMapping;
    if (!tariffMapping?.description || !tariffMapping?.hsCode || !inventoryMapping?.name) {
      alert('Could not detect required columns for classification.');
      return;
    }

    const structuredLib = buildStructuredLibrary(tariffData, tariffMapping);
    const start = performance.now();
    const results = processAllItemsForFood(inventoryData, structuredLib, inventoryMapping);
    const durationSec = ((performance.now() - start) / 1000).toFixed(2);
    // eslint-disable-next-line no-console
    console.log(`\n✓ Classified ${results.length} items in ${durationSec} seconds`);
    logClassificationStatistics(results);

    const header = Object.keys(results[0] || {
      'Item ID': '', 'Description': '', 'Status': '', 'HS Code': '', 'Chapter': '',
      'Tariff Description': '', 'Confidence': '', 'Score': '', 'Match Reasons': '', 'Alternatives': '', 'Needs Review': ''
    });

    const csv = [
      header,
      ...results.map(r => header.map(h => String((r as any)[h] ?? ''))) 
    ].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'food_classification_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Inventory to Tariff Fuzzy Matching Tool
          </h1>
          <p className="text-gray-600 mb-6">
            Upload your tariff schedule and inventory data to find the best HS code matches using advanced fuzzy matching algorithms.
          </p>

          {/* Debug Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <Info className="h-4 w-4" />
              {showDebug ? 'Hide' : 'Show'} Debug Information
            </button>
          </div>

          {/* Debug Information */}
          {showDebug && (
            <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Tariff File Debug</h4>
                {debugInfo.tariff.headers && (
                  <div className="text-sm space-y-1">
                    <p><strong>Headers:</strong> {debugInfo.tariff.headers.join(', ')}</p>
                    <p><strong>Description Column:</strong> {debugInfo.tariff.mapping?.description || 'Not detected'}</p>
                    <p><strong>HS Code Column:</strong> {debugInfo.tariff.mapping?.hsCode || 'Not detected'}</p>
                    <p><strong>Records:</strong> {debugInfo.tariff.count}</p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Inventory File Debug</h4>
                {debugInfo.inventory.headers && (
                  <div className="text-sm space-y-1">
                    <p><strong>Headers:</strong> {debugInfo.inventory.headers.join(', ')}</p>
                    <p><strong>Name Column:</strong> {debugInfo.inventory.mapping?.name || 'Not detected'}</p>
                    <p><strong>Records:</strong> {debugInfo.inventory.count}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* File Upload Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tariff Schedule (Reference)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  CSV with Description and HS Code columns
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, 'tariff')}
                  className="hidden"
                  id="tariff-upload"
                />
                <label
                  htmlFor="tariff-upload"
                  className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
                >
                  Upload Tariff CSV
                </label>
                {tariffData.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-green-600">✓ {tariffData.length} items loaded</p>
                    {debugInfo.tariff.mapping?.description && (
                      <p className="text-xs text-gray-600">
                        Using: {debugInfo.tariff.mapping.description} → {debugInfo.tariff.mapping.hsCode}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Inventory Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  CSV with product/item name column
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, 'inventory')}
                  className="hidden"
                  id="inventory-upload"
                />
                <label
                  htmlFor="inventory-upload"
                  className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-600"
                >
                  Upload Inventory CSV
                </label>
                {inventoryData.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-green-600">✓ {inventoryData.length} items loaded</p>
                    {debugInfo.inventory.mapping?.name && (
                      <p className="text-xs text-gray-600">
                        Using: {debugInfo.inventory.mapping.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings and Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Minimum Score:</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={minScore}
                onChange={(e) => setMinScore(parseFloat(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-gray-600">{(minScore * 100).toFixed(0)}%</span>
            </div>
            
            <button
              onClick={processMatching}
              disabled={isProcessing || tariffData.length === 0 || inventoryData.length === 0}
              className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Start Matching'}
            </button>

            {matches.length > 0 && (
              <button
                onClick={exportResults}
                className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Results
              </button>
            )}

            {(tariffData.length > 0 && inventoryData.length > 0) && (
              <button
                onClick={exportFoodClassification}
                className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Food Classification
              </button>
            )}
          </div>

          {/* Results Summary */}
          {matches.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {matches.filter(m => m.status === 'matched').length}
                </div>
                <div className="text-green-700">Matched</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {matches.filter(m => m.status === 'unmatched').length}
                </div>
                <div className="text-red-700">Unmatched</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {matches.length > 0 ? ((matches.filter(m => m.status === 'matched').length / matches.length) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-blue-700">Success Rate</div>
              </div>
            </div>
          )}
        </div>

        {/* Results Table */}
        {matches.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Matching Results</h2>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inventory Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matched Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HS Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matches.map((match, index) => (
                    <tr key={index} className={match.status === 'matched' ? 'bg-green-50' : 'bg-red-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {match.inventoryName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {match.match?.description || 'No match found'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {match.match?.hsCode || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {match.match?.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {match.match ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${match.match.score * 100}%` }}
                              ></div>
                            </div>
                            <span>{(match.match.score * 100).toFixed(1)}%</span>
                          </div>
                        ) : '0%'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {match.status === 'matched' ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Matched
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Unmatched
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuzzyMatchingApp;