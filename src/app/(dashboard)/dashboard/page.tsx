'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import EditorDashboard from '@/components/dashboard/EditorDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no user, show redirect message
  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      </div>
      );
  }

  // Render the appropriate dashboard based on user role
  try {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'editor':
      case 'viewer':
      default:
        return <EditorDashboard />;
    }
  } catch (err) {
    console.error('Dashboard rendering error:', err);
    setError(err instanceof Error ? err.message : 'An error occurred while rendering the dashboard');
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h1>
            <p className="text-gray-600 mb-4">An error occurred while rendering the dashboard</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}
