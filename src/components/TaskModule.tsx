import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  Calendar, 
  AlertTriangle, 
  ChevronDown, 
  Tag, 
  RotateCcw,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface TaskModuleProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onEditTask: (id: string, updated: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  isQuickModalOpen?: boolean;
  onCloseQuickModal?: () => void;
  globalSearch?: string;
  onSearchChange?: (val: string) => void;
}

export default function TaskModule({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  isQuickModalOpen = false,
  onCloseQuickModal,
  globalSearch,
  onSearchChange
}: TaskModuleProps) {
  // Filters & State
  const [localSearch, setLocalSearch] = useState('');
  const search = globalSearch !== undefined ? globalSearch : localSearch;
  const setSearch = onSearchChange !== undefined ? onSearchChange : setLocalSearch;
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'alphabetical'>('dueDate');

  // Modal / Form state (New or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');

  // Extract unique subjects
  const subjects = useMemo(() => {
    const list = new Set<string>();
    tasks.forEach(t => {
      if (t.subject) list.add(t.subject.trim());
    });
    return Array.from(list);
  }, [tasks]);

  // Form actions
  const openAddForm = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle('');
    setDescription('');
    setSubject('');
    setPriority('medium');
    setDueDate('');
    setIsModalOpen(true);
  };

  const openEditForm = (task: Task) => {
    setIsEditing(true);
    setEditId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setSubject(task.subject);
    setPriority(task.priority);
    setDueDate(task.dueDate || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      priority,
      dueDate: dueDate || undefined,
      status: 'pending' as const
    };

    if (isEditing && editId) {
      onEditTask(editId, taskPayload);
    } else {
      onAddTask(taskPayload);
    }

    setIsModalOpen(false);
    if (onCloseQuickModal) onCloseQuickModal();
  };

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearch('');
    setSubjectFilter('all');
    setPriorityFilter('all');
    setStatusFilter('all');
    setSortBy('dueDate');
  };

  // Process sorting / filtering
  const processedTasks = useMemo(() => {
    let list = [...tasks];

    // Filter by search text
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) || 
        t.subject.toLowerCase().includes(q)
      );
    }

    // Filter by subject
    if (subjectFilter !== 'all') {
      list = list.filter(t => t.subject.toLowerCase() === subjectFilter.toLowerCase());
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      list = list.filter(t => t.priority === priorityFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      list = list.filter(t => t.status === statusFilter);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    return list;
  }, [tasks, search, subjectFilter, priorityFilter, statusFilter, sortBy]);

  // Handle outside quick modal trigger from dashboard
  React.useEffect(() => {
    if (isQuickModalOpen) {
      openAddForm();
    }
  }, [isQuickModalOpen]);

  const priorityColors = {
    high: 'text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20',
    medium: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
    low: 'text-zinc-500 bg-zinc-50 border-zinc-100 dark:text-zinc-400 dark:bg-zinc-800/10 dark:border-zinc-800/20'
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wider font-display">Task Deliverables</h1>
          <p className="text-xs text-slate-400">Track homework, subjects, and study tasks.</p>
        </div>
        <button
          id="btn-create-task"
          onClick={openAddForm}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition text-xs font-bold shadow-sm active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Task
        </button>
      </div>

      {/* Search and Filters Hub */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm space-y-4">
        
        {/* Search Input Bar */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          <input
            id="sh-task-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, deliverables, projects..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-full text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          />
        </div>

        {/* Dynamic Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Filter by Subject */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Tag className="w-3 h-3" /> Subject
            </label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-650 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
            >
              <option value="all">📁 All Subjects</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Filter by Priority */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-650 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
            >
              <option value="all">⚡ All Priorities</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-650 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
            >
              <option value="all">🔄 All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Sort By criteria */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> Sort Sequence
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-650 dark:text-slate-355 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
            >
              <option value="dueDate">🗓️ Calendar Deadline</option>
              <option value="priority">🔥 High Priority First</option>
              <option value="alphabetical">🔤 Alphabetical (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Search feedback & parameters reset */}
        {(search || subjectFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
              Filtered matches: {processedTasks.length} out of {tasks.length} tasks
            </span>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-[10px] uppercase font-bold text-slate-450 hover:text-indigo-600 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Task Queue Display */}
      <div className="space-y-4">
        {processedTasks.length > 0 ? (
          processedTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            
            return (
              <div 
                key={task.id}
                className={`relative overflow-hidden rounded-xl border p-4 transition duration-200 flex items-start gap-4 ${
                  isCompleted 
                    ? 'border-slate-100 dark:border-[#1e293b] bg-slate-50/50 dark:bg-slate-900/10' 
                    : 'border-slate-200 dark:border-slate-850 bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Checkbox Trigger */}
                <button
                  onClick={() => onEditTask(task.id, { status: isCompleted ? 'pending' : 'completed' })}
                  className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition cursor-pointer ${
                    isCompleted 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'border-slate-300 hover:border-indigo-600 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                {/* Info block */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`font-bold text-xs leading-tight text-slate-800 dark:text-slate-100 ${
                      isCompleted ? 'line-through text-slate-400 dark:text-slate-500 font-medium' : ''
                    }`}>
                      {task.title}
                    </h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {task.subject}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className={`text-xs leading-relaxed text-slate-505 dark:text-slate-400 ${
                      isCompleted ? 'opacity-50' : ''
                    }`}>
                      {task.description}
                    </p>
                  )}

                  {/* Due Date Badge */}
                  {task.dueDate && (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                      <Calendar className="w-3.5 h-3.5" /> Due on {task.dueDate}
                    </div>
                  )}
                </div>

                {/* Action button cluster */}
                <div className="flex gap-1.5 hover-actions self-center shrink-0">
                  <button
                    onClick={() => openEditForm(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Edit study task"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Delete study task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-zinc-800 py-12 text-center">
            <div className="max-w-xs mx-auto space-y-2">
              <SlidersHorizontal className="w-8 h-8 text-neutral-300 dark:text-zinc-700 mx-auto" />
              <p className="text-sm font-semibold text-neutral-600 dark:text-zinc-300">No matching study tasks found.</p>
              <p className="text-xs text-neutral-400">Adjust your keyword query filters above or add a fresh assignment.</p>
              <button
                onClick={openAddForm}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-500 font-bold hover:underline"
              >
                Create your first task now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Creation & Modification modal drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg overflow-hidden bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-5 py-4.5 border-b border-neutral-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
              <h2 className="text-base font-bold font-display text-neutral-800 dark:text-zinc-100">
                {isEditing ? 'Modify Study Deliverable' : 'Establish New Deliverable'}
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseQuickModal) onCloseQuickModal();
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-zinc-200 hover:bg-neutral-150 dark:hover:bg-zinc-850"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              
              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 dark:text-zinc-400">Task Title <span className="text-rose-500">*</span></label>
                <input
                  id="task-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Read Physics Chapter 3 summary"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-neutral-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
              </div>

              {/* Subject Tag */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 dark:text-zinc-400">Subject / Category <span className="text-rose-500">*</span></label>
                <input
                  id="task-subject-input"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics, Computer Science, Biology"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-neutral-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
              </div>

              {/* Task Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 dark:text-zinc-400">Task Description</label>
                <textarea
                  id="task-desc-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize instructions, practice questions, pages numbers..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-neutral-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
              </div>

              {/* Double column for urgency and due date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Priority Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-zinc-400">Priority Level</label>
                  <select
                    id="task-priority-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-neutral-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                  >
                    <option value="high">🔴 High Urgency</option>
                    <option value="medium">🟡 Medium Urgency</option>
                    <option value="low">🟡 Low / Routine</option>
                  </select>
                </div>

                {/* Due Date scheduling */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-zinc-400">Calendar Due Date</label>
                  <input
                    id="task-date-input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-neutral-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onCloseQuickModal) onCloseQuickModal();
                  }}
                  className="px-4.5 py-2 text-sm font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-zinc-250 hover:bg-neutral-100 dark:hover:bg-zinc-850 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  id="task-submit-btn"
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-md transition"
                >
                  {isEditing ? 'Save Changes' : 'Establish deliverable'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
