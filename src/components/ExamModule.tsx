import React, { useState, useMemo } from 'react';
import { Exam } from '../types';
import { 
  Calendar, 
  Trash2, 
  Plus, 
  AlertCircle, 
  Flag, 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  Clock,
  ExternalLink,
  X
} from 'lucide-react';

interface ExamModuleProps {
  exams: Exam[];
  onAddExam: (exam: Omit<Exam, 'id'>) => void;
  onDeleteExam: (id: string) => void;
}

export default function ExamModule({
  exams,
  onAddExam,
  onDeleteExam
}: ExamModuleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const [expandedPast, setExpandedPast] = useState(false);

  // Calculate timelines
  const nowMidnight = new Date().setHours(0,0,0,0);

  const { upcomingExams, pastExams } = useMemo(() => {
    const upcoming: Exam[] = [];
    const past: Exam[] = [];

    exams.forEach(ex => {
      const examTime = new Date(ex.date).setHours(0,0,0,0);
      if (examTime >= nowMidnight) {
        upcoming.push(ex);
      } else {
        past.push(ex);
      }
    });

    // Sort upcoming (soonest first)
    upcoming.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Sort past (newest completed first)
    past.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { upcomingExams: upcoming, pastExams: past };
  }, [exams, nowMidnight]);

  // Highlight nearest upcoming exam
  const nearestExam = upcomingExams[0];

  const getDaysLeft = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - nowMidnight;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !date) return;

    onAddExam({
      name: name.trim(),
      subject: subject.trim(),
      date,
      notes: notes.trim()
    });

    // Reset Fields
    setName('');
    setSubject('');
    setDate('');
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title & Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-zinc-50 uppercase tracking-tight font-display">Exam countdown</h1>
          <p className="text-sm text-neutral-400">Track critical assessment milestones and plan revision sprints.</p>
        </div>
        <button
          id="btn-add-exam"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition text-sm font-semibold shadow-md active:scale-98"
        >
          <Plus className="w-4 h-4" /> Log Examination
        </button>
      </div>

      {/* Featured Nearest Exam Countdown block */}
      {nearestExam && (
        <div className="relative overflow-hidden rounded-xl bg-slate-800 dark:bg-slate-900 p-6 text-white shadow-sm">
          <div className="absolute right-4 top-4 opacity-10">
            <Clock className="w-24 h-24 stroke-[1]" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-extrabold bg-white/10 text-indigo-100 uppercase tracking-widest border border-white/10">
              <AlertCircle className="w-3.5 h-3.5 animate-pulse text-indigo-400" /> Critical academic milestone
            </span>

            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight font-display">{nearestExam.name}</h2>
              <p className="text-indigo-200 font-semibold text-xs leading-none">{nearestExam.subject}</p>
            </div>

            {nearestExam.notes && (
              <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-xl">
                Topics: {nearestExam.notes}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="bg-white/10 px-4 py-1.5 rounded-lg border border-white/10 min-w-[120px] text-center">
                <span className="block text-[9px] tracking-widest text-slate-300 font-bold uppercase">Time remaining</span>
                <span className="text-lg font-extrabold font-display text-white">
                  {getDaysLeft(nearestExam.date) === 0 ? 'TODAY' : 
                   getDaysLeft(nearestExam.date) === 1 ? '1 Day' : 
                   `${getDaysLeft(nearestExam.date)} Days`}
                </span>
              </div>

              <div className="bg-white/10 px-4 py-1.5 rounded-lg border border-white/10 min-w-[120px] text-center">
                <span className="block text-[9px] tracking-widest text-slate-300 font-bold uppercase">Target date</span>
                <span className="text-xs font-bold font-mono text-white">
                  {nearestExam.date}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Upcoming Exams vs Past Exams list */}
      <div className="grid grid-cols-1 gap-6">

        {/* Regular queue of upcoming examinations */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
            <h3 className="font-bold text-xs text-slate-400 dark:text-slate-550 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" /> Active Countdowns ({upcomingExams.length})
            </h3>
          </div>

          <div className="space-y-4">
            {upcomingExams.length > 0 ? (
              upcomingExams.map((ex) => {
                const daysVal = getDaysLeft(ex.date);
                return (
                  <div 
                    key={ex.id}
                    className="group border border-slate-100 dark:border-[#1e293b] rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/10 hover:border-indigo-200 dark:hover:border-indigo-950 transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded">
                          {ex.subject}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{ex.date}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-150 uppercase tracking-tight">{ex.name}</h4>
                      {ex.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-sans max-w-2xl">{ex.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 border-t border-dashed border-slate-100 dark:border-slate-800 md:border-none pt-3 md:pt-0">
                      <div className="text-right">
                        <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest">Countdown</span>
                        <span className={`text-xs font-bold font-display ${
                          daysVal <= 2 ? 'text-rose-600' : daysVal <= 5 ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300'
                        }`}>
                          {daysVal === 0 ? '⚠️ TODAY' : daysVal === 1 ? '⏳ 1 day' : `${daysVal} days left`}
                        </span>
                      </div>

                      <button
                        onClick={() => onDeleteExam(ex.id)}
                        className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-405 hover:text-rose-600 transition cursor-pointer"
                        title="Delete exam milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-400 dark:text-slate-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No active exam countdowns registered.</p>
                <p className="text-[11px] opacity-80 mt-1">Add upcoming midterms or revisions to display days-left notifications.</p>
              </div>
            )}
          </div>
        </div>

        {/* Accordian / collapsible panel of Completed / Expired past exams */}
        {pastExams.length > 0 && (
          <div className="rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/10 p-4">
            <button
              onClick={() => setExpandedPast(!expandedPast)}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-450 dark:text-slate-400 focus:outline-none cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <ChevronRight className={`w-4 h-4 transition ${expandedPast ? 'rotate-90 text-indigo-600' : ''}`} />
                Past Completed Examinations ({pastExams.length})
              </span>
              <span className="text-[9px] font-mono lowercase text-slate-400">archive database</span>
            </button>

            {expandedPast && (
              <div className="mt-4 space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                {pastExams.map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between text-xs p-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/65 rounded-xl">
                    <div>
                      <h5 className="font-bold text-slate-400 line-through uppercase tracking-tight">{ex.name}</h5>
                      <span className="text-[10px] text-slate-400">{ex.subject} — Concluded on {ex.date}</span>
                    </div>
                    <button
                      onClick={() => onDeleteExam(ex.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title="Purge archival history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Custom Modal for setting exam dates */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md overflow-hidden bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-2xl shadow-xl flex flex-col">
            
            <div className="px-5 py-4.5 border-b border-neutral-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
              <h2 className="text-base font-bold font-display text-neutral-800 dark:text-zinc-100">Register Exam Assessment</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="px-5 py-5 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 dark:text-zinc-400">Exam Title <span className="text-rose-500">*</span></label>
                <input
                  id="exam-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mathematics Midterm, Physics Final"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-neutral-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 dark:text-zinc-400">Subject Field <span className="text-rose-500">*</span></label>
                <input
                  id="exam-subject-input"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Computer Science, Chemistry"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-neutral-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 dark:text-zinc-400">Examination Date <span className="text-rose-500">*</span></label>
                <input
                  id="exam-date-input"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-neutral-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 dark:text-zinc-400">Study Guidelines / Topics covered</label>
                <textarea
                  id="exam-notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add topics: Linear recursion, organic formulas..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-neutral-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4.5 py-2 text-sm font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-zinc-250 hover:bg-neutral-100 dark:hover:bg-zinc-850 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  id="exam-submit-btn"
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-md transition"
                >
                  Confirm exam target
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
