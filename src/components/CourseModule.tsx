"use client";

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CourseModule as CourseModuleType, Lesson, ContentForm, MixedQuestionList } from '@/types';
import ContentGenerator from './ContentGenerator';

const LOCAL_STORAGE_KEY = 'course-modules';

export default function CourseModule() {
  const [modules, setModules] = useState<CourseModuleType[]>([]);
  const [activeModule, setActiveModule] = useState<CourseModuleType | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [contentForm, setContentForm] = useState<ContentForm>({
    topic: '',
    subtopic: '',
  });

  // Load modules from localStorage on component mount
  useEffect(() => {
    const savedModules = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedModules) {
      try {
        setModules(JSON.parse(savedModules));
      } catch (e) {
        console.error('Error parsing modules from localStorage:', e);
      }
    }
  }, []);

  // Save modules to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(modules));
  }, [modules]);

  const createNewModule = () => {
    if (!moduleTitle.trim()) return;

    const newModule: CourseModuleType = {
      id: uuidv4(),
      title: moduleTitle,
      description: moduleDescription,
      lessons: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setModules([...modules, newModule]);
    setActiveModule(newModule);
    setModuleTitle('');
    setModuleDescription('');
    setIsCreatingModule(false);
  };

  const addLessonToModule = (lessonContent: string, generatedQuestions: MixedQuestionList) => {
    if (!activeModule) return;

    const newLesson: Lesson = {
      id: uuidv4(),
      title: contentForm.subtopic || `Lesson ${activeModule.lessons.length + 1}`,
      content: lessonContent,
      order: activeModule.lessons.length,
      questions: generatedQuestions,
    };

    const updatedModule = {
      ...activeModule,
      lessons: [...activeModule.lessons, newLesson],
      updatedAt: new Date().toISOString(),
    };

    setModules(modules.map(module => 
      module.id === activeModule.id ? updatedModule : module
    ));
    
    setActiveModule(updatedModule);
    setActiveLesson(newLesson);
  };

  const handleContentGenerated = (content: string, questions: MixedQuestionList) => {
    addLessonToModule(content, questions);
  };

  const deleteModule = (moduleId: string) => {
    setModules(modules.filter(module => module.id !== moduleId));
    if (activeModule?.id === moduleId) {
      setActiveModule(null);
      setActiveLesson(null);
    }
  };

  const deleteLesson = (lessonId: string) => {
    if (!activeModule) return;

    const updatedLessons = activeModule.lessons.filter(lesson => lesson.id !== lessonId);
    
    // Update order of remaining lessons
    const reorderedLessons = updatedLessons.map((lesson, index) => ({
      ...lesson,
      order: index
    }));

    const updatedModule = {
      ...activeModule,
      lessons: reorderedLessons,
      updatedAt: new Date().toISOString(),
    };

    setModules(modules.map(module => 
      module.id === activeModule.id ? updatedModule : module
    ));
    
    setActiveModule(updatedModule);
    
    if (activeLesson?.id === lessonId) {
      setActiveLesson(reorderedLessons.length > 0 ? reorderedLessons[0] : null);
    }
  };

  const renderModulesList = () => {
    if (modules.length === 0) {
      return (
        <div className="empty-state">
          <p>No course modules yet</p>
          <button 
            className="create-module-btn"
            onClick={() => setIsCreatingModule(true)}
          >
            Create your first module
          </button>
        </div>
      );
    }

    return (
      <div className="modules-list">
        <h2>Your Course Modules</h2>
        <button 
          className="create-module-btn"
          onClick={() => setIsCreatingModule(true)}
        >
          + New Module
        </button>
        <div className="modules">
          {modules.map(module => (
            <div 
              key={module.id} 
              className={`module-card ${activeModule?.id === module.id ? 'active' : ''}`}
              onClick={() => {
                setActiveModule(module);
                setActiveLesson(module.lessons.length > 0 ? module.lessons[0] : null);
              }}
            >
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <div className="module-meta">
                <span>{module.lessons.length} lessons</span>
                <span>{new Date(module.updatedAt).toLocaleDateString()}</span>
              </div>
              <button 
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete module "${module.title}"?`)) {
                    deleteModule(module.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLessonsList = () => {
    if (!activeModule) return null;

    return (
      <div className="lessons-list">
        <h3>{activeModule.title} - Lessons</h3>
        {activeModule.lessons.length === 0 ? (
          <p>No lessons yet. Create your first lesson below.</p>
        ) : (
          <div className="lessons">
            {activeModule.lessons.sort((a, b) => a.order - b.order).map(lesson => (
              <div 
                key={lesson.id} 
                className={`lesson-item ${activeLesson?.id === lesson.id ? 'active' : ''}`}
                onClick={() => setActiveLesson(lesson)}
              >
                <span>{lesson.title}</span>
                <button 
                  className="delete-btn small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete lesson "${lesson.title}"?`)) {
                      deleteLesson(lesson.id);
                    }
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLessonContent = () => {
    if (!activeLesson) return null;

    return (
      <div className="lesson-content">
        <h2>{activeLesson.title}</h2>
        <div 
          className="content-display"
          dangerouslySetInnerHTML={{ __html: activeLesson.content.replace(/\n/g, '<br />') }}
        />
        
        {activeLesson.questions && (
          <div className="lesson-questions">
            <h3>Questions</h3>
            <div className="questions-list">
              {activeLesson.questions.questions.map((question, index) => (
                <div key={question.id || index} className="question-item">
                  <p className="question-text"><strong>Q{index + 1}:</strong> {question.question}</p>
                  
                  {question.type === 'singleChoice' && (
                    <div className="options">
                      {question.options.map((option: string, i: number) => (
                        <div key={i} className="option">
                          <input 
                            type="radio" 
                            id={`q${index}-opt${i}`} 
                            name={`question-${index}`} 
                            disabled 
                          />
                          <label htmlFor={`q${index}-opt${i}`}>
                            {option}
                            {option === question.correctAnswer && ' ✓'}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {('explanation' in question && question.explanation) && (
                    <p className="explanation"><em>Explanation: {question.explanation}</em></p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderModuleCreationForm = () => {
    return (
      <div className="module-creation-form">
        <h2>Create New Module</h2>
        <div className="form-group">
          <label htmlFor="module-title">Module Title:</label>
          <input 
            type="text"
            id="module-title"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="Introduction to..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="module-description">Description:</label>
          <textarea 
            id="module-description"
            value={moduleDescription}
            onChange={(e) => setModuleDescription(e.target.value)}
            placeholder="This module covers..."
            rows={3}
          />
        </div>
        <div className="buttons">
          <button 
            className="cancel-btn"
            onClick={() => setIsCreatingModule(false)}
          >
            Cancel
          </button>
          <button 
            className="create-btn"
            onClick={createNewModule}
            disabled={!moduleTitle.trim()}
          >
            Create Module
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="course-module-container">
      {isCreatingModule ? (
        renderModuleCreationForm()
      ) : (
        <>
          <div className="modules-panel">
            {renderModulesList()}
          </div>
          
          {activeModule && (
            <div className="active-module-panel">
              <div className="module-header">
                <h2>{activeModule.title}</h2>
                <p>{activeModule.description}</p>
              </div>
              
              <div className="module-content">
                <div className="lessons-sidebar">
                  {renderLessonsList()}
                </div>
                <div className="content-area">
                  {activeLesson ? (
                    renderLessonContent()
                  ) : (
                    <div className="empty-lesson-state">
                      <p>Select a lesson or create a new one</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lesson-creation">
                <h3>Create New Lesson</h3>
                <div className="content-generator-wrapper">
                  <div className="form-group">
                    <label htmlFor="lesson-topic">Topic:</label>
                    <input 
                      type="text"
                      id="lesson-topic"
                      name="topic"
                      value={contentForm.topic}
                      onChange={(e) => setContentForm({
                        ...contentForm,
                        topic: e.target.value
                      })}
                      placeholder="Main topic..."
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lesson-subtopic">Subtopic/Lesson Title:</label>
                    <input 
                      type="text"
                      id="lesson-subtopic"
                      name="subtopic"
                      value={contentForm.subtopic}
                      onChange={(e) => setContentForm({
                        ...contentForm,
                        subtopic: e.target.value
                      })}
                      placeholder="Specific subtopic..."
                    />
                  </div>
                  
                  <ContentGenerator 
                    onContentGenerated={handleContentGenerated}
                    initialContentForm={contentForm}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 