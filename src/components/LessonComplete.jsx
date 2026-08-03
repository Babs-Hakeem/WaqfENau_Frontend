import { motion } from 'framer-motion';
import { Star, Trophy, Flame, Gem, ArrowRight, RotateCcw } from 'lucide-react';

export default function LessonComplete({ 
  xpEarned, 
  totalXp, 
  score, 
  streak, 
  unlockedAchievements, 
  onNextLesson, 
  onRetry 
}) {
  const getScoreColor = () => {
    if (score >= 90) return 'text-amber';
    if (score >= 70) return 'text-primary';
    return 'text-red';
  };

  const getScoreLabel = () => {
    if (score >= 90) return 'Excellent!';
    if (score >= 70) return 'Great job!';
    return 'Keep practicing!';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-gray-light flex flex-col"
    >
      <div className="bg-gradient-to-b from-primary to-primary-dark pt-12 pb-8 px-6 text-white text-center relative overflow-hidden">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="relative z-10"
        >
          <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Trophy className="w-12 h-12 text-amber fill-amber" />
          </div>
          <h1 className="text-3xl font-bold mb-1">{getScoreLabel()}</h1>
          <p className="text-primary-light">Lesson Complete</p>
        </motion.div>
        
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#E8F7EF" strokeWidth="8" />
              <motion.circle
                cx="60" cy="60" r="54" fill="none" stroke="#3AAB6D" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 54}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - score / 100) }}
                transition={{ duration: 1.5, delay: 0.5 }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor()}`}>{score}%</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Gem className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-dark">+{xpEarned}</p>
            <p className="text-xs text-gray">XP Earned</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Flame className="w-6 h-6 text-amber mx-auto mb-1" />
            <p className="text-2xl font-bold text-dark">{streak}</p>
            <p className="text-xs text-gray">Day Streak</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Star className="w-6 h-6 text-amber mx-auto mb-1" />
            <p className="text-2xl font-bold text-dark">{totalXp}</p>
            <p className="text-xs text-gray">Total XP</p>
          </motion.div>
        </div>

        {unlockedAchievements?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mb-6">
            <h3 className="text-sm font-bold text-dark mb-3">Achievements Unlocked</h3>
            {unlockedAchievements.map((achievement, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + idx * 0.1 }}
                className="bg-amber/10 border border-amber/20 rounded-xl p-3 flex items-center gap-3 mb-2">
                <span className="text-2xl">{typeof achievement === 'string' ? '🏆' : achievement.iconUrl || '🏆'}</span>
                <div>
                  <p className="font-bold text-dark text-sm">{typeof achievement === 'string' ? achievement : achievement.name}</p>
                  <p className="text-xs text-gray">{typeof achievement === 'string' ? 'New achievement!' : achievement.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="px-6 pb-6 pt-2 bg-white border-t border-gray-100">
        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          whileTap={{ scale: 0.98 }} onClick={onNextLesson}
          className="w-full h-[52px] bg-primary hover:bg-primary-dark text-white font-bold rounded-button flex items-center justify-center gap-2 transition-colors mb-3">
          Continue
          <ArrowRight className="w-5 h-5" />
        </motion.button>
        
        {score < 70 && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            whileTap={{ scale: 0.98 }} onClick={onRetry}
            className="w-full h-[44px] text-gray font-medium flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Retry Lesson
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}