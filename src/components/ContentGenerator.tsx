"use client";

import { useState } from 'react';
import { ContentForm, QuestionSettings, QuestionType, DifficultyLevel } from '@/types';

interface QuestionData {
  questions: Array<Record<string, unknown>>;
}

export default function ContentGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [contentForm, setContentForm] = useState<ContentForm>({
    topic: '',
    subtopic: '',
  });
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [questionSettings, setQuestionSettings] = useState<QuestionSettings>({
    questionType: 'singleChoice',
    difficulty: 'medium',
    numQuestions: 5,
  });
  const [questions, setQuestions] = useState<QuestionData | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const generateContent = async () => {
    if (!contentForm.topic || !contentForm.subtopic) {
      setError('Please fill in both the topic and subtopic fields');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentForm),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
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
      default:
        return <p>Unsupported question type.</p>;
    }
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
            <h2 className="section-title">Generate Educational Content</h2>
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
                <label className="form-label required">Subtopic</label>
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

            {generatedContent && (
              <div className="card generated-content">
                <h3 className="section-heading">Generated Content</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{generatedContent}</p>
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
              </div>
              <button 
                className="button"
                disabled={isLoading}
                onClick={generateQuestions}
              >
                {isLoading ? 'Generating...' : 'Generate Questions'}
              </button>
            </div>

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
      </div>
    </div>
  );
} 