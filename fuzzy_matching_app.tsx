import React, { useState, useCallback } from 'react';
import { Upload, Download, Search, AlertCircle, CheckCircle } from 'lucide-react';

const FuzzyMatchingApp = () => {
  const [tariffData, setTariffData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [minScore, setMinScore] = useState(0.6);

  // Fuzzy matching utilities
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
    return str.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const extractKeywords = (text) => {
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']);
    return normalizeString(text)
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.has(word));
  };

  const calculateKeywordScore = (inventoryKeywords, tariffKeywords) => {
    if (inventoryKeywords.length === 0 || tariffKeywords.length === 0) return 0;
    
    let matches = 0;
    let partialMatches = 0;
    
    for (const invWord of inventoryKeywords) {
      for (const tarWord of tariffKeywords) {
        if (invWord === tarWord) {
          matches++;
        } else if (invWord.includes(tarWord) || tarWord.includes(invWord)) {
          partialMatches += 0.5;
        } else {
          const distance = levenshteinDistance(invWord, tarWord);
          const maxLen = Math.max(invWord.length, tarWord.length);
          if (distance / maxLen <= 0.3) {
            partialMatches += 0.7;
          }
        }
      }
    }
    
    return (matches + partialMatches) / Math.max(inventoryKeywords.length, tariffKeywords.length);
  };

  const calculateSimilarityScore = (str1, str2) => {
    const norm1 = normalizeString(str1);
    const norm2 = normalizeString(str2);
    
    if (norm1 === norm2) return 1.0;
    
    const distance = levenshteinDistance(norm1, norm2);
    const maxLen = Math.max(norm1.length, norm2.length);
    
    return 1 - (distance / maxLen);
  };

  const findBestMatch = (inventoryItem) => {
    const inventoryKeywords = extractKeywords(inventoryItem.name);
    let bestMatch = null;
    let bestScore = 0;

    for (const tariffItem of tariffData) {
      const tariffKeywords = extractKeywords(tariffItem.description);
      
      // Calculate different similarity scores
      const keywordScore = calculateKeywordScore(inventoryKeywords, tariffKeywords);
      const stringScore = calculateSimilarityScore(inventoryItem.name, tariffItem.description);
      
      // Weight the scores (keyword matching is more important for this use case)
      const combinedScore = (keywordScore * 0.7) + (stringScore * 0.3);
      
      if (combinedScore > bestScore && combinedScore >= minScore) {
        bestScore = combinedScore;
        bestMatch = {
          ...tariffItem,
          score: combinedScore,
          keywordScore,
          stringScore
        };
      }
    }

    return bestMatch;
  };

  const processCsvData = (csvText, type) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((header, index) => {
        obj[header.toLowerCase()] = values[index] || '';
      });
      return obj;
    });
  };

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const data = processCsvData(csvText, type);
        
        if (type === 'tariff') {
          setTariffData(data);
        } else {
          setInventoryData(data);
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
    const csvContent = [
      ['Inventory Name', 'Matched Description', 'HS Code', 'Confidence Score', 'Status'],
      ...matches.map(m => [
        m.inventory.name || '',
        m.match?.description || 'No match found',
        m.match?.['hs code'] || m.match?.hs_code || '',
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

          {/* File Upload Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tariff Schedule (Reference)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  CSV with columns: description, hs_code (or HS Code)
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
                  <p className="text-green-600 mt-2">✓ {tariffData.length} items loaded</p>
                )}
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Inventory Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  CSV with column: name (or product_name, item_name)
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
                  <p className="text-green-600 mt-2">✓ {inventoryData.length} items loaded</p>
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
                  {((matches.filter(m => m.status === 'matched').length / matches.length) * 100).toFixed(1)}%
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
                        {match.inventory.name || match.inventory.product_name || match.inventory.item_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {match.match?.description || 'No match found'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {match.match?.['hs code'] || match.match?.hs_code || '-'}
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