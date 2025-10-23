'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkData();
  }, []);

  const checkData = async () => {
    try {
      // Get user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setError('User error: ' + userError.message);
        return;
      }

      setUser(currentUser);

      if (currentUser) {
        // Get projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', currentUser.id);

        if (projectsError) {
          setError('Projects error: ' + projectsError.message);
        } else {
          setProjects(projectsData || []);
        }
      }
    } catch (err: any) {
      setError('Error: ' + err.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">User Info</h2>
          {user ? (
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          ) : (
            <p>No user logged in</p>
          )}
        </div>

        <div className="bg-white border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Projects ({projects.length})</h2>
          {projects.length > 0 ? (
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(projects, null, 2)}
            </pre>
          ) : (
            <p>No projects found</p>
          )}
        </div>
      </div>
    </div>
  );
}
