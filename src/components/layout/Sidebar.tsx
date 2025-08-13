'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Entries', href: '/entries', icon: '📝' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Teams', href: '/teams', icon: '👥' },
  { name: 'Export', href: '/export', icon: '📤' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={`bg-white border-r border-secondary-200 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SW</span>
            </div>
            <span className="font-semibold text-secondary-900">Starweaver</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-secondary-100 text-secondary-500"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''} ${
                    isCollapsed ? 'justify-center px-2' : ''
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!isCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-secondary-200">
        {!isCollapsed && user && (
          <div className="mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-secondary-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <span className={`badge ${
                user.role === 'admin' ? 'badge-primary' : 
                user.role === 'editor' ? 'badge-secondary' : 'badge-warning'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={`btn-outline w-full ${isCollapsed ? 'px-2' : ''}`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          {isCollapsed ? '🚪' : 'Logout'}
        </button>
      </div>
    </div>
  );
}
