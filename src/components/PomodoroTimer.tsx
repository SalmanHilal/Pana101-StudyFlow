import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Music, 
  Music2, 
  Sparkles, 
  Coffee, 
  CheckCircle, 
  Volume2, 
  VolumeX,
  Plus,
  Minus
} from 'lucide-react';
import { playChimeSuccess, playTickSound } from '../lib/storage';

interface PomodoroTimerProps {
  onSessionComplete: (duration: number, type: 'focus' | 'short' | 'long') => void;
  sessionsCount: number;
  totalMins: number;
}

type PomoMode = 'focus' | 'short' | 'long';

export default function PomodoroTimer({
  onSessionComplete,
  sessionsCount,
  totalMins
}: PomodoroTimerProps) {
  const [mode, setMode] = useState<PomoMode>('focus');
  
  // Custom states to change durations (in minutes)
  const [focusConfig, setFocusConfig] = useState(25);
  const [shortConfig, setShortConfig] = useState(5);
  const [longConfig, setLongConfig] = useState(15);

  const getDurationSeconds = (m: PomoMode) => {
    switch (m) {
      case 'focus': return focusConfig * 60;
      case 'short': return shortConfig * 60;
      case 'long': return longConfig * 60;
    }
  };

  const [timeLeft, setTimeLeft] = useState(focusConfig * 60);
  const [isActive, setIsActive] = useState(false);
  const [isTickSoundEnabled, setIsTickSoundEnabled] = useState(false);
  const [isChimeEnabled, setIsChimeEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync timer on config adjustments when not running
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(getDurationSeconds(mode));
    }
  }, [focusConfig, shortConfig, longConfig, mode, isActive]);

  // Handle ticking loop
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Completed!
            handleTimerComplete();
            return 0;
          }
          if (isTickSoundEnabled) {
            playTickSound();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isTickSoundEnabled, mode]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (isChimeEnabled) {
      playChimeSuccess();
    }

    const durationMinutes = mode === 'focus' ? focusConfig : mode === 'short' ? shortConfig : longConfig;
    onSessionComplete(durationMinutes, mode);

    // Prompt next action
    if (mode === 'focus') {
      alert(`📚 Focus interval concluded! Time for a short ${shortConfig}-minute recovery break.`);
      setMode('short');
      setTimeLeft(shortConfig * 60);
    } else {
      alert(`⚡ Recovery completed! Back to high-intensity studying.`);
      setMode('focus');
      setTimeLeft(focusConfig * 60);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getDurationSeconds(mode));
  };

  const changeMode = (newMode: PomoMode) => {
    setIsActive(false);
    setMode(newMode);
    switch (newMode) {
      case 'focus': setTimeLeft(focusConfig * 60); break;
      case 'short': setTimeLeft(shortConfig * 60); break;
      case 'long': setTimeLeft(longConfig * 60); break;
    }
  };

  // SVG Progress circle calculations
  const totalDuration = getDurationSeconds(mode);
  const percentageCompleted = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) : 0;
  
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - percentageCompleted * circumference;

  // Format MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wider font-display">Pomodoro focus</h1>
          <p className="text-xs text-slate-400">Improve brain concentration using structured study sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Span 2): Focus Circle Panel */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm flex flex-col items-center justify-center space-y-6 min-h-[420px]">
          
          {/* Preset Buttons */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg max-w-sm w-full">
            <button
              onClick={() => changeMode('focus')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition cursor-pointer ${
                mode === 'focus' 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              📚 Focus Mode
            </button>
            <button
              onClick={() => changeMode('short')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition cursor-pointer ${
                mode === 'short' 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              ☕ Short Break
            </button>
            <button
              onClick={() => changeMode('long')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition cursor-pointer ${
                mode === 'long' 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              🌴 Long Break
            </button>
          </div>

          {/* SVG Circular Display */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Secondary Track color */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Running colored segment */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-indigo-600 dark:stroke-indigo-500 transition-all duration-300"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Content within circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-3xl font-extrabold font-mono tracking-tighter text-slate-800 dark:text-slate-100">
                {formattedTime}
              </span>
              <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40">
                {mode === 'focus' ? 'Session active' : 'Break ongoing'}
              </span>
            </div>

          </div>

          {/* Action buttons slider */}
          <div className="flex items-center gap-4">
            <button
              onClick={resetTimer}
              className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-350 active:scale-95 transition shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer"
              title="Reset ticking countdown"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              id="btn-toggle-pomo"
              onClick={toggleTimer}
              className={`p-4 rounded-full text-white font-extrabold active:scale-95 transition shadow-sm cursor-pointer ${
                isActive 
                  ? 'bg-amber-600 hover:bg-amber-700' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <div className="flex flex-col gap-1.5 shrink-0 select-none">
              <button
                onClick={() => setIsTickSoundEnabled(!isTickSoundEnabled)}
                className={`p-1.5 rounded-md text-[10px] font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                  isTickSoundEnabled 
                    ? 'bg-indigo-50 border-indigo-150 text-indigo-660 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-400' 
                    : 'bg-transparent border-slate-200 text-slate-400 dark:border-slate-800'
                }`}
                title="Toggle ticking audio feedback"
              >
                {isTickSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />} Ticking
              </button>

              <button
                onClick={() => setIsChimeEnabled(!isChimeEnabled)}
                className={`p-1.5 rounded-md text-[10px] font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                  isChimeEnabled 
                    ? 'bg-indigo-50 border-indigo-150 text-indigo-660 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-400' 
                    : 'bg-transparent border-slate-200 text-slate-400 dark:border-slate-800'
                }`}
                title="Toggle end reward chime"
              >
                {isChimeEnabled ? <Music className="w-3.5 h-3.5" /> : <Music2 className="w-3.5 h-3.5" />} Reward Chime
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Custom Config & Stats */}
        <div className="space-y-6">
          
          {/* Custom config slider variables */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Presets configuration (Min)
            </h3>

            <div className="space-y-4.5">
              {/* Focus period */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Focus Duration</span>
                  <span className="text-[10px] text-slate-400">Standard: 25 mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={focusConfig <= 5}
                    onClick={() => setFocusConfig(prev => Math.max(5, prev - 5))}
                    className="p-1 rounded border border-slate-200 text-slate-500 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-xs font-bold text-slate-850 dark:text-slate-200 w-6 text-center">{focusConfig}</span>
                  <button 
                    disabled={focusConfig >= 90}
                    onClick={() => setFocusConfig(prev => Math.min(90, prev + 5))}
                    className="p-1 rounded border border-slate-200 text-slate-500 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Short break */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Short Break</span>
                  <span className="text-[10px] text-slate-400">Standard: 5 mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={shortConfig <= 1}
                    onClick={() => setShortConfig(prev => Math.max(1, prev - 1))}
                    className="p-1 rounded border border-slate-200 text-slate-500 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-xs font-bold text-slate-850 dark:text-slate-200 w-6 text-center">{shortConfig}</span>
                  <button 
                    disabled={shortConfig >= 25}
                    onClick={() => setShortConfig(prev => Math.min(25, prev + 1))}
                    className="p-1 rounded border border-slate-200 text-slate-500 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Long break */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Long Break</span>
                  <span className="text-[10px] text-slate-400">Standard: 15 mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={longConfig <= 5}
                    onClick={() => setLongConfig(prev => Math.max(5, prev - 5))}
                    className="p-1 rounded border border-slate-200 text-slate-500 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-xs font-bold text-slate-850 dark:text-slate-200 w-6 text-center">{longConfig}</span>
                  <button 
                    disabled={longConfig >= 60}
                    onClick={() => setLongConfig(prev => Math.min(60, prev + 5))}
                    className="p-1 rounded border border-slate-200 text-slate-500 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Pomodoro Accomplishments */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm text-slate-700 dark:text-slate-200 space-y-3.5">
            <h3 className="font-bold text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5 text-slate-400">
              <Coffee className="w-4 h-4 text-indigo-600" /> Focus stats tracking
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">Slots Checked Off</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{sessionsCount} focus sessions</span>
              </div>

              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">Cumulative Duration</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{totalMins} minutes online</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-sans italic">
              *All focus parameters are synced to Local Storage on successful session complete.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
