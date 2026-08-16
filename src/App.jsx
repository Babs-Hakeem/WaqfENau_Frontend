import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';
import Exercise from './screens/Exercise';
import UnitLessons from './screens/UnitLessons';
import Profile from './screens/Profile';
import Hearts from './screens/Hearts';
import Streak from './screens/Streak';
import Leaderboard from './screens/Leaderboard';
import Friends from './screens/Friends';
import AdminPanel from './screens/AdminPanel';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const member = useAuthStore((state) => state.member);
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (member?.role !== 'NationalAdmin') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/unit/:unitId" element={<ProtectedRoute><UnitLessons /></ProtectedRoute>} />
        <Route path="/lesson/:lessonId" element={<ProtectedRoute><Exercise /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/hearts" element={<ProtectedRoute><Hearts /></ProtectedRoute>} />
        <Route path="/streak" element={<ProtectedRoute><Streak /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
