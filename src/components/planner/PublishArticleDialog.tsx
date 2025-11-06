'use client';

import { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface Integration {
  id: string;
  platform: string;
  name: string;
  status: string;
  last_tested_at?: string;
}

interface PublishArticleDialogProps {
  articleId: string;
  articleTitle: string;
  projectId: string;
  onClose: () => void;
  onSuccess?: (url: string) => void;
}

export default function PublishArticleDialog({
  articleId,
  articleTitle,
  projectId,
  onClose,
  onSuccess,
}: PublishArticleDialogProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [publishStatus, setPublishStatus] = useState<'draft' | 'publish'>('draft');
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, [projectId]);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch(`/api/integrations?project_id=${projectId}`);
      const data = await response.json();

      if (response.ok) {
        // Filter only WordPress integrations that have been tested
        const wpIntegrations = (data.integrations || []).filter(
          (i: Integration) => i.platform === 'wordpress'
        );
        setIntegrations(wpIntegrations);

        // Auto-select first integration if only one
        if (wpIntegrations.length === 1) {
          setSelectedIntegration(wpIntegrations[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setError('Failed to load WordPress connections');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedIntegration) {
      setError('Please select a WordPress connection');
      return;
    }

    setPublishing(true);
    setError(null);

    try {
      const response = await fetch(`/api/articles/${articleId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_id: selectedIntegration,
          status: publishStatus,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        if (onSuccess && data.data?.url) {
          onSuccess(data.data.url);
        }
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Failed to publish article');
      }
    } catch (error) {
      console.error('Error publishing article:', error);
      setError('An error occurred while publishing');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Publish to WordPress
            </h2>
            <p className="text-sm text-gray-600">{articleTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading WordPress connections...</p>
          </div>
        )}

        {/* No Integrations */}
        {!loading && integrations.length === 0 && (
          <div className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">No WordPress Connections</p>
            <p className="text-sm text-gray-600 mb-4">
              Please connect a WordPress site first in the Integrations page.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900 mb-2">Published Successfully!</p>
            <p className="text-sm text-gray-600">
              Your article has been published to WordPress
            </p>
          </div>
        )}

        {/* Publish Form */}
        {!loading && integrations.length > 0 && !success && (
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* WordPress Connection Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WordPress Site
              </label>
              <select
                value={selectedIntegration}
                onChange={(e) => setSelectedIntegration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={publishing}
              >
                <option value="">Select a WordPress site...</option>
                {integrations.map((integration) => (
                  <option key={integration.id} value={integration.id}>
                    {integration.name}
                    {!integration.last_tested_at && ' (Not tested)'}
                  </option>
                ))}
              </select>
              {selectedIntegration && (
                <p className="text-xs text-gray-500 mt-1">
                  Make sure to test the connection first
                </p>
              )}
            </div>

            {/* Publish Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Status
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={publishStatus === 'draft'}
                    onChange={(e) => setPublishStatus(e.target.value as 'draft' | 'publish')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    disabled={publishing}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Draft</p>
                    <p className="text-xs text-gray-500">Save as draft (not publicly visible)</p>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="publish"
                    checked={publishStatus === 'publish'}
                    onChange={(e) => setPublishStatus(e.target.value as 'draft' | 'publish')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    disabled={publishing}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Publish</p>
                    <p className="text-xs text-gray-500">Publish immediately (publicly visible)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                disabled={publishing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing || !selectedIntegration}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {publishing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Publish to WordPress</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
