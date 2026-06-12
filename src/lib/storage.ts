import { Task, Exam, Activity, PomodoroStats, UserProfile } from '../types';

// Web Audio API Sound Generator for Pomodoro chime (100% offline, zero reliance on external asset loading)
export function playChimeSuccess() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Low chime
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6
    
    gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.55);

    // Warm high overtone standard chord chime
    setTimeout(() => {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1318.51, audioCtx.currentTime); // E6
      gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.7);
    }, 150);
  } catch (e) {
    console.warn('Web Audio Playback failed or was blocked by browser autoplay rules:', e);
  }
}

export function playTickSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    // Silent fail for tick as it happens every second
  }
}

// SEED DATA
const DEFAULT_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Review Advanced Calculus Integration Techniques',
    description: 'Solve practice problems 1-15 on integration by parts, substitution, and partial fraction decomposition.',
    subject: 'Mathematics',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    status: 'pending'
  },
  {
    id: 't-2',
    title: 'Complete CompSci Lab 4 on Balanced Trees',
    description: 'Code the AVL tree rotation algorithm and submit the benchmark runtime reports to the autograder.',
    subject: 'Computer Science',
    priority: 'high',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days from now
    status: 'pending'
  },
  {
    id: 't-3',
    title: 'Draft Introduction for World History Essay',
    description: 'Establish thesis regarding international trade routes setup in the Silk Road expansion period.',
    subject: 'History',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending'
  },
  {
    id: 't-4',
    title: 'Preread Chapter 6 Chemistry Slides',
    description: 'Familiarize with standard molar reaction enthalpys and thermodynamic structures.',
    subject: 'Chemistry',
    priority: 'low',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'completed'
  }
];

const DEFAULT_EXAMS: Exam[] = [
  {
    id: 'e-1',
    name: 'Algorithms & Data Structures Midterm',
    subject: 'Computer Science',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
    notes: 'Focus on Big-O notation, Heap Sort, Red-Black balance, and Depth-First Graph Search.'
  },
  {
    id: 'e-2',
    name: 'Physics I Mechanics Exam',
    subject: 'Physics',
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 9 days from now
    notes: 'Rotational torque, elastic collisions, and gravity equations.'
  }
];

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    text: 'Completed Focus Session 1 (25m专注)',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    type: 'pomodoro'
  },
  {
    id: 'act-2',
    text: 'Added exam "Physics I Mechanics Exam"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'exam'
  },
  {
    id: 'act-3',
    text: 'Completed Chemistry pre-reading task',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    type: 'task'
  },
  {
    id: 'act-4',
    text: 'System dashboard seeded successfully',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    type: 'system'
  }
];

const MOTIVATIONAL_QUOTES = [
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { quote: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" }
];

export const getQuote = (): { quote: string, author: string } => {
  const hash = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[hash];
};

// STORAGE SERVICE
export const storage = {
  getTasks(): Task[] {
    const raw = localStorage.getItem('studyflow_tasks');
    if (!raw) {
      this.saveTasks(DEFAULT_TASKS);
      return DEFAULT_TASKS;
    }
    return JSON.parse(raw);
  },

  saveTasks(tasks: Task[]): void {
    localStorage.setItem('studyflow_tasks', JSON.stringify(tasks));
  },

  getExams(): Exam[] {
    const raw = localStorage.getItem('studyflow_exams');
    if (!raw) {
      this.saveExams(DEFAULT_EXAMS);
      return DEFAULT_EXAMS;
    }
    return JSON.parse(raw);
  },

  saveExams(exams: Exam[]): void {
    localStorage.setItem('studyflow_exams', JSON.stringify(exams));
  },

  getActivities(): Activity[] {
    const raw = localStorage.getItem('studyflow_activities');
    if (!raw) {
      this.saveActivities(DEFAULT_ACTIVITIES);
      return DEFAULT_ACTIVITIES;
    }
    return JSON.parse(raw);
  },

  saveActivities(activities: Activity[]): void {
    localStorage.setItem('studyflow_activities', JSON.stringify(activities));
  },

  addActivity(text: string, type: 'task' | 'exam' | 'pomodoro' | 'system'): void {
    const acts = this.getActivities();
    const newAct: Activity = {
      id: 'act-' + Math.random().toString(36).substr(2, 9),
      text,
      timestamp: new Date().toISOString(),
      type
    };
    this.saveActivities([newAct, ...acts].slice(0, 30)); // Keep last 30
  },

  getPomodoroStats(): PomodoroStats {
    const raw = localStorage.getItem('studyflow_pomo');
    if (!raw) {
      const initPomo = { sessionsCompleted: 1, totalFocusMinutes: 25 };
      this.savePomodoroStats(initPomo);
      return initPomo;
    }
    return JSON.parse(raw);
  },

  savePomodoroStats(stats: PomodoroStats): void {
    localStorage.setItem('studyflow_pomo', JSON.stringify(stats));
  },

  getUserProfile(): UserProfile {
    const raw = localStorage.getItem('studyflow_profile');
    if (!raw) {
      const initProfile = { name: '', goal: 'Maintain high academic goals and task concentration.', onboarded: false };
      this.saveUserProfile(initProfile);
      return initProfile;
    }
    return JSON.parse(raw);
  },

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem('studyflow_profile', JSON.stringify(profile));
  },

  getThemePreference(): 'light' | 'dark' {
    const raw = localStorage.getItem('studyflow_theme');
    return (raw as 'light' | 'dark') || 'light';
  },

  saveThemePreference(theme: 'light' | 'dark'): void {
    localStorage.setItem('studyflow_theme', theme);
  },

  resetAllData(): void {
    localStorage.removeItem('studyflow_tasks');
    localStorage.removeItem('studyflow_exams');
    localStorage.removeItem('studyflow_activities');
    localStorage.removeItem('studyflow_pomo');
    localStorage.removeItem('studyflow_profile');
  }
};

// DYNAMIC LOCAL ANALYSIS ENGINE ("STUDY BRAIN")
export interface SmartDiagnostic {
  stressLevel: 'relaxed' | 'focused' | 'heavy' | 'danger';
  stressScore: number; // 0 - 100
  focusEfficiency: string; // Dynamic message
  primaryBottleneck: string;
  focusPlan: string[]; // Step-by-step smart path
  tips: string[];
}

export function computeSmartDiagnostic(tasks: Task[], exams: Exam[], pomo: PomodoroStats): SmartDiagnostic {
  const pending = tasks.filter(t => t.status === 'pending');
  const highPending = pending.filter(t => t.priority === 'high').length;
  const mediumPending = pending.filter(t => t.priority === 'medium').length;
  
  // Calculate exam factors
  const now = new Date();
  let nearestExamDays = 999;
  let criticalExamsCount = 0;
  
  exams.forEach(ex => {
    const diffTime = new Date(ex.date).getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < nearestExamDays) {
      nearestExamDays = diffDays;
    }
    if (diffDays >= 0 && diffDays <= 4) {
      criticalExamsCount++;
    }
  });

  // Score stress: 0 to 100
  // high task pending = 12pts each. medium pending = 6pts. low pending = 2pts.
  // exam in 1 day = 50pts. exam in 3 days = 35pts. exam in 7 days = 20pts.
  let score = 0;
  score += highPending * 12;
  score += mediumPending * 6;
  score += (pending.length - highPending - mediumPending) * 3;

  if (nearestExamDays <= 1) score += 45;
  else if (nearestExamDays <= 3) score += 30;
  else if (nearestExamDays <= 7) score += 15;
  else if (nearestExamDays <= 14) score += 5;

  score += Math.max(0, criticalExamsCount * 15);

  // Normalize
  score = Math.min(100, Math.max(5, score));

  let level: 'relaxed' | 'focused' | 'heavy' | 'danger' = 'relaxed';
  if (score > 75) level = 'danger';
  else if (score > 50) level = 'heavy';
  else if (score > 25) level = 'focused';

  // Work out primary bottleneck
  let primaryBottleneck = 'None. You are in a great rhythm! Keep taking proactive, small steps.';
  if (criticalExamsCount > 0) {
    primaryBottleneck = `Immediate exams approaching. You have ${criticalExamsCount} examinations within the next 4 days.`;
  } else if (highPending > 0) {
    primaryBottleneck = `Unresolved high-priority critical tasks. You have ${highPending} core deliverables requiring urgent focus.`;
  } else if (pending.length > 5) {
    primaryBottleneck = `High backlog counts. Your pending task queue is growing (${pending.length} unresolved steps).`;
  }

  // Work out smart Focus Plan (stretching actionable steps)
  const focusPlan: string[] = [];
  if (nearestExamDays <= 3 && exams.length > 0) {
    const nearEx = exams.find(ex => {
      const d = Math.ceil((new Date(ex.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return d === nearestExamDays;
    });
    if (nearEx) {
      focusPlan.push(`Dedicate the next Pomodoro session entirely to ${nearEx.name} review (${nearEx.subject}).`);
    }
  }

  const firstUrgentTask = pending.find(t => t.priority === 'high');
  if (firstUrgentTask) {
    focusPlan.push(`Solve task bottleneck: "${firstUrgentTask.title}" (${firstUrgentTask.subject}).`);
  } else {
    const firstPendingTask = pending[0];
    if (firstPendingTask) {
      focusPlan.push(`Knock out the oldest pending block: "${firstPendingTask.title}".`);
    }
  }

  // Final push
  focusPlan.push(`Perform a 5-minute cooldown break then check off completed markers.`);

  if (focusPlan.length < 3) {
    focusPlan.push('All clear! Generate a fresh preview task or read upcoming syllabus drafts to stay ahead.');
  }

  // Brain feedback quotes/tips
  const tips: string[] = [];
  if (pomo.sessionsCompleted > 4) {
    tips.push('Excellent energy! You have sustained heavy cognitive focus today. Ensure high fluid intake.');
  } else {
    tips.push('Initiating one simple Pomodoro (25m) triggers momentum. Start low and clear just one paragraph.');
  }
  
  if (level === 'danger') {
    tips.push('Brain bandwidth is nearing safe threshold. Break tasks into tiny sub-sentences to prevent paralysis.');
    tips.push('Priority rule: Ignore low-priority checklist items completely until exam reviews conclude.');
  } else if (level === 'heavy') {
    tips.push('Implement standard active recall of lecture summaries for nearby examinations.');
  } else {
    tips.push('Great time to pre-study next week\'s topic. Proactive reading reduces mid-term stress spikes by up to 50%.');
  }

  // Focus Efficiency sentence
  let focusEfficiency = 'Moderate';
  if (pomo.sessionsCompleted === 0) {
    focusEfficiency = 'Ready to launch; ignite your first Pomodoro session to calculate live concentration efficiency.';
  } else if (pomo.sessionsCompleted >= 3 && score < 40) {
    focusEfficiency = 'Optimal. Your high focus-rate coupled with balanced work loads places you in an elite workflow rhythm!';
  } else if (score > 60) {
    focusEfficiency = 'Challenged. Task burden is currently out-scaling focus duration. Recommend doubling break periods to recover concentration reserves.';
  } else {
    focusEfficiency = 'Steady. Solid productivity loop is maintained with stable storage management.';
  }

  return {
    stressLevel: level,
    stressScore: score,
    focusEfficiency,
    primaryBottleneck,
    focusPlan,
    tips
  };
}
