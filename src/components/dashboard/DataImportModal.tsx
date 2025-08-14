import React, { useState, useRef } from 'react';
import { Upload, FileText, Users, CheckCircle, AlertCircle, X, User, Database } from 'lucide-react';
import * as XLSX from 'xlsx';

interface UserImportData {
  users: Array<{
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'manager' | 'editor' | 'viewer';
  }>;
}

interface DataImportData {
  productivityData: Array<{
    userEmail: string;
    date: string;
    videosCompleted: number;
    videoCategory?: 'Course Video' | 'Marketing Video' | 'Leave';
    notes?: string;
  }>;
}

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserImport: (data: UserImportData) => Promise<void>;
  onDataImport: (data: DataImportData) => Promise<void>;
}

const DataImportModal: React.FC<DataImportModalProps> = ({ isOpen, onClose, onUserImport, onDataImport }) => {
  const [importType, setImportType] = useState<'select' | 'user' | 'data'>('select');
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [userImportData, setUserImportData] = useState<UserImportData | null>(null);
  const [dataImportData, setDataImportData] = useState<DataImportData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setValidationErrors([]);

    try {
      if (importType === 'user') {
        const data = await parseUserFile(uploadedFile);
        const validationResult = validateUserData(data);
        
        if (validationResult.isValid) {
          setUserImportData(data);
          setStep('preview');
        } else {
          setValidationErrors(validationResult.errors);
        }
      } else if (importType === 'data') {
        const data = await parseDataFile(uploadedFile);
        const validationResult = validateDataData(data);
        
        if (validationResult.isValid) {
          setDataImportData(data);
          setStep('preview');
        } else {
          setValidationErrors(validationResult.errors);
        }
      }
    } catch (error) {
      setValidationErrors([`Error parsing file: ${error}`]);
    }
  };

  const parseUserFile = async (file: File): Promise<UserImportData> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'json') {
      const text = await file.text();
      return JSON.parse(text);
    } else if (['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Debug logging
            console.log('Excel headers found:', jsonData[0]);
            console.log('Excel data rows:', jsonData.length - 1);
            
            // Convert Excel data to expected format
            const users = convertExcelToUsers(jsonData);
            resolve({ users });
          } catch (error) {
            reject(new Error(`Failed to parse Excel file: ${error}`));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsBinaryString(file);
      });
    } else {
      throw new Error('Unsupported file format. Please use JSON, Excel, or CSV.');
    }
  };

  const parseDataFile = async (file: File): Promise<DataImportData> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'json') {
      const text = await file.text();
      return JSON.parse(text);
    } else if (['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Debug logging
            console.log('Excel headers found:', jsonData[0]);
            console.log('Excel data rows:', jsonData.length - 1);
            
            // Convert Excel data to expected format
            const productivityData = convertExcelToProductivityData(jsonData);
            resolve({ productivityData });
          } catch (error) {
            reject(new Error(`Failed to parse Excel file: ${error}`));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsBinaryString(file);
      });
    } else {
      throw new Error('Unsupported file format. Please use JSON, Excel, or CSV.');
    }
  };

  const validateUserData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate structure
    if (!data.users || !Array.isArray(data.users)) {
      errors.push('Missing or invalid users array');
    }

    // Validate users
    if (data.users) {
      data.users.forEach((user: any, index: number) => {
        if (!user.name || !user.email || !user.password || !user.role) {
          errors.push(`User ${index + 1}: Missing required fields (name, email, password, role)`);
        }
        if (!user.email.includes('@')) {
          errors.push(`User ${index + 1}: Invalid email format`);
        }
        if (!['admin', 'manager', 'editor', 'viewer'].includes(user.role)) {
          errors.push(`User ${index + 1}: Invalid role. Must be admin, manager, editor, or viewer`);
        }
        if (user.password.length < 8) {
          errors.push(`User ${index + 1}: Password must be at least 8 characters long`);
        }
      });
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateDataData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate structure
    if (!data.productivityData || !Array.isArray(data.productivityData)) {
      errors.push('Missing or invalid productivityData array');
    }

    // Validate productivity data
    if (data.productivityData) {
      data.productivityData.forEach((entry: any, index: number) => {
        if (!entry.userEmail || !entry.date || typeof entry.videosCompleted !== 'number') {
          errors.push(`Productivity Entry ${index + 1}: Missing required fields (userEmail, date, videosCompleted)`);
        }
        if (!entry.userEmail.includes('@')) {
          errors.push(`Productivity Entry ${index + 1}: Invalid email format`);
        }
        if (entry.videosCompleted < 0) {
          errors.push(`Productivity Entry ${index + 1}: Videos completed cannot be negative`);
        }
        if (entry.videoCategory && !['Course Video', 'Marketing Video', 'Leave'].includes(entry.videoCategory)) {
          errors.push(`Productivity Entry ${index + 1}: Invalid video category. Must be 'Course Video', 'Marketing Video', or 'Leave'`);
        }
      });
    }

    return { isValid: errors.length === 0, errors };
  };

  // Convert Excel data to users format
  const convertExcelToUsers = (excelData: any[]): any[] => {
    if (excelData.length < 2) {
      throw new Error('Excel file must have at least a header row and one data row');
    }

    const headers = excelData[0];
    const dataRows = excelData.slice(1);

    // Find column indices with more flexible matching
    const nameIndex = headers.findIndex((h: string) => 
      h?.toString().toLowerCase().includes('name'));
    const emailIndex = headers.findIndex((h: string) => 
      h?.toString().toLowerCase().includes('email'));
    const passwordIndex = headers.findIndex((h: string) => 
      h?.toString().toLowerCase().includes('password') || 
      h?.toString().toLowerCase().includes('pasword') || // Handle typo
      h?.toString().toLowerCase().includes('pass') ||
      h?.toString().toLowerCase().includes('pwd'));
    const roleIndex = headers.findIndex((h: string) => 
      h?.toString().toLowerCase().includes('role') ||
      h?.toString().toLowerCase().includes('access') ||
      h?.toString().toLowerCase().includes('level'));

    // Provide more helpful error messages
    const missingColumns = [];
    if (nameIndex === -1) missingColumns.push('Name');
    if (emailIndex === -1) missingColumns.push('Email');
    if (passwordIndex === -1) missingColumns.push('Password (or similar like "Pasword", "Pass", "Pwd")');
    if (roleIndex === -1) missingColumns.push('Role (or similar like "Access", "Level")');

    if (missingColumns.length > 0) {
      throw new Error(`Excel file missing required columns: ${missingColumns.join(', ')}. Found headers: ${headers.join(', ')}`);
    }

    return dataRows
      .filter((row: any[]) => row.some(cell => cell !== null && cell !== undefined))
      .map((row: any[], index: number) => ({
        name: row[nameIndex]?.toString() || '',
        email: row[emailIndex]?.toString() || '',
        password: row[passwordIndex]?.toString() || '',
        role: row[roleIndex]?.toString()?.toLowerCase() || 'editor'
      }));
  };

  // Convert Excel data to productivity data format
  const convertExcelToProductivityData = (excelData: any[]): any[] => {
    if (excelData.length < 2) {
      throw new Error('Excel file must have at least a header row and one data row');
    }

    const headers = excelData[0];
    const dataRows = excelData.slice(1);

    // Find column indices with more flexible matching
    const userEmailIndex = headers.findIndex((h: string) => 
      h?.toString().toLowerCase().includes('email') || 
      h?.toString().toLowerCase().includes('user') ||
      h?.toString().toLowerCase().includes('useremail'));
    const dateIndex = headers.findIndex((h: string) => 
      h?.toString().toLowerCase().includes('date') ||
      h?.toString().toLowerCase().includes('workdate') ||
      h?.toString().toLowerCase().includes('entrydate'));
    const videosIndex = headers.findIndex((h: string) => 
      h?.toString().toLowerCase().includes('video') || 
      h?.toString().toLowerCase().includes('number') ||
      h?.toString().toLowerCase().includes('videos') ||
      h?.toString().toLowerCase().includes('completed') ||
      h?.toString().toLowerCase().includes('count'));
    const categoryIndex = headers.findIndex((h: string) => 
      h?.toString().toLowerCase().includes('category') || 
      h?.toString().toLowerCase().includes('type') ||
      h?.toString().toLowerCase().includes('videocategory') ||
      h?.toString().toLowerCase().includes('videotype'));
    const notesIndex = headers.findIndex((h: string) => 
      h?.toString().toLowerCase().includes('note') || 
      h?.toString().toLowerCase().includes('remark') ||
      h?.toString().toLowerCase().includes('comment') ||
      h?.toString().toLowerCase().includes('description'));

    // Provide more helpful error messages
    const missingColumns = [];
    if (userEmailIndex === -1) missingColumns.push('User Email (or similar like "Email", "User", "UserEmail")');
    if (dateIndex === -1) missingColumns.push('Date (or similar like "WorkDate", "EntryDate")');
    if (videosIndex === -1) missingColumns.push('Videos Completed (or similar like "Videos", "Number", "Count", "Completed")');

    if (missingColumns.length > 0) {
      throw new Error(`Excel file missing required columns: ${missingColumns.join(', ')}. Found headers: ${headers.join(', ')}`);
    }

    return dataRows
      .filter((row: any[]) => row.some(cell => cell !== null && cell !== undefined))
      .map((row: any[], index: number) => ({
        userEmail: row[userEmailIndex]?.toString() || '',
        date: row[dateIndex]?.toString() || '',
        videosCompleted: Number(row[videosIndex]) || 0,
        videoCategory: categoryIndex !== -1 ? row[categoryIndex]?.toString() || 'Course Video' : 'Course Video',
        notes: notesIndex !== -1 ? row[notesIndex]?.toString() || '' : ''
      }));
  };

  const handleImport = async () => {
    if (importType === 'user' && userImportData) {
      setIsImporting(true);
      setStep('importing');

      try {
        await onUserImport(userImportData);
        onClose();
      } catch (error) {
        setValidationErrors([`Import failed: ${error}`]);
        setStep('preview');
      } finally {
        setIsImporting(false);
      }
    } else if (importType === 'data' && dataImportData) {
      setIsImporting(true);
      setStep('importing');

      try {
        await onDataImport(dataImportData);
        onClose();
      } catch (error) {
        setValidationErrors([`Import failed: ${error}`]);
        setStep('preview');
      } finally {
        setIsImporting(false);
      }
    }
  };

  const resetModal = () => {
    setImportType('select');
    setStep('upload');
    setFile(null);
    setUserImportData(null);
    setDataImportData(null);
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
            <h2 className="text-2xl font-bold text-gray-900">Import Data</h2>
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
              {importType === 'select' && (
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Choose Import Type</h3>
                  <p className="text-gray-600 mb-6">
                    Select the type of data you want to import
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <button
                      onClick={() => setImportType('user')}
                      className="p-6 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-center"
                    >
                      <User className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">User Import</h4>
                      <p className="text-sm text-gray-600">Import users with their details, roles, and passwords</p>
                    </button>
                    
                    <button
                      onClick={() => setImportType('data')}
                      className="p-6 border-2 border-dashed border-green-300 rounded-lg hover:bg-green-50 transition-colors text-center"
                    >
                      <Database className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Data Import</h4>
                      <p className="text-sm text-gray-600">Import productivity data for existing users</p>
                    </button>
                  </div>
                </div>
              )}

              {importType !== 'select' && (
                <>
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      {importType === 'user' ? <User className="w-8 h-8 text-blue-600" /> : <Database className="w-8 h-8 text-green-600" />}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {importType === 'user' ? 'Import Users' : 'Import Productivity Data'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {importType === 'user' 
                        ? 'Upload a file containing user information with name, email, password, and role.'
                        : 'Upload a file containing productivity data with user email, date, videos completed, and notes.'
                      }
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
                                         {importType === 'user' ? (
                       <div className="text-sm text-gray-600 space-y-1">
                         <p>• <strong>users:</strong> Array of users with name, email, password, role</p>
                         <p>• <strong>role:</strong> Must be admin, manager, editor, or viewer</p>
                         <p>• <strong>password:</strong> Minimum 8 characters</p>
                         <p>• <strong>Excel Support:</strong> Upload Excel files with columns: Name, Email, Password, Role</p>
                       </div>
                                         ) : (
                       <div className="text-sm text-gray-600 space-y-1">
                         <p>• <strong>productivityData:</strong> Array of entries with userEmail, date, videosCompleted, videoCategory, notes</p>
                         <p>• <strong>userEmail:</strong> Must match existing user email</p>
                         <p>• <strong>date:</strong> Format: YYYY-MM-DD</p>
                         <p>• <strong>videoCategory:</strong> Optional - Course Video, Marketing Video, or Leave (defaults to Course Video)</p>
                         <p>• <strong>Excel Support:</strong> Upload Excel files with columns: User Email, Date, Videos Completed, Category, Notes</p>
                       </div>
                     )}
                  </div>

                  {/* Back Button */}
                  <div className="text-center">
                    <button
                      onClick={() => setImportType('select')}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      ← Back to Import Type Selection
                    </button>
                  </div>
                </>
              )}

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

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Data Preview</h3>
                <p className="text-gray-600 mb-6">
                  Review the data before importing.
                  {importType === 'user' 
                    ? ' This will create new user accounts with the specified roles and passwords.'
                    : ' This will import productivity data for existing users.'
                  }
                </p>
              </div>

              {importType === 'user' && userImportData && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Users to Import ({userImportData.users.length})</span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-blue-200">
                          <th className="text-left py-2 px-3">Name</th>
                          <th className="text-left py-2 px-3">Email</th>
                          <th className="text-left py-2 px-3">Role</th>
                          <th className="text-left py-2 px-3">Password</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userImportData.users.map((user, index) => (
                          <tr key={index} className="border-b border-blue-100">
                            <td className="py-2 px-3">{user.name}</td>
                            <td className="py-2 px-3">{user.email}</td>
                            <td className="py-2 px-3 capitalize">{user.role}</td>
                            <td className="py-2 px-3">••••••••</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importType === 'data' && dataImportData && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3 flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Productivity Data to Import ({dataImportData.productivityData.length} entries)</span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-green-200">
                          <th className="text-left py-2 px-3">User Email</th>
                          <th className="text-left py-2 px-3">Date</th>
                          <th className="text-left py-2 px-3">Videos</th>
                          <th className="text-left py-2 px-3">Category</th>
                          <th className="text-left py-2 px-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataImportData.productivityData.slice(0, 10).map((entry, index) => (
                          <tr key={index} className="border-b border-green-100">
                            <td className="py-2 px-3">{entry.userEmail}</td>
                            <td className="py-2 px-3">{entry.date}</td>
                            <td className="py-2 px-3">{entry.videosCompleted}</td>
                            <td className="py-2 px-3">{entry.videoCategory || 'Course Video'}</td>
                            <td className="py-2 px-3">{entry.notes || '-'}</td>
                          </tr>
                        ))}
                        {dataImportData.productivityData.length > 10 && (
                          <tr>
                            <td colSpan={5} className="py-2 px-3 text-center text-gray-500">
                              ... and {dataImportData.productivityData.length - 10} more entries
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

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
              <p className="text-gray-600">
                {importType === 'user' 
                  ? 'Please wait while we create user accounts and set up roles.'
                  : 'Please wait while we import productivity data.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataImportModal;
