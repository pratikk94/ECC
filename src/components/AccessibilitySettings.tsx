"use client";

import { useState, useEffect } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
  reduceMotion: boolean;
  language: string;
  readabilityLevel: 'standard' | 'simplified' | 'advanced';
}

export default function AccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    screenReaderOptimized: false,
    reduceMotion: false,
    language: 'english',
    readabilityLevel: 'standard'
  });

  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
        document.documentElement.setAttribute('data-high-contrast', JSON.parse(savedSettings).highContrast);
        document.documentElement.setAttribute('data-large-text', JSON.parse(savedSettings).largeText);
        document.documentElement.setAttribute('data-reduce-motion', JSON.parse(savedSettings).reduceMotion);
      } catch (e) {
        console.error('Error parsing accessibility settings:', e);
      }
    }
  }, []);

  // Apply settings when they change
  useEffect(() => {
    document.documentElement.setAttribute('data-high-contrast', String(settings.highContrast));
    document.documentElement.setAttribute('data-large-text', String(settings.largeText));
    document.documentElement.setAttribute('data-reduce-motion', String(settings.reduceMotion));
  }, [settings]);

  const handleSettingChange = (
    setting: keyof AccessibilitySettings, 
    value: boolean | string
  ) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };

  const saveSettings = () => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    setSavedFeedback('Settings saved successfully!');
    
    setTimeout(() => {
      setSavedFeedback(null);
    }, 3000);
  };

  return (
    <div className="accessibility-settings">
      <h2>Accessibility Settings</h2>
      <p className="settings-description">
        Customize your experience to make the application more accessible according to your needs.
      </p>

      <div className="settings-grid">
        <div className="settings-section">
          <h3>Visual Settings</h3>
          
          <div className="settings-group">
            <div className="toggle-setting">
              <label className="toggle-label">
                <span>High Contrast Mode</span>
                <input 
                  type="checkbox" 
                  checked={settings.highContrast}
                  onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                />
                <span className="toggle-switch"></span>
              </label>
              <p className="setting-description">
                Increases contrast between elements for better visibility
              </p>
            </div>
            
            <div className="toggle-setting">
              <label className="toggle-label">
                <span>Large Text</span>
                <input 
                  type="checkbox" 
                  checked={settings.largeText}
                  onChange={(e) => handleSettingChange('largeText', e.target.checked)}
                />
                <span className="toggle-switch"></span>
              </label>
              <p className="setting-description">
                Increases font size throughout the application
              </p>
            </div>
            
            <div className="toggle-setting">
              <label className="toggle-label">
                <span>Reduce Motion</span>
                <input 
                  type="checkbox" 
                  checked={settings.reduceMotion}
                  onChange={(e) => handleSettingChange('reduceMotion', e.target.checked)}
                />
                <span className="toggle-switch"></span>
              </label>
              <p className="setting-description">
                Reduces or eliminates animations and transitions
              </p>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Screen Reader Settings</h3>
          
          <div className="settings-group">
            <div className="toggle-setting">
              <label className="toggle-label">
                <span>Screen Reader Optimized</span>
                <input 
                  type="checkbox" 
                  checked={settings.screenReaderOptimized}
                  onChange={(e) => handleSettingChange('screenReaderOptimized', e.target.checked)}
                />
                <span className="toggle-switch"></span>
              </label>
              <p className="setting-description">
                Enhances compatibility with screen readers and assistive technologies
              </p>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Language & Readability</h3>
          
          <div className="settings-group">
            <div className="select-setting">
              <label className="select-label">Display Language</label>
              <select 
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="settings-select"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="chinese">Chinese (Simplified)</option>
                <option value="japanese">Japanese</option>
              </select>
              <p className="setting-description">
                Changes the interface language (content generation will still use English)
              </p>
            </div>
            
            <div className="select-setting">
              <label className="select-label">Readability Level</label>
              <select 
                value={settings.readabilityLevel}
                onChange={(e) => handleSettingChange('readabilityLevel', e.target.value as 'simplified' | 'standard' | 'advanced')}
                className="settings-select"
              >
                <option value="simplified">Simplified</option>
                <option value="standard">Standard</option>
                <option value="advanced">Advanced</option>
              </select>
              <p className="setting-description">
                Adjusts the complexity of generated content to match your preferred reading level
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="settings-actions">
        <button 
          className="button save-settings-btn"
          onClick={saveSettings}
        >
          Save Settings
        </button>
        
        {savedFeedback && (
          <div className="settings-feedback">
            {savedFeedback}
          </div>
        )}
      </div>
    </div>
  );
} 