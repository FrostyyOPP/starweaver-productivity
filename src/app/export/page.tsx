'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ExportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Export Data</h1>
          <p className="text-secondary-600">Export your productivity data in various formats</p>
        </div>
        
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📤</div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">Export Feature</h3>
          <p className="text-secondary-600 mb-4">
            Data export functionality will be available soon
          </p>
          <button className="btn-primary">
            Coming Soon
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
