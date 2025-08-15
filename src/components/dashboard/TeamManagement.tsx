'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Eye, 
  UserPlus, 
  Settings, 
  Filter, 
  Search, 
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Clock,
  Award,
  BarChart3,
  Calendar,
  Video,
  Star,
  LogOut
} from 'lucide-react';
import TeamMemberList from './TeamMemberList';

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

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  averageProductivity: number;
  totalVideosCompleted: number;
  weeklyProgress: number;
  monthlyProgress: number;
  teamTarget: number;
  teamAchievement: number;
}

interface Team {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
}

export default function TeamManagement() {
  const [team, setTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalMembers: 0,
    activeMembers: 0,
    averageProductivity: 0,
    totalVideosCompleted: 0,
    weeklyProgress: 0,
    monthlyProgress: 0,
    teamTarget: 0,
    teamAchievement: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch real team data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the access token from localStorage (same as auth system)
        const token = localStorage.getItem('accessToken');

        if (!token) {
          throw new Error('No access token found');
        }

        console.log('🔍 Fetching team data with token:', token.substring(0, 20) + '...');

        // Fetch team data from the API
        const response = await fetch('/api/teams/manager', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch team data');
        }

        const data = await response.json();
        
        console.log('📡 API Response:', data);
        console.log('👥 Members found:', data.members ? data.members.length : 0);
        
        // Update team members
        if (data.members) {
          setTeamMembers(data.members.map((member: any) => ({
            _id: member._id,
            name: member.name,
            email: member.email,
            position: member.position || 'Editor',
            department: member.department || 'Content Production',
            employeeId: member.employeeId || `EMP${member._id.slice(-4)}`,
            avatar: member.avatar || '',
            skills: member.skills || ['Content Creation', 'Video Editing'],
            joinDate: member.joinDate || member.createdAt || new Date().toISOString(),
            isActive: member.isActive !== undefined ? member.isActive : true,
            lastLogin: member.lastLogin,
            productivityScore: member.productivityScore || 85,
            courseVideos: member.courseVideos || 0,
            marketingVideos: member.marketingVideos || 0,
            totalVideos: member.totalVideos || 0,
            targetVideos: member.targetVideos || 50,
            phone: member.phone || '',
            location: member.location || 'India'
          })));
        }

        // Update team stats
        if (data.stats) {
          setTeamStats({
            totalMembers: data.stats.totalMembers || 0,
            activeMembers: data.stats.activeMembers || 0,
            averageProductivity: data.stats.averageProductivity || 0,
            totalVideosCompleted: data.stats.totalVideosCompleted || 0,
            weeklyProgress: data.stats.weeklyProgress || 0,
            monthlyProgress: data.stats.monthlyProgress || 0,
            teamTarget: data.stats.teamTarget || 0,
            teamAchievement: data.stats.teamAchievement || 0
          });
        }

        // Update team info
        if (data.team) {
          setTeam({
            id: data.team._id,
            name: data.team.name || 'Starweaver Team',
            code: data.team.code || 'SW001',
            color: data.team.color || '#4c51bf',
            description: data.team.description || 'Content Production Team'
          });
        }

      } catch (err) {
        console.error('Error fetching team data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch team data');
        
        // Don't set demo data - let the error state handle it
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const handleEditMember = (member: TeamMember) => {
    console.log('Edit member:', member);
    // TODO: Implement edit functionality
  };

  const handleViewMember = (member: TeamMember) => {
    console.log('View member:', member);
    // TODO: Implement view functionality
  };

  const handleDeleteMember = (memberId: string) => {
    console.log('Delete member:', memberId);
    // TODO: Implement delete functionality
  };

  return (
    <div className="space-y-8">
      {/* Team Members List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Team Members</h3>
          <p className="text-gray-600">Manage your team members and view their status</p>
        </div>
        <div className="card-content">
          <TeamMemberList
            members={teamMembers}
            onEditMember={handleEditMember}
            onViewMember={handleViewMember}
            onDeleteMember={handleDeleteMember}
          />
        </div>
      </div>
    </div>
  );
}
