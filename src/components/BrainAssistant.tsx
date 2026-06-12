import React, { useState } from 'react';
import { Task, Exam, PomodoroStats } from '../types';
import { 
  computeSmartDiagnostic, 
  storage 
} from '../lib/storage';
import { 
  Zap, 
  BookOpen, 
  ShieldAlert, 
  Lightbulb, 
  User, 
  Edit3, 
  Save, 
  Maximize2,
  ListRestart,
  BarChart2,
  Cpu,
  Bookmark
} from 'lucide-react';

interface BrainAssistantProps {
  tasks: Task[];
  exams: Exam[];
  pomoStats: PomodoroStats;
  onUpdateProfile: (name: string, goal: string) => void;
  userProfile: { name: string; goal: string };
  onResetAllData: () => void;
}

export default function BrainAssistant({
  tasks,
  exams,
  pomoStats,
  onUpdateProfile,
  userProfile,
  onResetAllData
}: BrainAssistantProps) {
  const [profileName, setProfileName] = useState(userProfile.name);
  const [profileGoal, setProfileGoal] = useState(userProfile.goal);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Compute smart stats and instructions purely offline!
  const diagnostics = computeSmartDiagnostic(tasks, exams, pomoStats);

  const pending = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');
  const totalTasksCount = tasks.length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((completed.length / totalTasksCount) * 100) : 0;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileName, profileGoal);
    setIsEditingProfile(false);
  };

  const stressColorClasses = {
    relaxed: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      badge: 'bg-emerald-600 dark:bg-emerald-700 text-white',
      msg: 'Your academic pressure is fully controlled. Great work!'
    },
    focused: {
      bg: 'bg-sky-50 dark:bg-sky-950/20',
      border: 'border-sky-200 dark:border-sky-900/30',
      text: 'text-indigo-700 dark:text-indigo-455',
      badge: 'bg-indigo-600 dark:bg-indigo-700 text-white',
      msg: 'Steady flow. Steady accomplishments are driving good progress.'
    },
    heavy: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-250 dark:border-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      badge: 'bg-amber-600 dark:bg-amber-700 text-white',
      msg: 'Load is accumulating quickly. Prioritize high-urgency exam slots.'
    },
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      border: 'border-rose-200 dark:border-rose-900/30',
      text: 'text-rose-700 dark:text-rose-400',
      badge: 'bg-rose-600 dark:bg-rose-700 text-white',
      msg: 'Burnout risk active! Delay non-essential works and recharge.'
    }
  }[diagnostics.stressLevel];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wider font-display flex items-center gap-2">
            <Cpu className="text-indigo-600" /> Cognitive Intelligence Center
          </h1>
          <p className="text-xs text-slate-400">Offline algorithm calculating academic workloads and recommended task pipelines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Span 2): Diagnostics Console, Load distribution chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stress Level Gauge */}
          <div className={`rounded-xl border ${stressColorClasses.border} ${stressColorClasses.bg} p-6 space-y-4 shadow-sm relative overflow-hidden`}>
            <div className="absolute top-4 right-4 opacity-10 pointer-events-none text-current">
              <Zap className="w-20 h-20" />
            </div>
            
            <div className="space-y-1.5 z-10 relative">
              <span className={`inline-flex px-2 py-0.5 text-[9px] font-extrabold rounded uppercase tracking-wider ${stressColorClasses.badge}`}>
                {diagnostics.stressLevel} scale active
              </span>
              <h2 className="text-lg font-bold font-display tracking-tight text-slate-850 dark:text-slate-50">
                Cognitive Diagnostic: {stressColorClasses.msg}
              </h2>
            </div>

            {/* Slider meter layout */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400">
                <span>Calculated load strain</span>
                <span>{diagnostics.stressScore} / 100 max</span>
              </div>
              <div className="h-2 rounded-full bg-slate-205 dark:bg-slate-800 overflow-hidden relative">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${
                    diagnostics.stressLevel === 'danger' ? 'bg-rose-600' :
                    diagnostics.stressLevel === 'heavy' ? 'bg-amber-500' :
                    diagnostics.stressLevel === 'focused' ? 'bg-indigo-600' :
                    'bg-emerald-600'
                  }`}
                  style={{ width: `${diagnostics.stressScore}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Work Concentration index</span>
                <p className="text-slate-655 dark:text-slate-350 font-sans leading-relaxed text-xs">{diagnostics.focusEfficiency}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Primary Bottleneck</span>
                <p className="text-slate-655 dark:text-slate-350 font-bold flex items-center gap-1.5 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 animate-bounce" /> {diagnostics.primaryBottleneck}
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Generated Revision step-by-step Roadmap */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" /> Prescribed Revision Sprint Path
            </h3>

            <div className="relative border-l border-slate-150 dark:border-slate-800 ml-3 pl-4 space-y-4 py-1">
              {diagnostics.focusPlan.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Dot marker */}
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-605 border border-white dark:border-slate-900 ring-4 ring-indigo-500/10 group-hover:scale-125 transition" />
                  
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Priority Segment 0{idx + 1}</span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-350 font-sans leading-relaxed">
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core metrics visual statistics bars */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-indigo-600" /> Real-Time Accomplishment Diagnostics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <span className="block text-2xl font-black text-indigo-600 font-display">{completionPercentage}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion speed</span>
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${completionPercentage}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <span className="block text-2xl font-black text-emerald-600 font-display">{completed.length}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasks Archived</span>
                <span className="block text-[10px] text-slate-400 mt-2 font-mono">{pending.length} pending checks</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <span className="block text-2xl font-black text-amber-605 font-display">{exams.length}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deadlines Listed</span>
                <span className="block text-[10px] text-slate-400 mt-2 font-mono">{pomoStats.sessionsCompleted} sessions stored</span>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (Span 1): Dynamic Study Tips, Profile Modifier console, Reset Option */}
        <div className="space-y-6">
          
          {/* Dynamic AI Study Tips */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm space-y-3.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Focus recommendations
            </h3>

            <ul className="space-y-3">
              {diagnostics.tips.map((tip, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-sans">
                  <span>✨</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Profile Configuration Dashboard Console */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" /> Student Profile Console
            </h3>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
                {/* Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Target Student Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Academic Goal */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Primary Goal / Mission</label>
                  <textarea
                    rows={2}
                    required
                    value={profileGoal}
                    onChange={(e) => setProfileGoal(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white transition font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Target Student Name</span>
                  <p className="font-bold text-slate-700 dark:text-slate-100 mt-0.5">{userProfile.name}</p>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Workspace Goal</span>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-sans mt-0.5 italic">"{userProfile.goal}"</p>
                </div>

                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline mt-2 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Adjust profile specifications
                </button>
              </div>
            )}
          </div>

          {/* Quick Clear / Reset Seeder Option */}
          <div className="rounded-xl border border-rose-150 dark:border-rose-955 bg-rose-50/50 dark:bg-rose-950/10 p-4">
            <button
              onClick={() => {
                if(confirm("⚠️ Critical reset action: Are you sure you want to delete all stored StudyFlow database records? (Theme preferences and focus goals will regress to template defaults)")) {
                  onResetAllData();
                }
              }}
              className="w-full text-left text-xs uppercase tracking-wider text-rose-600 hover:text-rose-700 font-bold flex items-center gap-2 cursor-pointer"
            >
              <ListRestart className="w-4 h-4" /> Factory Reset Stored Stack
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
