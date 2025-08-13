'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { entriesAPI, Entry } from '@/lib/api';

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await entriesAPI.getEntries({ limit: 20, sortOrder: 'desc' });
      setEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (entryData: any) => {
    try {
      await entriesAPI.createEntry(entryData);
      setShowCreateForm(false);
      fetchEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await entriesAPI.deleteEntry(id);
      fetchEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
            <p className="text-secondary-600">Loading entries...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Productivity Entries</h1>
            <p className="text-secondary-600">Track and manage your daily productivity</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            + New Entry
          </button>
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Create Entry Form */}
        {showCreateForm && (
          <CreateEntryForm
            onSubmit={handleCreateEntry}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Entries List */}
        {entries.length > 0 ? (
          <div className="grid gap-4">
            {entries.map((entry) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                onDelete={() => handleDeleteEntry(entry._id)}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No entries yet</h3>
            <p className="text-secondary-600 mb-4">
              Start tracking your productivity by creating your first entry
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create First Entry
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function CreateEntryForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shiftStart: '09:00',
    shiftEnd: '17:00',
    videosCompleted: '',
    targetVideos: '',
    notes: '',
    mood: 'good',
    energyLevel: '3',
    challenges: '',
    achievements: ''
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    const entryData = {
      date: formData.date,
      shiftStart: `${formData.date}T${formData.shiftStart}:00Z`,
      shiftEnd: `${formData.date}T${formData.shiftEnd}:00Z`,
      videosCompleted: parseInt(formData.videosCompleted),
      targetVideos: parseInt(formData.targetVideos),
      notes: formData.notes,
      mood: formData.mood as 'excellent' | 'good' | 'average' | 'poor',
      energyLevel: parseInt(formData.energyLevel),
      challenges: formData.challenges ? [formData.challenges] : [],
      achievements: formData.achievements ? [formData.achievements] : []
    };

    onSubmit(entryData);
  };

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Create New Entry</h3>
        <p className="card-description">Record your daily productivity metrics</p>
      </div>
      <div className="card-content">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Mood
              </label>
              <select
                name="mood"
                value={formData.mood}
                onChange={handleChange}
                className="select"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Shift Start
              </label>
              <input
                type="time"
                name="shiftStart"
                value={formData.shiftStart}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Shift End
              </label>
              <input
                type="time"
                name="shiftEnd"
                value={formData.shiftEnd}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Videos Completed
              </label>
              <input
                type="number"
                name="videosCompleted"
                value={formData.videosCompleted}
                onChange={handleChange}
                className="input"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Target Videos
              </label>
              <input
                type="number"
                name="targetVideos"
                value={formData.targetVideos}
                onChange={handleChange}
                className="input"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Energy Level (1-5)
              </label>
              <select
                name="energyLevel"
                value={formData.energyLevel}
                onChange={handleChange}
                className="select"
              >
                <option value="1">1 - Very Low</option>
                <option value="2">2 - Low</option>
                <option value="3">3 - Medium</option>
                <option value="4">4 - High</option>
                <option value="5">5 - Very High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="textarea"
              rows={3}
              placeholder="Any additional notes about your day..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Challenges
              </label>
              <input
                type="text"
                name="challenges"
                value={formData.challenges}
                onChange={handleChange}
                className="input"
                placeholder="Main challenge faced today"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Achievements
              </label>
              <input
                type="text"
                name="achievements"
                value={formData.achievements}
                onChange={handleChange}
                className="input"
                placeholder="Key achievement today"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Create Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EntryCard({ entry, onDelete }: { entry: Entry; onDelete: () => void }) {
  const productivityPercentage = (entry.videosCompleted / entry.targetVideos) * 100;
  
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-3">
            <div>
              <h3 className="font-medium text-secondary-900">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <p className="text-sm text-secondary-600">
                {new Date(entry.shiftStart).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} - {new Date(entry.shiftEnd).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} • {entry.totalHours}h
              </p>
            </div>
            <div className={`badge ${
              entry.mood === 'excellent' ? 'badge-success' :
              entry.mood === 'good' ? 'badge-primary' :
              entry.mood === 'average' ? 'badge-warning' : 'badge-danger'
            }`}>
              {entry.mood}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-secondary-600">Videos</p>
              <p className="font-medium text-secondary-900">
                {entry.videosCompleted} / {entry.targetVideos}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">Productivity</p>
              <p className="font-medium text-secondary-900">
                {entry.productivityScore}%
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">Energy</p>
              <p className="font-medium text-secondary-900">
                {entry.energyLevel}/5
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">Achievement</p>
              <p className={`font-medium ${
                productivityPercentage >= 100 ? 'text-success-600' : 
                productivityPercentage >= 80 ? 'text-primary-600' : 'text-warning-600'
              }`}>
                {productivityPercentage.toFixed(0)}%
              </p>
            </div>
          </div>

          {entry.notes && (
            <div className="mb-4">
              <p className="text-sm text-secondary-600 mb-1">Notes</p>
              <p className="text-sm text-secondary-900">{entry.notes}</p>
            </div>
          )}

          {(entry.challenges?.length > 0 || entry.achievements?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entry.challenges && entry.challenges.length > 0 && (
                <div>
                  <p className="text-sm text-secondary-600 mb-1">Challenges</p>
                  <ul className="text-sm text-secondary-900">
                    {entry.challenges.map((challenge, index) => (
                      <li key={index}>• {challenge}</li>
                    ))}
                  </ul>
                </div>
              )}
              {entry.achievements && entry.achievements.length > 0 && (
                <div>
                  <p className="text-sm text-secondary-600 mb-1">Achievements</p>
                  <ul className="text-sm text-secondary-900">
                    {entry.achievements.map((achievement, index) => (
                      <li key={index}>• {achievement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ml-4">
          <button
            onClick={onDelete}
            className="text-danger-600 hover:text-danger-700 p-1"
            title="Delete entry"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
