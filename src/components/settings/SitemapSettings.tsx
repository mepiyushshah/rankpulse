'use client'

import { useState, useEffect } from 'react'
import { Link2, Plus, Trash2, ExternalLink, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'

interface Sitemap {
  id: string
  sitemap_url: string
  last_parsed_at: string | null
  article_count: number
  status: 'pending' | 'parsing' | 'active' | 'error'
  error_message: string | null
  created_at: string
}

interface SitemapSettingsProps {
  projectId: string
}

export default function SitemapSettings({ projectId }: SitemapSettingsProps) {
  const [sitemaps, setSitemaps] = useState<Sitemap[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newSitemapUrl, setNewSitemapUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadSitemaps()
  }, [projectId])

  // Auto-refresh when there are parsing sitemaps
  useEffect(() => {
    const hasParsing = sitemaps.some(s => s.status === 'parsing')
    if (!hasParsing) return

    const interval = setInterval(() => {
      loadSitemaps()
    }, 3000) // Check every 3 seconds

    return () => clearInterval(interval)
  }, [sitemaps])

  const loadSitemaps = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/sitemaps?projectId=${projectId}`)
      if (!response.ok) throw new Error('Failed to load sitemaps')
      const data = await response.json()
      setSitemaps(data.sitemaps || [])
    } catch (err) {
      console.error('Error loading sitemaps:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const addSitemap = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newSitemapUrl.trim()) {
      setError('Please enter a sitemap URL')
      return
    }

    // Validate URL
    try {
      new URL(newSitemapUrl)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    try {
      setIsAdding(true)
      const response = await fetch('/api/sitemaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          sitemapUrl: newSitemapUrl.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add sitemap')
      }

      setNewSitemapUrl('')
      setTimeout(() => loadSitemaps(), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add sitemap')
    } finally {
      setIsAdding(false)
    }
  }

  const deleteSitemap = async (sitemapId: string) => {
    if (!confirm('Are you sure you want to delete this sitemap?')) {
      return
    }

    try {
      const response = await fetch(`/api/sitemaps?id=${sitemapId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete sitemap')
      }

      loadSitemaps()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sitemap')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        )
      case 'parsing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            <Loader2 className="w-3 h-3 animate-spin" />
            Parsing...
          </span>
        )
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Error
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            Pending
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[#00AA45]" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-[#00AA45]" />
        Sitemap Integration
      </h3>

      <div className="space-y-4">
        {/* Description */}
        <div className="text-xs text-gray-600">
          <p className="mb-1">Add your website's sitemap to automatically discover existing articles for internal linking.</p>
          <p className="text-gray-500">💡 Use your main sitemap URL (e.g., sitemap.xml or sitemap_index.xml)</p>
        </div>

        {/* Add Sitemap Form */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <form onSubmit={addSitemap} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Sitemap URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newSitemapUrl}
                  onChange={(e) => setNewSitemapUrl(e.target.value)}
                  placeholder="https://example.com/sitemap.xml"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AA45] focus:border-transparent"
                  disabled={isAdding}
                />
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-3 py-1.5 bg-[#00AA45] text-white text-sm rounded-lg hover:bg-[#008837] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Sitemaps List */}
        {sitemaps.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">Connected Sitemaps ({sitemaps.length})</div>
            <div className="space-y-2">
              {sitemaps.map((sitemap) => (
                <div key={sitemap.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {getStatusBadge(sitemap.status)}
                        <a
                          href={sitemap.sitemap_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 truncate"
                        >
                          {sitemap.sitemap_url}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        {sitemap.article_count > 0 && (
                          <span>
                            <span className="font-medium">{sitemap.article_count}</span> articles
                          </span>
                        )}
                        {sitemap.last_parsed_at && (
                          <span>
                            Last parsed: <span className="font-medium">{new Date(sitemap.last_parsed_at).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>

                      {sitemap.error_message && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          {sitemap.error_message}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteSitemap(sitemap.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete sitemap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {sitemaps.length === 0 && (
          <div className="text-center py-6 text-xs text-gray-500">
            No sitemaps added yet. Add your first sitemap above to get started.
          </div>
        )}
      </div>
    </div>
  )
}
