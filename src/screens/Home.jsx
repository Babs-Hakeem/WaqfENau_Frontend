import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import {
  Flame, Heart, Gem, BookOpen, Lock, CheckCircle2,
  Home as HomeIcon, Trophy, Users, User,
  LogOut, X, Star, Shield, ChevronRight, Zap, Sparkles, Target, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_PATH = [
  {
    id: 'sec-1', title: 'Section 1', description: 'Foundations of Faith',
    ageGroup: 'Teenagers13_15', orderIndex: 1,
    units: [
      { id: 'u1', title: 'Wudu & Salat', category: 'Salat', xpReward: 100, totalLessons: 5, completedLessons: 5, progressPercent: 100, isUnlocked: true, isCompleted: true },
      { id: 'u2', title: 'The Five Pillars', category: 'Hadith', xpReward: 120, totalLessons: 6, completedLessons: 3, progressPercent: 50, isUnlocked: true, isCompleted: false },
      { id: 'u3', title: 'Islamic History', category: 'History', xpReward: 150, totalLessons: 8, completedLessons: 0, progressPercent: 0, isUnlocked: false, isCompleted: false },
      { id: 'u4', title: 'The Holy Quran', category: 'Quran', xpReward: 200, totalLessons: 10, completedLessons: 0, progressPercent: 0, isUnlocked: false, isCompleted: false },
      { id: 'u5', title: 'Names of Allah', category: 'Hadith', xpReward: 120, totalLessons: 5, completedLessons: 0, progressPercent: 0, isUnlocked: false, isCompleted: false },
    ]
  },
  {
    id: 'sec-2', title: 'Section 2', description: 'Character & Morals',
    ageGroup: 'Teenagers13_15', orderIndex: 2,
    units: [
      { id: 'u6', title: 'Akhlaq', category: 'Character', xpReward: 100, totalLessons: 5, completedLessons: 0, progressPercent: 0, isUnlocked: false, isCompleted: false },
      { id: 'u7', title: 'Respect & Manners', category: 'Character', xpReward: 100, totalLessons: 4, completedLessons: 0, progressPercent: 0, isUnlocked: false, isCompleted: false },
      { id: 'u8', title: 'Honesty & Truth', category: 'Hadith', xpReward: 110, totalLessons: 5, completedLessons: 0, progressPercent: 0, isUnlocked: false, isCompleted: false },
    ]
  }
];

// Zigzag offsets — left of center, center, right of center
const ZIGZAG_X = [-80, -30, 30, 80, 30, -30];
const NODE_SIZE = 80;

// ── Top Bar ───────────────────────────────────────────────────────────────────
function TopBar({ member, hearts, streak, xp, onProfileClick }) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b-2 border-gray-100">
      <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between gap-3">
        <button className="flex items-center gap-2 px-4 h-10 rounded-2xl bg-orange-50 border-2 border-orange-200 hover:bg-orange-100 transition-colors">
          <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
          <span className="font-extrabold text-orange-500 text-base">{streak?.currentStreak || 0}</span>
        </button>
        <button className="flex items-center gap-2 px-4 h-10 rounded-2xl bg-rose-50 border-2 border-rose-200 hover:bg-rose-100 transition-colors">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          <span className="font-extrabold text-rose-500 text-base">{hearts?.current ?? 5}</span>
        </button>
        <button className="flex items-center gap-2 px-4 h-10 rounded-2xl bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100 transition-colors">
          <Gem className="w-5 h-5 text-emerald-500" />
          <span className="font-extrabold text-emerald-600 text-base">{xp || 0}</span>
        </button>
        <button onClick={onProfileClick}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-extrabold text-base flex items-center justify-center ring-2 ring-primary/30 hover:ring-4 transition-all shadow-md">
          {member?.firstName?.[0]}{member?.lastName?.[0]}
        </button>
      </div>
    </div>
  );
}

// ── Unit Node ─────────────────────────────────────────────────────────────────
function UnitNode({ unit, index }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const nodeRef = useRef(null);
  const navigate = useNavigate();

  const state = unit.isCompleted ? 'completed'
    : (unit.isUnlocked && unit.progressPercent > 0) ? 'progress'
    : unit.isUnlocked ? 'current'
    : 'locked';

  const xOffset = ZIGZAG_X[index % ZIGZAG_X.length];

  useEffect(() => {
    if (!popupOpen) return;
    const handleClick = (e) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target)) setPopupOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [popupOpen]);

  const handleStart = () => {
    setPopupOpen(false);
    navigate(`/unit/${unit.id}`, { state: { unit } });
  };

  return (
    <div className="relative flex justify-center" style={{ height: `${NODE_SIZE + 60}px` }}>
      {/* Node positioned with zigzag offset */}
      <div ref={nodeRef} className="absolute flex flex-col items-center"
        style={{ left: `calc(50% + ${xOffset}px - ${NODE_SIZE / 2}px)`, top: '20px' }}>

        {/* START bounce label */}
        {state === 'current' && (
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="mb-2 bg-primary text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg relative">
            START
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary" />
          </motion.div>
        )}

        {/* The actual node circle */}
        <motion.button
          whileHover={state !== 'locked' ? { scale: 1.1 } : {}}
          whileTap={state !== 'locked' ? { scale: 0.92 } : {}}
          onClick={() => state !== 'locked' && setPopupOpen(p => !p)}
          disabled={state === 'locked'}
          animate={state === 'current' ? {
            boxShadow: ['0 0 0 0px rgba(58,171,109,0.6)', '0 0 0 18px rgba(58,171,109,0)', '0 0 0 0px rgba(58,171,109,0)']
          } : {}}
          transition={state === 'current' ? { repeat: Infinity, duration: 2 } : {}}
          className={`relative flex items-center justify-center rounded-full
            ${state === 'locked'
              ? 'bg-[#e5e5e5] border-b-[5px] border-[#bbb] cursor-not-allowed'
              : state === 'completed'
              ? 'bg-primary border-b-[5px] border-primary-dark shadow-xl shadow-primary/40 cursor-pointer'
              : state === 'progress'
              ? 'bg-white border-4 border-primary shadow-lg cursor-pointer'
              : 'bg-primary border-b-[5px] border-primary-dark shadow-xl shadow-primary/50 cursor-pointer'
            }`}
          style={{ width: NODE_SIZE, height: NODE_SIZE }}>

          {state === 'locked' && <Lock className="text-[#aaa]" style={{ width: 32, height: 32 }} />}
          {state === 'completed' && <CheckCircle2 className="text-white" style={{ width: 36, height: 36 }} strokeWidth={2.5} />}
          {state === 'progress' && (
            <>
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#d1fae5" strokeWidth="7" />
                <motion.circle cx="40" cy="40" r="34" fill="none" stroke="#3AAB6D" strokeWidth="7"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - unit.progressPercent / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  strokeLinecap="round" />
              </svg>
              <BookOpen className="text-primary relative z-10" style={{ width: 30, height: 30 }} />
            </>
          )}
          {state === 'current' && <Star className="text-white fill-white" style={{ width: 36, height: 36 }} />}

          {/* Gold star badge on completed */}
          {state === 'completed' && (
            <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber rounded-full flex items-center justify-center shadow-md border-2 border-white">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
          )}
        </motion.button>

        {/* Unit name label under node */}
        <div className="mt-2 text-center max-w-[110px]">
          <p className={`text-xs font-bold leading-tight ${state === 'locked' ? 'text-gray-400' : 'text-dark'}`}>
            {unit.title}
          </p>
        </div>

        {/* Popup card */}
        <AnimatePresence>
          {popupOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.93 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 bg-primary rounded-2xl p-4 shadow-2xl"
              style={{ top: `${NODE_SIZE + 16}px`, width: '200px', left: '50%', transform: 'translateX(-50%)' }}>
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-primary" />
              <p className="text-white font-extrabold text-sm leading-tight mb-0.5">{unit.title}</p>
              <p className="text-green-200 text-[11px] mb-2">{unit.category} · +{unit.xpReward} XP</p>
              {state === 'progress' && (
                <div className="mb-2">
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${unit.progressPercent}%` }} />
                  </div>
                  <p className="text-green-200 text-[10px] mt-1">{unit.completedLessons}/{unit.totalLessons} lessons</p>
                </div>
              )}
              <button onClick={handleStart}
                className="w-full h-9 bg-white text-primary font-extrabold text-sm rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-1.5">
                {state === 'completed' ? 'Practice' : state === 'progress' ? 'Continue' : 'Start'}
                <Zap className="w-3.5 h-3.5 text-primary" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
function PathSection({ section }) {
  return (
    <div className="mb-4">
      {/* Section banner */}
      <div className="bg-primary rounded-2xl px-6 py-5 flex items-center justify-between mb-4">
        <div>
          <p className="text-green-200 text-[11px] font-extrabold uppercase tracking-[0.15em] mb-1">{section.title}</p>
          <h2 className="text-white font-extrabold text-2xl leading-tight">{section.description}</h2>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 ml-4">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Path with nodes */}
      <div className="relative">
        {/* Background path line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[6px] -translate-x-1/2 bg-gray-200 rounded-full" />

        {section.units.map((unit, idx) => (
          <UnitNode key={unit.id} unit={unit} index={idx} />
        ))}
      </div>
    </div>
  );
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = [
    { icon: HomeIcon, label: 'Learn', path: '/' },
    { icon: Trophy, label: 'League', path: '/leaderboard' },
    { icon: Users, label: 'Friends', path: '/friends' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100">
      <div className="max-w-2xl mx-auto flex h-16">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <motion.button key={tab.path} whileTap={{ scale: 0.85 }} onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors border-t-[3px] -mt-[2px]
                ${active ? 'text-primary border-primary' : 'text-gray-400 border-transparent'}`}>
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-extrabold uppercase tracking-wide`}>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Profile Drawer ────────────────────────────────────────────────────────────
function ProfileDrawer({ isOpen, onClose, member, onLogout }) {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl flex flex-col">
            <div className="h-16 px-5 flex items-center justify-between border-b-2 border-gray-100">
              <span className="font-extrabold text-dark text-lg">Menu</span>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5 text-gray" />
              </button>
            </div>
            <div className="p-5 border-b-2 border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-xl font-extrabold shadow-lg">
                  {member?.firstName?.[0]}{member?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-extrabold text-dark text-lg">{member?.firstName} {member?.lastName}</p>
                  <p className="text-gray text-sm">{member?.branchName}</p>
                  <span className="mt-1 inline-block bg-primary-light text-primary text-xs font-extrabold px-2 py-0.5 rounded-full">
                    LEVEL {member?.currentLevel || 1}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-1">
              {[
                { icon: Heart, label: 'Hearts', path: '/hearts', color: 'text-rose-500', bg: 'bg-rose-50' },
                { icon: Flame, label: 'Streak', path: '/streak', color: 'text-orange-500', bg: 'bg-orange-50' },
                { icon: Shield, label: 'Profile', path: '/profile', color: 'text-primary', bg: 'bg-primary-light' },
                { icon: Trophy, label: 'Leaderboard', path: '/leaderboard', color: 'text-amber', bg: 'bg-amber/10' },
                ...(member?.role === 'NationalAdmin'
                  ? [{ icon: Settings, label: 'Admin Panel', path: '/admin', color: 'text-purple-600', bg: 'bg-purple-50' }]
                  : []),
              ].map(item => (
                <button key={item.path} onClick={() => { navigate(item.path); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="font-bold text-dark flex-1 text-left">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>
            <div className="p-4 border-t-2 border-gray-100">
              <button onClick={() => { onLogout(); onClose(); }}
                className="w-full h-12 rounded-xl bg-gray-100 text-gray font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [path, setPath] = useState([]);
  const [hearts, setHearts] = useState({ current: 5, max: 5 });
  const [streak, setStreak] = useState({ currentStreak: 0, studiedToday: false });
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [useMock, setUseMock] = useState(false);

  const member = useAuthStore(s => s.member);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pathRes, heartsRes, streakRes] = await Promise.all([
          api.get('/me/path'),
          api.get('/me/hearts'),
          api.get('/me/streak'),
        ]);
        const pathData = pathRes.data;
        if (!pathData || pathData.length === 0) { setUseMock(true); setPath(MOCK_PATH); }
        else setPath(pathData);
        setHearts(heartsRes.data);
        setStreak(streakRes.data);
        setXp(member?.totalXp || 0);
      } catch {
        setUseMock(true);
        setPath(MOCK_PATH);
      } finally { setLoading(false); }
    };
    fetchData();
    const t = setInterval(async () => {
      try { const r = await api.get('/me/hearts'); setHearts(r.data); } catch {}
    }, 300000);
    return () => clearInterval(t);
  }, [member]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar member={member} hearts={hearts} streak={streak} xp={xp} onProfileClick={() => setProfileOpen(true)} />

      {/* Centered content — max 640px like Duolingo */}
      <div className="max-w-xl mx-auto px-6 pt-6 pb-28">

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <p className="text-green-200 text-xs font-semibold flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> {greeting}
            </p>
            <h1 className="text-3xl font-extrabold">{member?.firstName}!</h1>
            <p className="text-green-200 mt-1">
              {streak.studiedToday ? '🎉 You studied today — great work!' : 'Ready to continue your journey?'}
            </p>
            {!streak.studiedToday && streak.currentStreak > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <Flame className="w-4 h-4 text-orange-300 fill-orange-300" />
                <span className="text-sm font-bold">{streak.currentStreak} day streak — keep going!</span>
              </div>
            )}
          </div>
        </motion.div>

        {useMock && (
          <div className="bg-amber/10 border border-amber/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber flex-shrink-0" />
            <span className="text-xs text-amber font-semibold">Demo content shown — add real sections in the admin panel</span>
          </div>
        )}

        {/* Path sections */}
        {path.map((section) => (
          <PathSection key={section.id} section={section} />
        ))}
      </div>

      <BottomNav />
      <ProfileDrawer isOpen={profileOpen} onClose={() => setProfileOpen(false)}
        member={member} onLogout={() => { logout(); navigate('/login'); }} />
    </div>
  );
}
