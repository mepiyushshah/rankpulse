import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  organization_name: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  website_url: string | null;
  language: string;
  brand_voice: string | null;
  default_author: string | null;
  status: string;
  created_at: string;
};

export type CMSConnection = {
  id: string;
  project_id: string;
  platform: 'wordpress' | 'webflow' | 'shopify';
  api_url: string;
  api_key: string;
  status: string;
  created_at: string;
};

export type Article = {
  id: string;
  project_id: string;
  title: string;
  content: string;
  meta_description: string | null;
  word_count: number | null;
  language: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduled_at: string | null;
  published_at: string | null;
  cms_post_id: string | null;
  published_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Keyword = {
  id: string;
  project_id: string;
  keyword: string;
  priority: string;
  status: string;
  created_at: string;
};

export type ContentTemplate = {
  id: string;
  user_id: string;
  name: string;
  template_type: string | null;
  prompt_structure: string;
  created_at: string;
};
