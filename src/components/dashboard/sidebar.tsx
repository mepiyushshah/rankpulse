'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  Zap,
  Calendar,
  Link as LinkIcon,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
  { name: 'Articles', href: '/dashboard/articles', icon: FileText },
  { name: 'Generate Content', href: '/dashboard/generate', icon: Zap },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Integrations', href: '/dashboard/integrations', icon: LinkIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    // Will implement sign out logic
    window.location.href = '/auth/login';
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-primary">RankPulse</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg
                transition-colors duration-200
                ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
