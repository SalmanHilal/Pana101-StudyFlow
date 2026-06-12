import React from 'react';
import { Task, Exam, Activity } from '../types';
import { 
  ClipboardList, 
  CheckCircle, 
  Hourglass, 
  Calendar, 
  Quote, 
  Zap, 
  Play, 
  FilePlus, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  tasks: Task[];
  exams: Exam[];
  activities: Activity[];
  pomoStats: { sessionsCompleted: number; totalFocusMinutes: number };
  quote: { quote: string; author: string };
  stressScore: number;
  stressLevel: 'relaxed' | 'focused' | 'heavy' | 'danger';
  onNavigate: (tab: string) => void;
  onOpenQuickTaskModal: () => void;
  userProfile: { name: string; goal: string };
}

export default function DashboardView({
  tasks,
  exams,
  activities,
  pomoStats,
  quote,
  stressScore,
  stressLevel,
  onNavigate,
  onOpenQuickTaskModal,
  userProfile
}: DashboardViewProps) {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  // Calculate nearest exam
  const nearestExam = [...exams]
    .filter(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const getDaysLeft = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().setHours(0,0,0,0);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Get stress colors
  const getStressColor = (lvl: string) => {
    switch (lvl) {
      case 'relaxed': return 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30';
      case 'focused': return 'text-sky-500 bg-sky-500/10 dark:bg-sky-500/15 border-sky-500/30';
      case 'heavy': return 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30';
      case 'danger': return 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStressName = (lvl: string) => {
    switch (lvl) {
      case 'relaxed': return 'Optimal (Relaxed)';
      case 'focused': return 'Productive Pace';
      case 'heavy': return 'High Burden';
      case 'danger': return 'Burnout Warning';
      default: return 'Stable';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Top Banner Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 md:p-8 text-white shadow-sm">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none">
          {/* Abstract SVG Background representation */}
          <svg className="w-full h-full object-cover" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C30,40 70,60 100,0 L100,100 Z" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-sm text-indigo-100 mb-4 border border-white/10 uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" /> StudyFlow Workspace
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display mb-2">
            Welcome Back, {userProfile.name}!
          </h1>
          <p className="text-indigo-100/90 text-sm md:text-base leading-relaxed mb-6 font-sans">
            "{userProfile.goal}"
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              id="sh-btn-focus"
              onClick={() => onNavigate('pomodoro')} 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-600 hover:bg-slate-50 active:scale-98 transition text-sm font-bold shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current animate-pulse" /> Start Focus Session
            </button>
            <button
              id="sh-btn-task"
              onClick={onOpenQuickTaskModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-98 transition text-sm font-bold border border-white/20 cursor-pointer"
            >
              <FilePlus className="w-4 h-4" /> Quick Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Card */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm hover:shadow hover:border-slate-300 dark:hover:border-slate-700 transition duration-200"
        >
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Tasks</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 pointer-events-none">
            <span className="text-2xl md:text-3xl font-bold font-display text-slate-800 dark:text-slate-100">{tasks.length}</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Syllabus achievements</p>
          </div>
        </div>

        {/* Completed Tasks Card */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm hover:shadow hover:border-slate-300 dark:hover:border-slate-700 transition duration-200"
        >
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completion</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 group-hover:bg-emerald-600 group-hover:text-white transition duration-200">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 pointer-events-none">
            <span className="text-2xl md:text-3xl font-bold font-display text-slate-800 dark:text-slate-100">{completedTasks.length}</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}% Completion rate
            </p>
          </div>
        </div>

        {/* Pending Tasks Card */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm hover:shadow hover:border-slate-300 dark:hover:border-slate-700 transition duration-200"
        >
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 group-hover:bg-amber-600 group-hover:text-white transition duration-200">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 pointer-events-none">
            <span className="text-2xl md:text-3xl font-bold font-display text-slate-800 dark:text-slate-100">{pendingTasks.length}</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Awaiting active focus</p>
          </div>
        </div>

        {/* Focus Sessions Completed */}
        <div 
          onClick={() => onNavigate('pomodoro')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm hover:shadow hover:border-slate-300 dark:hover:border-slate-700 transition duration-200"
        >
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pomo Sessions</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 pointer-events-none">
            <span className="text-2xl md:text-3xl font-bold font-display text-slate-800 dark:text-zinc-100">{pomoStats.sessionsCompleted}</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{pomoStats.totalFocusMinutes} Total focused mins</p>
          </div>
        </div>
      </div>

      {/* Two-Column Midsection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Span (2/3 size): Motivation + Nearest Exam + Burnout Status */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Motivation Quote Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 shrink-0">
                <Quote className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Daily Brain Fuel</span>
                <p className="text-slate-700 dark:text-slate-300 text-sm italic leading-relaxed font-sans">
                  "{quote.quote}"
                </p>
                <p className="text-xs font-semibold text-slate-400">— {quote.author}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nearest Exam Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-450 text-xs font-bold uppercase tracking-wider mb-3">
                  <Calendar className="w-4 h-4" /> Upcoming milestone
                </div>
                {nearestExam ? (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 uppercase tracking-tight">{nearestExam.name}</h3>
                      <p className="text-xs font-medium text-slate-400">{nearestExam.subject}</p>
                    </div>
                    
                    <div className="mt-4 inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                      {getDaysLeft(nearestExam.date) === 0 ? (
                        '🚨 TODAY IS EXAM DAY!'
                      ) : getDaysLeft(nearestExam.date) === 1 ? (
                        '🔥 1 DAY REMAINING'
                      ) : (
                        `⏳ ${getDaysLeft(nearestExam.date)} DAYS COUNTDOWN`
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                    <p className="text-sm">No impending examinations listed.</p>
                    <button 
                      onClick={() => onNavigate('exams')} 
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline mt-2 inline-flex items-center gap-1 cursor-pointer"
                    >
                      Log first examination milestone <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {nearestExam && (
                <button
                  onClick={() => onNavigate('exams')}
                  className="mt-6 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold group pt-4 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                >
                  Configure countdown targets
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition duration-240" />
                </button>
              )}
            </div>

            {/* Smart Cognitive Stress Index */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <TrendingUp className="w-4 h-4" /> Academic Load Index
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400 font-bold">Cognitive Load Score</span>
                      <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{stressScore}%</span>
                    </div>
                    {/* Progress slider bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1.5">
                      <div 
                        className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
                        style={{ width: `${stressScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-tight border ${getStressColor(stressLevel)}`}>
                      {getStressName(stressLevel)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {stressLevel === 'danger' ? 'High risk! Rest immediately.' : 
                       stressLevel === 'heavy' ? 'Prioritize focus.' : 'Balanced status.'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('ai')}
                className="mt-6 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold group pt-4 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
              >
                Inspect smart load diagnostic
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition duration-240" />
              </button>
            </div>

          </div>

        </div>

        {/* Right Span (1/3 size): Recent Activities Logging panel */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-850 pb-3">
            <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Activity Journal</h3>
            <span className="text-xs font-mono text-slate-400">{activities.length} entries</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 max-h-[320px] scrollbar-thin">
            {activities.length > 0 ? (
              activities.map((act) => {
                const isPomo = act.type === 'pomodoro';
                const isTask = act.type === 'task';
                const isExam = act.type === 'exam';
                
                return (
                  <div key={act.id} className="flex gap-2.5 items-start group">
                    <div className={`p-1 mt-1 shrink-0 rounded ${
                      isPomo ? 'bg-rose-500/10 text-rose-500' :
                      isTask ? 'bg-indigo-500/10 text-indigo-505' :
                      isExam ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-555'
                    }`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-tight">
                        {act.text}
                      </p>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-450 dark:text-slate-500">
                <p className="text-xs">Journal entries recorded securely in local stack.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
