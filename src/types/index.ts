// Content Generation
export interface ContentForm {
  topic: string;
  subtopic: string;
  accessibilityLevel?: 'standard' | 'enhanced';
  targetAudience?: string;
  contentComplexity?: 'beginner' | 'intermediate' | 'advanced';
}

// Question Types
export interface BaseQuestion {
  id: string;
  question: string;
  difficulty: DifficultyLevel;
  tags: string[];
  estimatedTimeSeconds: number;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'singleChoice';
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multipleChoice';
  options: string[];
  correctAnswers: string[];
  explanation?: string;
}

export interface MatchingPairsQuestion extends BaseQuestion {
  type: 'matchingPairs';
  columnA: string[];
  columnB: string[];
  correctPairs: [number, number][];
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'trueFalse';
  statement: string;
  isTrue: boolean;
  explanation?: string;
}

export interface FillInBlankQuestion extends BaseQuestion {
  type: 'fillInBlank';
  textWithBlanks: string;
  answers: string[][];  // Each array contains acceptable answers for a blank
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  prompt: string;
  wordLimit?: number;
  rubric?: RubricItem[];
  sampleAnswer?: string;
}

export interface RubricItem {
  criteria: string;
  weight: number;
  descriptions: {
    excellent: string;
    good: string;
    satisfactory: string;
    needsImprovement: string;
  };
}

export type QuestionType = 'singleChoice' | 'multipleChoice' | 'matchingPairs' | 'trueFalse' | 'fillInBlank' | 'essay';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QuestionSettings {
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  numQuestions: number;
  includeExplanations?: boolean;
  includeTags?: boolean;
  timeEstimates?: boolean;
}

export interface HistoryItem {
  id: string;
  date: string;
  topic: string;
  subtopic: string;
  content: string;
  questions: any | null;
  questionSettings: QuestionSettings;
  tags: string[];
  analytics?: ContentAnalytics;
}

// Analytics Types
export interface ContentAnalytics {
  readabilityScore: number;  // Flesch-Kincaid or similar
  wordCount: number;
  estimatedReadingTimeMinutes: number;
  topicRelevanceScore?: number;
  keyTerms: string[];
  complexityLevel: 'beginner' | 'intermediate' | 'advanced';
  suggestedTags?: string[];
}

export interface QuestionAnalytics {
  difficulty: number;  // 0-100 scale
  discrimination: number;  // -1 to 1, how well it distinguishes between high/low performers
  guessability: number;  // 0-100 scale, chance of guessing correctly
  averageResponseTimeSeconds?: number;
}

// Export Types
export interface ExportSettings {
  format: 'pdf' | 'html' | 'docx' | 'pptx' | 'scorm' | 'canvas' | 'moodle';
  includeAnswers: boolean;
  includeExplanations: boolean;
  separateAnswerKey: boolean;
  accessibilityFeatures: AccessibilityOptions;
}

export interface AccessibilityOptions {
  highContrast: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
  alternativeText: boolean;
  readingLevel: 'standard' | 'simplified';
}

// Library Management Types
export interface ContentTag {
  id: string;
  name: string;
  color: string;
}

export interface ContentFolder {
  id: string;
  name: string;
  parentId?: string;
}

export interface ContentLibraryItem {
  id: string;
  title: string;
  description: string;
  dateCreated: string;
  dateModified: string;
  content: string;
  questions: any[];
  tags: string[];
  folderId?: string;
  version: number;
  previousVersions?: string[];  // IDs of previous versions
}

// Question List Types
export interface SingleChoiceQuestionList {
  questions: SingleChoiceQuestion[];
}

export interface MultipleChoiceQuestionList {
  questions: MultipleChoiceQuestion[];
}

export interface MatchingPairsQuestionList {
  questions: MatchingPairsQuestion[];
}

export interface TrueFalseQuestionList {
  questions: TrueFalseQuestion[];
}

export interface FillInBlankQuestionList {
  questions: FillInBlankQuestion[];
}

export interface EssayQuestionList {
  questions: EssayQuestion[];
}

export interface MixedQuestionList {
  questions: (SingleChoiceQuestion | MultipleChoiceQuestion | MatchingPairsQuestion | 
              TrueFalseQuestion | FillInBlankQuestion | EssayQuestion)[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  questions?: MixedQuestionList;
  analytics?: ContentAnalytics;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
} 