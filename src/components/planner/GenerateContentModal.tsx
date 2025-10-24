'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { ChevronDown } from 'lucide-react';

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
}

type GenerationType = 'competitors' | 'target_audiences' | 'competitors_audiences';

export function GenerateContentModal({
  open,
  onClose,
  onGenerate,
  currentMonth,
  projectId,
}: GenerateContentModalProps) {
  const [generationType, setGenerationType] = useState<GenerationType>('competitors_audiences');
  const [numKeywords, setNumKeywords] = useState('8');
  const [availableCompetitors, setAvailableCompetitors] = useState<string[]>([]);
  const [availableAudiences, setAvailableAudiences] = useState<string[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCompetitorDropdown, setShowCompetitorDropdown] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);

  // Load project data when modal opens
  useEffect(() => {
    if (open && projectId) {
      loadProjectData();
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

  const handleGenerate = () => {
    onGenerate({
      numKeywords: parseInt(numKeywords) || 8,
      selectedCompetitors,
      selectedAudiences,
    });
    onClose();
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
    <Dialog open={open} onClose={onClose} title="Generate Content Plan" maxWidth="2xl">
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

        {/* Select Competitors */}
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

        {/* Select Target Audiences */}
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
          <Button onClick={handleGenerate} size="md">
            Generate
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
