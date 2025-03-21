"use client";

import { useState } from 'react';
import { ExportSettings, AccessibilityOptions } from '@/types';

interface ExportOptionsProps {
  onExport: (settings: ExportSettings) => void;
  isLoading: boolean;
}

export default function ExportOptions({ onExport, isLoading }: ExportOptionsProps) {
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'pdf',
    includeAnswers: true,
    includeExplanations: true,
    separateAnswerKey: false,
    accessibilityFeatures: {
      highContrast: false,
      largeText: false,
      screenReaderOptimized: false,
      alternativeText: false,
      readingLevel: 'standard',
    },
  });

  const handleFormatChange = (format: ExportSettings['format']) => {
    setSettings(prev => ({ ...prev, format }));
  };

  const handleToggle = (setting: keyof Omit<ExportSettings, 'format' | 'accessibilityFeatures'>) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleAccessibilityToggle = (feature: keyof Omit<AccessibilityOptions, 'readingLevel'>) => {
    setSettings(prev => ({
      ...prev,
      accessibilityFeatures: {
        ...prev.accessibilityFeatures,
        [feature]: !prev.accessibilityFeatures[feature],
      },
    }));
  };

  const handleReadingLevelChange = (level: AccessibilityOptions['readingLevel']) => {
    setSettings(prev => ({
      ...prev,
      accessibilityFeatures: {
        ...prev.accessibilityFeatures,
        readingLevel: level,
      },
    }));
  };

  return (
    <div className="card">
      <h3 className="section-heading">Export Options</h3>
      
      <div className="export-options">
        <div 
          className={`export-option ${settings.format === 'pdf' ? 'active' : ''}`}
          onClick={() => handleFormatChange('pdf')}
        >
          <svg className="export-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H14.5C14.6326 3 14.7598 3.05268 14.8536 3.14645C14.9473 3.24021 15 3.36739 15 3.5V9C15 9.13261 15.0527 9.25978 15.1464 9.35355C15.2402 9.44732 15.3674 9.5 15.5 9.5H21V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.5 13.5V17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.5 13.5V17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 13.5V17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 3.5V9H20.5L15 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="export-title">PDF</div>
          <div className="export-description">Portable Document Format</div>
        </div>
        
        <div 
          className={`export-option ${settings.format === 'docx' ? 'active' : ''}`}
          onClick={() => handleFormatChange('docx')}
        >
          <svg className="export-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H14.5C14.6326 3 14.7598 3.05268 14.8536 3.14645C14.9473 3.24021 15 3.36739 15 3.5V9C15 9.13261 15.0527 9.25978 15.1464 9.35355C15.2402 9.44732 15.3674 9.5 15.5 9.5H21V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 18H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 3.5V9H20.5L15 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="export-title">Word</div>
          <div className="export-description">Microsoft Word Document</div>
        </div>
        
        <div 
          className={`export-option ${settings.format === 'html' ? 'active' : ''}`}
          onClick={() => handleFormatChange('html')}
        >
          <svg className="export-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 22L3 12L9 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 2L21 12L15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="export-title">HTML</div>
          <div className="export-description">Web Page Format</div>
        </div>
        
        <div 
          className={`export-option ${settings.format === 'scorm' ? 'active' : ''}`}
          onClick={() => handleFormatChange('scorm')}
        >
          <svg className="export-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 10L12 13L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="export-title">SCORM</div>
          <div className="export-description">LMS Compatible Package</div>
        </div>
      </div>
      
      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <div className="checkbox-option">
          <input
            type="checkbox"
            id="includeAnswers"
            className="checkbox-input"
            checked={settings.includeAnswers}
            onChange={() => handleToggle('includeAnswers')}
          />
          <label htmlFor="includeAnswers" className="checkbox-label">
            Include Answers
          </label>
        </div>
        
        <div className="checkbox-option">
          <input
            type="checkbox"
            id="includeExplanations"
            className="checkbox-input"
            checked={settings.includeExplanations}
            onChange={() => handleToggle('includeExplanations')}
          />
          <label htmlFor="includeExplanations" className="checkbox-label">
            Include Explanations
          </label>
        </div>
        
        <div className="checkbox-option">
          <input
            type="checkbox"
            id="separateAnswerKey"
            className="checkbox-input"
            checked={settings.separateAnswerKey}
            onChange={() => handleToggle('separateAnswerKey')}
          />
          <label htmlFor="separateAnswerKey" className="checkbox-label">
            Create Separate Answer Key
          </label>
        </div>
      </div>
      
      <div className="accessibility-settings">
        <div className="accessibility-title">
          <svg className="accessibility-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Accessibility Options
        </div>
        
        <div className="accessibility-options">
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="highContrast"
              className="checkbox-input"
              checked={settings.accessibilityFeatures.highContrast}
              onChange={() => handleAccessibilityToggle('highContrast')}
            />
            <label htmlFor="highContrast" className="checkbox-label">
              High Contrast
            </label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="largeText"
              className="checkbox-input"
              checked={settings.accessibilityFeatures.largeText}
              onChange={() => handleAccessibilityToggle('largeText')}
            />
            <label htmlFor="largeText" className="checkbox-label">
              Large Text
            </label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="screenReaderOptimized"
              className="checkbox-input"
              checked={settings.accessibilityFeatures.screenReaderOptimized}
              onChange={() => handleAccessibilityToggle('screenReaderOptimized')}
            />
            <label htmlFor="screenReaderOptimized" className="checkbox-label">
              Screen Reader Optimized
            </label>
          </div>
          
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="alternativeText"
              className="checkbox-input"
              checked={settings.accessibilityFeatures.alternativeText}
              onChange={() => handleAccessibilityToggle('alternativeText')}
            />
            <label htmlFor="alternativeText" className="checkbox-label">
              Alternative Text
            </label>
          </div>
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Reading Level</label>
            <select
              className="form-select"
              value={settings.accessibilityFeatures.readingLevel}
              onChange={(e) => handleReadingLevelChange(e.target.value as AccessibilityOptions['readingLevel'])}
            >
              <option value="standard">Standard</option>
              <option value="simplified">Simplified</option>
            </select>
          </div>
        </div>
      </div>
      
      <button
        className="button"
        style={{ marginTop: '1.5rem', width: '100%' }}
        onClick={() => onExport(settings)}
        disabled={isLoading}
      >
        {isLoading ? 'Exporting...' : 'Export Content'}
      </button>
    </div>
  );
} 