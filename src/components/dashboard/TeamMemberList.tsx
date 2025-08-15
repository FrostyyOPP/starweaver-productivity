'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Edit, 
  Eye, 
  UserPlus, 
  Settings, 
  Search, 
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  Award,
  BarChart3,
  Calendar,
  Video,
  Star,
  Mail,
  Phone,
  MapPin,
  MoreVertical
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  employeeId: string;
  avatar?: string;
  skills: string[];
  joinDate: string;
  isActive: boolean;
  lastLogin?: string;
  productivityScore: number;
  courseVideos: number;
  marketingVideos: number;
  totalVideos: number;
  targetVideos: number;
  phone?: string;
  location?: string;
}

interface TeamMemberListProps {
  members: TeamMember[];
  onEditMember?: (member: TeamMember) => void;
  onViewMember?: (member: TeamMember) => void;
  onDeleteMember?: (memberId: string) => void;
}

export default function TeamMemberList({ 
  members, 
  onEditMember, 
  onViewMember, 
  onDeleteMember 
}: TeamMemberListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getProductivityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProductivityIcon = (score: number) => {
    if (score >= 90) return <Award className="w-4 h-4" />;
    if (score >= 75) return <TrendingUp className="w-4 h-4" />;
    if (score >= 60) return <Clock className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <div className="search-container">
          <div className="search-input">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
        </div>
        
        <div className="filter-container">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Departments</option>
            <option value="Content Production">Content Production</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Development">Development</option>
          </select>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="empty-state">
          <Users className="empty-state-icon" />
          <p className="empty-state-title">No team members found</p>
          <p className="empty-state-description">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="members-grid">
          {filteredMembers.map((member) => (
            <div key={member._id} className="member-card">
              <div className="card-header">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="card-title text-lg">{member.name}</h3>
                      <p className="text-gray-600 text-sm">{member.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(member.isActive)}`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card-content">
                <div className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="contact-info">
                      <Mail className="w-4 h-4" />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="contact-info">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.location && (
                      <div className="contact-info">
                        <MapPin className="w-4 h-4" />
                        <span>{member.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Department & Employee ID */}
                  <div className="flex items-center justify-between text-sm">
                    <span>Dept: <span className="font-medium">{member.department}</span></span>
                    <span>ID: <span className="font-medium">{member.employeeId}</span></span>
                  </div>

                  {/* Skills */}
                  <div className="skills-container">
                    <p>Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag skill-tag-primary">
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 3 && (
                        <span className="skill-tag skill-tag-secondary">
                          +{member.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="performance-metrics">
                    <div className="metric-item">
                      <p className="metric-value">{member.productivityScore}%</p>
                      <p className="metric-label">Productivity</p>
                    </div>
                    <div className="metric-item">
                      <p className="metric-value">{member.totalVideos}</p>
                      <p className="metric-label">Total Videos</p>
                    </div>
                  </div>

                  {/* Video Breakdown */}
                  <div className="video-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-label">Course:</span>
                      <span className="breakdown-value">{member.courseVideos}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Marketing:</span>
                      <span className="breakdown-value">{member.marketingVideos}</span>
                      <span className="breakdown-note">(×6)</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-container">
                    <div className="progress-header">
                      <span className="progress-label">Progress</span>
                      <span className="progress-value">
                        {member.totalVideos}/{member.targetVideos}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${Math.min((member.totalVideos / member.targetVideos) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Join Date & Last Login */}
                  <div className="member-dates">
                    <span>Joined: {formatDate(member.joinDate)}</span>
                    {member.lastLogin && (
                      <span>Last: {formatDate(member.lastLogin)}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button
                    onClick={() => onViewMember?.(member)}
                    className="action-btn action-btn-view"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => onEditMember?.(member)}
                    className="action-btn action-btn-edit"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteMember?.(member._id)}
                    className="action-btn action-btn-remove"
                  >
                    <X className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
