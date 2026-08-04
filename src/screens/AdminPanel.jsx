import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChevronRight, ArrowLeft, Trash2, Eye, EyeOff,
  BookOpen, Layers, FileText, Zap, CheckCircle2, X, Save
} from 'lucide-react';
import api from '../api/axios';

// ── Helpers ────────────────────────────────────────────────────────────────
const AGE_GROUPS = ['Children7_9', 'Children10_12', 'Teenagers13_15', 'Youth16_Plus'];
const CATEGORIES = ['Hadith', 'Salat', 'Urdu', 'History', 'QuranRecitation'];
const EXERCISE_TYPES = ['InfoCard', 'MultipleChoice', 'TrueFalse', 'FillBlank', 'Arrange', 'Match'];

function Badge({ published }) {
  return (
    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${published ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray'}`}>
      {published ? 'PUBLISHED' : 'DRAFT'}
    </span>
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
            <X className="w-4 h-4 text-gray" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray mb-1 uppercase tracking-wide">{label}</label>
      <input className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-sm font-medium text-dark transition-colors" {...props} />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray mb-1 uppercase tracking-wide">{label}</label>
      <select className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-sm font-medium text-dark bg-white transition-colors" {...props}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray mb-1 uppercase tracking-wide">{label}</label>
      <textarea className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none text-sm font-medium text-dark transition-colors resize-none" rows={3} {...props} />
    </div>
  );
}

function Btn({ children, onClick, variant = 'primary', disabled, className = '' }) {
  const base = 'h-11 px-5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50';
  const styles = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/30',
    outline: 'border-2 border-primary text-primary hover:bg-primary-light',
    danger: 'bg-red/10 text-red hover:bg-red/20 border-2 border-red/20',
    ghost: 'bg-gray-100 text-gray hover:bg-gray-200',
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>{children}</button>;
}

// ══════════════════════════════════════════════════════════════════════════════
// EXERCISE BUILDER
// ══════════════════════════════════════════════════════════════════════════════
function ExerciseBuilder({ lessonId, onBack }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'MultipleChoice', prompt: '', explanationText: '', xpReward: 5,
    options: [
      { text: '', isCorrect: true, orderIndex: 0 },
      { text: '', isCorrect: false, orderIndex: 1 },
      { text: '', isCorrect: false, orderIndex: 2 },
      { text: '', isCorrect: false, orderIndex: 3 },
    ]
  });

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get(`/admin/lessons/${lessonId}/exercises`); setExercises(r.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [lessonId]);

  const resetForm = () => setForm({
    type: 'MultipleChoice', prompt: '', explanationText: '', xpReward: 5,
    options: [
      { text: '', isCorrect: true, orderIndex: 0 },
      { text: '', isCorrect: false, orderIndex: 1 },
      { text: '', isCorrect: false, orderIndex: 2 },
      { text: '', isCorrect: false, orderIndex: 3 },
    ]
  });

  const handleTypeChange = (type) => {
    let options = [];
    if (type === 'MultipleChoice') options = [
      { text: '', isCorrect: true, orderIndex: 0 }, { text: '', isCorrect: false, orderIndex: 1 },
      { text: '', isCorrect: false, orderIndex: 2 }, { text: '', isCorrect: false, orderIndex: 3 },
    ];
    if (type === 'TrueFalse') options = [
      { text: 'True', isCorrect: true, orderIndex: 0 },
      { text: 'False', isCorrect: false, orderIndex: 1 },
    ];
    if (type === 'FillBlank') options = [{ text: '', isCorrect: true, orderIndex: 0 }];
    if (type === 'Arrange') options = [
      { text: '', isCorrect: true, orderIndex: 0 }, { text: '', isCorrect: true, orderIndex: 1 },
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
    if (!form.prompt.trim()) return;
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
      fetch();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const deleteExercise = async (id) => {
    if (!confirm('Delete this exercise?')) return;
    try { await api.delete(`/admin/exercises/${id}`); fetch(); } catch (e) { console.error(e); }
  };

  const typeColors = {
    InfoCard: 'bg-blue-50 text-blue-600', MultipleChoice: 'bg-primary-light text-primary',
    TrueFalse: 'bg-amber/10 text-amber', FillBlank: 'bg-purple-50 text-purple-600',
    Arrange: 'bg-orange-50 text-orange-600', Match: 'bg-rose-50 text-rose-600',
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-gray hover:text-dark mb-4 font-semibold text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Lessons
      </button>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-dark text-xl">Exercises</h2>
        <Btn onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Add Exercise
        </Btn>
      </div>

      {loading ? <div className="text-center py-10 text-gray">Loading...</div> : (
        <div className="space-y-3">
          {exercises.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <Zap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray font-semibold">No exercises yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Add Exercise" to create the first one</p>
            </div>
          )}
          {exercises.map((ex, i) => (
            <div key={ex.id} className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-extrabold text-gray flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${typeColors[ex.type] || 'bg-gray-100 text-gray'}`}>
                    {ex.type}
                  </span>
                </div>
                <p className="text-sm font-semibold text-dark leading-snug">{ex.prompt}</p>
                {ex.options?.length > 0 && (
                  <p className="text-xs text-gray mt-1">{ex.options.length} options</p>
                )}
              </div>
              <button onClick={() => deleteExercise(ex.id)}
                className="w-8 h-8 rounded-lg bg-red/10 flex items-center justify-center hover:bg-red/20 flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5 text-red" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title="Add Exercise" onClose={() => setShowModal(false)}>
            <Select label="Exercise Type" value={form.type}
              onChange={e => handleTypeChange(e.target.value)} options={EXERCISE_TYPES} />

            <Textarea label="Prompt / Question" value={form.prompt}
              onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
              placeholder="e.g. What does Bismillah mean?" />

            {form.type === 'InfoCard' && (
              <Textarea label="Explanation Text" value={form.explanationText}
                onChange={e => setForm(f => ({ ...f, explanationText: e.target.value }))}
                placeholder="The explanation shown to the student..." />
            )}

            <Input label="XP Reward" type="number" value={form.xpReward}
              onChange={e => setForm(f => ({ ...f, xpReward: e.target.value }))} />

            {/* Options */}
            {form.type !== 'InfoCard' && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray mb-2 uppercase tracking-wide">
                  {form.type === 'FillBlank' ? 'Correct Answer' :
                   form.type === 'Arrange' ? 'Words in correct order' :
                   form.type === 'Match' ? 'Pairs (same group = match)' : 'Options'}
                </label>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {form.type === 'MultipleChoice' && (
                        <button onClick={() => setForm(f => ({
                          ...f, options: f.options.map((o, j) => ({ ...o, isCorrect: j === i }))
                        }))}
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors
                            ${opt.isCorrect ? 'bg-primary border-primary' : 'border-gray-300'}`} />
                      )}
                      {form.type === 'Match' && (
                        <span className="text-xs font-bold text-gray w-6 text-center">G{opt.matchGroupId}</span>
                      )}
                      <input value={opt.text}
                        onChange={e => setForm(f => ({
                          ...f, options: f.options.map((o, j) => j === i ? { ...o, text: e.target.value } : o)
                        }))}
                        placeholder={
                          form.type === 'FillBlank' ? 'The correct answer...' :
                          form.type === 'Arrange' ? `Word ${i + 1}` :
                          form.type === 'Match' ? (i % 2 === 0 ? `Left item ${Math.ceil((i+1)/2)}` : `Right item ${Math.ceil((i+1)/2)}`) :
                          `Option ${i + 1}${opt.isCorrect ? ' ✓ correct' : ''}`
                        }
                        className="flex-1 h-9 px-3 rounded-lg border-2 border-gray-200 focus:border-primary outline-none text-sm transition-colors" />
                    </div>
                  ))}
                </div>
                {form.type === 'Arrange' && (
                  <button onClick={() => setForm(f => ({ ...f, options: [...f.options, { text: '', isCorrect: true, orderIndex: f.options.length }] }))}
                    className="mt-2 text-xs text-primary font-bold flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add word
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Btn onClick={() => setShowModal(false)} variant="ghost" className="flex-1">Cancel</Btn>
              <Btn onClick={save} disabled={saving} className="flex-1">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Exercise'}
              </Btn>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LESSON LIST
// ══════════════════════════════════════════════════════════════════════════════
function LessonList({ unitId, onBack }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', xpReward: 10, estimatedMinutes: 5 });

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get(`/admin/units/${unitId}/lessons`); setLessons(r.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [unitId]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await api.post('/admin/lessons', { ...form, unitId, orderIndex: lessons.length + 1, xpReward: Number(form.xpReward), estimatedMinutes: Number(form.estimatedMinutes) });
      setShowModal(false);
      setForm({ title: '', description: '', xpReward: 10, estimatedMinutes: 5 });
      fetch();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const deleteLesson = async (id) => {
    if (!confirm('Delete this lesson and all its exercises?')) return;
    try { await api.delete(`/admin/lessons/${id}`); fetch(); } catch (e) { console.error(e); }
  };

  if (activeLessonId) return <ExerciseBuilder lessonId={activeLessonId} onBack={() => setActiveLessonId(null)} />;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-gray hover:text-dark mb-4 font-semibold text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Units
      </button>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-dark text-xl">Lessons</h2>
        <Btn onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Add Lesson</Btn>
      </div>

      {loading ? <div className="text-center py-10 text-gray">Loading...</div> : (
        <div className="space-y-3">
          {lessons.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray font-semibold">No lessons yet</p>
              <p className="text-sm text-gray-400 mt-1">Add lessons to this unit</p>
            </div>
          )}
          {lessons.map((lesson, i) => (
            <div key={lesson.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-sm font-extrabold text-primary flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dark text-sm">{lesson.title}</p>
                <p className="text-xs text-gray">{lesson.exerciseCount} exercises · {lesson.xpReward} XP · {lesson.estimatedMinutes} min</p>
              </div>
              <button onClick={() => setActiveLessonId(lesson.id)}
                className="h-8 px-3 bg-primary-light text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">
                Build
              </button>
              <button onClick={() => deleteLesson(lesson.id)}
                className="w-8 h-8 rounded-lg bg-red/10 flex items-center justify-center hover:bg-red/20">
                <Trash2 className="w-3.5 h-3.5 text-red" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title="Add Lesson" onClose={() => setShowModal(false)}>
            <Input label="Lesson Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. How to make Wudu" />
            <Textarea label="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="XP Reward" type="number" value={form.xpReward} onChange={e => setForm(f => ({ ...f, xpReward: e.target.value }))} />
              <Input label="Est. Minutes" type="number" value={form.estimatedMinutes} onChange={e => setForm(f => ({ ...f, estimatedMinutes: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <Btn onClick={() => setShowModal(false)} variant="ghost" className="flex-1">Cancel</Btn>
              <Btn onClick={save} disabled={saving} className="flex-1"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Lesson'}</Btn>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// UNIT LIST
// ══════════════════════════════════════════════════════════════════════════════
function UnitList({ sectionId, onBack }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeUnitId, setActiveUnitId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'Salat', xpReward: 100 });

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get(`/admin/sections/${sectionId}/units`); setUnits(r.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [sectionId]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await api.post('/admin/units', { ...form, sectionId, orderIndex: units.length + 1, xpReward: Number(form.xpReward) });
      setShowModal(false);
      setForm({ title: '', description: '', category: 'Salat', xpReward: 100 });
      fetch();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const togglePublish = async (unit) => {
    try {
      const endpoint = unit.isActive ? `/admin/units/${unit.id}/unpublish` : `/admin/units/${unit.id}/publish`;
      await api.post(endpoint);
      fetch();
    } catch (e) { console.error(e); }
  };

  const deleteUnit = async (id) => {
    if (!confirm('Delete this unit and all its content?')) return;
    try { await api.delete(`/admin/units/${id}`); fetch(); } catch (e) { console.error(e); }
  };

  if (activeUnitId) return <LessonList unitId={activeUnitId} onBack={() => setActiveUnitId(null)} />;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-gray hover:text-dark mb-4 font-semibold text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Sections
      </button>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-dark text-xl">Units</h2>
        <Btn onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Add Unit</Btn>
      </div>

      {loading ? <div className="text-center py-10 text-gray">Loading...</div> : (
        <div className="space-y-3">
          {units.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <Layers className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray font-semibold">No units yet</p>
              <p className="text-sm text-gray-400 mt-1">Add units to this section</p>
            </div>
          )}
          {units.map((unit) => (
            <div key={unit.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-dark text-sm">{unit.title}</p>
                    <Badge published={unit.isActive} />
                  </div>
                  <p className="text-xs text-gray">{unit.category} · {unit.lessonCount} lessons · {unit.xpReward} XP</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setActiveUnitId(unit.id)}
                  className="flex-1 h-9 bg-primary-light text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Lessons
                </button>
                <button onClick={() => togglePublish(unit)}
                  className={`h-9 px-3 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors
                    ${unit.isActive ? 'bg-amber/10 text-amber hover:bg-amber/20' : 'bg-primary-light text-primary hover:bg-primary hover:text-white'}`}>
                  {unit.isActive ? <><EyeOff className="w-3.5 h-3.5" /> Unpublish</> : <><Eye className="w-3.5 h-3.5" /> Publish</>}
                </button>
                <button onClick={() => deleteUnit(unit.id)}
                  className="w-9 h-9 rounded-xl bg-red/10 flex items-center justify-center hover:bg-red/20">
                  <Trash2 className="w-3.5 h-3.5 text-red" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title="Add Unit" onClose={() => setShowModal(false)}>
            <Input label="Unit Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Wudu & Salat" />
            <Textarea label="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} options={CATEGORIES} />
            <Input label="XP Reward (on unit completion)" type="number" value={form.xpReward} onChange={e => setForm(f => ({ ...f, xpReward: e.target.value }))} />
            <div className="flex gap-3 pt-2">
              <Btn onClick={() => setShowModal(false)} variant="ghost" className="flex-1">Cancel</Btn>
              <Btn onClick={save} disabled={saving} className="flex-1"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Unit'}</Btn>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION LIST (ROOT VIEW)
// ══════════════════════════════════════════════════════════════════════════════
function SectionList({ onEnter }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', ageGroup: 'Teenagers13_15', orderIndex: 1 });

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get('/admin/sections'); setSections(r.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await api.post('/admin/sections', { ...form, orderIndex: Number(form.orderIndex) });
      setShowModal(false);
      setForm({ title: '', description: '', ageGroup: 'Teenagers13_15', orderIndex: sections.length + 1 });
      fetch();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const togglePublish = async (section) => {
    try {
      const endpoint = section.isActive ? `/admin/sections/${section.id}/unpublish` : `/admin/sections/${section.id}/publish`;
      await api.post(endpoint);
      fetch();
    } catch (e) { console.error(e); }
  };

  const deleteSection = async (id) => {
    if (!confirm('Delete this section and ALL its content?')) return;
    try { await api.delete(`/admin/sections/${id}`); fetch(); } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-extrabold text-dark text-2xl">Content Manager</h2>
          <p className="text-gray text-sm">Sections → Units → Lessons → Exercises</p>
        </div>
        <Btn onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> New Section</Btn>
      </div>

      {loading ? <div className="text-center py-10 text-gray">Loading...</div> : (
        <div className="space-y-3">
          {sections.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray font-bold text-lg">No sections yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Create your first section to get started</p>
              <Btn onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Create Section</Btn>
            </div>
          )}
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-extrabold text-dark">{section.title}</p>
                    <Badge published={section.isActive} />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {section.ageGroup}
                    </span>
                  </div>
                  {section.description && <p className="text-sm text-gray mb-1">{section.description}</p>}
                  <p className="text-xs text-gray">{section.unitCount} units</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => onEnter(section.id)}
                  className="flex-1 h-10 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                  <ChevronRight className="w-4 h-4" /> Manage Units
                </button>
                <button onClick={() => togglePublish(section)}
                  className={`h-10 px-4 text-sm font-bold rounded-xl flex items-center gap-1.5 transition-colors
                    ${section.isActive ? 'bg-amber/10 text-amber hover:bg-amber/20' : 'bg-primary-light text-primary hover:bg-primary hover:text-white'}`}>
                  {section.isActive ? <><EyeOff className="w-4 h-4" /> Unpublish</> : <><Eye className="w-4 h-4" /> Publish</>}
                </button>
                <button onClick={() => deleteSection(section.id)}
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
          <Modal title="Create Section" onClose={() => setShowModal(false)}>
            <Input label="Section Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Section 1" />
            <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Foundations of Faith" />
            <Select label="Age Group" value={form.ageGroup} onChange={e => setForm(f => ({ ...f, ageGroup: e.target.value }))} options={AGE_GROUPS} />
            <Input label="Order Index" type="number" value={form.orderIndex} onChange={e => setForm(f => ({ ...f, orderIndex: e.target.value }))} />
            <div className="flex gap-3 pt-2">
              <Btn onClick={() => setShowModal(false)} variant="ghost" className="flex-1">Cancel</Btn>
              <Btn onClick={save} disabled={saving} className="flex-1"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Create Section'}</Btn>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT ADMIN PANEL
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeSectionId, setActiveSectionId] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b-2 border-gray-100">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { if (activeSectionId) setActiveSectionId(null); else navigate('/'); }}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
              <ArrowLeft className="w-4 h-4 text-gray" />
            </button>
            <span className="font-extrabold text-dark text-lg">Admin Panel</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-primary" />
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
