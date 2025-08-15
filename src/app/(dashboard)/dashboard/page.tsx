'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import EditorDashboard from '@/components/dashboard/EditorDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import TeamManagerDashboard from '@/components/dashboard/TeamManagerDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ClientOnly from '@/components/ClientOnly';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Star } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        setDashboardLoading(false);
      }
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading || dashboardLoading) {
    return (
      <div className="dashboard-container">
        <div className="min-h-screen flex items-center justify-center">
          <div className="dashboard-header flex-col items-center text-center p-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-white">
                    STARWEAVER
                  </h1>
                </div>
              </div>
              <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
              <p className="text-gray-300">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="min-h-screen flex items-center justify-center">
          <div className="dashboard-header flex-col items-center text-center p-8">
            <div className="text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-white mb-2">Dashboard Error</h1>
              <p className="text-gray-300 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Reload Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no user, show redirect message
  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="min-h-screen flex items-center justify-center">
          <div className="dashboard-header flex-col items-center text-center p-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-white">
                    STARWEAVER
                  </h1>
                </div>
              </div>
              <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
              <p className="text-gray-300">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  return (
    <ClientOnly fallback={
      <div className="dashboard-container">
        <div className="min-h-screen flex items-center justify-center">
          <div className="dashboard-header flex-col items-center text-center p-8">
            <div className="text-center">
              <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
              <p className="text-gray-300">Initializing dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ErrorBoundary>
        {user.role === 'admin' && <AdminDashboard key="admin" />}
        {user.role === 'manager' && <ManagerDashboard key="manager" />}
        {user.role === 'team_manager' && <TeamManagerDashboard key="team-manager" />}
        {user.role === 'editor' && <EditorDashboard key="editor" />}
      </ErrorBoundary>
    </ClientOnly>
  );
}
