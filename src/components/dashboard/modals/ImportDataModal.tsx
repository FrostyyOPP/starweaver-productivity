'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, FileSpreadsheet, FileJson, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportData {
  editorName: string;
  email: string;
  videoDelivered: number;
  date: string;
  videoType: 'course_video' | 'marketing_video' | 'on_leave';
}

export default function ImportDataModal({ isOpen, onClose }: ImportDataModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'xlsx' | 'csv' | 'json'>('xlsx');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [previewData, setPreviewData] = useState<ImportData[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage('');
      setUploadStatus('idle');
      
      // Validate file type
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        setFileType('xlsx');
      } else if (fileName.endsWith('.csv')) {
        setFileType('csv');
      } else if (fileName.endsWith('.json')) {
        setFileType('json');
      } else {
        setErrorMessage('Please select a valid file type (XLSX, CSV, or JSON)');
        setSelectedFile(null);
        return;
      }

      // Generate preview data
      generatePreviewData(file);
    }
  };

  const generatePreviewData = (file: File) => {
    // TODO: Implement actual file parsing
    // For now, generate mock preview data
    const mockData: ImportData[] = [
      {
        editorName: 'Alice Johnson',
        email: 'alice@starweaver.com',
        videoDelivered: 15,
        date: '2024-01-15',
        videoType: 'course_video'
      },
      {
        editorName: 'Bob Smith',
        email: 'bob@starweaver.com',
        videoDelivered: 8,
        date: '2024-01-15',
        videoType: 'marketing_video'
      },
      {
        editorName: 'Carol Davis',
        email: 'carol@starweaver.com',
        videoDelivered: 0,
        date: '2024-01-15',
        videoType: 'on_leave'
      }
    ];
    setPreviewData(mockData);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: Implement actual file upload API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      
      // Simulate processing delay
      setTimeout(() => {
        alert('✅ Data imported successfully! 25 records processed.');
        onClose();
        resetForm();
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFileType('xlsx');
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'xlsx':
        return <FileSpreadsheet className="w-5 h-5" />;
      case 'csv':
        return <FileText className="w-5 h-5" />;
      case 'json':
        return <FileJson className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getVideoTypeLabel = (type: string) => {
    switch (type) {
      case 'course_video':
        return 'Course Video';
      case 'marketing_video':
        return 'Marketing Video';
      case 'on_leave':
        return 'On Leave';
      default:
        return type;
    }
  };

  const getVideoTypeColor = (type: string) => {
    switch (type) {
      case 'course_video':
        return 'bg-blue-100 text-blue-800';
      case 'marketing_video':
        return 'bg-green-100 text-green-800';
      case 'on_leave':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-large">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="modal-title">Import Productivity Data</h2>
              <p className="modal-subtitle">Upload XLSX, CSV, or JSON files with team productivity data</p>
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
          {/* File Upload Section */}
          <div className="upload-section">
            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.json"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="upload-label">
                <div className="upload-icon">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                <div className="upload-text">
                  <span className="upload-title">Click to upload or drag and drop</span>
                  <span className="upload-subtitle">
                    XLSX, CSV, or JSON files up to 10MB
                  </span>
                </div>
              </label>
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="file-info">
                <div className="file-details">
                  {getFileTypeIcon(fileType)}
                  <div>
                    <h4 className="file-name">{selectedFile.name}</h4>
                    <p className="file-size">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="btn btn-outline btn-sm"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="error-message">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Upload Progress */}
            {uploadStatus === 'uploading' && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{uploadProgress}%</span>
              </div>
            )}

            {/* Success Message */}
            {uploadStatus === 'success' && (
              <div className="success-message">
                <CheckCircle className="w-4 h-4" />
                <span>File uploaded successfully!</span>
              </div>
            )}
          </div>

          {/* Data Preview Section */}
          {previewData.length > 0 && (
            <div className="preview-section">
              <h3 className="preview-title">Data Preview</h3>
              <p className="preview-subtitle">
                Preview of the data that will be imported
              </p>
              
              <div className="preview-table">
                <div className="preview-header">
                  <div className="preview-cell">Editor Name</div>
                  <div className="preview-cell">Email</div>
                  <div className="preview-cell">Videos Delivered</div>
                  <div className="preview-cell">Date</div>
                  <div className="preview-cell">Video Type</div>
                </div>
                
                {previewData.map((row, index) => (
                  <div key={index} className="preview-row">
                    <div className="preview-cell">{row.editorName}</div>
                    <div className="preview-cell">{row.email}</div>
                    <div className="preview-cell">{row.videoDelivered}</div>
                    <div className="preview-cell">{row.date}</div>
                    <div className="preview-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVideoTypeColor(row.videoType)}`}>
                        {getVideoTypeLabel(row.videoType)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Fields Info */}
          <div className="required-fields-info">
            <h4 className="info-title">Required Data Fields:</h4>
            <div className="fields-grid">
              <div className="field-item">
                <span className="field-name">Editor Name</span>
                <span className="field-desc">Full name of the team member</span>
              </div>
              <div className="field-item">
                <span className="field-name">Email Address</span>
                <span className="field-desc">Valid email address</span>
              </div>
              <div className="field-item">
                <span className="field-name">Videos Delivered</span>
                <span className="field-desc">Number of videos completed</span>
              </div>
              <div className="field-item">
                <span className="field-name">Date</span>
                <span className="field-desc">Date of productivity (YYYY-MM-DD)</span>
              </div>
              <div className="field-item">
                <span className="field-name">Video Type</span>
                <span className="field-desc">Course Video, Marketing Video, or On Leave</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Download className="w-4 h-4" />
            <span>Download sample template</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn btn-outline"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              className="btn btn-primary"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="loading-spinner w-4 h-4"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
