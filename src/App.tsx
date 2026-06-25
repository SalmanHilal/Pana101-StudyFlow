import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  storage, 
  computeSmartDiagnostic,
  getQuote
} from './lib/storage';
import { Task, Exam, Activity, PomodoroStats, UserProfile } from './types';
import DashboardView from './components/DashboardView';
import TaskModule from './components/TaskModule';
import ExamModule from './components/ExamModule';
import PomodoroTimer from './components/PomodoroTimer';
import BrainAssistant from './components/BrainAssistant';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  Coffee, 
  Cpu, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Bell, 
  Search, 
  RefreshCw,
  LogOut,
  ChevronRight,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Ref for main content area to scroll to top on tab navigate
  const mainContentRef = useRef<HTMLElement>(null);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(storage.getThemePreference());

  // Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pomoStats, setPomoStats] = useState<PomodoroStats>({ sessionsCompleted: 0, totalFocusMinutes: 0 });
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', goal: '', onboarded: false });
  const [quote, setQuote] = useState<{ quote: string; author: string }>({ quote: '', author: '' });

  // Floating Modals triggers
  const [isQuickTaskModalOpen, setIsQuickTaskModalOpen] = useState(false);

  // Profile Dropdown toggle state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Search filter
  const [globalSearch, setGlobalSearch] = useState('');

  // Toast Notifications list
  interface Toast {
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning';
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Initialize and Seed
  useEffect(() => {
    // Read LocalStorage
    setTasks(storage.getTasks());
    setExams(storage.getExams());
    setActivities(storage.getActivities());
    setPomoStats(storage.getPomodoroStats());
    setUserProfile(storage.getUserProfile());
    setQuote(getQuote());
  }, []);

  // Sync HTML class on theme change
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Scroll to top when tab changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Sync state triggers
  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto purge toast
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    storage.saveThemePreference(nextTheme);
    
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      triggerToast('Dark mode workspace loaded', 'info');
    } else {
      document.documentElement.classList.remove('dark');
      triggerToast('Light mode workspace loaded', 'info');
    }
  };

  // Data management callbacks
  const handleAddTask = (newTaskPayload: Omit<Task, 'id'>) => {
    const id = 't-' + Math.random().toString(36).substr(2, 9);
    const addedTask: Task = { id, ...newTaskPayload };
    const updatedTasks = [addedTask, ...tasks];
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);

    // Logging Activity
    storage.addActivity(`Created task "${addedTask.title}"`, 'task');
    setActivities(storage.getActivities());

    triggerToast(`Created task: ${addedTask.title}`, 'success');
  };

  const handleEditTask = (id: string, updatedFields: Partial<Task>) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        // Log status change if completed
        if (updatedFields.status && updatedFields.status !== t.status) {
          const actionWord = updatedFields.status === 'completed' ? 'Finished' : 'Re-opened';
          storage.addActivity(`${actionWord} task: "${t.title}"`, 'task');
        }
        return { ...t, ...updatedFields };
      }
      return t;
    });

    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
    setActivities(storage.getActivities());
    triggerToast('Updated task registry details', 'info');
  };

  const handleDeleteTask = (id: string) => {
    const target = tasks.find(t => t.id === id);
    const remaining = tasks.filter(t => t.id !== id);
    setTasks(remaining);
    storage.saveTasks(remaining);

    if (target) {
      storage.addActivity(`Purged task "${target.title}"`, 'system');
      setActivities(storage.getActivities());
      triggerToast(`Removed: ${target.title}`, 'warning');
    }
  };

  const handleAddExam = (newExamPayload: Omit<Exam, 'id'>) => {
    const id = 'e-' + Math.random().toString(36).substr(2, 9);
    const addedExam: Exam = { id, ...newExamPayload };
    const updatedExams = [addedExam, ...exams];
    setExams(updatedExams);
    storage.saveExams(updatedExams);

    storage.addActivity(`Listed exam "${addedExam.name}"`, 'exam');
    setActivities(storage.getActivities());

    triggerToast(`Exam listed: ${addedExam.name}`, 'success');
  };

  const handleDeleteExam = (id: string) => {
    const target = exams.find(e => e.id === id);
    const remaining = exams.filter(e => e.id !== id);
    setExams(remaining);
    storage.saveExams(remaining);

    if (target) {
      storage.addActivity(`Removed exam target "${target.name}"`, 'system');
      setActivities(storage.getActivities());
      triggerToast(`Removed exam countdown`, 'warning');
    }
  };

  const handlePomodoroComplete = (duration: number, type: 'focus' | 'short' | 'long') => {
    // Only increment focus counts for active focus modes
    if (type === 'focus') {
      const nextStats = {
        sessionsCompleted: pomoStats.sessionsCompleted + 1,
        totalFocusMinutes: pomoStats.totalFocusMinutes + duration
      };
      setPomoStats(nextStats);
      storage.savePomodoroStats(nextStats);

      storage.addActivity(`Completed a Pomodoro Focus Session (${duration}m)`, 'pomodoro');
      setActivities(storage.getActivities());

      triggerToast('Pomodoro session completed! Focus verified.', 'success');
    } else {
      const label = type === 'short' ? 'Short' : 'Long';
      storage.addActivity(`Completed a ${label} recovery break`, 'pomodoro');
      setActivities(storage.getActivities());
      triggerToast('Break over! Brain recovered and ready.', 'info');
    }
  };

  const handleUpdateProfile = (name: string, goal: string) => {
    const nextProfile = { name, goal, onboarded: true };
    setUserProfile(nextProfile);
    storage.saveUserProfile(nextProfile);
    triggerToast('Academic profile updated', 'success');
  };

  const handleLogout = () => {
    const loggedOutProfile = { name: '', goal: 'Maintain high academic goals and task concentration.', onboarded: false };
    setUserProfile(loggedOutProfile);
    storage.saveUserProfile(loggedOutProfile);
    triggerToast('Logged out of StudyFlow workspace', 'info');
    setIsProfileDropdownOpen(false);
  };

  const handleResetAllData = () => {
    storage.resetAllData();
    // Force reload states back to seed standard
    setTasks(storage.getTasks());
    setExams(storage.getExams());
    setActivities(storage.getActivities());
    setPomoStats(storage.getPomodoroStats());
    setUserProfile(storage.getUserProfile());
    triggerToast('All local storage databases seeded back to template defaults', 'warning');
  };

  // Perform a small dynamic load diagnostic calculation
  const calculatedDiagnostics = useMemo(() => {
    return computeSmartDiagnostic(tasks, exams, pomoStats);
  }, [tasks, exams, pomoStats]);

  // Global search targets counts
  const totalMatchesCount = useMemo(() => {
    if (!globalSearch.trim()) return 0;
    const query = globalSearch.toLowerCase();
    const matchTasks = tasks.filter(t => t.title.toLowerCase().includes(query) || t.subject.toLowerCase().includes(query));
    const matchExams = exams.filter(e => e.name.toLowerCase().includes(query) || e.subject.toLowerCase().includes(query));
    return matchTasks.length + matchExams.length;
  }, [globalSearch, tasks, exams]);

  // Trigger global search redirect
  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    setActiveTab('tasks'); // jump to tasks to display full filtered rows
    triggerToast(`Showing search matches for "${globalSearch}"`, 'info');
    setIsMobileMenuOpen(false);
  };

  // Sidebar list configurations
  const menuItems = [
    { label: 'Workspace Dashboard', icon: LayoutDashboard, id: 'dashboard' },
    { label: 'Task Deliverables', icon: ClipboardList, id: 'tasks', badge: tasks.filter(t=>t.status === 'pending').length },
    { label: 'Exam Countdowns', icon: Calendar, id: 'exams', badge: exams.filter(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0)).length },
    { label: 'Pomodoro Focus', icon: Coffee, id: 'pomodoro' },
    { label: 'Cognitive Diagnostics', icon: Cpu, id: 'ai' },
  ];

  // Quick navigation wrappers
  const handleTabNavigate = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const isUserNotOnboarded = !userProfile.name || !userProfile.onboarded || userProfile.name === 'Sophia Chen';

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-930 dark:bg-[#0b0f19] dark:text-slate-100 font-sans transition-colors duration-300 flex overflow-hidden">
      
      {/* Immersive Onboarding Screen Overlay to force profile setting */}
      {isUserNotOnboarded && (
        <div id="onboarding-overlay" className="fixed inset-0 z-50 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl relative overflow-hidden animate-fade-in text-slate-900 dark:text-slate-100">
            {/* Top decorative accent bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-550 via-indigo-600 to-violet-600"></div>
            
            <div className="space-y-6">
              {/* Logo & Headline */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
                  <span className="text-white font-black text-xl tracking-tighter">SF</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">Welcome to StudyFlow</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mt-1">Please set up your student profile to initialize your customized academic dashboard, tools and stress index.</p>
                </div>
              </div>

              {/* Form Entry */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const nameInput = form.elements.namedItem('username') as HTMLInputElement;
                const goalInput = form.elements.namedItem('usergoal') as HTMLInputElement;
                
                const valName = nameInput.value.trim();
                const valGoal = goalInput.value.trim();

                if (valName.length < 2) {
                  triggerToast('Please provide a valid name (at least 2 letters)', 'warning');
                  return;
                }

                handleUpdateProfile(valName, valGoal || 'Maintain high academic goals and task concentration.');
              }} className="space-y-5">
                <div className="space-y-2 text-left font-sans">
                  <label htmlFor="onboard-name-input" className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                    Your Full Name <span className="text-indigo-600 dark:text-indigo-400 font-bold">*</span>
                  </label>
                  <input
                    id="onboard-name-input"
                    name="username"
                    type="text"
                    required
                    placeholder="e.g., Alex Carter"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900/80 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 font-medium"
                  />
                </div>

                <div className="space-y-2 text-left font-sans">
                  <label htmlFor="onboard-goal-input" className="block text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                    Academic Goal (Optional)
                  </label>
                  <textarea
                    id="onboard-goal-input"
                    name="usergoal"
                    rows={3}
                    placeholder="e.g., Keep up with all Computer Science labs and prep for mechanics exams early..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900/80 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 leading-relaxed font-sans font-medium"
                  />
                </div>

                {/* Highly tactile, high-contrast, beautiful button */}
                <button
                  id="btn-submit-onboard"
                  type="submit"
                  className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white dark:text-white rounded-xl font-bold text-sm tracking-widest uppercase transition duration-200 shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-indigo-700 dark:border-indigo-500 select-none text-[12px]"
                >
                  Configure Workspace & Get Started
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Overlay Container */}
      <div className="fixed bottom-5 right-5 z-50 space-y-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`p-3.5 rounded-xl border shadow-lg flex items-start gap-2.5 backdrop-blur-md pointer-events-auto ${
                t.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400' 
                  : t.type === 'warning' 
                  ? 'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400' 
                  : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {t.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
              {t.type === 'info' && <Info className="w-5 h-5 shrink-0 mt-0.5" />}
              <span className="text-xs font-semibold font-sans leading-tight">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Side Navigation Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 p-6 shrink-0 h-screen justify-between">
        
        <div className="space-y-6">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SF</span>
            </div>
            <div>
              <span className="font-bold font-display text-xl tracking-tight text-slate-800 dark:text-white leading-none block">StudyFlow</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mt-0.5">Workspace</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isSelected = activeTab === item.id;
              
              return (
                <button
                  id={`nav-link-${item.id}`}
                  key={item.id}
                  onClick={() => handleTabNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition group cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-medium' 
                      : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`} />
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${isSelected ? 'bg-indigo-150 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile details */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 px-1 cursor-pointer" onClick={() => handleTabNavigate('ai')}>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border-2 border-white dark:border-slate-900 shadow-sm">
              {userProfile.name ? userProfile.name.split(' ').map(n=>n[0]).join('') : 'SF'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{userProfile.name || 'Student'}</span>
              <span className="block text-xs text-slate-400 dark:text-slate-500 leading-none mt-0.5">Academic profile</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
        </div>

      </aside>

      {/* Main Content Workspace viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Sticky Utility Top Navigation Bar */}
        <header className="h-16 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-3">
            {/* Burger Trigger - Mobile View */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Quick date display */}
            <div className="hidden sm:block">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Primary schedule</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-350 mt-1 block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Quick search input and theme utilities */}
          <div className="flex items-center gap-6">
            
            <form onSubmit={handleGlobalSearchSubmit} className="relative hidden md:block w-70">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</div>
              <input
                id="sh-global-search-input"
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search tasks, subjects, exams..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-900 border-none rounded-full text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
              {globalSearch && (
                <span className="absolute right-3 px-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[9px] font-bold text-slate-500 top-1/2 -translate-y-1/2 pointer-events-none">
                  {totalMatchesCount} matches
                </span>
              )}
            </form>

            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={handleToggleTheme}>
              <div className={`w-8 h-4 rounded-full p-0.5 relative transition-colors duration-250 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-250 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">DARK MODE</span>
            </div>

            <div className="relative">
              <button 
                id="profile-dropdown-btn"
                className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border-2 border-white dark:border-slate-900 shadow-sm cursor-pointer hover:opacity-90 focus:outline-none select-none text-sm transition relative z-40"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                {userProfile.name ? userProfile.name.split(' ').map(n=>n[0]).join('') : 'ST'}
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <>
                    {/* Backdrop to close the dropdown on click outside */}
                    <div 
                      className="fixed inset-0 z-30 bg-transparent" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    
                    {/* Styled Dropdown Menu */}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-40 text-left font-sans"
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {userProfile.name || 'Student'}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-normal">
                          {userProfile.goal || 'Academic workspace'}
                        </p>
                      </div>
                      
                      <div className="p-1.5 space-y-0.5">
                        <button
                          onClick={() => {
                            handleTabNavigate('ai');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition"
                        >
                          <Cpu className="w-4 h-4 text-indigo-500" />
                          <span>Cognitive Diagnostics</span>
                        </button>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 cursor-pointer transition font-sans"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Logout (Reset Settings)</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

        </header>

        {/* Mobile Navigation Drawer Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280, transition: { ease: 'easeInOut', duration: 0.2 } }}
                onClick={(e) => e.stopPropagation()}
                className="w-72 max-w-xs bg-white dark:bg-zinc-900 h-full p-5 shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-xl text-white">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-extrabold font-display text-base tracking-tighter text-indigo-600 dark:text-white uppercase leading-none block">StudyFlow</span>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5 block">Mobile Access</span>
                      </div>
                    </div>
                    {/* Close Trigger */}
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mobile Search bar */}
                  <form onSubmit={handleGlobalSearchSubmit} className="relative block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                      placeholder="Search tasks, exams..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-205 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-950 text-xs"
                    />
                  </form>

                  {/* Navigation Links */}
                  <nav className="space-y-1">
                    {menuItems.map((item) => {
                      const IconComp = item.icon;
                      const isSelected = activeTab === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleTabNavigate(item.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition ${
                            isSelected 
                              ? 'bg-indigo-500 text-white shadow-md' 
                              : 'text-neutral-500 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-850'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <IconComp className={`w-4.5 h-4.5 shrink-0 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                            {item.label}
                          </span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-neutral-100 text-neutral-600 dark:bg-zinc-800 dark:text-zinc-400">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-zinc-850/80">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center">
                      {userProfile.name ? userProfile.name.split(' ').map(n=>n[0]).join('') : 'ST'}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-neutral-700 dark:text-zinc-200">{userProfile.name || 'Student'}</span>
                      <span className="block text-[10px] text-zinc-400">Workspace Member</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Main Content Frame */}
        <main ref={mainContentRef} className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && (
                  <DashboardView
                    tasks={tasks}
                    exams={exams}
                    activities={activities}
                    pomoStats={pomoStats}
                    quote={quote}
                    stressScore={calculatedDiagnostics.stressScore}
                    stressLevel={calculatedDiagnostics.stressLevel}
                    onNavigate={handleTabNavigate}
                    onOpenQuickTaskModal={() => {
                      setActiveTab('tasks');
                      setIsQuickTaskModalOpen(true);
                    }}
                    userProfile={userProfile}
                  />
                )}

                {activeTab === 'tasks' && (
                  <TaskModule
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    isQuickModalOpen={isQuickTaskModalOpen}
                    onCloseQuickModal={() => setIsQuickTaskModalOpen(false)}
                    globalSearch={globalSearch}
                    onSearchChange={setGlobalSearch}
                  />
                )}

                {activeTab === 'exams' && (
                  <ExamModule
                    exams={exams}
                    onAddExam={handleAddExam}
                    onDeleteExam={handleDeleteExam}
                  />
                )}

                {activeTab === 'pomodoro' && (
                  <PomodoroTimer
                    onSessionComplete={handlePomodoroComplete}
                    sessionsCount={pomoStats.sessionsCompleted}
                    totalMins={pomoStats.totalFocusMinutes}
                  />
                )}

                {activeTab === 'ai' && (
                  <BrainAssistant
                    tasks={tasks}
                    exams={exams}
                    pomoStats={pomoStats}
                    onUpdateProfile={handleUpdateProfile}
                    userProfile={userProfile}
                    onResetAllData={handleResetAllData}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <footer className="h-10 px-8 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Online Sync Active
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase">Build v2.4.0</span>
          </div>
          <div className="text-[10px] text-slate-400">Local Storage: 2.4MB / 5.0MB Used</div>
        </footer>

        {/* Mobile floating quick bottom nav for simple touch action */}
        <nav className="lg:hidden border-t border-slate-200/60 dark:border-slate-800/80 bg-white/95 dark:bg-[#111827]/95 backdrop-blur px-5.5 py-2.5 flex items-center justify-between shrink-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSel = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabNavigate(item.id)}
                className={`flex flex-col items-center gap-1 cursor-pointer min-w-[50px] min-h-[44px] justify-center ${
                  isSel ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600 dark:text-slate-450 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[8px] font-extrabold uppercase tracking-wide leading-none">{item.id === 'ai' ? 'Brain' : item.id === 'pomodoro' ? 'Focus' : item.id}</span>
              </button>
            );
          })}
        </nav>

      </div>

    </div>
  );
}
