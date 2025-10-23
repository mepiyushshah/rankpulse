'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Sign out from Supabase
        await authService.signOut();

        // Clear local storage
        localStorage.clear();
        sessionStorage.clear();

        // Redirect to home page
        router.push('/');
        router.refresh();
      } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, redirect to home
        router.push('/');
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Logging out...</h2>
        <p className="text-gray-600">Please wait while we sign you out.</p>
      </div>
    </div>
  );
}
