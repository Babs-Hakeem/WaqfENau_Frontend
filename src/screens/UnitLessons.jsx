import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, CheckCircle2, Star, Zap, BookOpen, Gem } from 'lucide-react';
import api from '../api/axios';

const ZIGZAG_X = [-70, -25, 25, 70, 25, -25];
const NODE_SIZE = 72;

// ── Lesson Node ─────────────────────────────────────────────────────────────
function LessonNode({ lesson, index, isNext }) {
  const navigate = useNavigate();
  const [popupOpen, setPopupOpen] = useState(false);

  const state = lesson.isCompleted ? 'completed' : lesson.isUnlocked ? (isNext ? 'current' : 'unlocked') : 'locked';
  const xOffset = ZIGZAG_X[index % ZIGZAG_X.length];

  const handleGo = () => navigate(`/lesson/${lesson.id}`);

  return (
    <div className="relative flex justify-center" style={{ height: `${NODE_SIZE + 56}px` }}>
      <div className="absolute flex flex-col items-center"
        style={{ left: `calc(50% + ${xOffset}px - ${NODE_SIZE / 2}px)`, top: '16px' }}>

        {state === 'current' && (
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="mb-2 bg-primary text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg relative">
            START
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-primary" />
          </motion.div>
        )}

        <motion.button
          whileHover={state !== 'locked' ? { scale: 1.08 } : {}}
          whileTap={state !== 'locked' ? { scale: 0.92 } : {}}
          onClick={() => state !== 'locked' && setPopupOpen(p => !p)}
          disabled={state === 'locked'}
          animate={state === 'current' ? {
            boxShadow: ['0 0 0 0px rgba(58,171,109,0.6)', '0 0 0 14px rgba(58,171,109,0)', '0 0 0 0px rgba(58,171,109,0)']
          } : {}}
          transition={state === 'current' ? { repeat: Infinity, duration: 2 } : {}}
          className={`relative flex items-center justify-center rounded-full
            ${state === 'locked'
              ? 'bg-[#e5e5e5] border-b-[5px] border-[#bbb] cursor-not-allowed'
              : 'bg-primary border-b-[5px] border-primary-dark shadow-lg shadow-primary/40 cursor-pointer'
            }`}
          style={{ width: NODE_SIZE, height: NODE_SIZE }}>
          {state === 'locked' && <Lock className="text-[#aaa]" style={{ width: 28, height: 28 }} />}
          {state === 'completed' && <CheckCircle2 className="text-white" style={{ width: 32, height: 32 }} strokeWidth={2.5} />}
          {(state === 'current' || state === 'unlocked') && <Star className="text-white fill-white" style={{ width: 30, height: 30 }} />}
          {state === 'completed' && (
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-amber rounded-full flex items-center justify-center shadow-md border-2 border-white">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
          )}
        </motion.button>

        <div className="mt-2 text-center max-w-[100px]">
          <p className={`text-xs font-bold leading-tight ${state === 'locked' ? 'text-gray-400' : 'text-dark'}`}>
            {lesson.title}
          </p>
        </div>

        <AnimatePresence>
          {popupOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.93 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 bg-primary rounded-2xl p-4 shadow-2xl"
              style={{ top: `${NODE_SIZE + 12}px`, width: '190px', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-primary" />
              <p className="text-white font-extrabold text-sm leading-tight mb-0.5">{lesson.title}</p>
              <p className="text-green-200 text-[11px] mb-3">+{lesson.xpReward} XP · {lesson.estimatedMinutes} min</p>
              <button onClick={handleGo}
                className="w-full h-9 bg-white text-primary font-extrabold text-sm rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-1.5">
                {state === 'completed' ? 'Practice' : 'Start'}
                <Zap className="w-3.5 h-3.5 text-primary" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Root Screen ───────────────────────────────────────────────────────────────
export default function UnitLessons() {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const unitSummary = location.state?.unit; // passed from Home when available — avoids an extra fetch

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      setError(false);
      try {
        const r = await api.get(`/me/units/${unitId}/lessons`);
        setLessons(r.data || []);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [unitId]);

  const nextIndex = lessons.findIndex(l => l.isUnlocked && !l.isCompleted);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b-2 border-gray-100">
        <div className="max-w-xl mx-auto px-6 h-16 flex items-center gap-3">
          <button onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-gray" />
          </button>
          <div className="min-w-0">
            <p className="font-extrabold text-dark truncate">{unitSummary?.title || 'Unit'}</p>
            {unitSummary && (
              <p className="text-xs text-gray">{unitSummary.category} · +{unitSummary.xpReward} XP total</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 pt-6">
        {error && (
          <div className="bg-red/10 border border-red/30 rounded-xl px-4 py-3 mb-6 text-sm text-red font-semibold">
            Couldn't load lessons for this unit. Pull to refresh or check your connection.
          </div>
        )}

        {!error && lessons.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray font-bold text-lg">No lessons in this unit yet</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon</p>
          </div>
        )}

        {lessons.length > 0 && (
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-[6px] -translate-x-1/2 bg-gray-200 rounded-full" />
            {lessons.map((lesson, idx) => (
              <LessonNode key={lesson.id} lesson={lesson} index={idx} isNext={idx === nextIndex} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
