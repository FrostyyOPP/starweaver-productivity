'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Star, LogOut, Users, Target, TrendingUp, UserPlus, BarChart3, PieChart, Activity, Settings, Download, Upload, Plus, ChevronDown, FileText, FileSpreadsheet, FileDown } from 'lucide-react';
import TeamManagement from './TeamManagement';
import TeamReports from './TeamReports';

// Modal Components
import AddMemberModal from './modals/AddMemberModal';
import TeamSettingsModal from './modals/TeamSettingsModal';
import ImportDataModal from './modals/ImportDataModal';

export default function TeamManagerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [activeTab, setActiveTab] = useState('team-management');
  const [showQuickActionsDropdown, setShowQuickActionsDropdown] = useState(false);
  const [showExportFormatDropdown, setShowExportFormatDropdown] = useState(false);
  
  // Modal states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showTeamSettingsModal, setShowTeamSettingsModal] = useState(false);
  const [showImportDataModal, setShowImportDataModal] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'team_manager') {
      router.push('/login');
    }
  }, [user, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.quick-actions-dropdown') && !target.closest('.quick-actions-button')) {
        setShowQuickActionsDropdown(false);
      }
      if (!target.closest('.export-format-dropdown') && !target.closest('.export-report-button')) {
        setShowExportFormatDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    setShowQuickActionsDropdown(false);
    switch (action) {
      case 'add-member':
        setShowAddMemberModal(true);
        break;
      case 'export-report':
        setShowExportFormatDropdown(!showExportFormatDropdown);
        break;
      case 'team-settings':
        setShowTeamSettingsModal(true);
        break;
      case 'import-data':
        setShowImportDataModal(true);
        break;
      case 'bulk-actions':
        alert('👥 Bulk actions panel opened...');
        console.log('Bulk actions clicked');
        break;
      default:
        break;
    }
  };

  const handleExportFormat = (format: string) => {
    setShowExportFormatDropdown(false);
    // Handle export based on format
    switch (format) {
      case 'xlsx':
        alert('📊 Exporting data as XLSX file...');
        // TODO: Implement XLSX export
        break;
      case 'csv':
        alert('📊 Exporting data as CSV file...');
        // TODO: Implement CSV export
        break;
      case 'pdf':
        alert('📊 Exporting data as PDF file...');
        // TODO: Implement PDF export
        break;
      default:
        break;
    }
  };

  if (!user || user.role !== 'team_manager') {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h1 className="dashboard-title">STARWEAVER</h1>
          </div>
          
          <div className="user-section">
            <div className="text-right mr-4">
              <p className="text-sm text-gray-400">Team Manager</p>
              <p className="text-lg font-semibold text-white">{user?.name || 'Manager'}</p>
            </div>
            
            {/* User Initial with Hover Dropdown */}
            <div className="relative group">
              <div className="user-initial">
                {user?.name?.charAt(0)?.toUpperCase() || 'M'}
              </div>
              
              {/* Logout Dropdown */}
              <div className="logout-dropdown">
                <button
                  onClick={handleLogout}
                  className="logout-button"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="quick-actions-bar">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">Team Dashboard</h2>
              <div className="period-selector">
                {['week', 'month'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quick Actions Dropdown */}
            <div className="quick-actions-container">
              <button
                onClick={() => setShowQuickActionsDropdown(!showQuickActionsDropdown)}
                className="btn btn-primary flex items-center space-x-2 quick-actions-button"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Actions</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showQuickActionsDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Quick Actions Dropdown Menu */}
              {showQuickActionsDropdown && (
                <div className="quick-actions-dropdown">
                  <div className="dropdown-item" onClick={() => handleQuickAction('add-member')}>
                    <UserPlus className="w-4 h-4" />
                    <span>Add New Member</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleQuickAction('export-report')}>
                    <FileDown className="w-4 h-4" />
                    <span>Export Report</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleQuickAction('team-settings')}>
                    <Settings className="w-4 h-4" />
                    <span>Team Settings</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleQuickAction('import-data')}>
                    <Upload className="w-4 h-4" />
                    <span>Import Data</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleQuickAction('bulk-actions')}>
                    <Users className="w-4 h-4" />
                    <span>Bulk Actions</span>
                  </div>
                </div>
              )}

              {/* Export Format Dropdown */}
              {showExportFormatDropdown && (
                <div className="export-format-dropdown">
                  <div className="dropdown-item" onClick={() => handleExportFormat('xlsx')}>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export as XLSX</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleExportFormat('csv')}>
                    <FileText className="w-4 h-4" />
                    <span>Export as CSV</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleExportFormat('pdf')}>
                    <FileDown className="w-4 h-4" />
                    <span>Export as PDF</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Team Stats Grid - Data comes from API */}
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Users className="w-6 h-6" />
              </div>
              <div className="stat-value">-</div>
              <div className="stat-label">Team Members</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Target className="w-6 h-6" />
              </div>
              <div className="stat-value">-</div>
              <div className="stat-label">Total Videos</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="stat-value">-</div>
              <div className="stat-label">Team Productivity</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Activity className="w-6 h-6" />
              </div>
              <div className="stat-value">-</div>
              <div className="stat-label">Weekly Progress</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              onClick={() => setActiveTab('team-management')}
              className={`tab-button ${activeTab === 'team-management' ? 'tab-active' : ''}`}
            >
              <Users className="w-5 h-5" />
              <span>Team Management</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`tab-button ${activeTab === 'reports' ? 'tab-active' : ''}`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Reports & Analytics</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'team-management' ? (
              <TeamManagement />
            ) : (
              <TeamReports />
            )}
          </div>
        </div>

        {/* Modals */}
        {showAddMemberModal && (
          <AddMemberModal
            isOpen={showAddMemberModal}
            onClose={() => setShowAddMemberModal(false)}
          />
        )}

        {showTeamSettingsModal && (
          <TeamSettingsModal
            isOpen={showTeamSettingsModal}
            onClose={() => setShowTeamSettingsModal(false)}
          />
        )}

        {showImportDataModal && (
          <ImportDataModal
            isOpen={showImportDataModal}
            onClose={() => setShowImportDataModal(false)}
          />
        )}
      </div>
    </div>
  );
}
