/**
 * API client for communicating with the backend
 */
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Upload endpoints
  async uploadPaper(file: File, year?: number, subject?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (year) formData.append('year', year.toString());
    if (subject) formData.append('subject', subject);

    return this.client.post('/api/upload/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getPapers() {
    return this.client.get('/api/upload/papers');
  }

  async getPaper(paperId: string) {
    return this.client.get(`/api/upload/papers/${paperId}`);
  }

  // Analysis endpoints
  async getAnalysis(topic?: string, topN: number = 20) {
    return this.client.get('/api/analysis/analysis', {
      params: { topic, top_n: topN },
    });
  }

  async getQuestions(topic?: string, limit: number = 100) {
    return this.client.get('/api/analysis/questions', {
      params: { topic, limit },
    });
  }

  async getTopics() {
    return this.client.get('/api/analysis/topics');
  }

  async findSimilarQuestions(question: string, threshold: number = 0.75) {
    return this.client.get('/api/analysis/similar-questions', {
      params: { question, threshold },
    });
  }

  // Schedule endpoints
  async generateSchedule(data: {
    available_hours: number;
    study_duration?: number;
    break_duration?: number;
    start_date?: string;
    exam_date?: string;
    topics_to_include?: string[];
  }) {
    return this.client.post('/api/schedule/generate', data);
  }

  async getSchedules(userId: string = 'default_user') {
    return this.client.get('/api/schedule/schedules', {
      params: { user_id: userId },
    });
  }

  async predictQuestions(topN: number = 20) {
    return this.client.post('/api/schedule/predict-questions', null, {
      params: { top_n: topN },
    });
  }

  // Timer endpoints
  async createTimer(
    userId: string,
    studyDuration: number = 25,
    breakDuration: number = 5,
    longBreakDuration: number = 15,
    sessionsUntilLongBreak: number = 4
  ) {
    return this.client.post('/api/timer/create', null, {
      params: {
        user_id: userId,
        study_duration: studyDuration,
        break_duration: breakDuration,
        long_break_duration: longBreakDuration,
        sessions_until_long_break: sessionsUntilLongBreak,
      },
    });
  }

  async startTimer(userId: string, topic?: string) {
    return this.client.post('/api/timer/start', null, {
      params: { user_id: userId, topic },
    });
  }

  async pauseTimer(userId: string) {
    return this.client.post('/api/timer/pause', null, {
      params: { user_id: userId },
    });
  }

  async resetTimer(userId: string) {
    return this.client.post('/api/timer/reset', null, {
      params: { user_id: userId },
    });
  }

  async getTimerState(userId: string) {
    return this.client.get('/api/timer/state', {
      params: { user_id: userId },
    });
  }

  async getTimerStats(userId: string) {
    return this.client.get('/api/timer/stats', {
      params: { user_id: userId },
    });
  }

  // Health check
  async healthCheck() {
    return this.client.get('/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
