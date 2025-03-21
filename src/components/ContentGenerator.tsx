"use client";

import { useState, useEffect } from 'react';
import { ContentForm, QuestionSettings, QuestionType, DifficultyLevel, HistoryItem, MixedQuestionList } from '@/types';
import ContentEnrichment from './ContentEnrichment';
import AnalyticsDashboard from './AnalyticsDashboard';

interface QuestionData {
  questions: Array<Record<string, unknown>>;
}

interface ContentGeneratorProps {
  initialContentForm?: ContentForm;
  onContentGenerated?: (content: string, questions: MixedQuestionList) => void;
}

const LOCAL_STORAGE_KEY = 'content-generator-history';

export default function ContentGenerator({ 
  initialContentForm,
  onContentGenerated 
}: ContentGeneratorProps = {}) {
  // State for the main functionality
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [contentForm, setContentForm] = useState<ContentForm>(
    initialContentForm || {
      topic: '',
      subtopic: '',
      language: 'english',
      readabilityLevel: 'standard'
    }
  );
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [questionSettings, setQuestionSettings] = useState<QuestionSettings>({
    questionType: 'singleChoice',
    difficulty: 'medium',
    numQuestions: 5,
    includeExplanations: true
  });
  const [questions, setQuestions] = useState<QuestionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // New features state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeHistoryItem, setActiveHistoryItem] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isLoadingIndicatorVisible, setIsLoadingIndicatorVisible] = useState(false);
  
  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error parsing history from localStorage:', e);
      }
    }
  }, []);
  
  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
  }, [history]);
  
  // Calculate word count when content changes
  useEffect(() => {
    if (generatedContent) {
      const words = generatedContent.trim().split(/\s+/);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [generatedContent]);
  
  // Handle loading indicator with slight delay for better UX
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoadingIndicatorVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsLoadingIndicatorVisible(false);
    }
  }, [isLoading]);

  const handleContentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContentForm({
      ...contentForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuestionSettingsChange = (field: keyof QuestionSettings, value: string | number) => {
    setQuestionSettings({
      ...questionSettings,
      [field]: value,
    });
  };
  
  // Save current session to history
  const saveToHistory = () => {
    if (!generatedContent) return;
    
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      topic: contentForm.topic,
      subtopic: contentForm.subtopic,
      content: generatedContent,
      questions: questions,
      questionSettings: {...questionSettings},
      tags: []
    };
    
    setHistory(prev => [historyItem, ...prev]);
  };
  
  // Load a history item
  const loadFromHistory = (id: string) => {
    const item = history.find(h => h.id === id);
    if (!item) return;
    
    setContentForm({
      topic: item.topic,
      subtopic: item.subtopic
    });
    setGeneratedContent(item.content);
    if (item.questions) {
      setQuestions(item.questions);
      setQuestionSettings(item.questionSettings);
    }
    setActiveHistoryItem(id);
    setError(null);
    
    // Go to content tab
    setActiveTab(0);
  };
  
  // Delete a history item
  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click event
    setHistory(prev => prev.filter(item => item.id !== id));
    if (activeHistoryItem === id) {
      setActiveHistoryItem(null);
    }
  };
  
  // Clear all history
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      setHistory([]);
      setActiveHistoryItem(null);
    }
  };

  const generateContent = async () => {
    if (!contentForm.topic || !contentForm.subtopic) {
      setError('Please fill in both the topic and subtopic fields');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      // Load accessibility settings
      const savedSettings = localStorage.getItem('accessibility-settings');
      let accessibilitySettings = null;
      if (savedSettings) {
        try {
          accessibilitySettings = JSON.parse(savedSettings);
        } catch (e) {
          console.error('Error parsing accessibility settings:', e);
        }
      }

      // Apply accessibility settings if available
      const requestData = {
        ...contentForm
      };

      if (accessibilitySettings) {
        if (accessibilitySettings.language && accessibilitySettings.language !== 'english') {
          requestData.language = accessibilitySettings.language;
        }
        if (accessibilitySettings.readabilityLevel) {
          requestData.readabilityLevel = accessibilitySettings.readabilityLevel;
        }
      }

      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      
      // Reset questions when generating new content
      setQuestions(null);
      
      // Clear active history item
      setActiveHistoryItem(null);
    } catch (error) {
      setError('Failed to generate content. Please try again later.');
      console.error('Content generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestions = async () => {
    if (!generatedContent) {
      setError('Please generate content first');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: generatedContent,
          ...questionSettings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data);
      
      // Call onContentGenerated prop if it exists
      if (onContentGenerated && generatedContent) {
        onContentGenerated(generatedContent, data);
      }
      
      // Save to history after generating questions
      setTimeout(() => saveToHistory(), 500);
    } catch (error) {
      setError('Failed to generate questions. Please try again later.');
      console.error('Question generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadContent = async () => {
    const contentElement = document.getElementById('download-content');
    if (!contentElement) return;

    try {
      // Dynamically import html2pdf only on client side
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${contentForm.topic}_${contentForm.subtopic}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(contentElement).save();
    } catch (error) {
      setError('Failed to download PDF. Please try again.');
      console.error('PDF generation error:', error);
    }
  };

  const renderQuestions = () => {
    if (!questions || !questions.questions || questions.questions.length === 0) {
      return <p>No questions generated yet.</p>;
    }

    switch (questionSettings.questionType) {
      case 'singleChoice':
        return (
          <div>
            {questions.questions.map((q, i: number) => (
              <div key={i} className="question-item">
                <h3 className="question-title">
                  {i + 1}. {q.question as string}
                </h3>
                <div>
                  {(q.options as string[]).map((option: string, j: number) => (
                    <div 
                      key={j} 
                      className={`option-item ${option === q.correctAnswer ? 'correct' : ''}`}
                    >
                      {option} {option === q.correctAnswer && '✓'}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="question-explanation">
                    <p><strong>Explanation:</strong> {q.explanation as string}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case 'multipleChoice':
        return (
          <div>
            {questions.questions.map((q, i: number) => (
              <div key={i} className="question-item">
                <h3 className="question-title">
                  {i + 1}. {q.question as string}
                </h3>
                <div>
                  {(q.options as string[]).map((option: string, j: number) => (
                    <div 
                      key={j} 
                      className={`option-item ${(q.correctAnswers as string[]).includes(option) ? 'correct' : ''}`}
                    >
                      {option} {(q.correctAnswers as string[]).includes(option) && '✓'}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="question-explanation">
                    <p><strong>Explanation:</strong> {q.explanation as string}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case 'matchingPairs':
        return (
          <div>
            {questions.questions.map((q, i: number) => (
              <div key={i} className="question-item">
                <h3 className="question-title">
                  Matching Pairs Set {i + 1}
                </h3>
                <div className="match-columns">
                  <div className="column">
                    <h4 className="column-heading">Column A</h4>
                    {(q.columnA as string[]).map((item: string, j: number) => (
                      <div key={j} className="column-item">
                        {j + 1}. {item}
                      </div>
                    ))}
                  </div>
                  <div className="column">
                    <h4 className="column-heading">Column B</h4>
                    {(q.columnB as string[]).map((item: string, j: number) => (
                      <div key={j} className="column-item">
                        {String.fromCharCode(65 + j)}. {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="matches">
                  <h4 className="column-heading">Correct Matches:</h4>
                  {(q.correctPairs as [number, number][]).map((pair: [number, number], j: number) => (
                    <p key={j} className="match-item">
                      {pair[0] + 1} ↔ {String.fromCharCode(65 + pair[1])}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'trueFalse':
        return (
          <div>
            {questions.questions.map((q, i: number) => (
              <div key={i} className="question-item">
                <h3 className="question-title">
                  {i + 1}. True or False:
                </h3>
                <p className="statement">{q.statement as string}</p>
                <div className="true-false-options">
                  <div className={`option-item ${q.isTrue ? 'correct' : ''}`}>
                    True {q.isTrue && '✓'}
                  </div>
                  <div className={`option-item ${!q.isTrue ? 'correct' : ''}`}>
                    False {!q.isTrue && '✓'}
                  </div>
                </div>
                {q.explanation && (
                  <div className="question-explanation">
                    <p><strong>Explanation:</strong> {q.explanation as string}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case 'fillInBlank':
        return (
          <div>
            {questions.questions.map((q, i: number) => (
              <div key={i} className="question-item">
                <h3 className="question-title">
                  {i + 1}. Fill in the Blank:
                </h3>
                <p className="fill-blank-text">{(q.textWithBlanks as string).replace(/___/g, '<span class="blank">_____</span>')}</p>
                <div className="blanks-answers">
                  <h4>Answers:</h4>
                  <ul className="blank-answer-list">
                    {(q.answers as string[][]).map((answerGroup, j: number) => (
                      <li key={j}>
                        Blank {j + 1}: {answerGroup.join(' or ')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        );
      case 'essay':
        return (
          <div>
            {questions.questions.map((q, i: number) => (
              <div key={i} className="question-item essay-question">
                <h3 className="question-title">
                  {i + 1}. Essay Question:
                </h3>
                <p className="essay-prompt">{q.prompt as string}</p>
                {q.wordLimit && (
                  <p className="word-limit">Word Limit: {q.wordLimit}</p>
                )}
                {q.rubric && (
                  <div className="rubric-section">
                    <h4>Grading Rubric:</h4>
                    <div className="rubric">
                      {(q.rubric as any[]).map((item, j: number) => (
                        <div key={j} className="rubric-item">
                          <div className="rubric-criteria">
                            <strong>{item.criteria}</strong> ({item.weight}%)
                          </div>
                          <div className="rubric-descriptions">
                            <div className="rubric-level">
                              <span className="level-name">Excellent:</span> {item.descriptions.excellent}
                            </div>
                            <div className="rubric-level">
                              <span className="level-name">Good:</span> {item.descriptions.good}
                            </div>
                            <div className="rubric-level">
                              <span className="level-name">Satisfactory:</span> {item.descriptions.satisfactory}
                            </div>
                            <div className="rubric-level">
                              <span className="level-name">Needs Improvement:</span> {item.descriptions.needsImprovement}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {q.sampleAnswer && (
                  <div className="sample-answer">
                    <h4>Sample Answer:</h4>
                    <p>{q.sampleAnswer as string}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      default:
        return <p>Unsupported question type.</p>;
    }
  };
  
  const renderHistoryPanel = () => {
    if (history.length === 0) {
      return (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No history yet. Generate content to save it here.</p>
        </div>
      );
    }
    
    return (
      <div className="history-panel">
        <div className="history-header">
          <span>Content History</span>
          <button onClick={clearHistory} className="history-item-action" title="Clear all history">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 7L6 19C6 19.5304 6.21071 20.0391 6.58579 20.4142C6.96086 20.7893 7.46957 21 8 21H16C16.5304 21 17.0391 20.7893 17.4142 20.4142C17.7893 20.0391 18 19.5304 18 19L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 7V4C9 3.73478 9.10536 3.48043 9.29289 3.29289C9.48043 3.10536 9.73478 3 10 3H14C14.2652 3 14.5196 3.10536 14.7071 3.29289C14.8946 3.48043 15 3.73478 15 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="history-list">
          {history.map(item => {
            const date = new Date(item.date);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            
            return (
              <div 
                key={item.id} 
                className={`history-item ${activeHistoryItem === item.id ? 'active' : ''}`}
                onClick={() => loadFromHistory(item.id)}
              >
                <div className="history-item-content">
                  <div className="history-item-topic">{item.topic}</div>
                  <div className="history-item-subtopic">{item.subtopic} - {formattedDate}</div>
                </div>
                <div className="history-item-actions">
                  <button 
                    onClick={(e) => deleteHistoryItem(item.id, e)} 
                    className="history-item-action"
                    title="Delete this item"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="main-content">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 0 ? 'active' : ''}`}
          onClick={() => setActiveTab(0)}
        >
          Content Generator
        </button>
        <button 
          className={`tab ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => generatedContent && setActiveTab(1)}
          disabled={!generatedContent}
        >
          Question Generator
        </button>
        <button 
          className={`tab ${activeTab === 2 ? 'active' : ''}`}
          onClick={() => questions && setActiveTab(2)}
          disabled={!questions}
        >
          Preview & Download
        </button>
        <button 
          className={`tab ${activeTab === 3 ? 'active' : ''}`}
          onClick={() => setActiveTab(3)}
        >
          Analytics
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="tab-content">
        {/* Content Generation Tab */}
        {activeTab === 0 && (
          <div>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="section-title">Generate Educational Content</h2>
              
              <button 
                className={`toggle-button ${showHistory ? 'expanded' : ''}`} 
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Hide History' : 'Show History'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {showHistory && renderHistoryPanel()}
            
            <div className="card">
              <div className="form-group">
                <label className="form-label required">Topic</label>
                <input 
                  type="text"
                  name="topic" 
                  value={contentForm.topic} 
                  onChange={handleContentFormChange}
                  placeholder="e.g., World History, Physics, Mathematics"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label required">
                  Subtopic
                  <span className="tooltip">
                    <svg style={{marginLeft: '6px', width: '14px', height: '14px'}} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 17V17.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 13.5C11.9816 13.1754 12.0692 12.8536 12.2495 12.5833C12.4299 12.313 12.6933 12.1098 13 12C13.3759 11.8562 13.7132 11.6274 13.9856 11.3335C14.2579 11.0396 14.4577 10.6878 14.5693 10.3061C14.6809 9.92443 14.7013 9.52366 14.6287 9.13289C14.556 8.74211 14.3923 8.37245 14.1496 8.05523C13.9069 7.73801 13.5921 7.48323 13.2321 7.31168C12.8721 7.14013 12.4764 7.05692 12.0785 7.06841C11.6806 7.07991 11.2907 7.18573 10.9412 7.37596C10.5917 7.56618 10.2913 7.8353 10.0667 8.1654" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="tooltip-text">Enter a specific subtopic within your main topic for more focused content</span>
                  </span>
                </label>
                <input 
                  type="text"
                  name="subtopic" 
                  value={contentForm.subtopic} 
                  onChange={handleContentFormChange}
                  placeholder="e.g., World War II, Newton's Laws, Calculus"
                  className="form-input"
                  required
                />
              </div>
              <button 
                className="button"
                disabled={isLoading}
                onClick={generateContent}
              >
                {isLoading ? 'Generating...' : 'Generate Content'}
              </button>
            </div>

            {isLoadingIndicatorVisible && !generatedContent && (
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <p>Generating content, please wait...</p>
              </div>
            )}

            {generatedContent && (
              <div className="card generated-content">
                <h3 className="section-heading">Generated Content</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{generatedContent}</p>
                
                <div className="word-count">
                  Word count: {wordCount} words
                </div>
                
                <div className="content-enrichment-container">
                  <h3 className="section-heading">Content Enrichment</h3>
                  <p className="enrichment-description">Enhance your content with relevant images and videos</p>
                  <ContentEnrichment content={generatedContent} topic={contentForm.topic} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Question Generator Tab */}
        {activeTab === 1 && (
          <div>
            <h2 className="section-title">Generate Questions</h2>
            <div className="card">
              <div className="form-group">
                <label className="form-label">Question Type</label>
                <select 
                  value={questionSettings.questionType}
                  onChange={(e) => handleQuestionSettingsChange('questionType', e.target.value as QuestionType)}
                  className="form-select"
                >
                  <option value="singleChoice">Single Choice</option>
                  <option value="multipleChoice">Multiple Choice</option>
                  <option value="matchingPairs">Matching Pairs</option>
                  <option value="trueFalse">True/False</option>
                  <option value="fillInBlank">Fill in the Blank</option>
                  <option value="essay">Essay Question</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select 
                  value={questionSettings.difficulty}
                  onChange={(e) => handleQuestionSettingsChange('difficulty', e.target.value as DifficultyLevel)}
                  className="form-select"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Number of Questions</label>
                <input 
                  type="number" 
                  min={1} 
                  max={10} 
                  value={questionSettings.numQuestions}
                  onChange={(e) => handleQuestionSettingsChange('numQuestions', parseInt(e.target.value))}
                  className="form-input"
                />
                <span className="character-count">Maximum value: 10</span>
              </div>
              <button 
                className="button"
                disabled={isLoading}
                onClick={generateQuestions}
              >
                {isLoading ? 'Generating...' : 'Generate Questions'}
              </button>
            </div>

            {isLoadingIndicatorVisible && !questions && (
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <p>Generating questions, please wait...</p>
              </div>
            )}

            {questions && (
              <div className="card generated-content">
                <h3 className="section-heading">Generated Questions</h3>
                {renderQuestions()}
              </div>
            )}
          </div>
        )}

        {/* Preview & Download Tab */}
        {activeTab === 2 && (
          <div>
            <h2 className="section-title">Preview & Download</h2>
            <div className="card download-card">
              <h3 className="download-title">Your content is ready!</h3>
              <p className="download-description">Download your educational content and assessment questions as a PDF file for offline use, printing, or sharing.</p>
              <button 
                className="button download-button"
                onClick={downloadContent}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 13L12 16L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 16.5V18.75C3 19.9926 4.00736 21 5.25 21H18.75C19.9926 21 21 19.9926 21 18.75V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download as PDF
              </button>
            </div>

            <div id="download-content" className="download-preview">
              <h1 className="preview-title">{contentForm.topic}</h1>
              <h2 className="preview-subtitle">{contentForm.subtopic}</h2>
              
              <div className="content-section">
                <h3 className="section-heading">Content</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{generatedContent}</p>
              </div>

              {questions && (
                <div className="content-section">
                  <h3 className="section-heading">Assessment Questions</h3>
                  {renderQuestions()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 3 && (
          <div>
            <h2 className="section-title">Content & Question Analytics</h2>
            <AnalyticsDashboard history={history} />
          </div>
        )}
      </div>
    </div>
  );
} 