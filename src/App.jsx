import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';
import Exercise from './screens/Exercise';
import Profile from './screens/Profile';
import Hearts from './screens/Hearts';
import Streak from './screens/Streak';
import Leaderboard from './screens/Leaderboard';
import Friends from './screens/Friends';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Protected = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Protected><Home /></Protected>} />
        <Route path="/lesson/:lessonId" element={<Protected><Exercise /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/hearts" element={<Protected><Hearts /></Protected>} />
        <Route path="/streak" element={<Protected><Streak /></Protected>} />
        <Route path="/leaderboard" element={<Protected><Leaderboard /></Protected>} />
        <Route path="/friends" element={<Protected><Friends /></Protected>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
