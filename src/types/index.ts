/**
 * TypeScript type definitions
 */

export interface Question {
  id: string;
  text: string;
  topic?: string;
  year?: number;
  difficulty?: string;
  importance_score: number;
  frequency: number;
  last_appeared?: number;
}

export interface TopicAnalysis {
  topic: string;
  frequency: number;
  importance_score: number;
  questions: string[];
  avg_difficulty?: string;
}

export interface PaperUploadResponse {
  success: boolean;
  message: string;
  paper_id: string;
  extracted_text_length: number;
  questions_extracted: number;
  topics_identified: string[];
}

export interface StudySession {
  topic: string;
  duration_minutes: number;
  importance_score: number;
  questions_to_cover: string[];
  day: number;
  session_number: number;
}

export interface StudySchedule {
  total_hours: number;
  total_sessions: number;
  sessions: StudySession[];
  topic_distribution: { [key: string]: number };
  start_date?: string;
  exam_date?: string;
}

export interface TimerState {
  is_running: boolean;
  is_break: boolean;
  current_session: number;
  time_remaining: number;
  topic?: string;
}

export interface TimerConfig {
  study_duration: number;
  break_duration: number;
  long_break_duration: number;
  sessions_until_long_break: number;
}

export interface AnalysisResponse {
  total_questions: number;
  topics: TopicAnalysis[];
  repeated_questions: any[];
  important_topics: string[];
  predictions: Question[];
  success: boolean;
}

export interface TimerStats {
  sessions_completed: number;
  total_study_minutes: number;
  total_break_minutes: number;
  current_topic?: string;
  is_break: boolean;
  time_remaining: string;
}
