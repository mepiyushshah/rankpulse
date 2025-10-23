'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is already logged in, redirect to dashboard
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await authService.signIn({
        email: formData.email,
        password: formData.password,
      });

      // Get redirect URL from query params or default to dashboard
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold text-primary mb-2">RankPulse</h1>
          </Link>
          <p className="text-gray-600">Welcome back!</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Log In</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
              />

              <Input
                label="Password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded border-gray-300" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link href="/auth/reset-password" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Log In
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
                  Sign up free
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-8">
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
