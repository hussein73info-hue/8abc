/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Trainee {
  id: string;
  name: string;
}

export type ScreenType = 'login' | 'welcome' | 'index' | 'lesson';

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
}

export interface CategorizationActivity {
  category1: {
    title: string;
    items: string[];
  };
  category2: {
    title: string;
    items: string[];
  };
}

export interface Lesson {
  unit: string;
  unitNo: number;
  title: string;
  discover: string;
  learn: string[];
  quiz?: QuizQuestion[];
  categorization?: CategorizationActivity;
}

export interface LessonResult {
  completed: boolean;
  score: number;
  total: number;
  submittedAt?: string;
  answers?: Record<number, number>;
  categorizationAnswers?: Record<string, 'importance' | 'methods'>;
}

export interface SubmissionRecord {
  id: string;
  traineeId: string;
  traineeName: string;
  lessonIndex: number;
  lessonTitle: string;
  unitTitle: string;
  score: number;
  total: number;
  submittedAt: string;
  answersDetail?: string;
}
