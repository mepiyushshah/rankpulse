'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Platform Icons
const WordPressIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#21759B"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 15.5L6.5 7.8l1.9-.6 3.1 7.7-1 .6zm4.5-.5l-3-7.5 1.5-.5 3.5 8.5-2-.5z" fill="white"/>
  </svg>
);


// Platform configuration
const PLATFORMS = [
  {
    id: 'wordpress',
    name: 'WordPress.org',
    icon: WordPressIcon,
    description: 'Self-hosted WordPress sites',
    color: 'bg-blue-50 border-blue-200',
    fields: ['api_url', 'api_key']
  }
];

interface Integration {
  id: string;
  platform: string;
  name: string;
  status: string;
  created_at: string;
  api_url?: string;
  site_id?: string;
}

export default function IntegrationsPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProject();
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchIntegrations();
    }
  }, [projectId]);

  const loadProject = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: projectsData, error } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (projectsData) {
      setProjectId(projectsData.id);
    } else if (error?.code === 'PGRST116') {
      // No project found - create a default one
      const { data: newProject } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: 'My Project',
          description: 'Default project',
        })
        .select('id')
        .single();

      if (newProject) {
        setProjectId(newProject.id);
      }
    }
  };

  const fetchIntegrations = async () => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/integrations?project_id=${projectId}`);
      const data = await response.json();

      if (response.ok) {
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPlatform = (platformId: string) => {
    setSelectedPlatform(platformId);
    setFormData({ platform: platformId });
    setShowConnectionDialog(true);
  };

  const handleSubmitConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project_id: projectId
        })
      });

      if (response.ok) {
        await fetchIntegrations();
        setShowConnectionDialog(false);
        setFormData({});
        setSelectedPlatform(null);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating integration:', error);
      alert('Failed to create integration');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to remove this integration?')) return;

    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchIntegrations();
      }
    } catch (error) {
      console.error('Error deleting integration:', error);
    }
  };

  const getConnectedPlatforms = () => {
    return integrations.map(i => i.platform);
  };

  const getPlatformConfig = (platformId: string) => {
    return PLATFORMS.find(p => p.id === platformId);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Found</h3>
          <p className="text-gray-600">Please create a project first to manage integrations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="mb-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Integrations</h1>
        <p className="text-sm text-gray-500">
          Connect your content management platforms to automatically publish articles.
        </p>
      </div>

      {/* Connected Integrations */}
      {integrations.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => {
              const platform = getPlatformConfig(integration.platform);
              return (
                <div
                  key={integration.id}
                  className={`border-2 rounded-lg p-6 ${platform?.color || 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div>{platform?.icon && <platform.icon />}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {integration.name || platform?.name}
                        </h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Connected</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteIntegration(integration.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  {integration.api_url && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">URL:</span> {integration.api_url}
                    </p>
                  )}
                  {integration.site_id && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Site ID:</span> {integration.site_id}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Connected {new Date(integration.created_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Platforms */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map((platform) => {
            const isConnected = getConnectedPlatforms().includes(platform.id);
            return (
              <button
                key={platform.id}
                onClick={() => !isConnected && handleConnectPlatform(platform.id)}
                disabled={isConnected}
                className={`border-2 rounded-lg p-6 text-left transition-all ${
                  isConnected
                    ? 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed'
                    : `${platform.color} hover:shadow-md hover:scale-105`
                }`}
              >
                <div className="mb-3"><platform.icon /></div>
                <h3 className="font-semibold text-gray-900 mb-1">{platform.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{platform.description}</p>
                {isConnected ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Connect</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Connection Dialog */}
      {showConnectionDialog && selectedPlatform && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect {getPlatformConfig(selectedPlatform)?.name}
            </h2>
            <form onSubmit={handleSubmitConnection}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Connection Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., My Blog"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {getPlatformConfig(selectedPlatform)?.fields.includes('api_url') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API URL
                    </label>
                    <input
                      type="url"
                      value={formData.api_url || ''}
                      onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                      placeholder="https://yourblog.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {getPlatformConfig(selectedPlatform)?.fields.includes('site_id') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site ID
                    </label>
                    <input
                      type="text"
                      value={formData.site_id || ''}
                      onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                      placeholder="Your site ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {getPlatformConfig(selectedPlatform)?.fields.includes('api_key') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={formData.api_key || ''}
                      onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                      placeholder="Your API key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {getPlatformConfig(selectedPlatform)?.fields.includes('api_secret') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Secret
                    </label>
                    <input
                      type="password"
                      value={formData.api_secret || ''}
                      onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                      placeholder="Your API secret"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {getPlatformConfig(selectedPlatform)?.fields.includes('webhook_url') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={formData.webhook_url || ''}
                      onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                      placeholder="https://your-webhook-url.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowConnectionDialog(false);
                    setFormData({});
                    setSelectedPlatform(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
