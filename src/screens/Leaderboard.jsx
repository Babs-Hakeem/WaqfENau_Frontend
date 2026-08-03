import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Gem, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

const TABS = ['Branch', 'National', 'Friends'];

function EntryRow({ entry, index, isMe }) {
  const medalColors = { 0: 'bg-amber text-white', 1: 'bg-gray-300 text-white', 2: 'bg-orange-400 text-white' };
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-2xl mb-2 ${isMe ? 'bg-primary-light border-2 border-primary' : 'bg-white'} shadow-sm`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
        ${index < 3 ? medalColors[index] : 'bg-gray-light text-gray'}`}>
        {index < 3 ? ['🥇','🥈','🥉'][index] : entry.rank || index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${isMe ? 'text-primary-dark' : 'text-dark'}`}>
          {entry.memberName || entry.fullName} {isMe ? '(You)' : ''}
        </p>
        <p className="text-xs text-gray truncate">{entry.branchName || ''}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber" />
          <span className="text-xs font-medium text-dark">{entry.currentStreak || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Gem className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-dark">{entry.totalXp || entry.weeklyXp || 0}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const [tab, setTab] = useState('Branch');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const member = useAuthStore(s => s.member);

  useEffect(() => {
    setLoading(true);
    const endpoint = tab === 'Friends' ? '/me/friends/leaderboard' : `/leaderboard?scope=${tab}`;
    api.get(endpoint).then(r => setData(r.data)).catch(() => setData([])).finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="min-h-screen bg-gray-light pb-24">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 pt-3 pb-0">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-6 h-6 text-amber" />
            <h1 className="font-bold text-dark text-xl">Leaderboard</h1>
          </div>
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-t-xl transition-colors
                  ${tab === t ? 'bg-primary text-white' : 'text-gray hover:text-dark'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-3" />
            <p className="text-gray font-medium">No data yet</p>
            <p className="text-sm text-gray mt-1">
              {tab === 'Friends' ? 'Add friends to see their rankings' : 'Complete lessons to appear here'}
            </p>
          </div>
        ) : (
          data.map((entry, i) => (
            <EntryRow key={entry.memberId || i} entry={entry} index={i}
              isMe={entry.memberId === member?.id || entry.isMe} />
          ))
        )}
      </div>
    </div>
  );
}
