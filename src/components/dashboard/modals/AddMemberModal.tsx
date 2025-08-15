'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Lock, Users, Shield } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TeamManager {
  _id: string;
  name: string;
  email: string;
}

export default function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor',
    teamManager: ''
  });

  const [teamManagers, setTeamManagers] = useState<TeamManager[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch team managers for dropdown
      fetchTeamManagers();
    }
  }, [isOpen]);

  const fetchTeamManagers = async () => {
    try {
      // TODO: Replace with actual API call
      const mockTeamManagers: TeamManager[] = [
        { _id: '1', name: 'John Manager', email: 'john@starweaver.com' },
        { _id: '2', name: 'Sarah Lead', email: 'sarah@starweaver.com' },
        { _id: '3', name: 'Mike Supervisor', email: 'mike@starweaver.com' }
      ];
      setTeamManagers(mockTeamManagers);
    } catch (error) {
      console.error('Error fetching team managers:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement actual API call to add member
      console.log('Adding new member:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('✅ Team member added successfully!');
      onClose();
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'editor',
        teamManager: ''
      });
    } catch (error) {
      console.error('Error adding member:', error);
      alert('❌ Error adding team member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="modal-title">Add New Team Member</h2>
              <p className="modal-subtitle">Create a new team member account</p>
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
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            {/* Name Field */}
            <div className="form-field">
              <label htmlFor="name" className="form-label">
                <Users className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter full name"
              />
            </div>

            {/* Email Field */}
            <div className="form-field">
              <label htmlFor="email" className="form-label">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter email address"
              />
            </div>

            {/* Password Field */}
            <div className="form-field">
              <label htmlFor="password" className="form-label">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="form-input"
                placeholder="Enter password (min 6 characters)"
              />
            </div>

            {/* Role Field */}
            <div className="form-field">
              <label htmlFor="role" className="form-label">
                <Shield className="w-4 h-4" />
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="editor">Editor</option>
                <option value="team_manager">Team Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Team Manager Field */}
            <div className="form-field form-field-full">
              <label htmlFor="teamManager" className="form-label">
                <Users className="w-4 h-4" />
                Assign to Team Manager
              </label>
              <select
                id="teamManager"
                name="teamManager"
                value={formData.teamManager}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Select a team manager</option>
                {teamManagers.map((manager) => (
                  <option key={manager._id} value={manager._id}>
                    {manager.name} ({manager.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner w-4 h-4"></div>
                  Adding Member...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
