import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../api/axios';

export default function Streak() {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    api.get('/me/streak').then(r => setStreak(r.data)).catch(console.error);
  }, []);

  const s = streak || {};

  return (
    <div className="min-h-screen bg-gray-light pb-24">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-light flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray" />
        </button>
        <h1 className="font-bold text-dark text-lg">Streak</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        {/* Main streak */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber to-orange-400 rounded-2xl p-6 text-white text-center relative overflow-hidden">
          <div className="text-6xl mb-2">🔥</div>
          <p className="text-6xl font-bold">{s.currentStreak || 0}</p>
          <p className="text-amber/80 mt-1">Day Streak</p>
          {s.studiedToday && (
            <div className="mt-3 flex items-center justify-center gap-2 bg-white/20 rounded-xl px-4 py-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Studied today ✓</span>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Flame className="w-8 h-8 text-amber mx-auto mb-2" />
            <p className="text-2xl font-bold text-dark">{s.longestStreak || 0}</p>
            <p className="text-xs text-gray">Longest Streak</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Shield className="w-8 h-8 text-blue mx-auto mb-2" />
            <p className="text-2xl font-bold text-dark">{s.freezesAvailable || 0}</p>
            <p className="text-xs text-gray">Streak Freezes</p>
          </motion.div>
        </div>

        {/* Freeze info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue" />
            </div>
            <div>
              <p className="font-bold text-dark">Streak Freeze</p>
              <p className="text-xs text-gray">Protects your streak for 1 missed day</p>
            </div>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: Math.max(s.freezesAvailable || 0, 3) }).map((_, i) => (
              <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center
                ${i < (s.freezesAvailable || 0) ? 'bg-blue/10' : 'bg-gray-100'}`}>
                <Shield className={`w-5 h-5 ${i < (s.freezesAvailable || 0) ? 'text-blue' : 'text-gray-300'}`} />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray mt-3">Earn freezes by completing achievements and XP milestones.</p>
        </motion.div>
      </div>
    </div>
  );
}
