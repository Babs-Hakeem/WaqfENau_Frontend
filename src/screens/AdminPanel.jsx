import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChevronRight, ArrowLeft, Trash2, Eye, EyeOff,
  BookOpen, Layers, FileText, Zap, CheckCircle2, X, Save, AlertCircle
} from 'lucide-react';
import api from '../api/axios';

// ── Constants — must match backend enums exactly ───────────────────────────
const AGE_GROUPS = [
  { value: 'Children7_9',    label: 'Children (7-9)' },
  { value: 'Children10_12',  label: 'Children (10-12)' },
  { value: 'Teenagers13_15', label: 'Teenagers (13-15)' },
  { value: 'Youth16_Plus',   label: 'Youth (16+)' },
];

const CATEGORIES = [
  { value: 'Hadith',          label: 'Hadith' },
  { value: 'Salat',           label: 'Salat' },
  { value: 'Urdu',            label: 'Urdu' },
  { value: 'History',         label: 'History' },
  { value: 'QuranRecitation', label: 'Quran Recitation' },
];

const EXERCISE_TYPES = [
  { value: 'InfoCard',       label: 'Info Card (text/explanation)' },
  { value: 'MultipleChoice', label: 'Multiple Choice (4 options)' },
  { value: 'TrueFalse',      label: 'True / False' },
  { value: 'FillBlank',      label: 'Fill in the Blank' },
  { value: 'Arrange',        label: 'Arrange Words in Order' },
  { value: 'Match',          label: 'Match Pairs' },
];

// ── Shared UI components ───────────────────────────────────────────────────
function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-red/10 border border-red/20 rounded-xl p-3 mb-4">
      <AlertCircle className="w-4 h-4 text-red flex-shrink-0 mt-0.5" />
      <p className="text-red text-sm font-medium">{message}</p>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-extrabold text-dark text-lg">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-sm font-medium text-dark transition-colors";
const selectCls = "w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-sm font-medium text-dark bg-white transition-colors";
const textareaCls = "w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-sm font-medium text-dark transition-colors resize-none";

function Btn({ children, onClick, variant = 'primary', disabled, className = '' }) {
  const base = 'h-11 px-5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const styles = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/30',
    outline: 'border-2 border-primary text-primary hover:bg-primary-light',
    danger:  'bg-red/10 text-red hover:bg-red/20 border-2 border-red/20',
    ghost:   'bg-gray-100 text-gray-600 hover:bg-gray-200',
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

function Badge({ published }) {
  return (
    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full
      ${published ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'}`}>
      {published ? 'PUBLISHED' : 'DRAFT'}
    </span>
  );
}

// ── Exercise Builder ───────────────────────────────────────────────────────
function ExerciseBuilder({ lessonId, onBack }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    type: 'MultipleChoice', prompt: '', explanationText: '', xpReward: 5,
    options: [
      { text: '', isCorrect: true,  orderIndex: 0 },
      { text: '', isCorrect: false, orderIndex: 1 },
      { text: '', isCorrect: false, orderIndex: 2 },
      { text: '', isCorrect: false, orderIndex: 3 },
    ]
  });

  const load = async () => {
    setLoading(true);
    try { const r = await api.get(`/admin/lessons/${lessonId}/exercises`); setExercises(r.data); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [lessonId]);

  const resetForm = () => {
    setError('');
    setForm({
      type: 'MultipleChoice', prompt: '', explanationText: '', xpReward: 5,
      options: [
        { text: '', isCorrect: true,  orderIndex: 0 },
        { text: '', isCorrect: false, orderIndex: 1 },
        { text: '', isCorrect: false, orderIndex: 2 },
        { text: '', isCorrect: false, orderIndex: 3 },
      ]
    });
  };

  const handleTypeChange = (type) => {
    let options = [];
    if (type === 'MultipleChoice') options = [
      { text: '', isCorrect: true,  orderIndex: 0 },
      { text: '', isCorrect: false, orderIndex: 1 },
      { text: '', isCorrect: false, orderIndex: 2 },
      { text: '', isCorrect: false, orderIndex: 3 },
    ];
    if (type === 'TrueFalse') options = [
      { text: 'True',  isCorrect: true,  orderIndex: 0 },
      { text: 'False', isCorrect: false, orderIndex: 1 },
    ];
    if (type === 'FillBlank') options = [
      { text: '', isCorrect: true, orderIndex: 0 }
    ];
    if (type === 'Arrange') options = [
      { text: '', isCorrect: true, orderIndex: 0 },
      { text: '', isCorrect: true, orderIndex: 1 },
      { text: '', isCorrect: true, orderIndex: 2 },
    ];
    if (type === 'Match') options = [
      { text: '', isCorrect: true, orderIndex: 0, matchGroupId: 1 },
      { text: '', isCorrect: true, orderIndex: 1, matchGroupId: 1 },
      { text: '', isCorrect: true, orderIndex: 2, matchGroupId: 2 },
      { text: '', isCorrect: true, orderIndex: 3, matchGroupId: 2 },
    ];
    setForm(f => ({ ...f, type, options }));
  };

  const save = async () => {
    setError('');
    if (!form.prompt.trim()) { setError('Prompt is required'); return; }
    setSaving(true);
    try {
      await api.post('/admin/exercises', {
        lessonId,
        type: form.type,
        orderIndex: exercises.length + 1,
        prompt: form.prompt,
        explanationText: form.explanationText || null,
        xpReward: Number(form.xpReward),
        options: form.type === 'InfoCard' ? [] : form.options.map((o, i) => ({ ...o, orderIndex: i })),
      });
      setShowModal(false);
      resetForm();
      load();
    } catch (e) {
      setError(e.response?.data?.message || JSON.stringify(e.response?.data) || 'Failed to save exercise');
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this exercise?')) return;
    try { await api.delete(`/admin/exercises/${id}`); load(); } catch { }
  };

  const typeColors = {
    InfoCard: 'bg-blue-50 text-blue-600',
    MultipleChoice: 'bg-primary-light text-primary',
    TrueFalse: 'bg-amber/10 text-amber-600',
    FillBlank: 'bg-purple-50 text-purple-600',
    Arrange: 'bg-orange-50 text-orange-600',
    Match: 'bg-rose-50 text-rose-600',
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-dark mb-5 font-semibold text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Lessons
      </button>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-dark text-xl">Exercises</h2>
        <Btn onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Add Exercise
        </Btn>
      </div>

      {loading ? <p className="text-center py-10 text-gray-400">Loading...</p> : (
        <div className="space-y-3">
          {exercises.length === 0 && (
            <div className="text-center py-14 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <Zap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 font-semibold">No exercises yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Add Exercise" to build the first question</p>
            </div>
          )}
          {exercises.map((ex, i) => (
            <div key={ex.id} className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-extrabold text-gray-500 flex-shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1 ${typeColors[ex.type] || 'bg-gray-100 text-gray-500'}`}>{ex.type}</span>
                <p className="text-sm font-semibold text-dark leading-snug">{ex.prompt}</p>
                {ex.options?.length > 0 && <p className="text-xs text-gray-400 mt-1">{ex.options.length} options</p>}
              </div>
              <button onClick={() => del(ex.id)} className="w-8 h-8 rounded-lg bg-red/10 flex items-center justify-center hover:bg-red/20 flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5 text-red" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title="Add Exercise" onClose={() => setShowModal(false)}>
            <ErrorBox message={error} />

            <Field label="Exercise Type">
              <select className={selectCls} value={form.type} onChange={e => handleTypeChange(e.target.value)}>
                {EXERCISE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>

            <Field label="Prompt / Question">
              <textarea className={textareaCls} rows={3} value={form.prompt}
                onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                placeholder="e.g. What does Bismillah mean?" />
            </Field>

            {form.type === 'InfoCard' && (
              <Field label="Explanation Text (shown to student)">
                <textarea className={textareaCls} rows={4} value={form.explanationText}
                  onChange={e => setForm(f => ({ ...f, explanationText: e.target.value }))}
                  placeholder="The explanation text shown before the student continues..." />
              </Field>
            )}

            <Field label="XP Reward">
              <input type="number" className={inputCls} value={form.xpReward}
                onChange={e => setForm(f => ({ ...f, xpReward: e.target.value }))} />
            </Field>

            {form.type !== 'InfoCard' && (
              <Field label={
                form.type === 'FillBlank' ? 'Correct Answer' :
                form.type === 'Arrange'   ? 'Words in correct order (top = first)' :
                form.type === 'Match'     ? 'Pairs — same group number = correct match' :
                'Answer Options (click circle to mark correct)'
              }>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {form.type === 'MultipleChoice' && (
                        <button type="button"
                          onClick={() => setForm(f => ({ ...f, options: f.options.map((o, j) => ({ ...o, isCorrect: j === i })) }))}
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${opt.isCorrect ? 'bg-primary border-primary' : 'border-gray-300 hover:border-primary'}`} />
                      )}
                      {form.type === 'TrueFalse' && (
                        <button type="button"
                          onClick={() => setForm(f => ({ ...f, options: f.options.map((o, j) => ({ ...o, isCorrect: j === i })) }))}
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${opt.isCorrect ? 'bg-primary border-primary' : 'border-gray-300'}`} />
                      )}
                      {form.type === 'Match' && (
                        <span className="text-xs font-extrabold text-gray-400 w-8 text-center flex-shrink-0">G{opt.matchGroupId}</span>
                      )}
                      <input value={opt.text}
                        onChange={e => setForm(f => ({ ...f, options: f.options.map((o, j) => j === i ? { ...o, text: e.target.value } : o) }))}
                        placeholder={
                          form.type === 'FillBlank' ? 'Type the correct answer...' :
                          form.type === 'Arrange'   ? `Word / phrase ${i + 1}` :
                          form.type === 'Match'     ? (i % 2 === 0 ? `Left item ${Math.ceil((i+1)/2)}` : `Right item ${Math.ceil((i+1)/2)}`) :
                          `Option ${i + 1}${opt.isCorrect ? '  ✓ correct' : ''}`
                        }
                        className="flex-1 h-9 px-3 rounded-lg border-2 border-gray-200 focus:border-primary outline-none text-sm transition-colors" />
                    </div>
                  ))}
                  {form.type === 'Arrange' && (
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, options: [...f.options, { text: '', isCorrect: true, orderIndex: f.options.length }] }))}
                      className="text-xs text-primary font-bold flex items-center gap-1 mt-1 hover:underline">
                      <Plus className="w-3 h-3" /> Add word
                    </button>
                  )}
                </div>
              </Field>
            )}

            <div className="flex gap-3 pt-2">
              <Btn onClick={() => setShowModal(false)} variant="ghost" className="flex-1">Cancel</Btn>
              <Btn onClick={save} disabled={saving} className="flex-1">
                <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Exercise'}
              </Btn>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Lesson List ────────────────────────────────────────────────────────────
function LessonList({ unitId, onBack }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', xpReward: 10, estimatedMinutes: 5 });

  const load = async () => {
    setLoading(true);
    try { const r = await api.get(`/admin/units/${unitId}/lessons`); setLessons(r.data); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [unitId]);

  const save = async () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    try {
      await api.post('/admin/lessons', {
        title: form.title,
        description: form.description,
        unitId,
        orderIndex: lessons.length + 1,
        xpReward: Number(form.xpReward),
        estimatedMinutes: Number(form.estimatedMinutes),
      });
      setShowModal(false);
      setForm({ title: '', description: '', xpReward: 10, estimatedMinutes: 5 });
      load();
    } catch (e) {
      setError(e.response?.data?.message || JSON.stringify(e.response?.data) || 'Failed to save');
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this lesson and all its exercises?')) return;
    try { await api.delete(`/admin/lessons/${id}`); load(); } catch { }
  };

  if (activeLessonId) return <ExerciseBuilder lessonId={activeLessonId} onBack={() => setActiveLessonId(null)} />;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-dark mb-5 font-semibold text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Units
      </button>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-dark text-xl">Lessons</h2>
        <Btn onClick={() => { setError(''); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Add Lesson
        </Btn>
      </div>

      {loading ? <p className="text-center py-10 text-gray-400">Loading...</p> : (
        <div className="space-y-3">
          {lessons.length === 0 && (
            <div className="text-center py-14 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 font-semibold">No lessons yet</p>
              <p className="text-sm text-gray-400 mt-1">Add the first lesson to this unit</p>
            </div>
          )}
          {lessons.map((lesson, i) => (
            <div key={lesson.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-sm font-extrabold text-primary flex-shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dark text-sm">{lesson.title}</p>
                <p className="text-xs text-gray-400">{lesson.exerciseCount} exercises · {lesson.xpReward} XP · {lesson.estimatedMinutes} min</p>
              </div>
              <button onClick={() => setActiveLessonId(lesson.id)}
                className="h-8 px-3 bg-primary-light text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">
                Build
              </button>
              <button onClick={() => del(lesson.id)} className="w-8 h-8 rounded-lg bg-red/10 flex items-center justify-center hover:bg-red/20">
                <Trash2 className="w-3.5 h-3.5 text-red" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title="Add Lesson" onClose={() => setShowModal(false)}>
            <ErrorBox message={error} />
            <Field label="Lesson Title">
              <input className={inputCls} value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. How to make Wudu" />
            </Field>
            <Field label="Description (optional)">
              <textarea className={textareaCls} rows={2} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="XP Reward">
                <input type="number" className={inputCls} value={form.xpReward}
                  onChange={e => setForm(f => ({ ...f, xpReward: e.target.value }))} />
              </Field>
              <Field label="Est. Minutes">
                <input type="number" className={inputCls} value={form.estimatedMinutes}
                  onChange={e => setForm(f => ({ ...f, estimatedMinutes: e.target.value }))} />
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <Btn onClick={() => setShowModal(false)} variant="ghost" className="flex-1">Cancel</Btn>
              <Btn onClick={save} disabled={saving} className="flex-1">
                <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Lesson'}
              </Btn>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Unit List ──────────────────────────────────────────────────────────────
function UnitList({ sectionId, onBack }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeUnitId, setActiveUnitId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'Salat', xpReward: 100 });

  const load = async () => {
    setLoading(true);
    try { const r = await api.get(`/admin/sections/${sectionId}/units`); setUnits(r.data); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [sectionId]);

  const save = async () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    try {
      await api.post('/admin/units', {
        title: form.title,
        description: form.description,
        sectionId,
        category: form.category,
        orderIndex: units.length + 1,
        xpReward: Number(form.xpReward),
        guidebookContent: '',
      });
      setShowModal(false);
      setForm({ title: '', description: '', category: 'Salat', xpReward: 100 });
      load();
    } catch (e) {
      setError(e.response?.data?.message || JSON.stringify(e.response?.data) || 'Failed to save');
    } finally { setSaving(false); }
  };

  const togglePublish = async (unit) => {
    try {
      await api.post(unit.isActive ? `/admin/units/${unit.id}/unpublish` : `/admin/units/${unit.id}/publish`);
      load();
    } catch { }
  };

  const del = async (id) => {
    if (!confirm('Delete this unit and ALL its content?')) return;
    try { await api.delete(`/admin/units/${id}`); load(); } catch { }
  };

  if (activeUnitId) return <LessonList unitId={activeUnitId} onBack={() => setActiveUnitId(null)} />;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-dark mb-5 font-semibold text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Sections
      </button>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-dark text-xl">Units</h2>
        <Btn onClick={() => { setError(''); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Add Unit
        </Btn>
      </div>

      {loading ? <p className="text-center py-10 text-gray-400">Loading...</p> : (
        <div className="space-y-3">
          {units.length === 0 && (
            <div className="text-center py-14 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <Layers className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 font-semibold">No units yet</p>
              <p className="text-sm text-gray-400 mt-1">Add the first unit to this section</p>
            </div>
          )}
          {units.map((unit) => (
            <div key={unit.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-bold text-dark text-sm">{unit.title}</p>
                    <Badge published={unit.isActive} />
                  </div>
                  <p className="text-xs text-gray-400">{unit.category} · {unit.lessonCount} lessons · {unit.xpReward} XP</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveUnitId(unit.id)}
                  className="flex-1 h-9 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Lessons ({unit.lessonCount})
                </button>
                <button onClick={() => togglePublish(unit)}
                  className={`h-9 px-3 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors
                    ${unit.isActive ? 'bg-amber/10 text-amber-600 hover:bg-amber/20' : 'bg-primary-light text-primary hover:bg-primary hover:text-white'}`}>
                  {unit.isActive ? <><EyeOff className="w-3.5 h-3.5" /> Unpublish</> : <><Eye className="w-3.5 h-3.5" /> Publish</>}
                </button>
                <button onClick={() => del(unit.id)} className="w-9 h-9 rounded-xl bg-red/10 flex items-center justify-center hover:bg-red/20">
                  <Trash2 className="w-4 h-4 text-red" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title="Add Unit" onClose={() => setShowModal(false)}>
            <ErrorBox message={error} />
            <Field label="Unit Title">
              <input className={inputCls} value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Wudu & Salat" />
            </Field>
            <Field label="Description (optional)">
              <textarea className={textareaCls} rows={2} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </Field>
            <Field label="Category">
              <select className={selectCls} value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="XP Reward (on unit completion)">
              <input type="number" className={inputCls} value={form.xpReward}
                onChange={e => setForm(f => ({ ...f, xpReward: e.target.value }))} />
            </Field>
            <div className="flex gap-3 pt-2">
              <Btn onClick={() => setShowModal(false)} variant="ghost" className="flex-1">Cancel</Btn>
              <Btn onClick={save} disabled={saving} className="flex-1">
                <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Unit'}
              </Btn>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Section List ───────────────────────────────────────────────────────────
function SectionList({ onEnter }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', ageGroup: 'Teenagers13_15', orderIndex: 1 });

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/sections'); setSections(r.data); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    try {
      await api.post('/admin/sections', {
        title: form.title,
        description: form.description,
        ageGroup: form.ageGroup,
        orderIndex: Number(form.orderIndex),
      });
      setShowModal(false);
      setForm({ title: '', description: '', ageGroup: 'Teenagers13_15', orderIndex: sections.length + 2 });
      load();
    } catch (e) {
      setError(e.response?.data?.message || JSON.stringify(e.response?.data) || 'Failed to create section');
    } finally { setSaving(false); }
  };

  const togglePublish = async (section) => {
    try {
      await api.post(section.isActive ? `/admin/sections/${section.id}/unpublish` : `/admin/sections/${section.id}/publish`);
      load();
    } catch { }
  };

  const del = async (id) => {
    if (!confirm('Delete this section and ALL its content? This cannot be undone.')) return;
    try { await api.delete(`/admin/sections/${id}`); load(); } catch { }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-extrabold text-dark text-2xl">Content Manager</h2>
          <p className="text-gray-400 text-sm mt-0.5">Section → Unit → Lesson → Exercise</p>
        </div>
        <Btn onClick={() => { setError(''); setForm({ title: '', description: '', ageGroup: 'Teenagers13_15', orderIndex: sections.length + 1 }); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> New Section
        </Btn>
      </div>

      {loading ? <p className="text-center py-10 text-gray-400">Loading...</p> : (
        <div className="space-y-4">
          {sections.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <BookOpen className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-bold text-xl">No sections yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-5">Create your first section to start building content</p>
              <Btn onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Create First Section</Btn>
            </div>
          )}
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-extrabold text-dark">{section.title}</p>
                    <Badge published={section.isActive} />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {AGE_GROUPS.find(a => a.value === section.ageGroup)?.label || section.ageGroup}
                    </span>
                  </div>
                  {section.description && <p className="text-sm text-gray-500 mb-1">{section.description}</p>}
                  <p className="text-xs text-gray-400">{section.unitCount} unit{section.unitCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEnter(section.id)}
                  className="flex-1 h-10 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                  <ChevronRight className="w-4 h-4" /> Manage Units
                </button>
                <button onClick={() => togglePublish(section)}
                  className={`h-10 px-4 text-sm font-bold rounded-xl flex items-center gap-1.5 transition-colors
                    ${section.isActive ? 'bg-amber/10 text-amber-600 hover:bg-amber/20' : 'bg-primary-light text-primary hover:bg-primary hover:text-white'}`}>
                  {section.isActive ? <><EyeOff className="w-4 h-4" /> Unpublish</> : <><Eye className="w-4 h-4" /> Publish</>}
                </button>
                <button onClick={() => del(section.id)}
                  className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center hover:bg-red/20">
                  <Trash2 className="w-4 h-4 text-red" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title="Create New Section" onClose={() => setShowModal(false)}>
            <ErrorBox message={error} />
            <Field label="Section Title">
              <input className={inputCls} value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Section 1" />
            </Field>
            <Field label="Description">
              <input className={inputCls} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Foundations of Faith" />
            </Field>
            <Field label="Age Group">
              <select className={selectCls} value={form.ageGroup}
                onChange={e => setForm(f => ({ ...f, ageGroup: e.target.value }))}>
                {AGE_GROUPS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </Field>
            <Field label="Order (1 = first on path)">
              <input type="number" className={inputCls} value={form.orderIndex}
                onChange={e => setForm(f => ({ ...f, orderIndex: e.target.value }))} />
            </Field>
            <div className="flex gap-3 pt-2">
              <Btn onClick={() => setShowModal(false)} variant="ghost" className="flex-1">Cancel</Btn>
              <Btn onClick={save} disabled={saving} className="flex-1">
                <Save className="w-4 h-4" />{saving ? 'Creating...' : 'Create Section'}
              </Btn>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeSectionId, setActiveSectionId] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="sticky top-0 z-40 bg-white border-b-2 border-gray-100">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeSectionId && (
              <button onClick={() => setActiveSectionId(null)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <span className="font-extrabold text-dark text-lg">Admin Panel</span>
          </div>
          <button onClick={() => navigate('/')}
            className="text-xs font-bold text-gray-400 hover:text-primary transition-colors">
            View as Student →
          </button>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 pt-6">
        {activeSectionId
          ? <UnitList sectionId={activeSectionId} onBack={() => setActiveSectionId(null)} />
          : <SectionList onEnter={setActiveSectionId} />
        }
      </div>
    </div>
  );
}
