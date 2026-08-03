import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Flame, Check, X, Gem } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

const TABS = ['Friends', 'Requests'];

function FriendCard({ friend }) {
  const today = friend.studiedToday;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm mb-2">
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold">
          {friend.fullName?.[0]}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${today ? 'bg-primary' : 'bg-gray-300'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-dark text-sm">{friend.fullName}</p>
        <p className="text-xs text-gray">{friend.branchName}</p>
        <p className={`text-xs mt-0.5 ${today ? 'text-primary' : 'text-gray'}`}>
          {today ? '✓ Studied today' : 'Not studied today'}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber" />
          <span className="text-xs font-bold text-dark">{friend.currentStreak}</span>
        </div>
        <div className="flex items-center gap-1">
          <Gem className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-dark">{friend.totalXp}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Friends() {
  const [tab, setTab] = useState('Friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addId, setAddId] = useState('');
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [fr, rr] = await Promise.all([api.get('/me/friends'), api.get('/me/friends/requests')]);
      setFriends(fr.data);
      setRequests(rr.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const sendRequest = async () => {
    if (!addId.trim()) return;
    setAdding(true); setAddMsg('');
    try {
      await api.post('/me/friends/request', { receiverId: addId.trim() });
      setAddMsg('Friend request sent!');
      setAddId('');
    } catch (e) {
      setAddMsg(e.response?.data?.message || 'Failed to send request');
    } finally { setAdding(false); }
  };

  const acceptRequest = async (friendshipId) => {
    try {
      await api.post(`/me/friends/${friendshipId}/accept`);
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const declineRequest = async (friendshipId) => {
    try {
      await api.delete(`/me/friends/${friendshipId}`);
      fetchAll();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-gray-light pb-24">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 pt-3 pb-0">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="font-bold text-dark text-xl">Friends</h1>
          </div>
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-t-xl transition-colors relative
                  ${tab === t ? 'bg-primary text-white' : 'text-gray hover:text-dark'}`}>
                {t}
                {t === 'Requests' && requests.length > 0 && (
                  <span className="absolute top-1 right-2 w-4 h-4 bg-red rounded-full text-white text-[10px] flex items-center justify-center">
                    {requests.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Add friend */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-sm font-semibold text-dark mb-2 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" /> Add Friend by ID
          </p>
          <div className="flex gap-2">
            <input value={addId} onChange={e => setAddId(e.target.value)}
              placeholder="Paste member ID..."
              className="flex-1 h-10 px-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
            <button onClick={sendRequest} disabled={adding}
              className="h-10 px-4 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50">
              {adding ? '...' : 'Add'}
            </button>
          </div>
          {addMsg && <p className={`text-xs mt-2 ${addMsg.includes('sent') ? 'text-primary' : 'text-red'}`}>{addMsg}</p>}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : tab === 'Friends' ? (
          friends.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-200 mx-auto mb-3" />
              <p className="text-gray font-medium">No friends yet</p>
              <p className="text-sm text-gray mt-1">Add friends using their member ID above</p>
            </div>
          ) : friends.map(f => <FriendCard key={f.memberId} friend={f} />)
        ) : (
          requests.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray font-medium">No pending requests</p>
            </div>
          ) : requests.map(r => (
            <motion.div key={r.friendshipId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm mb-2">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center font-bold text-primary">
                {r.fullName?.[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark text-sm">{r.fullName}</p>
                <p className="text-xs text-gray">Wants to be your friend</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => acceptRequest(r.friendshipId)}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </button>
                <button onClick={() => declineRequest(r.friendshipId)}
                  className="w-9 h-9 rounded-full bg-red/10 flex items-center justify-center">
                  <X className="w-4 h-4 text-red" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
