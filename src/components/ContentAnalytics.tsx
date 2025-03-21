"use client";

import { useState, useEffect, useCallback } from 'react';
import { ContentAnalytics as ContentAnalyticsType } from '@/types';

interface ContentAnalyticsProps {
  content: string;
}

export default function ContentAnalytics({ content }: ContentAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ContentAnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeContent = useCallback(async () => {
    if (!content || content.trim().length < 100) {
      setError('Content is too short for meaningful analysis');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      setError('Failed to analyze content. Please try again.');
      console.error('Error analyzing content:', error);
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  useEffect(() => {
    if (content && content.trim().length > 100) {
      analyzeContent();
    }
  }, [content, analyzeContent]);
  
  const getReadabilityLabel = (score: number) => {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  };
  
  const getReadabilityColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };
  
  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="section-heading">Content Analysis</h3>
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <p>Analyzing content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3 className="section-heading">Content Analysis</h3>
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="card">
        <h3 className="section-heading">Content Analysis</h3>
        <p>Content will be analyzed automatically once generated.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="section-heading">Content Analysis</h3>
      
      <div className="analytics-grid">
        <div className="analytics-item">
          <div className="analytics-label">Readability</div>
          <div className="analytics-value">
            <div className="meter-container">
              <div 
                className="meter-fill" 
                style={{ 
                  width: `${analytics.readabilityScore}%`, 
                  backgroundColor: getReadabilityColor(analytics.readabilityScore) 
                }}
              ></div>
            </div>
            <div className="meter-label">
              <span>{analytics.readabilityScore}/100</span>
              <span>{getReadabilityLabel(analytics.readabilityScore)}</span>
            </div>
          </div>
        </div>
        
        <div className="analytics-item">
          <div className="analytics-label">Reading Time</div>
          <div className="analytics-value">
            <div className="analytics-stat">
              {analytics.estimatedReadingTimeMinutes} min
            </div>
            <div className="analytics-subtext">
              {analytics.wordCount} words
            </div>
          </div>
        </div>
        
        <div className="analytics-item">
          <div className="analytics-label">Complexity</div>
          <div className="analytics-value">
            <div 
              className="analytics-stat" 
              style={{ color: getComplexityColor(analytics.complexityLevel) }}
            >
              {analytics.complexityLevel.charAt(0).toUpperCase() + analytics.complexityLevel.slice(1)}
            </div>
          </div>
        </div>
        
        {analytics.topicRelevanceScore && (
          <div className="analytics-item">
            <div className="analytics-label">Topic Focus</div>
            <div className="analytics-value">
              <div className="meter-container">
                <div 
                  className="meter-fill" 
                  style={{ 
                    width: `${analytics.topicRelevanceScore}%`, 
                    backgroundColor: analytics.topicRelevanceScore >= 80 ? '#10b981' : '#f59e0b' 
                  }}
                ></div>
              </div>
              <div className="meter-label">
                <span>{analytics.topicRelevanceScore}/100</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="analytics-section">
        <h4 className="analytics-section-title">Key Terms</h4>
        <div className="tags-container">
          {analytics.keyTerms.map((term, index) => (
            <span key={index} className="tag">
              {term}
            </span>
          ))}
        </div>
      </div>
      
      {analytics.suggestedTags && analytics.suggestedTags.length > 0 && (
        <div className="analytics-section">
          <h4 className="analytics-section-title">Suggested Tags</h4>
          <div className="tags-container">
            {analytics.suggestedTags.map((tag, index) => (
              <span key={index} className="tag tag-suggested">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 