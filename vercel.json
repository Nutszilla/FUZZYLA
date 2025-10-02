import React, { useState, useCallback } from 'react';
import { Upload, Download, Search, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';

const App = () => {
  const [tariffData, setTariffData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [minScore, setMinScore] = useState(0.6);

  // Enhanced keyword library for better matching
  const categoryLibraries = {
    fish: [
      'fish', 'salmon', 'tuna', 'cod', 'mackerel', 'sardine', 'herring', 'trout',
      'bass', 'tilapia', 'catfish', 'halibut', 'snapper', 'grouper', 'swordfish',
      'anchovy', 'carp', 'perch', 'pike', 'seafood', 'fillet', 'frozen fish',
      'haddock', 'pollock', 'mahi', 'barramundi', 'sole', 'flounder', 'mullet'
    ],
    shellfish: [
      'shrimp', 'prawn', 'lobster', 'crab', 'crayfish', 'oyster', 'mussel',
      'clam', 'scallop', 'squid', 'octopus', 'shellfish', 'crustacean', 'mollusc'
    ],
    meat: [
      'meat', 'beef', 'pork', 'chicken', 'lamb', 'mutton', 'veal', 'poultry',
      'turkey', 'duck', 'goose', 'venison', 'bacon', 'ham', 'sausage', 'steak',
      'ground meat', 'mince', 'chop', 'cutlet', 'breast', 'thigh', 'wing'
    ],
    dairy: [
      'milk', 'cheese', 'butter', 'cream', 'yogurt', 'dairy', 'cheddar', 'mozzarella',
      'parmesan', 'whey', 'casein', 'lactose', 'buttermilk', 'ghee', 'paneer',
      'gouda', 'brie', 'feta', 'ricotta', 'cottage cheese', 'sour cream'
    ],
    fruits: [
      'apple', 'banana', 'orange', 'grape', 'strawberry', 'mango', 'pineapple',
      'watermelon', 'melon', 'berry', 'cherry', 'peach', 'pear', 'plum', 'fruit',
      'lemon', 'lime', 'grapefruit', 'kiwi', 'papaya', 'guava', 'passion fruit',
      'blueberry', 'raspberry', 'blackberry', 'cranberry', 'apricot', 'fig', 'date'
    ],
    vegetables: [
      'tomato', 'potato', 'onion', 'carrot', 'lettuce', 'cabbage', 'broccoli',
      'cauliflower', 'spinach', 'pepper', 'cucumber', 'vegetable', 'garlic',
      'celery', 'zucchini', 'eggplant', 'pumpkin', 'squash', 'asparagus',
      'beet', 'radish', 'turnip', 'kale', 'chard', 'leek', 'shallot'
    ],
    grains: [
      'wheat', 'rice', 'corn', 'barley', 'oats', 'rye', 'grain', 'cereal',
      'flour', 'meal', 'groats', 'quinoa', 'millet', 'sorghum', 'bulgur',
      'couscous', 'semolina', 'bran', 'germ', 'maize'
    ],
    nuts: [
      'almond', 'walnut', 'cashew', 'peanut', 'pecan', 'pistachio', 'hazelnut',
      'macadamia', 'brazil nut', 'pine nut', 'chestnut', 'nut'
    ],
    oils: [
      'oil', 'olive oil', 'vegetable oil', 'coconut oil', 'palm oil', 'sunflower oil',
      'canola oil', 'sesame oil', 'soybean oil', 'corn oil', 'peanut oil'
    ],
    spices: [
      'pepper', 'salt', 'cinnamon', 'turmeric', 'cumin', 'coriander', 'cardamom',
      'clove', 'nutmeg', 'ginger', 'garlic powder', 'paprika', 'chili', 'cayenne',
      'oregano', 'basil', 'thyme', 'rosemary', 'sage', 'spice', 'seasoning'
    ],
    textiles: [
      'cotton', 'wool', 'silk', 'linen', 'polyester', 'fabric', 'textile',
      'cloth', 'yarn', 'fiber', 'fibre', 'thread', 'woven', 'knitted', 'nylon',
      'rayon', 'acrylic', 'fleece', 'denim', 'canvas', 'velvet', 'satin'
    ],
    leather: [
      'leather', 'hide', 'skin', 'suede', 'cowhide', 'sheepskin', 'pigskin'
    ],
    metals: [
      'iron', 'steel', 'aluminum', 'aluminium', 'copper', 'brass', 'bronze', 'metal',
      'alloy', 'zinc', 'nickel', 'tin', 'lead', 'gold', 'silver', 'platinum'
    ],
    plastics: [
      'plastic', 'polymer', 'resin', 'pvc', 'polyethylene', 'polypropylene',
      'polystyrene', 'acrylic', 'nylon', 'teflon'
    ],
    wood: [
      'wood', 'timber', 'lumber', 'oak', 'pine', 'maple', 'mahogany', 'teak',
      'cedar', 'birch', 'walnut', 'plywood', 'hardwood', 'softwood'
    ],
    chemicals: [
      'acid', 'alkali', 'solvent', 'alcohol', 'ether', 'ester', 'chemical',
      'compound', 'element', 'reagent', 'catalyst'
    ],
    beverages: [
      'wine', 'beer', 'spirits', 'juice', 'coffee', 'tea', 'soda', 'beverage',
      'drink', 'water', 'liquor', 'whiskey', 'vodka', 'rum', 'gin', 'brandy'
    ],
    machinery: [
      'machine', 'engine', 'motor', 'pump', 'compressor', 'turbine', 'generator',
      'equipment', 'apparatus', 'device', 'tool', 'instrument'
    ],
    electronics: [
      'electronic', 'computer', 'phone', 'tablet', 'monitor', 'screen', 'display',
      'circuit', 'semiconductor', 'transistor', 'chip', 'processor'
    ]
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
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
    return matrix[str2.length][str1.length];
  };

  const normalizeString = (str) => {
    if (!str) return '';
    return str.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const extractKeywords = (text) => {
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'not', 'nes', 'other', 'than', 'from', 'as']);
    return normalizeString(text)
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.has(word));
  };

  const checkCategoryMatch = (keywords) => {
    const matches = [];
    for (const [category, terms] of Object.entries(categoryLibraries)) {
      for (const keyword of keywords) {
        if (terms.some(term => 
          keyword.includes(term) || 
          term.includes(keyword) ||
          levenshteinDistance(keyword, term) <= 2
        )) {
          matches.push(category);
          break;
        }
      }
    }
    return [...new Set(matches)];
  };

  const calculateKeywordScore = (inventoryKeywords, tariffKeywords, inventoryCategories) => {
    if (inventoryKeywords.length === 0 || tariffKeywords.length === 0) return 0;
    
    let matches = 0;
    let partialMatches = 0;
    
    const tariffCategories = checkCategoryMatch(tariffKeywords);
    const categoryOverlap = inventoryCategories.filter(cat => tariffCategories.includes(cat)).length;
    const categoryBonus = categoryOverlap * 0.3;
    
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
          if (distance / maxLen <= 0.3) {
            bestWordScore = Math.max(bestWordScore, 0.7);
          }
        }
      }
      
      if (bestWordScore >= 1) matches++;
      else if (bestWordScore > 0) partialMatches += bestWordScore;
    }
    
    const baseScore = (matches + partialMatches) / Math.max(inventoryKeywords.length, tariffKeywords.length);
    return Math.min(1, baseScore + categoryBonus);
  };

  const calculateSimilarityScore = (str1, str2) => {
    const norm1 = normalizeString(str1);
    const norm2 = normalizeString(str2);
    
    if (norm1 === norm2) return 1.0;
    if (norm1.length === 0 || norm2.length === 0) return 0;
    
    const distance = levenshteinDistance(norm1, norm2);
    const maxLen = Math.max(norm1.length, norm2.length);
    
    return 1 - (distance / maxLen);
  };

  const findBestMatch = (inventoryItem) => {
    const itemName = inventoryItem.name || inventoryItem.product_name || inventoryItem.item_name || '';
    const inventoryKeywords = extractKeywords(itemName);
    const inventoryCategories = checkCategoryMatch(inventoryKeywords);
    
    let bestMatch = null;
    let bestScore = 0;

    for (const tariffItem of tariffData) {
      const description = tariffItem.description || '';
      const tariffKeywords = extractKeywords(description);
      
      const keywordScore = calculateKeywordScore(inventoryKeywords, tariffKeywords, inventoryCategories);
      const stringScore = calculateSimilarityScore(itemName, description);
      
      const combinedScore = (keywordScore * 0.7) + (stringScore * 0.3);
      
      if (combinedScore > bestScore && combinedScore >= minScore) {
        bestScore = combinedScore;
        bestMatch = {
          ...tariffItem,
          score: combinedScore,
          keywordScore,
          stringScore,
          categories: checkCategoryMatch(tariffKeywords)
        };
      }
    }

    return bestMatch;
  };

  const parseCsvLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    
    return result.map(val => val.replace(/^"|"$/g, ''));
  };

  const processCsvData = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
    
    return lines.slice(1).map(line => {
      const values = parseCsvLine(line);
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    }).filter(obj => Object.values(obj).some(val => val && val.length > 0));
  };

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const data = processCsvData(csvText);
        
        if (data.length === 0) {
          alert(`No valid data found in ${type} file. Please check the file format.`);
          return;
        }
        
        if (type === 'tariff') {
          const hasDescription = data[0].description !== undefined;
          const hasHsCode = data[0]['hs code'] !== undefined || data[0].hs_code !== undefined;
          
          if (!hasDescription || !hasHsCode) {
            alert('Tariff file must have "Description" and "HS Code" columns');
            return;
          }
          setTariffData(data);
        } else {
          const hasName = data[0].name !== undefined || 
                         data[0].product_name !== undefined || 
                         data[0].item_name !== undefined;
          
          if (!hasName) {
            alert('Inventory file must have a "name", "product_name", or "item_name" column');
            return;
          }
          setInventoryData(data);
        }
      } catch (error) {
        alert(`Error parsing ${type} file: ${error.message}`);
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const processMatching = useCallback(() => {
    if (tariffData.length === 0 || inventoryData.length === 0) {
      alert('Please upload both tariff and inventory files first.');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      const results = inventoryData.map(item => {
        const match = findBestMatch(item);
        return {
          inventory: item,
          match,
          status: match ? 'matched' : 'unmatched'
        };
      });
      
      setMatches(results);
      setIsProcessing(false);
    }, 100);
  }, [tariffData, inventoryData, minScore]);

  const exportResults = () => {
    const headers = ['Inventory Name', 'Matched Description', 'HS Code', 'Chapter', 'Confidence Score', 'Categories', 'Status'];
    const rows = matches.map(m => {
      const invName = m.inventory.name || m.inventory.product_name || m.inventory.item_name || '';
      const description = m.match?.description || 'No match found';
      const hsCode = m.match?.['hs code'] || m.match?.hs_code || '';
      const chapter = m.match?.chapter || '';
      const score = m.match?.score ? (m.match.score * 100).toFixed(1) + '%' : '0%';
      const categories = m.match?.categories?.join(', ') || '';
      
      return [invName, description, hsCode, chapter, score, categories, m.status];
    });
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuzzy_matching_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Smart Tariff Classification System
            </h1>
          </div>
          <p className="text-gray-600 mb-6">
            Upload your tariff schedule and inventory data to automatically find HS code matches using AI-powered fuzzy matching with category recognition.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 hover:border-indigo-500 transition-colors">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tariff Schedule</h3>
                <p className="text-sm text-gray-600 mb-4">
                  CSV with: Description, HS Code, Chapter
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
                  className="bg-indigo-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-indigo-600 inline-block transition-colors"
                >
                  Upload Tariff CSV
                </label>
                {tariffData.length > 0 && (
                  <p className="text-green-600 mt-3 font-medium">✓ {tariffData.length} tariff codes loaded</p>
                )}
              </div>
            </div>

            <div className="border-2 border-dashed border-green-300 rounded-lg p-6 hover:border-green-500 transition-colors">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Inventory Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  CSV with: name, product_name, or item_name
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
                  className="bg-green-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-green-600 inline-block transition-colors"
                >
                  Upload Inventory CSV
                </label>
                {inventoryData.length > 0 && (
                  <p className="text-green-600 mt-3 font-medium">✓ {inventoryData.length} products loaded</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Minimum Match Score:</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={minScore}
                onChange={(e) => setMinScore(parseFloat(e.target.value))}
                className="w-32"
              />
              <span className="text-sm font-semibold text-indigo-600 min-w-12">{(minScore * 100).toFixed(0)}%</span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={processMatching}
                disabled={isProcessing || tariffData.length === 0 || inventoryData.length === 0}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-md"
              >
                <Search className="h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Start Matching'}
              </button>

              {matches.length > 0 && (
                <button
                  onClick={exportResults}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-md"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {matches.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center border border-green-200">
                <div className="text-3xl font-bold text-green-600">
                  {matches.filter(m => m.status === 'matched').length}
                </div>
                <div className="text-green-700 font-medium">Matched</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg text-center border border-red-200">
                <div className="text-3xl font-bold text-red-600">
                  {matches.filter(m => m.status === 'unmatched').length}
                </div>
                <div className="text-red-700 font-medium">Unmatched</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">
                  {((matches.filter(m => m.status === 'matched').length / matches.length) * 100).toFixed(1)}%
                </div>
                <div className="text-blue-700 font-medium">Success Rate</div>
              </div>
            </div>
          )}
        </div>

        {matches.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500">
              <h2 className="text-xl font-semibold text-white">Matching Results</h2>
            </div>
            <div className="overflow-x-auto" style={{maxHeight: '500px', overflowY: 'auto'}}>
              <table className="w-full">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Inventory Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Matched Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      HS Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matches.map((match, index) => (
                    <tr key={index} className={match.status === 'matched' ? 'hover:bg-green-50' : 'hover:bg-red-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {match.inventory.name || match.inventory.product_name || match.inventory.item_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {match.match?.description || 'No match found'}
                        {match.match?.categories && match.match.categories.length > 0 && (
                          <div className="mt-1">
                            {match.match.categories.map(cat => (
                              <span key={cat} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded mr-1">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono font-semibold">
                        {match.match?.['hs code'] || match.match?.hs_code || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {match.match ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-500 h-2 rounded-full transition-all"
                                style={{ width: `${match.match.score * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold">{(match.match.score * 100).toFixed(1)}%</span>
                          </div>
                        ) : '0%'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {match.status === 'matched' ? (
                          <div className="flex items-center text-green-600 font-medium">
                            <CheckCircle className="h-5 w-5 mr-1" />
                            Matched
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600 font-medium">
                            <AlertCircle className="h-5 w-5 mr-1" />
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

export default App;