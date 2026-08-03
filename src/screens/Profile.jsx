import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Heart, Gem, Star, Target, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

const GOALS = [5, 10, 15, 20];

export default function Profile() {
  const navigate = useNavigate();
  const member = useAuthStore(s => s.member);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    api.get('/me/profile').then(r => setProfile(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const setGoal = async (min) => {
    setSavingGoal(true);
    try {
      await api.patch('/me/daily-goal', { goalMinutes: min });
      setProfile(p => ({ ...p, dailyGoalMinutes: min }));
    } catch (e) { console.error(e); }
    finally { setSavingGoal(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  const p = profile || {};

  return (
    <div className="min-h-screen bg-gray-light pb-24">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-light flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray" />
        </button>
        <h1 className="font-bold text-dark text-lg">My Profile</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Avatar card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5" />
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mx-auto mb-3">
            {p.firstName?.[0]}{p.lastName?.[0]}
          </div>
          <h2 className="text-xl font-bold">{p.firstName} {p.lastName}</h2>
          <p className="text-primary-light text-sm">{p.branchName}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">Level {p.currentLevel}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{p.role}</span>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Gem, label: 'Total XP', value: p.totalXp || 0, color: 'text-primary', bg: 'bg-primary-light' },
            { icon: Flame, label: 'Streak', value: p.streak?.currentStreak || 0, color: 'text-amber', bg: 'bg-amber/10' },
            { icon: Star, label: 'Lessons', value: p.lessonsCompleted || 0, color: 'text-blue', bg: 'bg-blue/10' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-xl font-bold text-dark">{s.value}</p>
              <p className="text-xs text-gray">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Hearts */}
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          onClick={() => navigate('/hearts')}
          className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red/10 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-red fill-red" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-dark">Hearts</p>
              <p className="text-xs text-gray">{p.hearts?.current ?? 5}/{p.hearts?.max ?? 5} remaining</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray" />
        </motion.button>

        {/* Daily goal */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-dark">Daily Goal</p>
              <p className="text-xs text-gray">Current: {p.dailyGoalMinutes || 10} minutes</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {GOALS.map(g => (
              <button key={g} onClick={() => setGoal(g)} disabled={savingGoal}
                className={`h-12 rounded-xl font-bold text-sm transition-all
                  ${(p.dailyGoalMinutes || 10) === g ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-gray-light text-gray hover:bg-primary-light hover:text-primary'}`}>
                {g}m
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
