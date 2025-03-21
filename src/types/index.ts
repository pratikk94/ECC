// Content Generation
export interface ContentForm {
  topic: string;
  subtopic: string;
}

// Question Types
export interface SingleChoiceQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  correctAnswers: string[];
}

export interface MatchingPairsQuestion {
  columnA: string[];
  columnB: string[];
  correctPairs: [number, number][];
}

export type QuestionType = 'singleChoice' | 'multipleChoice' | 'matchingPairs';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QuestionSettings {
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  numQuestions: number;
}

export interface SingleChoiceQuestionList {
  questions: SingleChoiceQuestion[];
}

export interface MultipleChoiceQuestionList {
  questions: MultipleChoiceQuestion[];
}

export interface MatchingPairsQuestionList {
  questions: MatchingPairsQuestion[];
} 