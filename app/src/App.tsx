import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import { useChatStore } from './store/chatStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useChatStore(s => s.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const user = useChatStore(s => s.user);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
    </Routes>
  )
}
