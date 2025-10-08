
export interface CourseModule {
  id: number;
  title: string;
  description: string;
  videoUrl?: string;
  content: string;
  estimatedDuration: number; // in minutes
  order: number;
  isLocked: boolean;
  isResourceModule?: boolean;
  completionCriteria: {
    videoWatched: boolean;
    quizPassed: boolean;
    minimumScore: number;
  };
}

export interface Quiz {
  id: number;
  moduleId: number;
  questions: QuizQuestion[];
  passingScore: number;
  maxAttempts: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  type: 'multiple-choice' | 'scenario-based';
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface UserProgress {
  userId: string;
  moduleId: number;
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  attempts: number;
  timeSpent: number; // in minutes
  completedAt?: string;
  videoProgress: number; // percentage
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  moduleId?: number;
}
