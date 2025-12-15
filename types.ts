export enum CompanyType {
  PRODUCT = 'Product-based',
  SERVICE = 'Service-based',
  STARTUP = 'Startup',
  UNKNOWN = 'General',
}

export interface JobAnalysis {
  role: string;
  company: string;
  type: CompanyType;
  skills: string[];
  summary: string;
}

export interface StudyModule {
  week: string;
  topic: string;
  description: string;
  resources: string[];
}

export interface TrainingPlan {
  techStack: string[];
  studyPlan: StudyModule[];
}

// Deprecated but keeping for compatibility if needed elsewhere temporarily
export interface StudyWeek {
  weekNumber: number;
  theme: string;
  topics: {
    title: string;
    description: string;
    resources?: string[];
  }[];
}

export interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation: string;
}

export interface CodeChallenge {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  starterCode: {
    python: string;
    javascript: string;
    java: string;
  };
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

export interface ExecutionResult {
  status: 'Success' | 'Error';
  errorDetails?: string;
  testCases: TestCase[];
  summary: string;
}
