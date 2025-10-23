'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { COUNTRIES, LANGUAGES } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

type FormData = {
  businessName: string;
  websiteUrl: string;
  country: string;
  language: string;
  description: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export function BusinessDetailsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    websiteUrl: '',
    country: 'US',
    language: 'en',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'Website URL is required';
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateDescription = async () => {
    if (!formData.websiteUrl) {
      setErrors({ websiteUrl: 'Please enter website URL first' });
      return;
    }

    setExtracting(true);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: formData.websiteUrl,
          businessName: formData.businessName,
          existingDescription: formData.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        updateField('description', data.description);
      } else {
        setErrors({ description: 'Failed to generate description. Please try again.' });
      }
    } catch (error) {
      console.error('Failed to generate description:', error);
      setErrors({ description: 'Failed to generate description. Please try again.' });
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Call API route to save project (bypasses RLS)
      const response = await fetch('/api/save-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.businessName,
          website_url: formData.websiteUrl,
          country: formData.country,
          language: formData.language,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      const data = await response.json();

      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating project:', error);
      setErrors({ businessName: error.message || 'Failed to save business details. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">About your business</h1>
            <p className="text-gray-600">Provide your business information to personalize content generation and SEO strategies</p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <div className="space-y-6">
              {/* Website URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website to business
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.websiteUrl}
                  onChange={(e) => updateField('websiteUrl', e.target.value)}
                  error={errors.websiteUrl}
                  className="bg-gray-50"
                />
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your business name"
                  value={formData.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  error={errors.businessName}
                />
              </div>

              {/* Language and Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Language
                    <span className="ml-1 text-gray-400 cursor-help" title="Primary language for content">ⓘ</span>
                  </label>
                  <Select
                    value={formData.language}
                    onChange={(e) => updateField('language', e.target.value)}
                    options={LANGUAGES.map(l => ({
                      value: l.code,
                      label: l.name
                    }))}
                    error={errors.language}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Country
                    <span className="ml-1 text-gray-400 cursor-help" title="Primary business location">ⓘ</span>
                  </label>
                  <Select
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    options={COUNTRIES.map(c => ({
                      value: c.code,
                      label: c.name
                    }))}
                    error={errors.country}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateDescription}
                    loading={extracting}
                    disabled={!formData.websiteUrl || extracting}
                    className="text-sm"
                  >
                    Autocomplete With AI
                  </Button>
                </div>
                <Textarea
                  placeholder="Describe your business, target audience, and what makes you unique..."
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  error={errors.description}
                  rows={8}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="min-w-[100px]"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
