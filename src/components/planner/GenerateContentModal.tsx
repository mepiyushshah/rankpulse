'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { ChevronDown, Loader2 } from 'lucide-react';

interface GenerateContentModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (config: GenerationConfig) => void;
  currentMonth: Date;
  projectId: string | null;
}

export interface GenerationConfig {
  numKeywords: number;
  selectedCompetitors?: string[];
  selectedAudiences?: string[];
  selectedKeywords?: { keyword: string; volume: number; difficulty: number }[];
}

interface GeneratedKeyword {
  keyword: string;
  volume: number;
  difficulty: number;
  reason: string;
}

type GenerationType = 'competitors' | 'target_audiences' | 'competitors_audiences';

export function GenerateContentModal({
  open,
  onClose,
  onGenerate,
  currentMonth,
  projectId,
}: GenerateContentModalProps) {
  const [step, setStep] = useState<'configure' | 'preview'>('configure');
  const [generationType, setGenerationType] = useState<GenerationType>('competitors_audiences');
  const [numKeywords, setNumKeywords] = useState('8');
  const [availableCompetitors, setAvailableCompetitors] = useState<string[]>([]);
  const [availableAudiences, setAvailableAudiences] = useState<string[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [generatedKeywords, setGeneratedKeywords] = useState<GeneratedKeyword[]>([]);
  const [selectedKeywordIndices, setSelectedKeywordIndices] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCompetitorDropdown, setShowCompetitorDropdown] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open && projectId) {
      loadProjectData();
      setStep('configure');
      setGeneratedKeywords([]);
      setSelectedKeywordIndices(new Set());
    }
  }, [open, projectId]);

  const loadProjectData = async () => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('projects')
      .select('competitors, target_audiences')
      .eq('id', projectId)
      .single();

    if (data) {
      const competitors = Array.isArray(data.competitors) ? data.competitors : [];
      const audiences = Array.isArray(data.target_audiences) ? data.target_audiences : [];

      setAvailableCompetitors(competitors);
      setAvailableAudiences(audiences);

      // Select all by default
      setSelectedCompetitors(competitors);
      setSelectedAudiences(audiences);
    }
  };

  const toggleCompetitor = (competitor: string) => {
    setSelectedCompetitors(prev =>
      prev.includes(competitor)
        ? prev.filter(c => c !== competitor)
        : [...prev, competitor]
    );
  };

  const toggleAudience = (audience: string) => {
    setSelectedAudiences(prev =>
      prev.includes(audience)
        ? prev.filter(a => a !== audience)
        : [...prev, audience]
    );
  };

  const selectAllCompetitors = () => {
    setSelectedCompetitors(availableCompetitors);
  };

  const selectAllAudiences = () => {
    setSelectedAudiences(availableAudiences);
  };

  const handleGenerateKeywords = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-keywords-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          numKeywords: parseInt(numKeywords) || 8,
          competitors: selectedCompetitors,
          audiences: selectedAudiences,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate keywords');
      }

      const data = await response.json();
      setGeneratedKeywords(data.keywords);
      // Select all by default
      setSelectedKeywordIndices(new Set(data.keywords.map((_: any, i: number) => i)));
      setStep('preview');
    } catch (error: any) {
      alert(error.message || 'Failed to generate keywords');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCalendar = () => {
    const selectedKeywords = Array.from(selectedKeywordIndices).map(i => generatedKeywords[i]);
    onGenerate({
      numKeywords: selectedKeywords.length,
      selectedCompetitors,
      selectedAudiences,
      selectedKeywords,
    });
    onClose();
  };

  const toggleKeywordSelection = (index: number) => {
    const newSet = new Set(selectedKeywordIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedKeywordIndices(newSet);
  };

  const selectAllKeywords = () => {
    setSelectedKeywordIndices(new Set(generatedKeywords.map((_, i) => i)));
  };

  const deselectAllKeywords = () => {
    setSelectedKeywordIndices(new Set());
  };

  const getCompetitorLabel = () => {
    if (selectedCompetitors.length === 0) return 'None Selected';
    if (selectedCompetitors.length === availableCompetitors.length) return 'All Competitors';
    if (selectedCompetitors.length === 1) return selectedCompetitors[0];
    return `${selectedCompetitors.length} Selected`;
  };

  const getAudienceLabel = () => {
    if (selectedAudiences.length === 0) return 'None Selected';
    if (selectedAudiences.length === availableAudiences.length) return 'All Target Audiences';
    if (selectedAudiences.length === 1) return selectedAudiences[0];
    return `${selectedAudiences.length} Selected`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={step === 'configure' ? 'Generate Keywords with AI' : 'Select Keywords to Add'}
      maxWidth="2xl"
    >
      {step === 'configure' ? (
      <div className="space-y-6">
        {/* Generation Type */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Generation Type
          </label>
          <button
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors flex items-center justify-between"
          >
            <span className="text-gray-900">
              {generationType === 'competitors' ? 'Competitors' :
               generationType === 'target_audiences' ? 'Target Audiences' :
               'Competitors & Target Audiences'}
            </span>
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </button>
          {showTypeDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <button
                onClick={() => {
                  setGenerationType('competitors');
                  setShowTypeDropdown(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                  generationType === 'competitors' ? 'bg-primary text-white hover:bg-primary' : 'text-gray-900'
                }`}
              >
                Competitors
              </button>
              <button
                onClick={() => {
                  setGenerationType('target_audiences');
                  setShowTypeDropdown(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                  generationType === 'target_audiences' ? 'bg-primary text-white hover:bg-primary' : 'text-gray-900'
                }`}
              >
                Target Audiences
              </button>
              <button
                onClick={() => {
                  setGenerationType('competitors_audiences');
                  setShowTypeDropdown(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                  generationType === 'competitors_audiences' ? 'bg-primary text-white hover:bg-primary' : 'text-gray-900'
                }`}
              >
                Competitors & Target Audiences
              </button>
            </div>
          )}
        </div>

        {/* Select Competitors - Only show if type includes competitors */}
        {(generationType === 'competitors' || generationType === 'competitors_audiences') && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Select Competitors
            </label>
            <button
              onClick={() => setShowCompetitorDropdown(!showCompetitorDropdown)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors flex items-center justify-between"
            >
              <span className="text-gray-900">{getCompetitorLabel()}</span>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </button>
            {showCompetitorDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    selectAllCompetitors();
                    setShowCompetitorDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-primary font-medium border-b"
                >
                  Select All
                </button>
                {availableCompetitors.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No competitors set. Add them in Settings.
                  </div>
                ) : (
                  availableCompetitors.map((competitor) => (
                    <label
                      key={competitor}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCompetitors.includes(competitor)}
                        onChange={() => toggleCompetitor(competitor)}
                        className="h-4 w-4 text-primary rounded border-gray-300 mr-3"
                      />
                      <span className="text-gray-900">{competitor}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Select Target Audiences - Only show if type includes audiences */}
        {(generationType === 'target_audiences' || generationType === 'competitors_audiences') && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Select Target Audiences
            </label>
            <button
              onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors flex items-center justify-between"
            >
              <span className="text-gray-900">{getAudienceLabel()}</span>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </button>
            {showAudienceDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    selectAllAudiences();
                    setShowAudienceDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-primary font-medium border-b"
                >
                  Select All
                </button>
                {availableAudiences.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No target audiences set. Add them in Settings.
                  </div>
                ) : (
                  availableAudiences.map((audience) => (
                    <label
                      key={audience}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAudiences.includes(audience)}
                        onChange={() => toggleAudience(audience)}
                        className="h-4 w-4 text-primary rounded border-gray-300 mr-3"
                      />
                      <span className="text-gray-900">{audience}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Number of Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Number of Keywords
          </label>
          <Input
            type="number"
            value={numKeywords}
            onChange={(e) => setNumKeywords(e.target.value)}
            min="1"
            max="30"
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} size="md">
            Cancel
          </Button>
          <Button onClick={handleGenerateKeywords} size="md" loading={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Keywords'}
          </Button>
        </div>
      </div>
      ) : (
        /* Preview Step */
        <div className="space-y-5">
          {/* Header Stats */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedKeywordIndices.size} of {generatedKeywords.length} keywords selected
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select keywords to add to your content calendar
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllKeywords}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllKeywords}>
                  Deselect All
                </Button>
              </div>
            </div>
          </div>

          {/* Keywords Grid */}
          <div className="max-h-[450px] overflow-y-auto pr-2 space-y-2">
            {generatedKeywords.map((kw, index) => (
              <label
                key={index}
                className={`
                  block p-3 border rounded-lg cursor-pointer transition-all
                  ${selectedKeywordIndices.has(index)
                    ? 'border-[#00AA45] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="flex items-start gap-2.5">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedKeywordIndices.has(index)}
                    onChange={() => toggleKeywordSelection(index)}
                    className="mt-0.5 h-4 w-4 text-[#00AA45] rounded border-gray-300 focus:ring-[#00AA45]"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Keyword Title & Metrics */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-gray-900">{kw.keyword}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-600">
                          {kw.volume >= 1000 ? `${(kw.volume / 1000).toFixed(1)}K` : kw.volume}
                        </span>
                        <span className={`
                          text-xs font-medium px-1.5 py-0.5 rounded
                          ${kw.difficulty < 30 ? 'bg-green-100 text-green-700' :
                            kw.difficulty < 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'}
                        `}>
                          {kw.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="text-xs text-gray-600">{kw.reason}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setStep('configure')} size="md">
              Back
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} size="md">
                Cancel
              </Button>
              <Button
                onClick={handleAddToCalendar}
                size="md"
                disabled={selectedKeywordIndices.size === 0}
              >
                Add {selectedKeywordIndices.size} to Calendar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
