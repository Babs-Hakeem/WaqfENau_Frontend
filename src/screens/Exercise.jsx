import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';
import InfoCard from '../components/exercises/InfoCard';
import MultipleChoice from '../components/exercises/MultipleChoice';
import TrueFalse from '../components/exercises/TrueFalse';
import FillBlank from '../components/exercises/FillBlank';
import Arrange from '../components/exercises/Arrange';
import Match from '../components/exercises/Match';
import LessonComplete from '../components/LessonComplete';

function HeartsDisplay({ count, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Heart key={i} className={`w-5 h-5 ${i < count ? 'text-red fill-red' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex-1">
      <motion.div className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full"
        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
    </div>
  );
}

function ResultBanner({ isCorrect, correctText, onNext }) {
  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25 }}
      className={`fixed bottom-0 left-0 right-0 z-50 p-5 ${isCorrect ? 'bg-primary-light border-t-4 border-primary' : 'bg-red/10 border-t-4 border-red'}`}>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-3">
          {isCorrect ? <CheckCircle className="w-7 h-7 text-primary" /> : <XCircle className="w-7 h-7 text-red" />}
          <div>
            <p className={`font-bold text-lg ${isCorrect ? 'text-primary-dark' : 'text-red'}`}>
              {isCorrect ? 'Correct! 🎉' : 'Incorrect'}
            </p>
            {!isCorrect && correctText && (
              <p className="text-sm text-gray">Answer: <span className="font-semibold text-dark">{correctText}</span></p>
            )}
          </div>
        </div>
        <button onClick={onNext}
          className={`w-full h-12 rounded-full font-bold text-white flex items-center justify-center gap-2 transition-colors
            ${isCorrect ? 'bg-primary hover:bg-primary-dark' : 'bg-red hover:bg-red/90'}`}>
          Continue <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

function NoHeartsModal({ nextRefillAt, onClose }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const update = () => {
      if (!nextRefillAt) return;
      const diff = new Date(nextRefillAt) - new Date();
      if (diff <= 0) { setTimeLeft('Refilling...'); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s}s`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [nextRefillAt]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
        <div className="text-5xl mb-3">💔</div>
        <h2 className="text-xl font-bold text-dark mb-2">Out of Hearts!</h2>
        <p className="text-gray text-sm mb-4">Next heart in <span className="font-bold text-red">{timeLeft}</span>. Hearts refill 1 every 30 minutes.</p>
        <button onClick={onClose} className="w-full h-12 rounded-full bg-gray-light text-dark font-semibold">Go Back</button>
      </motion.div>
    </motion.div>
  );
}

const ExerciseMap = { InfoCard, MultipleChoice, TrueFalse, FillBlank, Arrange, Match };

export default function Exercise() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [current, setCurrent] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [nextRefillAt, setNextRefillAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [showComplete, setShowComplete] = useState(false);
  const [completeData, setCompleteData] = useState(null);
  const [noHearts, setNoHearts] = useState(false);
  const [xpFloater, setXpFloater] = useState(null);
  const [answering, setAnswering] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [lessonRes, heartsRes] = await Promise.all([
          api.get(`/lessons/${lessonId}`),
          api.get('/me/hearts'),
        ]);
        setLesson(lessonRes.data);
        setExercises(lessonRes.data.exercises || []);
        setHearts(heartsRes.data.current ?? 5);
        setNextRefillAt(heartsRes.data.nextRefillAt);
      } catch { navigate('/'); }
      finally { setLoading(false); }
    };
    load();
  }, [lessonId, navigate]);

  const submitAnswer = useCallback(async (answer) => {
    if (answering || result) return;
    if (hearts <= 0) { setNoHearts(true); return; }
    setAnswering(true);
    try {
      const res = await api.post('/lessons/exercises/answer', {
        exerciseId: exercises[current].id,
        answer: String(answer),
      });
      const d = res.data;
      setHearts(d.heartsRemaining ?? hearts);
      setNextRefillAt(d.nextRefillAt ?? nextRefillAt);
      setResult({ isCorrect: d.isCorrect, correctText: d.correctAnswerText, xpEarned: d.xpEarned });
      if (d.isCorrect && d.xpEarned > 0) {
        setXpFloater({ xp: d.xpEarned, id: Date.now() });
        setTimeout(() => setXpFloater(null), 1200);
      }
    } catch (e) { console.error(e); }
    finally { setAnswering(false); }
  }, [answering, result, hearts, exercises, current, nextRefillAt]);

  const handleNext = useCallback(async () => {
    setResult(null);
    if (current + 1 >= exercises.length) {
      try {
        const res = await api.post('/lessons/complete', { lessonId });
        setCompleteData(res.data);
        setShowComplete(true);
      } catch { navigate('/'); }
      return;
    }
    setCurrent(c => c + 1);
  }, [current, exercises.length, lessonId, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  if (showComplete && completeData) return (
    <LessonComplete
      xpEarned={completeData.xpEarned}
      totalXp={completeData.totalXp}
      score={completeData.score}
      streak={completeData.currentStreak}
      unlockedAchievements={completeData.unlockedAchievements}
      onNextLesson={() => navigate('/')}
      onRetry={() => { setShowComplete(false); setCurrent(0); setResult(null); }}
    />
  );

  const exercise = exercises[current];
  const ExComponent = ExerciseMap[exercise?.type] || InfoCard;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300
      ${result?.isCorrect === true ? 'bg-primary-light' : result?.isCorrect === false ? 'bg-red/5' : 'bg-gray-light'}`}>

      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-light flex items-center justify-center">
            <X className="w-5 h-5 text-gray" />
          </button>
          <ProgressBar current={current} total={exercises.length} />
          <HeartsDisplay count={hearts} />
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-36">
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
            <ExComponent exercise={exercise} onAnswer={submitAnswer} disabled={!!result || answering} result={result} />
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {xpFloater && (
          <motion.div key={xpFloater.id} initial={{ opacity: 1, y: 0, x: '-50%' }}
            animate={{ opacity: 0, y: -60, x: '-50%' }} transition={{ duration: 1 }}
            className="fixed top-20 left-1/2 pointer-events-none z-50 font-bold text-primary text-xl">
            +{xpFloater.xp} XP ⚡
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && <ResultBanner isCorrect={result.isCorrect} correctText={result.correctText} onNext={handleNext} />}
      </AnimatePresence>

      <AnimatePresence>
        {noHearts && <NoHeartsModal nextRefillAt={nextRefillAt} onClose={() => navigate('/')} />}
      </AnimatePresence>
    </div>
  );
}
