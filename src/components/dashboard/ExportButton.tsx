'use client';

import React, { useState, useRef } from 'react';
import { Download, FileText, Image, ChevronDown, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

interface ExportButtonProps {
  entries: any[];
  period: string;
  chartRef?: React.RefObject<HTMLDivElement>;
}

interface ExportFormat {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ entries, period, chartRef }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const exportFormats: ExportFormat[] = [
    {
      id: 'csv',
      label: 'CSV File',
      icon: <FileText className="w-4 h-4" />,
      description: 'Daily entries in CSV format'
    },
    {
      id: 'excel',
      label: 'Excel File',
      icon: <FileText className="w-4 h-4" />,
      description: 'Daily entries in Excel format'
    },
    {
      id: 'chart-png',
      label: 'Chart as PNG',
      icon: <Image className="w-4 h-4" />,
      description: 'Current chart as image'
    }
  ];

  // Process entries for export
  const processEntriesForExport = () => {
    if (!entries || entries.length === 0) return [];

    return entries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry, index) => ({
        'Entry #': index + 1,
        'Date': new Date(entry.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        'Day of Week': new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' }),
        'Videos Completed': entry.videosCompleted || 0,
        'Video Category': entry.videoCategory || 'course',
        'Productivity Score (%)': entry.productivityScore || 0,
        'Total Hours': entry.totalHours || 0,
        'Mood': entry.mood || 'N/A',
        'Energy Level': entry.energyLevel || 0,
        'Challenges': Array.isArray(entry.challenges) ? entry.challenges.join(', ') : 'N/A',
        'Achievements': Array.isArray(entry.achievements) ? entry.achievements.join(', ') : 'N/A',
        'Remarks': entry.remarks || 'N/A',
        'Shift Start': entry.shiftStart ? new Date(entry.shiftStart).toLocaleTimeString() : 'N/A',
        'Shift End': entry.shiftEnd ? new Date(entry.shiftEnd).toLocaleTimeString() : 'N/A'
      }));
  };

  // Export to CSV
  const exportToCSV = async () => {
    setExporting(true);
    setExportProgress('Preparing CSV data...');

    try {
      const data = processEntriesForExport();
      if (data.length === 0) {
        alert('No data available for export');
        return;
      }

      setExportProgress('Generating CSV file...');
      
      // Convert to CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = (row as any)[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = `productivity_data_${period}_${new Date().toISOString().split('T')[0]}.csv`;
      saveAs(blob, fileName);

      setExportProgress('CSV exported successfully!');
      setTimeout(() => setExportProgress(''), 2000);
    } catch (error) {
      console.error('CSV export error:', error);
      setExportProgress('Export failed. Please try again.');
      setTimeout(() => setExportProgress(''), 3000);
    } finally {
      setExporting(false);
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    setExporting(true);
    setExportProgress('Preparing Excel data...');

    try {
      const data = processEntriesForExport();
      if (data.length === 0) {
        alert('No data available for export');
        return;
      }

      setExportProgress('Generating Excel file...');

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      // Auto-size columns
      const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(key.length, Math.max(...data.map(row => String((row as any)[key]).length)) + 2)
      }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Productivity Data');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `productivity_data_${period}_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);

      setExportProgress('Excel file exported successfully!');
      setTimeout(() => setExportProgress(''), 2000);
    } catch (error) {
      console.error('Excel export error:', error);
      setExportProgress('Export failed. Please try again.');
      setTimeout(() => setExportProgress(''), 3000);
    } finally {
      setExporting(false);
    }
  };

  // Export chart as image
  const exportChartAsImage = async (format: 'png' | 'pdf') => {
    if (!chartRef?.current) {
      alert('Chart not available for export');
      return;
    }

    setExporting(true);
    setExportProgress(`Generating ${format.toUpperCase()} image...`);

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true
      });

      if (format === 'png') {
        // Export as PNG
        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = `productivity_chart_${period}_${new Date().toISOString().split('T')[0]}.png`;
            saveAs(blob, fileName);
            setExportProgress('PNG image exported successfully!');
            setTimeout(() => setExportProgress(''), 2000);
          }
        }, 'image/png');
      } else {
        // For PDF export, we'll just export as PNG for now since jsPDF requires additional setup
        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = `productivity_chart_${period}_${new Date().toISOString().split('T')[0]}.png`;
            saveAs(blob, fileName);
            setExportProgress('PNG image exported successfully! (PDF export coming soon)');
            setTimeout(() => setExportProgress(''), 3000);
          }
        }, 'image/png');
      }
    } catch (error) {
      console.error('Chart export error:', error);
      setExportProgress('Chart export failed. Please try again.');
      setTimeout(() => setExportProgress(''), 3000);
    } finally {
      setExporting(false);
    }
  };

  // Handle export based on format
  const handleExport = async (format: string) => {
    setShowDropdown(false);
    
    switch (format) {
      case 'csv':
        await exportToCSV();
        break;
      case 'excel':
        await exportToExcel();
        break;
      case 'chart-png':
        await exportChartAsImage('png');
        break;
      case 'chart-pdf':
        await exportChartAsImage('pdf');
        break;
      default:
        console.error('Unknown export format:', format);
    }
  };

  return (
    <div className="export-container">
      {/* Export Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={exporting}
        className="export-button"
        title="Export data and charts"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Export Progress */}
      {exporting && (
        <div className="export-progress">
          <div className="export-progress-spinner"></div>
          <span>{exportProgress}</span>
        </div>
      )}

      {/* Export Dropdown */}
      {showDropdown && (
        <div className="export-dropdown">
          <div className="export-dropdown-header">
            <h4>Export Options</h4>
            <p>Choose format and content to export</p>
          </div>
          
          <div className="export-options">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => handleExport(format.id)}
                className="export-option"
                disabled={exporting}
              >
                <div className="export-option-icon">
                  {format.icon}
                </div>
                <div className="export-option-content">
                  <span className="export-option-label">{format.label}</span>
                  <span className="export-option-description">{format.description}</span>
                </div>
                <Check className="export-option-check w-4 h-4" />
              </button>
            ))}
          </div>

          <div className="export-dropdown-footer">
            <p className="export-info">
              <strong>Data Period:</strong> {period}
            </p>
            <p className="export-info">
              <strong>Total Entries:</strong> {entries?.length || 0}
            </p>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="export-overlay" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default ExportButton;
