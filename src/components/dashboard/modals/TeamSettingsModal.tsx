'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Edit, Trash2, Mail, Shield, AlertTriangle } from 'lucide-react';

interface TeamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  joinDate: string;
}

export default function TeamSettingsModal({ isOpen, onClose }: TeamSettingsModalProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const mockMembers: TeamMember[] = [
        {
          _id: '1',
          name: 'Alice Johnson',
          email: 'alice@starweaver.com',
          role: 'editor',
          isActive: true,
          joinDate: '2024-01-15'
        },
        {
          _id: '2',
          name: 'Bob Smith',
          email: 'bob@starweaver.com',
          role: 'team_manager',
          isActive: true,
          joinDate: '2024-02-01'
        },
        {
          _id: '3',
          name: 'Carol Davis',
          email: 'carol@starweaver.com',
          role: 'editor',
          isActive: false,
          joinDate: '2024-01-20'
        },
        {
          _id: '4',
          name: 'David Wilson',
          email: 'david@starweaver.com',
          role: 'admin',
          isActive: true,
          joinDate: '2023-12-01'
        }
      ];
      setTeamMembers(mockMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member._id);
    setEditForm({
      name: member.name,
      email: member.email,
      role: member.role
    });
  };

  const handleEditSave = async (memberId: string) => {
    try {
      // TODO: Implement actual API call to update member
      console.log('Updating member:', memberId, editForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setTeamMembers(prev => prev.map(member => 
        member._id === memberId 
          ? { ...member, ...editForm }
          : member
      ));
      
      setEditingMember(null);
      alert('✅ Team member updated successfully!');
    } catch (error) {
      console.error('Error updating member:', error);
      alert('❌ Error updating team member. Please try again.');
    }
  };

  const handleEditCancel = () => {
    setEditingMember(null);
    setEditForm({ name: '', email: '', role: '' });
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return;
    }

    try {
      // TODO: Implement actual API call to remove member
      console.log('Removing member:', memberId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setTeamMembers(prev => prev.filter(member => member._id !== memberId));
      
      alert('✅ Team member removed successfully!');
    } catch (error) {
      console.error('Error removing member:', error);
      alert('❌ Error removing team member. Please try again.');
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', label: 'Admin' },
      team_manager: { color: 'bg-blue-100 text-blue-800', label: 'Team Manager' },
      editor: { color: 'bg-green-100 text-green-800', label: 'Editor' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.editor;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-large">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="modal-title">Team Settings</h2>
              <p className="modal-subtitle">Manage team members and their roles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner w-8 h-8"></div>
              <span className="ml-3 text-gray-600">Loading team members...</span>
            </div>
          ) : (
            <div className="team-members-list">
              {teamMembers.map((member) => (
                <div key={member._id} className="team-member-card">
                  <div className="member-info">
                    <div className="member-avatar">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="member-details">
                      <h3 className="member-name">{member.name}</h3>
                      <div className="member-meta">
                        <span className="member-email">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </span>
                        <span className="member-join-date">
                          Joined: {new Date(member.joinDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="member-badges">
                        {getRoleBadge(member.role)}
                        {getStatusBadge(member.isActive)}
                      </div>
                    </div>
                  </div>

                  <div className="member-actions">
                    {editingMember === member._id ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="edit-input"
                          placeholder="Name"
                        />
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          className="edit-input"
                          placeholder="Email"
                        />
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                          className="edit-select"
                        >
                          <option value="editor">Editor</option>
                          <option value="team_manager">Team Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                        <div className="edit-actions">
                          <button
                            onClick={() => handleEditSave(member._id)}
                            className="btn btn-success btn-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="btn btn-outline btn-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(member)}
                          className="btn btn-outline btn-sm"
                          title="Edit member"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(member._id, member.name)}
                          className="btn btn-danger btn-sm"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <AlertTriangle className="w-4 h-4" />
            <span>Changes will be applied immediately</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
