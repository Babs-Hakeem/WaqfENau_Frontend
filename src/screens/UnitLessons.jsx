import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, Lock, Clock, Zap,
  BookOpen, Star, Play, Trophy
} from 'lucide-react';
import api from '../api/axios';

export default function UnitLessons() {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [unitRes, lessonsRes] = await Promise.all([
          api.get(`/admin/units/${unitId}`),   // get unit info
          api.get(`/lessons/unit/${unitId}`),   // get lessons with lock/complete status
        ]);
        setUnit(unitRes.data);
        setLessons(lessonsRes.data);
      } catch (e) {
        console.error(e);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [unitId, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  const completed = lessons.filter(l => l.isCompleted).length;
  const total = lessons.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = completed === total && total > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white px-4 pt-4 pb-8 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full" />

        <div className="relative z-10 max-w-lg mx-auto">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-green-200 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to path</span>
          </button>

          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-green-200 text-xs font-bold uppercase tracking-wider mb-0.5">
                {unit?.category}
              </p>
              <h1 className="text-2xl font-extrabold leading-tight">{unit?.title}</h1>
              {unit?.description && (
                <p className="text-green-200 text-sm mt-1">{unit.description}</p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-white/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">
                {allDone ? '🎉 Unit Complete!' : `${completed} of ${total} lessons done`}
              </span>
              <span className="text-sm font-extrabold">{progressPct}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-xs font-bold text-green-200">{unit?.xpReward} XP on completion</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-green-200" />
                <span className="text-xs font-bold text-green-200">
                  {lessons.reduce((sum, l) => sum + (l.estimatedMinutes || 5), 0)} min total
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons list */}
      <div className="max-w-lg mx-auto px-4 -mt-4">
        {lessons.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm mt-4">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No lessons yet</p>
            <p className="text-sm text-gray-400 mt-1">The admin hasn't added lessons to this unit yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const state = lesson.isCompleted ? 'completed'
                : lesson.isLocked ? 'locked'
                : 'available';

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}>

                  <button
                    onClick={() => state !== 'locked' && navigate(`/lesson/${lesson.id}`)}
                    disabled={state === 'locked'}
                    className={`w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border-2 transition-all text-left
                      ${state === 'completed' ? 'border-primary/30 hover:border-primary' :
                        state === 'available' ? 'border-transparent hover:border-primary/30 hover:shadow-md' :
                        'border-transparent opacity-60 cursor-not-allowed'}`}>

                    {/* Status icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
                      ${state === 'completed' ? 'bg-primary' :
                        state === 'available' ? 'bg-primary-light' :
                        'bg-gray-100'}`}>
                      {state === 'completed' && <CheckCircle2 className="w-7 h-7 text-white" strokeWidth={2.5} />}
                      {state === 'available' && <Play className="w-7 h-7 text-primary fill-primary ml-0.5" />}
                      {state === 'locked' && <Lock className="w-6 h-6 text-gray-400" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`font-extrabold text-sm ${state === 'locked' ? 'text-gray-400' : 'text-dark'}`}>
                          {lesson.title}
                        </p>
                        {state === 'completed' && lesson.score != null && (
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full
                            ${lesson.score >= 90 ? 'bg-amber/20 text-amber-600' :
                              lesson.score >= 70 ? 'bg-primary-light text-primary' :
                              'bg-gray-100 text-gray-500'}`}>
                            {lesson.score >= 90 ? '🥇' : lesson.score >= 70 ? '🥈' : '🥉'} {lesson.score}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lesson.estimatedMinutes || 5} min
                        </span>
                        <span className="text-xs text-primary font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3" /> +{lesson.xpReward} XP
                        </span>
                      </div>
                    </div>

                    {/* Right arrow / replay */}
                    {state === 'completed' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    )}
                    {state === 'available' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Unit complete celebration */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 bg-gradient-to-r from-amber to-orange-400 rounded-2xl p-5 text-white text-center">
            <div className="text-4xl mb-2">🏆</div>
            <p className="font-extrabold text-lg">Unit Complete!</p>
            <p className="text-amber-100 text-sm mt-1">You've finished all lessons in this unit.</p>
            <button onClick={() => navigate('/')}
              className="mt-3 h-10 px-6 bg-white text-amber-600 font-extrabold text-sm rounded-full hover:bg-amber-50 transition-colors">
              Back to Path
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
