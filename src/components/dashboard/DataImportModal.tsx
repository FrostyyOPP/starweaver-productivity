import React, { useState, useRef } from 'react';
import { Upload, FileText, Users, CheckCircle, AlertCircle, X } from 'lucide-react';

interface ImportData {
  teamLeaders: Array<{
    firstName: string;
    lastName: string;
    email: string;
    teamName: string;
  }>;
  editors: Array<{
    firstName: string;
    lastName: string;
    email: string;
    teamLeader: string;
    teamName: string;
  }>;
  productivityData: Array<{
    date: string;
    editorName: string;
    videosCompleted: number;
    category: 'Course' | 'Marketing' | 'Leave';
    notes?: string;
    mood?: number;
    energyLevel?: number;
    challenges?: string;
    achievements?: string;
  }>;
}

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ImportData) => Promise<void>;
}

const DataImportModal: React.FC<DataImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setValidationErrors([]);

    try {
      const data = await parseFile(uploadedFile);
      const validationResult = validateData(data);
      
      if (validationResult.isValid) {
        setImportData(data);
        setStep('preview');
      } else {
        setValidationErrors(validationResult.errors);
      }
    } catch (error) {
      setValidationErrors([`Error parsing file: ${error}`]);
    }
  };

  const parseFile = async (file: File): Promise<ImportData> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'json') {
      const text = await file.text();
      return JSON.parse(text);
    } else if (['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
      // For now, we'll expect JSON format
      // TODO: Add Excel/CSV parsing with xlsx library
      throw new Error('Please convert your Excel/CSV to JSON format for now');
    } else {
      throw new Error('Unsupported file format. Please use JSON, Excel, or CSV.');
    }
  };

  const validateData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate structure
    if (!data.teamLeaders || !Array.isArray(data.teamLeaders)) {
      errors.push('Missing or invalid teamLeaders array');
    }
    if (!data.editors || !Array.isArray(data.editors)) {
      errors.push('Missing or invalid editors array');
    }
    if (!data.productivityData || !Array.isArray(data.productivityData)) {
      errors.push('Missing or invalid productivityData array');
    }

    // Validate team leaders
    if (data.teamLeaders) {
      data.teamLeaders.forEach((tl: any, index: number) => {
        if (!tl.firstName || !tl.lastName || !tl.email || !tl.teamName) {
          errors.push(`Team Leader ${index + 1}: Missing required fields (firstName, lastName, email, teamName)`);
        }
        if (!tl.email.includes('@')) {
          errors.push(`Team Leader ${index + 1}: Invalid email format`);
        }
      });
    }

    // Validate editors
    if (data.editors) {
      data.editors.forEach((editor: any, index: number) => {
        if (!editor.firstName || !editor.lastName || !editor.email || !editor.teamLeader || !editor.teamName) {
          errors.push(`Editor ${index + 1}: Missing required fields (firstName, lastName, email, teamLeader, teamName)`);
        }
        if (!editor.email.includes('@')) {
          errors.push(`Editor ${index + 1}: Invalid email format`);
        }
      });
    }

    // Validate productivity data
    if (data.productivityData) {
      data.productivityData.forEach((entry: any, index: number) => {
        if (!entry.date || !entry.editorName || typeof entry.videosCompleted !== 'number' || !entry.category) {
          errors.push(`Productivity Entry ${index + 1}: Missing required fields (date, editorName, videosCompleted, category)`);
        }
        if (!['Course', 'Marketing', 'Leave'].includes(entry.category)) {
          errors.push(`Productivity Entry ${index + 1}: Invalid category. Must be Course, Marketing, or Leave`);
        }
      });
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleImport = async () => {
    if (!importData) return;

    setIsImporting(true);
    setStep('importing');

    try {
      await onImport(importData);
      onClose();
    } catch (error) {
      setValidationErrors([`Import failed: ${error}`]);
      setStep('preview');
    } finally {
      setIsImporting(false);
    }
  };

  const resetModal = () => {
    setStep('upload');
    setFile(null);
    setImportData(null);
    setValidationErrors([]);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Upload className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Import Team & Productivity Data</h2>
          </div>
          <button
            onClick={() => {
              resetModal();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Data File</h3>
                <p className="text-gray-600 mb-6">
                  Upload an Excel, CSV, or JSON file containing your team structure and productivity data.
                </p>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  {file ? `Selected: ${file.name}` : 'No file selected'}
                </p>
              </div>

              {/* File Format Instructions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Expected Data Format:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• <strong>teamLeaders:</strong> Array of team leaders with firstName, lastName, email, teamName</p>
                  <p>• <strong>editors:</strong> Array of editors with firstName, lastName, email, teamLeader, teamName</p>
                  <p>• <strong>productivityData:</strong> Array of daily entries with date, editorName, videosCompleted, category, notes</p>
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h4 className="font-medium text-red-900">Validation Errors</h4>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && importData && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Data Preview</h3>
                <p className="text-gray-600 mb-6">
                  Review the data before importing. This will create new users and import productivity data.
                </p>
              </div>

              {/* Team Leaders Preview */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Team Leaders ({importData.teamLeaders.length})</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-blue-200">
                        <th className="text-left py-2 px-3">Name</th>
                        <th className="text-left py-2 px-3">Email</th>
                        <th className="text-left py-2 px-3">Team</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.teamLeaders.map((tl, index) => (
                        <tr key={index} className="border-b border-blue-100">
                          <td className="py-2 px-3">{tl.firstName} {tl.lastName}</td>
                          <td className="py-2 px-3">{tl.email}</td>
                          <td className="py-2 px-3">{tl.teamName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Editors Preview */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3 flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Editors ({importData.editors.length})</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-green-200">
                        <th className="text-left py-2 px-3">Name</th>
                        <th className="text-left py-2 px-3">Email</th>
                        <th className="text-left py-2 px-3">Team</th>
                        <th className="text-left py-2 px-3">Team Leader</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.editors.map((editor, index) => (
                        <tr key={index} className="border-b border-green-100">
                          <td className="py-2 px-3">{editor.firstName} {editor.lastName}</td>
                          <td className="py-2 px-3">{editor.email}</td>
                          <td className="py-2 px-3">{editor.teamName}</td>
                          <td className="py-2 px-3">{editor.teamLeader}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Productivity Data Preview */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-3 flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Productivity Data ({importData.productivityData.length} entries)</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-purple-200">
                        <th className="text-left py-2 px-3">Date</th>
                        <th className="text-left py-2 px-3">Editor</th>
                        <th className="text-left py-2 px-3">Videos</th>
                        <th className="text-left py-2 px-3">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.productivityData.slice(0, 10).map((entry, index) => (
                        <tr key={index} className="border-b border-purple-100">
                          <td className="py-2 px-3">{entry.date}</td>
                          <td className="py-2 px-3">{entry.editorName}</td>
                          <td className="py-2 px-3">{entry.videosCompleted}</td>
                          <td className="py-2 px-3">{entry.category}</td>
                        </tr>
                      ))}
                      {importData.productivityData.length > 10 && (
                        <tr>
                          <td colSpan={4} className="py-2 px-3 text-center text-gray-500">
                            ... and {importData.productivityData.length - 10} more entries
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back to Upload
                </button>
                <button
                  onClick={handleImport}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirm Import
                </button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Importing Data...</h3>
              <p className="text-gray-600">Please wait while we create users and import productivity data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataImportModal;
