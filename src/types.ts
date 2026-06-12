export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string; // YYYY-MM-DD
  status: 'pending' | 'completed';
}

export interface Exam {
  id: string;
  name: string;
  subject: string;
  date: string; // YYYY-MM-DD
  notes: string;
}

export interface Activity {
  id: string;
  text: string;
  timestamp: string; // ISO String
  type: 'task' | 'exam' | 'pomodoro' | 'system';
}

export interface PomodoroStats {
  sessionsCompleted: number;
  totalFocusMinutes: number;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
}

export interface UserProfile {
  name: string;
  goal: string;
  onboarded: boolean;
}
