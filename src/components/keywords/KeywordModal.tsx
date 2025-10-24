'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface KeywordModalProps {
  open: boolean;
  onClose: () => void;
  onAddKeywords: (keywords: { keyword: string; volume?: number; difficulty?: number }[]) => void;
}

type TabType = 'find' | 'import';

interface KeywordSuggestion {
  keyword: string;
  volume: number;
  difficulty: number;
  selected: boolean;
}

export function KeywordModal({ open, onClose, onAddKeywords }: KeywordModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('find');
  const [seedKeyword, setSeedKeyword] = useState('');
  const [manualKeywords, setManualKeywords] = useState('');
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle AI keyword search
  const handleSearch = async () => {
    if (!seedKeyword.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedKeyword }),
      });

      if (!response.ok) throw new Error('Failed to generate keywords');

      const data = await response.json();
      // Limit to 7 keywords maximum
      const limitedKeywords = data.keywords.slice(0, 7);
      setSuggestions(
        limitedKeywords.map((k: any) => ({
          ...k,
          selected: false,
        }))
      );
    } catch (error) {
      console.error('Error generating keywords:', error);
      alert('Failed to generate keywords. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle keyword selection
  const toggleKeyword = (index: number) => {
    setSuggestions((prev) =>
      prev.map((k, i) => (i === index ? { ...k, selected: !k.selected } : k))
    );
  };

  // Handle adding keywords from Find tab
  const handleAddFromFind = () => {
    const selected = suggestions.filter((k) => k.selected);
    if (selected.length === 0) {
      alert('Please select at least one keyword');
      return;
    }

    onAddKeywords(
      selected.map((k) => ({
        keyword: k.keyword,
        volume: k.volume,
        difficulty: k.difficulty,
      }))
    );

    // Reset state
    setSeedKeyword('');
    setSuggestions([]);
    onClose();
  };

  // Handle adding keywords from Import tab
  const handleAddFromImport = () => {
    const keywords = manualKeywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keywords.length === 0) {
      alert('Please enter at least one keyword');
      return;
    }

    onAddKeywords(keywords.map((keyword) => ({ keyword })));

    // Reset state
    setManualKeywords('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add Keywords" maxWidth="2xl">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('find')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'find'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Find Keywords
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'import'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Import Keywords List
          </button>
        </nav>
      </div>

      {/* Find Keywords Tab */}
      {activeTab === 'find' && (
        <div>
          {/* Search Input */}
          <div className="flex items-center gap-3 mb-6">
            <Input
              placeholder="Enter a seed keyword (e.g., best website builders)"
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              loading={loading}
              disabled={!seedKeyword.trim()}
              size="md"
              className="whitespace-nowrap"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Results */}
          {suggestions.length > 0 ? (
            <div>
              <div className="border rounded-lg overflow-hidden mb-4">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keyword
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Search Volume
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difficulty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {suggestions.map((suggestion, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={(e) => {
                          // Allow clicks anywhere on the row
                          e.stopPropagation();
                          toggleKeyword(index);
                        }}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={suggestion.selected}
                            onChange={() => toggleKeyword(index)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {suggestion.keyword}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {suggestion.volume >= 1000
                            ? `${(suggestion.volume / 1000).toFixed(1)}K`
                            : suggestion.volume}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              suggestion.difficulty < 30
                                ? 'bg-green-100 text-green-800'
                                : suggestion.difficulty < 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {suggestion.difficulty}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleAddFromFind} size="md">
                  Add Selected Keywords ({suggestions.filter((k) => k.selected).length})
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Search for keywords to see results
            </div>
          )}
        </div>
      )}

      {/* Import Keywords Tab */}
      {activeTab === 'import' && (
        <div>
          <Textarea
            placeholder="Enter keywords separated by commas&#10;Example: seo tips, content marketing, digital marketing"
            value={manualKeywords}
            onChange={(e) => setManualKeywords(e.target.value)}
            rows={10}
            className="mb-4"
          />

          <div className="flex justify-end">
            <Button
              onClick={handleAddFromImport}
              disabled={!manualKeywords.trim()}
              size="md"
            >
              Add Keywords
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
