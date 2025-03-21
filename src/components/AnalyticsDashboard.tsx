"use client";

import { useState, useEffect } from 'react';
import { HistoryItem } from '@/types';

interface AnalyticsDashboardProps {
  history: HistoryItem[];
}

export default function AnalyticsDashboard({ history }: AnalyticsDashboardProps) {
  const [contentStats, setContentStats] = useState({
    totalContent: 0,
    totalWords: 0,
    avgWords: 0,
    topTopics: [] as {topic: string, count: number}[],
    contentByDate: [] as {date: string, count: number}[]
  });
  
  const [questionStats, setQuestionStats] = useState({
    totalQuestions: 0,
    questionsByType: [] as {type: string, count: number}[],
    questionsByDifficulty: [] as {difficulty: string, count: number}[]
  });

  useEffect(() => {
    if (!history || history.length === 0) return;
    
    // Calculate content statistics
    const totalContent = history.length;
    
    // Calculate total words
    const totalWords = history.reduce((sum, item) => {
      const words = item.content ? item.content.trim().split(/\s+/).length : 0;
      return sum + words;
    }, 0);
    
    const avgWords = Math.round(totalWords / totalContent);
    
    // Count topics
    const topicCounts = new Map<string, number>();
    history.forEach(item => {
      const topic = item.topic;
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });
    
    // Get top topics
    const topTopics = Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Group content by date
    const dateMap = new Map<string, number>();
    history.forEach(item => {
      const date = new Date(item.date).toLocaleDateString();
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });
    
    const contentByDate = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setContentStats({
      totalContent,
      totalWords,
      avgWords,
      topTopics,
      contentByDate
    });
    
    // Calculate question statistics
    let totalQuestions = 0;
    const typeCount = new Map<string, number>();
    const difficultyCount = new Map<string, number>();
    
    history.forEach(item => {
      if (item.questions && item.questions.questions) {
        const questionCount = item.questions.questions.length;
        totalQuestions += questionCount;
        
        // Count by type
        const type = item.questionSettings.questionType;
        typeCount.set(type, (typeCount.get(type) || 0) + questionCount);
        
        // Count by difficulty
        const difficulty = item.questionSettings.difficulty;
        difficultyCount.set(difficulty, (difficultyCount.get(difficulty) || 0) + questionCount);
      }
    });
    
    const questionsByType = Array.from(typeCount.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
    
    const questionsByDifficulty = Array.from(difficultyCount.entries())
      .map(([difficulty, count]) => ({ difficulty, count }))
      .sort((a, b) => {
        const order = { easy: 0, medium: 1, hard: 2 };
        return (order[a.difficulty as keyof typeof order] || 0) - (order[b.difficulty as keyof typeof order] || 0);
      });
    
    setQuestionStats({
      totalQuestions,
      questionsByType,
      questionsByDifficulty
    });
  }, [history]);

  if (!history || history.length === 0) {
    return (
      <div className="analytics-empty">
        <p>No content history available for analytics.</p>
        <p>Generate content to see analytics insights.</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-section">
        <h3>Content Analytics</h3>
        
        <div className="analytics-cards">
          <div className="analytics-card">
            <div className="analytics-card-value">{contentStats.totalContent}</div>
            <div className="analytics-card-label">Total Content Pieces</div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-card-value">{contentStats.totalWords}</div>
            <div className="analytics-card-label">Total Words Generated</div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-card-value">{contentStats.avgWords}</div>
            <div className="analytics-card-label">Average Words Per Content</div>
          </div>
        </div>
        
        <div className="analytics-detail">
          <div className="analytics-detail-section">
            <h4>Top Topics</h4>
            {contentStats.topTopics.length > 0 ? (
              <div className="analytics-list">
                {contentStats.topTopics.map((item, index) => (
                  <div key={index} className="analytics-list-item">
                    <div className="analytics-list-label">{item.topic}</div>
                    <div className="analytics-list-value">{item.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="analytics-empty-data">No topic data available</p>
            )}
          </div>
          
          <div className="analytics-detail-section">
            <h4>Content Generation Timeline</h4>
            {contentStats.contentByDate.length > 0 ? (
              <div className="analytics-timeline">
                {contentStats.contentByDate.map((item, index) => (
                  <div key={index} className="analytics-timeline-item">
                    <div className="analytics-timeline-date">{item.date}</div>
                    <div className="analytics-timeline-bar-container">
                      <div 
                        className="analytics-timeline-bar" 
                        style={{ 
                          width: `${Math.min(100, (item.count / Math.max(...contentStats.contentByDate.map(d => d.count))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="analytics-timeline-value">{item.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="analytics-empty-data">No timeline data available</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="analytics-section">
        <h3>Question Analytics</h3>
        
        <div className="analytics-cards">
          <div className="analytics-card">
            <div className="analytics-card-value">{questionStats.totalQuestions}</div>
            <div className="analytics-card-label">Total Questions Generated</div>
          </div>
        </div>
        
        <div className="analytics-detail">
          <div className="analytics-detail-section">
            <h4>Questions by Type</h4>
            {questionStats.questionsByType.length > 0 ? (
              <div className="analytics-list">
                {questionStats.questionsByType.map((item, index) => (
                  <div key={index} className="analytics-list-item">
                    <div className="analytics-list-label">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1).replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="analytics-list-value">{item.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="analytics-empty-data">No question type data available</p>
            )}
          </div>
          
          <div className="analytics-detail-section">
            <h4>Questions by Difficulty</h4>
            {questionStats.questionsByDifficulty.length > 0 ? (
              <div className="analytics-list">
                {questionStats.questionsByDifficulty.map((item, index) => (
                  <div key={index} className="analytics-list-item">
                    <div className="analytics-list-label">{item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}</div>
                    <div className="analytics-list-value">{item.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="analytics-empty-data">No difficulty data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 