import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import { Toaster } from '@/components/ui/sonner'

// Zero-friction: anyone who opens the link lands straight in the chat and can
// start shopping immediately. Sign-in (to personalize the name) is an optional
// route, never a gate.
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Toaster position="top-center" richColors closeButton />
    </>
  )
}
