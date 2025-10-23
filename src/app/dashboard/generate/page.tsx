'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Zap, Save, Send } from 'lucide-react';

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'technical', label: 'Technical' },
  { value: 'conversational', label: 'Conversational' },
];

const wordCountOptions = [
  { value: '500', label: '500 words' },
  { value: '1000', label: '1000 words' },
  { value: '1500', label: '1500 words' },
  { value: '2000', label: '2000 words' },
  { value: '2500', label: '2500 words' },
  { value: '3000', label: '3000 words' },
];

const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Arabic', label: 'Arabic' },
];

export default function GenerateContentPage() {
  const [formData, setFormData] = useState({
    topic: '',
    wordCount: '1500',
    tone: 'professional',
    language: 'English',
  });
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedContent(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setGeneratedContent(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    // TODO: Implement save to database
    alert('Save draft functionality will be implemented');
  };

  const handlePublish = async () => {
    // TODO: Implement publish functionality
    alert('Publish functionality will be implemented');
  };

  return (
    <DashboardLayout>
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Generate Content
        </h1>
        <p className="text-gray-600">
          Create SEO-optimized articles with AI in seconds
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Article Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Topic or Keyword"
                required
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                placeholder="e.g., How to optimize website speed for SEO"
                rows={4}
                helperText="Be specific about what you want to write about"
              />

              <Select
                label="Word Count"
                value={formData.wordCount}
                onChange={(e) =>
                  setFormData({ ...formData, wordCount: e.target.value })
                }
                options={wordCountOptions}
              />

              <Select
                label="Tone"
                value={formData.tone}
                onChange={(e) =>
                  setFormData({ ...formData, tone: e.target.value })
                }
                options={toneOptions}
              />

              <Select
                label="Language"
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                options={languageOptions}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                loading={loading}
                onClick={handleGenerate}
                className="w-full"
              >
                <Zap className="mr-2 h-5 w-5" />
                {loading ? 'Generating...' : 'Generate Article'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output/Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
            </CardHeader>
            <CardContent>
              {!generatedContent && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No content yet
                  </h3>
                  <p className="text-gray-600 max-w-sm">
                    Enter your topic and preferences, then click Generate to
                    create your article
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-600">Generating your article...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take 20-30 seconds
                  </p>
                </div>
              )}

              {generatedContent && (
                <div className="space-y-6">
                  {/* Article Title */}
                  <div>
                    <Input
                      label="Title"
                      value={generatedContent.title}
                      onChange={(e) =>
                        setGeneratedContent({
                          ...generatedContent,
                          title: e.target.value,
                        })
                      }
                      className="text-lg font-semibold"
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <Textarea
                      label="Meta Description"
                      value={generatedContent.metaDescription}
                      onChange={(e) =>
                        setGeneratedContent({
                          ...generatedContent,
                          metaDescription: e.target.value,
                        })
                      }
                      rows={2}
                      helperText={`${generatedContent.metaDescription?.length || 0}/160 characters`}
                    />
                  </div>

                  {/* Content Editor */}
                  <div>
                    <Textarea
                      label="Content"
                      value={generatedContent.content}
                      onChange={(e) =>
                        setGeneratedContent({
                          ...generatedContent,
                          content: e.target.value,
                        })
                      }
                      rows={20}
                      helperText={`${generatedContent.wordCount || 0} words`}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={handleSaveDraft}
                      className="flex-1"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save as Draft
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handlePublish}
                      className="flex-1"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Publish Now
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
