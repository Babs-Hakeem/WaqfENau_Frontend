import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

export default function Hearts() {
  const navigate = useNavigate();
  const [hearts, setHearts] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    api.get('/me/hearts').then(r => setHearts(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!hearts?.nextRefillAt) return;
    const update = () => {
      const diff = new Date(hearts.nextRefillAt) - new Date();
      if (diff <= 0) { setTimeLeft('Refilling...'); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s}s`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [hearts?.nextRefillAt]);

  const current = hearts?.current ?? 5;
  const max = hearts?.max ?? 5;

  return (
    <div className="min-h-screen bg-gray-light pb-24">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-light flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray" />
        </button>
        <h1 className="font-bold text-dark text-lg">Hearts</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
          className="w-28 h-28 bg-red/10 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-14 h-14 text-red fill-red" />
        </motion.div>

        <div className="flex gap-3 mb-6">
          {Array.from({ length: max }).map((_, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 + i * 0.1 }}>
              <Heart className={`w-10 h-10 ${i < current ? 'text-red fill-red' : 'text-gray-200 fill-gray-200'}`} />
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 w-full text-center shadow-sm">
          <p className="text-4xl font-bold text-dark mb-1">{current}<span className="text-gray text-2xl">/{max}</span></p>
          <p className="text-gray text-sm mb-4">Hearts remaining</p>

          {hearts?.isFull ? (
            <div className="bg-primary-light rounded-xl p-3">
              <p className="text-primary font-semibold text-sm">❤️ Hearts are full!</p>
            </div>
          ) : (
            <div className="bg-red/10 rounded-xl p-3">
              <p className="text-red font-semibold text-sm">Next heart in: {timeLeft}</p>
              <p className="text-gray text-xs mt-1">1 heart refills every 30 minutes</p>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-5 w-full mt-4 shadow-sm">
          <h3 className="font-bold text-dark mb-3">How Hearts Work</h3>
          <div className="space-y-2 text-sm text-gray">
            <p>• You start with 5 hearts</p>
            <p>• You lose 1 heart per wrong answer</p>
            <p>• Hearts refill automatically — 1 every 30 minutes</p>
            <p>• When all hearts are gone, you can't answer until one refills</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
