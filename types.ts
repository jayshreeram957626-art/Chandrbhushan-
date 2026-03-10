
export interface Question {
  id: number;
  subject: string;
  topic: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Equation {
  id: number;
  category: string;
  formula: string;
  description: string;
  meaning: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export interface UserProfile {
  name: string;
  email: string;
  grade: string;
  isLoggedIn: boolean;
}

export interface AIConfig {
  preferredLanguage: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
  };
}

export type Tab = 'home' | 'exams' | 'equations' | 'ai-tutor' | 'news' | 'english-coach' | 'math-solver' | 'voice-ai';
export type Language = 'hindi' | 'english' | 'both' | 'bhojpuri';
